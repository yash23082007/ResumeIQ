import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../database.js';
import config from '../config.js';
import { runFullAnalysis } from '../services/scoring/scoreEngine.js';

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const JOB_TIMEOUT_MS = 60000;

function withTimeout(promise) {
  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error('Analysis timed out after 60 seconds.')), JOB_TIMEOUT_MS);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timerId));
}

export function startAnalysisWorker() {
  const worker = new Worker('resume.analyze', async (job) => {
    const { analysisId, resumeId, jobDescriptionId, userId } = job.data;
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
    if (!resume) throw new Error('Resume not found for analysis job.');
    await prisma.analysis.update({ where: { id: analysisId }, data: { status: 'processing' } });
    await withTimeout(runFullAnalysis(analysisId, resume, jobDescriptionId, userId));
  }, { connection, concurrency: 2 });

  worker.on('completed', (job) => console.log(`[Worker] Analysis ${job.data.analysisId} completed.`));
  worker.on('failed', async (job, error) => {
    if (!job || job.attemptsMade < (job.opts.attempts || 3)) return;
    console.error(`[Worker] Analysis ${job.data.analysisId} failed: ${error.message}`);
    await prisma.analysis.update({
      where: { id: job.data.analysisId },
      data: { status: 'failed', findings: { error: 'Analysis processing failed.' } },
    }).catch((updateError) => console.error('[Worker] Failed to persist job failure:', updateError.message));
  });

  return worker;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  console.log('ResumeIQ analysis worker listening on resume.analyze.');
  const worker = startAnalysisWorker();

  const shutdown = async () => {
    console.log('Shutting down worker gracefully...');
    await worker.close();
    connection.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
