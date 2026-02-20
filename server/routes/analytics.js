const express = require('express');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const openIssues = await Issue.countDocuments({ status: 'Open' });
    const inProgressIssues = await Issue.countDocuments({ status: 'In Progress' });
    const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
    const closedIssues = await Issue.countDocuments({ status: 'Closed' });

    const issuesByCategory = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const issuesByPriority = await Issue.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const recentIssues = await Issue.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reportedBy', 'name email');

    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    res.json({
      summary: {
        totalIssues,
        openIssues,
        inProgressIssues,
        resolvedIssues,
        closedIssues
      },
      issuesByCategory,
      issuesByPriority,
      recentIssues,
      users: {
        totalUsers,
        totalStudents,
        totalAdmins
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
