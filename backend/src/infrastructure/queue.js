import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config.js';

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
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
  return analysisQueue.add('run-analysis', data, { jobId: data.analysisId });
}

export async function closeQueue() {
  await analysisQueue.close();
  await connection.quit();
}
