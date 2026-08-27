/**
 * Contact Submission Route
 * Allows users to submit inquiries, bug reports, and feedback.
 * Returns honest errors when persistence fails.
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../database.js';

const router = Router();

// Simple in-memory rate limit for contact submissions (10 per 15 min per IP)
const contactRateMap = new Map();
const CONTACT_WINDOW_MS = 15 * 60 * 1000;
const CONTACT_MAX = 10;

router.post('/', async (req, res) => {
  try {
    // Rate limiting
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const record = contactRateMap.get(ip);
    if (record && now - record.startTime < CONTACT_WINDOW_MS) {
      if (record.count >= CONTACT_MAX) {
        return res.status(429).json({ error: 'Too many contact submissions. Please wait before trying again.' });
      }
      record.count++;
    } else {
      contactRateMap.set(ip, { count: 1, startTime: now });
    }

    const { name, email, subject, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required.' });
    }
    if (email.length > 255 || message.length > 5000) {
      return res.status(400).json({ error: 'Email or message exceeds maximum length.' });
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const submission = {
      id: uuidv4(),
      name: name?.trim()?.substring(0, 100) || 'Anonymous',
      email: email.trim().toLowerCase(),
      subject: (subject || 'General Question').substring(0, 200),
      message: message.trim().substring(0, 5000),
      createdAt: new Date().toISOString(),
    };

    // Save to database/local store — return honest error on failure
    if (prisma.contactSubmission) {
      await prisma.contactSubmission.create({ data: submission });
    } else {
      console.warn('Contact submission model unavailable. Message may not be persisted.');
      return res.status(503).json({
        error: 'Contact submission system is temporarily unavailable. Please try again later or email support directly.',
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Inquiry received successfully. Our team will review it shortly.',
      submissionId: submission.id,
    });
  } catch (error) {
    console.error('Contact submission error:', error.message);
    return res.status(500).json({ error: 'Failed to save your message. Please try again later.' });
  }
});

export default router;
