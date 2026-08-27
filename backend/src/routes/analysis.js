/**
 * Analysis Routes — Poll / Fetch / Retry analysis results
 */

import { Router } from 'express';
import prisma from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { enqueueAnalysis } from '../infrastructure/queue.js';

const router = Router();

const METHODOLOGY_VERSION = '2026.08.1';

/**
 * GET /api/analyses/:id — Fetch analysis result (supports polling)
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: { id: req.params.id },
      include: {
        resume: {
          select: { userId: true, fileName: true },
        },
        jobDescription: {
          select: { title: true, company: true },
        },
      },
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Authorization: only the resume owner can view
    if (analysis.resume.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const isTerminal = ['completed', 'failed', 'cancelled'].includes(analysis.status);

    res.json({
      id: analysis.id,
      resumeId: analysis.resumeId,
      resumeName: analysis.resume.fileName,
      jobTitle: analysis.jobDescription?.title || null,
      jobCompany: analysis.jobDescription?.company || null,
      status: analysis.status,
      overallScore: analysis.overallScore,
      subScores: analysis.subScores,
      findings: analysis.findings,
      heatmapData: analysis.heatmapData,
      methodologyVersion: METHODOLOGY_VERSION,
      confidence: analysis.findings?.confidence ?? null,
      progress: isTerminal ? null : {
        stage: analysis.status,
        percent: analysis.status === 'queued' ? 10 : analysis.status === 'processing' ? 50 : null,
      },
      scoreWarnings: analysis.findings?.scoreWarnings || [],
      createdAt: analysis.createdAt,
      completedAt: isTerminal ? analysis.updatedAt : null,
      retryable: analysis.status === 'failed',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/analyses/:id/retry — Retry a failed analysis
 */
router.post('/:id/retry', authenticate, async (req, res, next) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: { id: req.params.id },
      include: {
        resume: { select: { userId: true, id: true } },
      },
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (analysis.resume.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (analysis.status !== 'failed') {
      return res.status(400).json({ error: 'Only failed analyses can be retried.' });
    }

    // Reset and re-enqueue
    await prisma.analysis.update({
      where: { id: analysis.id },
      data: {
        status: 'queued',
        overallScore: null,
        subScores: null,
        findings: null,
        heatmapData: null,
      },
    });

    await enqueueAnalysis({
      analysisId: analysis.id,
      resumeId: analysis.resumeId,
      jobDescriptionId: analysis.jobDescriptionId || null,
      userId: req.user.id,
    });

    res.json({
      id: analysis.id,
      status: 'queued',
      message: 'Analysis re-queued. Poll GET /api/analyses/:id for status.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analyses — List all analyses for the current user
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const analyses = await prisma.analysis.findMany({
      where: {
        resume: { userId: req.user.id },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        resume: { select: { fileName: true, label: true } },
        jobDescription: { select: { title: true, company: true } },
      },
    });

    res.json(analyses.map(a => ({
      id: a.id,
      resumeId: a.resumeId,
      resumeName: a.resume.fileName,
      resumeLabel: a.resume.label,
      jobTitle: a.jobDescription?.title,
      status: a.status,
      overallScore: a.overallScore,
      createdAt: a.createdAt,
    })));
  } catch (err) {
    next(err);
  }
});

export default router;
