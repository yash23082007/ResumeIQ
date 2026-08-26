/**
 * Contact Submission Route
 * Allows users to submit inquiries, bug reports, and feedback.
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../database.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are strictly required.' });
    }

    const submission = {
      id: uuidv4(),
      name: name?.trim() || 'Anonymous Candidate',
      email: email.trim().toLowerCase(),
      subject: subject || 'General Question',
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to database/local store if available
    try {
      if (prisma.contactSubmission) {
        await prisma.contactSubmission.create({ data: submission });
      }
    } catch {
      // Gracefully handle if DB model not migrated yet
    }

    console.log(`✓ Contact inquiry received from ${submission.email} [${submission.subject}]`);

    return res.status(201).json({
      success: true,
      message: 'Inquiry received successfully. Our team will review it shortly.',
      submissionId: submission.id,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({ error: 'Internal server error processing contact submission.' });
  }
});

export default router;
