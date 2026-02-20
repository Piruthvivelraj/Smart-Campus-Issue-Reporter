const express = require('express');
const { body, validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create issue
router.post('/', [auth, [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').isIn(['Infrastructure', 'Cleanliness', 'Safety', 'Technology', 'Other']),
  body('location').trim().notEmpty()
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const issue = new Issue({
      ...req.body,
      reportedBy: req.userId
    });

    await issue.save();
    await issue.populate('reportedBy', 'name email');

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all issues
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    if (req.user.role === 'student') {
      filter.reportedBy = req.userId;
    }

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single issue
router.get('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (req.user.role === 'student' && issue.reportedBy._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update issue (admin only)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status, priority, assignedTo, updatedAt: Date.now() },
      { new: true }
    ).populate('reportedBy', 'name email').populate('assignedTo', 'name email');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.comments.push({
      user: req.userId,
      text: req.body.text
    });

    await issue.save();
    await issue.populate('comments.user', 'name email');

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete issue (admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
