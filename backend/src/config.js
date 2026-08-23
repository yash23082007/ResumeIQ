/**
 * ResumeIQ — Application Configuration
 * Loads from environment variables with sensible defaults.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // Fallback to current working directory .env

const config = {
  // Server
  port: parseInt(process.env.PORT || '8000', 10),
  env: process.env.APP_ENV || 'development',
  debug: process.env.APP_DEBUG === 'true',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://resumeiq:resumeiq_dev@localhost:5432/resumeiq',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379/0',

  // Auth
  jwtSecret: process.env.JWT_SECRET || 'change-me-to-a-long-random-string',
  jwtAlgorithm: process.env.JWT_ALGORITHM || 'HS256',
  jwtExpirationMinutes: parseInt(process.env.JWT_EXPIRATION_MINUTES || '1440', 10),

  // Storage
  storageBackend: process.env.STORAGE_BACKEND || 'local',
  uploadDir: process.env.UPLOAD_DIR || './uploads',

  // LLM
  llmProvider: process.env.LLM_PROVIDER || 'groq',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmModel: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
  llmMaxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4096', 10),

  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()),

  // Computed
  get isLlmAvailable() {
    return Boolean(this.llmApiKey);
  },
};

export default config;
