import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import prisma from '../database.js';
import crypto from 'crypto';

const router = express.Router();

// Generate a secure share link for a resume/draft
router.post('/resume/:id', requireAuth, async (req, res) => {
  try {
    const { expiresInHours = 24 } = req.body;
    
    // In a real app we'd verify the resume belongs to the user
    // We'll assume draft id for now
    const draft = await prisma.resumeDraft.findUnique({ where: { id: req.params.id } });
    if (!draft || draft.userId !== req.user.id) {
      return res.status(404).json({ error: { message: 'Resume/Draft not found.' } });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const link = await prisma.reviewLink.create({
      data: {
        token,
        resumeId: req.params.id, // For now we'll store draft id here to keep it simple
        expiresAt
      }
    });

    res.status(201).json({ status: 'success', data: { token, expiresAt } });
  } catch (error) {
    console.error('Error creating share link:', error);
    res.status(500).json({ error: { message: 'Failed to create share link.' } });
  }
});

export default router;
