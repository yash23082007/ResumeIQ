/**
 * Job Description Routes — Save JD, Semantic Match, Cover Letter
 */

import { Router } from 'express';
import prisma from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { semanticMatchScore } from '../services/semantic/matcher.js';
import { generateCoverLetter } from '../services/ai/coverLetterGen.js';

const router = Router();

/**
 * POST /api/job-descriptions — Save a job description
 */
router.post('/job-descriptions', authenticate, async (req, res, next) => {
  try {
    const { title, company, rawText } = req.body;

    if (!rawText) {
      return res.status(400).json({ error: 'Job description text is required' });
    }

    const jd = await prisma.jobDescription.create({
      data: {
        userId: req.user.id,
        title: title || 'Untitled Position',
        company: company || null,
        rawText,
      },
    });

    res.status(201).json({
      id: jd.id,
      title: jd.title,
      company: jd.company,
      createdAt: jd.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/job-descriptions — List user's saved JDs
 */
router.get('/job-descriptions', authenticate, async (req, res, next) => {
  try {
    const jds = await prisma.jobDescription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, company: true, createdAt: true },
    });
    res.json(jds);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/job-descriptions/:id — Delete a saved job description
 */
router.delete('/job-descriptions/:id', authenticate, async (req, res, next) => {
  try {
    const jd = await prisma.jobDescription.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!jd) {
      return res.status(404).json({ error: 'Job description not found' });
    }

    await prisma.jobDescription.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Job description deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/resumes/:id/match/:jdId — Semantic match score + missing keywords
 */
router.post('/resumes/:id/match/:jdId', authenticate, async (req, res, next) => {
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

    const result = await semanticMatchScore(resume.rawText, jd.rawText);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/resumes/:id/cover-letter/:jdId — Generate cover letter
 */
router.post('/resumes/:id/cover-letter/:jdId', authenticate, async (req, res, next) => {
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

    const coverLetter = await generateCoverLetter(resume.rawText, jd.rawText, resume.parsedJson);
    res.json(coverLetter);
  } catch (err) {
    next(err);
  }
});

export default router;
