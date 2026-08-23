/**
 * ResumeIQ — Application Configuration
 * Loads from environment variables with sensible defaults and strict production safeguards.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // Fallback to current working directory .env

const env = process.env.NODE_ENV || process.env.APP_ENV || 'development';
const isProd = env === 'production';
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production-min-32-chars';

// Strict security validation in production
if (isProd) {
  const lower = (process.env.JWT_SECRET || '').toLowerCase().trim();
  const disallowedPatterns = [
    'change-me',
    'dev-secret',
    'change-in-production',
    'min-32-chars',
    'example',
    'password',
    'placeholder',
    'jwtsecret',
  ];

  const hasDisallowedPattern = disallowedPatterns.some(p => lower.includes(p));

  if (!process.env.JWT_SECRET || hasDisallowedPattern) {
    throw new Error('FATAL: A secure, non-placeholder JWT_SECRET is strictly required in production.');
  }
  if (jwtSecret.length < 32) {
    throw new Error('FATAL: JWT_SECRET must be at least 32 characters long in production.');
  }
}

const config = {
  // Server
  port: parseInt(process.env.PORT || '8000', 10),
  env,
  isProd,
  debug: process.env.APP_DEBUG === 'true',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://resumeiq:resumeiq_dev@localhost:5432/resumeiq',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379/0',

  // Auth
  jwtSecret,
  jwtAlgorithm: process.env.JWT_ALGORITHM || 'HS256',
  jwtExpirationMinutes: parseInt(process.env.JWT_EXPIRATION_MINUTES || '1440', 10),

  // Storage
  storageBackend: process.env.STORAGE_BACKEND || 'local',
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads'),

  // LLM
  llmProvider: process.env.LLM_PROVIDER || 'groq',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmModel: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
  llmMaxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4096', 10),

  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map(s => s.trim()),

  // Computed
  get isLlmAvailable() {
    return Boolean(this.llmApiKey && this.llmApiKey.trim().length > 0);
  },
};

export default config;
