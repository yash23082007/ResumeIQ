/**
 * Resume Routes — Upload, Fetch, Analyze, Heatmap, ATS Sim, Interview Qs
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import config from '../config.js';
import prisma from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { parseResume } from '../services/parsing/parser.js';
import { runFullAnalysis } from '../services/scoring/scoreEngine.js';
import { buildHeatmap } from '../services/analysis/heatmap.js';
import { simulateATS } from '../services/analysis/atsChecker.js';
import { predictInterviewQuestions } from '../services/ai/interviewPredictor.js';
import { generateTailoredResume } from '../services/ai/rewriteSuggester.js';

const router = Router();

// ─── Multer Upload Config ─────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowed.join(', ')}`));
    }
  },
});

/**
 * POST /api/resumes — Upload a resume
 */
router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { label } = req.body;

    // Parse the uploaded file
    const parsed = await parseResume(req.file.path, req.file.originalname);

    // Determine version number
    const existingCount = await prisma.resume.count({
      where: { userId: req.user.id },
    });

    const resume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        fileName: req.file.originalname,
        filePath: req.file.filename,
        rawText: parsed.rawText,
        parsedJson: parsed.structured,
        version: existingCount + 1,
        label: label || null,
      },
    });

    res.status(201).json({
      id: resume.id,
      fileName: resume.fileName,
      version: resume.version,
      label: resume.label,
      sections: Object.keys(parsed.structured?.sections || {}),
      createdAt: resume.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/resumes — List user's resumes
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { overallScore: true, subScores: true, status: true },
        },
      },
    });

    res.json(resumes.map(r => ({
      id: r.id,
      fileName: r.fileName,
      version: r.version,
      label: r.label,
      createdAt: r.createdAt,
      latestScore: r.analyses[0]?.overallScore || null,
      latestStatus: r.analyses[0]?.status || null,
      subScores: r.analyses[0]?.subScores || null,
    })));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/resumes/:id — Fetch a single resume with parsed data
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        analyses: { orderBy: { createdAt: 'desc' } },
        skills: { include: { skill: true } },
      },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json(resume);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/resumes/:id/versions — Version history
 */
router.get('/:id/versions', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const versions = await prisma.resume.findMany({
      where: { userId: req.user.id },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        label: true,
        fileName: true,
        createdAt: true,
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { overallScore: true },
        },
      },
    });

    res.json(versions.map(v => ({
      ...v,
      latestScore: v.analyses[0]?.overallScore || null,
    })));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/resumes/:id/analyze — Trigger full analysis
 */
router.post('/:id/analyze', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const { jobDescriptionId } = req.body;

    // Create a pending analysis record
    const analysis = await prisma.analysis.create({
      data: {
        resumeId: resume.id,
        jobDescriptionId: jobDescriptionId || null,
        status: 'processing',
      },
    });

    // Run analysis (in production this would be a BullMQ job)
    runFullAnalysis(analysis.id, resume, jobDescriptionId).catch(err => {
      console.error(`Analysis ${analysis.id} failed:`, err);
    });

    res.status(202).json({
      analysisId: analysis.id,
      status: 'processing',
      message: 'Analysis started. Poll GET /api/analyses/:id for results.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/resumes/:id/heatmap — Attention heatmap data
 */
router.get('/:id/heatmap', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const heatmap = buildHeatmap(resume.parsedJson);
    res.json(heatmap);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/resumes/:id/ats-simulation — Multi-ATS parsing simulation
 */
router.get('/:id/ats-simulation', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const simulation = simulateATS(resume.parsedJson);
    res.json(simulation);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/resumes/:id/interview-questions — Predicted interview Qs
 */
router.get('/:id/interview-questions', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const questions = await predictInterviewQuestions(resume.rawText, resume.parsedJson);
    res.json(questions);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/resumes/:id/tailor/:jdId — AI-generated tailored draft
 */
router.post('/:id/tailor/:jdId', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    const jd = await prisma.jobDescription.findFirst({
      where: { id: req.params.jdId, userId: req.user.id },
    });

    if (!resume || !jd) {
      return res.status(404).json({ error: 'Resume or job description not found' });
    }

    const tailored = await generateTailoredResume(resume.rawText, jd.rawText, resume.parsedJson);
    res.json(tailored);
  } catch (err) {
    next(err);
  }
});

export default router;
