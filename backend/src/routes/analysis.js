/**
 * Analysis Routes — Poll / Fetch analysis results
 */

import { Router } from 'express';
import prisma from '../database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

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
      createdAt: analysis.createdAt,
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
