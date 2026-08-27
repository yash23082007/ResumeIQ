import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config.js';
import prisma from '../database.js';
import { runFullAnalysis } from '../services/scoring/scoreEngine.js';

let isRedisConnected = false;

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 3) {
      if (config.debug) console.warn('[Queue] Redis unreachable, falling back to in-process execution.');
      return null;
    }
    return Math.min(times * 500, 2000);
  },
});

connection.on('connect', () => {
  isRedisConnected = true;
});

connection.on('error', (err) => {
  isRedisConnected = false;
  if (config.debug) {
    console.warn(`[Queue] Redis connection issue: ${err.message}`);
  }
});

// Attempt connecting non-blockingly
connection.connect().catch(() => {
  isRedisConnected = false;
});

export const analysisQueue = new Queue('resume.analyze', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 86400, count: 1000 },
    removeOnFail: { age: 604800, count: 1000 },
  },
});

export async function enqueueAnalysis(data) {
  if (isRedisConnected) {
    try {
      return await analysisQueue.add('run-analysis', data, { jobId: data.analysisId });
    } catch (err) {
      console.warn(`[Queue] BullMQ dispatch failed (${err.message}). Executing inline.`);
    }
  }

  // Resilient fallback: process in background asynchronously
  setImmediate(async () => {
    try {
      const resume = await prisma.resume.findFirst({ where: { id: data.resumeId, userId: data.userId } });
      if (!resume) return;
      await prisma.analysis.update({ where: { id: data.analysisId }, data: { status: 'processing' } });
      await runFullAnalysis(data.analysisId, resume, data.jobDescriptionId, data.userId);
    } catch (error) {
      console.error('[InlineWorker] Processing failed:', error);
      await prisma.analysis.update({
        where: { id: data.analysisId },
        data: { status: 'failed', findings: { error: error.message } }
      }).catch(() => {});
    }
  });

  return { id: data.analysisId, inline: true };
}

export async function closeQueue() {
  try {
    await analysisQueue.close();
    await connection.quit();
  } catch {
    // Ignore close errors during shutdown
  }
}

