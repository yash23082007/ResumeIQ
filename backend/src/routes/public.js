import express from 'express';
import prisma from '../database.js';
import { checkAtsFailures } from '../services/analysis/atsChecker.js';

const router = express.Router();

// Public ATS text checker (acquisition loop)
router.post('/ats-check', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: { message: 'Text is required.' } });
    }
    
    // Simulate a basic ATS check on the text snippet
    const atsSimulation = checkAtsFailures(text, { author: '', title: '' }, { hasTables: false, hasColumns: false });
    
    res.json({ status: 'success', data: { issues: atsSimulation.issues, score: atsSimulation.score } });
  } catch (error) {
    console.error('Error in public ATS check:', error);
    res.status(500).json({ error: { message: 'Failed to process ATS check.' } });
  }
});

// Fetch a shared resume by token
router.get('/review/:token', async (req, res) => {
  try {
    const link = await prisma.reviewLink.findUnique({ 
      where: { token: req.params.token },
      include: { resume: true }
    });
    
    if (!link || link.expiresAt < new Date()) {
      return res.status(404).json({ error: { message: 'Link is invalid or has expired.' } });
    }

    res.json({ status: 'success', data: { resume: link.resume, expiresAt: link.expiresAt } });
  } catch (error) {
    console.error('Error fetching share link:', error);
    res.status(500).json({ error: { message: 'Failed to fetch share link.' } });
  }
});

export default router;
