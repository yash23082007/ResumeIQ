/**
 * ResumeIQ — Express Server Entry Point
 */

import express from 'express';
import cors from 'cors';
import { mkdirSync } from 'fs';

import config from './config.js';
import prisma from './database.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';
import analysisRoutes from './routes/analysis.js';
import jobRoutes from './routes/jobs.js';

const app = express();

// ─── Middleware ────────────────────────────────
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists
mkdirSync(config.uploadDir, { recursive: true });

// ─── Routes ───────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api', jobRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'resumeiq' });
});

// ─── Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (config.debug) console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.debug && { stack: err.stack }),
  });
});

// ─── Start ────────────────────────────────────
const start = async () => {
  try {
    await prisma.$connect();
    console.log('✓ Database connected');

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`✓ ResumeIQ API running on http://0.0.0.0:${config.port}`);
      console.log(`✓ API docs: http://localhost:${config.port}/api/health`);
      console.log(`✓ LLM: ${config.isLlmAvailable ? config.llmProvider : 'disabled (no API key)'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

export default app;
