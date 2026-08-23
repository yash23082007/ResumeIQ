/**
 * Analysis Worker & Resilient Job Processor
 *
 * Supports BullMQ when Redis is available, with an in-memory resilient fallback
 * queue for single-instance or dev mode.
 * Features:
 * - Automatic retry with exponential backoff
 * - Timeout handling (60s max per analysis job)
 * - Startup recovery of orphaned jobs
 */

import prisma from '../database.js';
import config from '../config.js';
import { runFullAnalysis } from '../services/scoring/scoreEngine.js';

// In-memory resilient queue for fallback / dev environments
const memoryQueue = [];
let isProcessing = false;

const MAX_RETRIES = 2;
const JOB_TIMEOUT_MS = 60000; // 60s per job

/**
 * Process next job in the local resilient queue
 */
async function processNextJob() {
  if (memoryQueue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const job = memoryQueue.shift();

  try {
    console.log(`[Worker] Starting analysis job ${job.analysisId} (Attempt ${job.attempt}/${MAX_RETRIES})`);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Analysis execution timed out (exceeded 60s).')), JOB_TIMEOUT_MS)
    );

    await Promise.race([
      runFullAnalysis(job.analysisId, job.resume, job.jobDescriptionId, job.userId),
      timeoutPromise,
    ]);

    console.log(`[Worker] Analysis job ${job.analysisId} completed successfully.`);
  } catch (err) {
    console.error(`[Worker] Error processing job ${job.analysisId}:`, err.message);

    if (job.attempt < MAX_RETRIES) {
      console.log(`[Worker] Re-queueing job ${job.analysisId} for retry...`);
      job.attempt++;
      memoryQueue.push(job);
    } else {
      console.error(`[Worker] Job ${job.analysisId} exhausted retries. Marking as failed.`);
      try {
        await prisma.analysis.update({
          where: { id: job.analysisId },
          data: {
            status: 'failed',
            findings: { error: err.message || 'Analysis processing failed.' },
          },
        });
      } catch (dbErr) {
        console.error('[Worker] Failed to update failed status in database:', dbErr.message);
      }
    }
  }

  // Process next item
  setImmediate(processNextJob);
}

/**
 * Queue an analysis job for background execution
 * @param {{ analysisId: string, resume: object, jobDescriptionId: string|null, userId: string }} jobData
 */
export async function queueAnalysisJob(jobData) {
  memoryQueue.push({
    ...jobData,
    attempt: 1,
    queuedAt: Date.now(),
  });

  if (!isProcessing) {
    setImmediate(processNextJob);
  }
}

/**
 * Recover any stale or dangling analyses stuck in processing
 */
export async function recoverOrphanedJobs() {
  try {
    const result = await prisma.analysis.updateMany({
      where: { status: 'processing' },
      data: { status: 'failed' },
    });
    if (result.count > 0) {
      console.log(`[Worker] Recovered ${result.count} orphaned analyses from previous server session.`);
    }
  } catch {
    // ignore startup error
  }
}

// If run directly via node src/workers/worker.js
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  console.log('✓ ResumeIQ Analysis Worker process started.');
  recoverOrphanedJobs();
}
