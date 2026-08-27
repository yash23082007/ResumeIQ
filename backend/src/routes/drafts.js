import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import prisma from '../database.js';

const router = express.Router();

// Get all drafts for user
router.get('/', requireAuth, async (req, res) => {
  try {
    const drafts = await prisma.resumeDraft.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ status: 'success', data: drafts });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: { message: 'Failed to fetch drafts.' } });
  }
});

// Create new draft
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, templateId, sections } = req.body;
    const draft = await prisma.resumeDraft.create({
      data: {
        userId: req.user.id,
        title: title || 'Untitled Draft',
        templateId: templateId || 'classic',
        templateSettings: req.body.templateSettings || {},
        sections: sections || [],
        roleId: req.body.roleId || null,
        branchOfVersionId: req.body.branchOfVersionId || null
      }
    });
    res.status(201).json({ status: 'success', data: draft });
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({ error: { message: 'Failed to create draft.' } });
  }
});

// Get specific draft
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const draft = await prisma.resumeDraft.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!draft) return res.status(404).json({ error: { message: 'Draft not found.' } });
    res.json({ status: 'success', data: draft });
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ error: { message: 'Failed to fetch draft.' } });
  }
});

// Update/Autosave draft
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    // Verify ownership
    const existing = await prisma.resumeDraft.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ error: { message: 'Draft not found.' } });

    const { title, templateId, templateSettings, sections, roleId } = req.body;
    
    // Create data object dynamically based on provided fields
    const dataToUpdate = { revision: { increment: 1 } };
    if (title !== undefined) dataToUpdate.title = title;
    if (templateId !== undefined) dataToUpdate.templateId = templateId;
    if (templateSettings !== undefined) dataToUpdate.templateSettings = templateSettings;
    if (sections !== undefined) dataToUpdate.sections = sections;
    if (roleId !== undefined) dataToUpdate.roleId = roleId;

    const draft = await prisma.resumeDraft.update({
      where: { id: req.params.id },
      data: dataToUpdate
    });
    res.json({ status: 'success', data: draft });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ error: { message: 'Failed to update draft.' } });
  }
});

export default router;
