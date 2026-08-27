import express from 'express';
import prisma from '../database.js';
import { checkATSCompatibility } from '../services/analysis/atsChecker.js';

const router = express.Router();

// In-memory rate limit for public ATS check (20 per 15 min per IP)
const publicRateMap = new Map();
const PUBLIC_WINDOW_MS = 15 * 60 * 1000;
const PUBLIC_MAX = 20;

// Public ATS text checker (acquisition loop) — no auth required
router.post('/ats-check', async (req, res) => {
  try {
    // Rate limiting
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const record = publicRateMap.get(ip);
    if (record && now - record.startTime < PUBLIC_WINDOW_MS) {
      if (record.count >= PUBLIC_MAX) {
        return res.status(429).json({ error: { message: 'Rate limit exceeded. Please wait before trying again.' } });
      }
      record.count++;
    } else {
      publicRateMap.set(ip, { count: 1, startTime: now });
    }

    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: { message: 'Text is required.' } });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: { message: 'Text exceeds 2000 character limit.' } });
    }
    
    // Build a minimal parsedJson structure from the raw text for the ATS checker
    const lines = text.split('\n').filter(l => l.trim());
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const hasExperience = lines.some(l => /experience|work history/i.test(l));
    const hasEducation = lines.some(l => /education|degree/i.test(l));
    const hasSkills = lines.some(l => /skills|technologies/i.test(l));
    
    const mockParsed = {
      layout: { hasMultiColumnTables: false, hasImages: false, hasColumns: false, contactInHeaderFooter: false, pageCount: 1 },
      sections: {
        ...(hasExperience ? { experience: { content: text, bullets: [] } } : {}),
        ...(hasEducation ? { education: { content: '' } } : {}),
        ...(hasSkills ? { skills: { content: '' } } : {}),
      },
      wordCount,
    };
    
    const atsResult = checkATSCompatibility(mockParsed);
    
    res.json({ 
      status: 'success', 
      data: { 
        issues: atsResult.issues, 
        score: atsResult.score,
        disclaimer: 'Heuristic simulation based on documented parser failure modes — not a direct connection to proprietary ATS engines.' 
      } 
    });
  } catch (error) {
    console.error('Error in public ATS check:', error.message);
    res.status(500).json({ error: { message: 'Failed to process ATS check.' } });
  }
});

// Fetch a shared resume by token — no auth required
router.get('/review/:token', async (req, res) => {
  try {
    const link = await prisma.reviewLink.findUnique({ 
      where: { token: req.params.token },
      include: { resume: true }
    });
    
    if (!link || new Date(link.expiresAt) < new Date()) {
      return res.status(404).json({ error: { message: 'Link is invalid or has expired.' } });
    }

    res.json({ status: 'success', data: { resume: link.resume, expiresAt: link.expiresAt } });
  } catch (error) {
    console.error('Error fetching share link:', error.message);
    res.status(500).json({ error: { message: 'Failed to fetch share link.' } });
  }
});

export default router;
