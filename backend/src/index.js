/**
 * ResumeIQ — Express Server Entry Point
 */

import express from 'express';
import cors from 'cors';
import { mkdirSync } from 'fs';
import crypto from 'crypto';

import config from './config.js';
import prisma, { isFallbackMode } from './database.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';
import analysisRoutes from './routes/analysis.js';
import jobRoutes from './routes/jobs.js';
import contactRoutes from './routes/contact.js';
import draftsRoutes from './routes/drafts.js';
import exportRoutes from './routes/export.js';
import shareRoutes from './routes/share.js';
import publicRoutes from './routes/public.js';

const app = express();

const requestCounts = new Map();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 120;

app.disable('x-powered-by');
app.use((req, res, next) => {
  const requestId = req.header('x-request-id') || `req_${crypto.randomUUID()}`;
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'DENY');
  res.setHeader('referrer-policy', 'same-origin');
  next();
});
app.use((req, res, next) => {
  const now = Date.now();
  const key = req.ip || 'unknown';
  const current = requestCounts.get(key);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    requestCounts.set(key, { startedAt: now, count: 1 });
    return next();
  }
  current.count += 1;
  if (current.count > RATE_LIMIT) return res.status(429).json({ error: 'Too many requests. Please try again shortly.', requestId: req.requestId });
  next();
});

// ─── Middleware ────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure upload directory exists
mkdirSync(config.uploadDir, { recursive: true });

// ─── Routes ───────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/drafts', draftsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', jobRoutes);

// Versioned aliases allow the web client to migrate without breaking existing installations.
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/analyses', analysisRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/drafts', draftsRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1', jobRoutes);

app.get('/api/v1/methodology/current', (req, res) => {
  res.json({
    methodologyVersion: '2026.08.1',
    scoreDimensions: {
      contentImpact: 0.30,
      atsCompatibility: 0.25,
      roleRelevance: 0.20,
      formatting: 0.15,
      readability: 0.10,
    },
    limitations: [
      'ATS results are simulated heuristics, not vendor certifications.',
      'Readability scores are directional for resume fragments and technical language.',
      'A score is diagnostic and does not predict hiring outcomes.',
    ],
  });
});

app.get('/api/health/live', (req, res) => {
  res.json({ status: 'live', service: 'resumeiq', environment: config.env });
});

app.get('/api/health/ready', async (req, res) => {
  let database = { mode: isFallbackMode() ? 'local_development_store' : 'postgres', connected: false };
  try {
    if (isFallbackMode()) {
      database.connected = true;
    } else {
      await prisma.$queryRaw`SELECT 1`;
      database.connected = true;
    }
  } catch (error) {
    database.error = config.debug ? error.message : 'database_unavailable';
  }

  const ready = database.connected;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    service: 'resumeiq',
    database,
    llm: {
      provider: config.llmProvider,
      configured: config.isLlmAvailable,
      model: config.llmModel,
    },
  });
});

// Compatibility health endpoint
app.get('/api/health', async (req, res) => {
  let connected = false;
  try {
    connected = isFallbackMode() || Boolean(await prisma.$queryRaw`SELECT 1`);
  } catch {
    connected = false;
  }
  res.json({
    status: connected ? 'healthy' : 'degraded',
    service: 'resumeiq',
    environment: config.env,
    database: {
      mode: isFallbackMode() ? 'local_development_store' : 'postgres',
      connected,
    },
    llm: {
      provider: config.llmProvider,
      configured: config.isLlmAvailable,
      model: config.llmModel,
    },
  });
});

// ─── Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (config.debug) console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    requestId: req.requestId,
    ...(config.debug && { stack: err.stack }),
  });
});

// ─── Start ────────────────────────────────────
const start = async () => {
  try {
    await prisma.$connect();
    console.log(`✓ Database connected (${isFallbackMode() ? 'Local JSON Store' : 'PostgreSQL via Prisma'})`);

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`✓ ResumeIQ API running on http://0.0.0.0:${config.port}`);
      console.log(`✓ API health: http://localhost:${config.port}/api/health`);
      console.log(`✓ LLM: ${config.isLlmAvailable ? config.llmProvider : 'disabled (no API key configured)'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

export default app;
