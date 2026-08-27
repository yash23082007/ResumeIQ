/**
 * Resume Routes — Upload, Fetch, Analyze, Heatmap, ATS Sim, Interview Qs
 * Hardened with worker queues, authorization checks, temp cleanup, and nullish score handling.
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import config from '../config.js';
import prisma from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { parseResume } from '../services/parsing/parser.js';
import { enqueueAnalysis } from '../infrastructure/queue.js';
import { buildHeatmap } from '../services/analysis/heatmap.js';
import { simulateATS } from '../services/analysis/atsChecker.js';
import { predictInterviewQuestions } from '../services/ai/interviewPredictor.js';
import { generateTailoredResume } from '../services/ai/rewriteSuggester.js';

const router = Router();

// ─── Multer Upload Config ─────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB strict limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Only PDF, DOCX, and TXT are supported.`));
    }
  },
});

// Middleware to handle multer file size errors
const handleUploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File size exceeds maximum allowable limit (10MB).' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

/**
 * POST /api/resumes — Upload a resume
 */
router.post('/', authenticate, handleUploadMiddleware, async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Please attach a PDF, DOCX, or TXT document.' });
  }

  const uploadedFilePath = req.file.path;

  try {
    const { label, parentResumeId } = req.body;

    // Parse the uploaded file
    let parsed;
    try {
      parsed = await parseResume(uploadedFilePath, req.file.originalname);
    } catch (parseErr) {
      // Client-side document issue -> HTTP 400
      return res.status(400).json({ error: parseErr.message || 'Failed to parse resume document.' });
    }

    let versionGroupId = uuidv4();
    let version = 1;

    // If this is a new iteration of an existing resume
    if (parentResumeId) {
      const parent = await prisma.resume.findFirst({
        where: { id: parentResumeId, userId: req.user.id },
      });
      if (parent) {
        versionGroupId = parent.versionGroupId || parent.id;
        const versionCount = await prisma.resume.count({
          where: { userId: req.user.id, versionGroupId },
        });
        version = versionCount + 1;
      }
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        fileName: req.file.originalname,
        filePath: req.file.filename,
        rawText: parsed.rawText,
        parsedJson: parsed.structured,
        version,
        versionGroupId,
        label: label || null,
      },
    });

    res.status(201).json({
      id: resume.id,
      fileName: resume.fileName,
      version: resume.version,
      versionGroupId: resume.versionGroupId,
      label: resume.label,
      sections: Object.keys(parsed.structured?.sections || {}),
      createdAt: resume.createdAt,
    });
  } catch (err) {
    // Unexpected internal / database error -> HTTP 500
    next(err);
  } finally {
    // Cleanup temp file if an unhandled error occurred
    if (res.statusCode >= 400 && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch {
        // ignore unlink error
      }
    }
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

    res.json(resumes.map(r => {
      const latest = r.analyses?.[0] || null;
      return {
        id: r.id,
        fileName: r.fileName,
        version: r.version,
        versionGroupId: r.versionGroupId,
        label: r.label,
        createdAt: r.createdAt,
        latestScore: latest?.overallScore ?? null,
        latestStatus: latest?.status ?? null,
        subScores: latest?.subScores ?? null,
        latestAnalysis: latest ? {
          id: latest.id,
          status: latest.status,
          score: latest.overallScore ?? null,
          subScores: latest.subScores ?? null,
        } : null,
        analyses: r.analyses || [],
      };
    }));
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
 * DELETE /api/resumes/:id — Delete a resume and its associated analyses
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    await prisma.resume.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Resume deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/resumes/:id/versions — Version history for this specific resume group
 */
router.get('/:id/versions', authenticate, async (req, res, next) => {
  try {
    const currentResume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!currentResume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const versionGroupId = currentResume.versionGroupId || currentResume.id;

    const versions = await prisma.resume.findMany({
      where: { userId: req.user.id, versionGroupId },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        versionGroupId: true,
        label: true,
        fileName: true,
        createdAt: true,
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { overallScore: true, subScores: true },
        },
      },
    });

    res.json(versions.map(v => ({
      id: v.id,
      version: v.version,
      versionGroupId: v.versionGroupId,
      label: v.label,
      fileName: v.fileName,
      createdAt: v.createdAt,
      latestScore: v.analyses?.[0]?.overallScore ?? null,
      subScores: v.analyses?.[0]?.subScores ?? null,
    })));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/resumes/:id/analyze — Trigger full analysis through resilient worker queue
 */
router.post('/:id/analyze', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found or does not belong to you' });
    }

    const { jobDescriptionId } = req.body;

    // Cross-user Job Description Authorization Check (Task 4)
    if (jobDescriptionId) {
      const jd = await prisma.jobDescription.findFirst({
        where: { id: jobDescriptionId, userId: req.user.id },
      });
      if (!jd) {
        return res.status(403).json({
          error: 'Unauthorized: The specified Job Description does not belong to your account or does not exist.',
        });
      }
    }

    // Create a pending analysis record
    const analysis = await prisma.analysis.create({
      data: {
        resumeId: resume.id,
        jobDescriptionId: jobDescriptionId || null,
        status: 'queued',
      },
    });

    // Dispatch to resilient background worker queue
    await enqueueAnalysis({
      analysisId: analysis.id,
      resumeId: resume.id,
      jobDescriptionId: jobDescriptionId || null,
      userId: req.user.id,
    });

    res.status(202).json({
      analysisId: analysis.id,
      status: 'queued',
      message: 'Analysis initiated. Poll GET /api/analyses/:id for status and findings.',
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
      return res.status(404).json({ error: 'Resume or job description not found or unauthorized' });
    }

    const tailored = await generateTailoredResume(resume.rawText, jd.rawText, resume.parsedJson);
    res.json(tailored);
  } catch (err) {
    next(err);
  }
});

export default router;
