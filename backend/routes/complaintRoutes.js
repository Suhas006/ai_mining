const express = require('express');
const router = express.Router();
const { createComplaint, getMyGrievances, getPendingComplaints, resolveComplaint } = require('../controllers/complaintController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// POST /api/complaints/create - allows user to submit a new complaint
router.post('/create', authMiddleware, checkRole('user'), createComplaint);

// GET /api/complaints/my-grievances - fetches complaints for the logged in user
router.get('/my-grievances', authMiddleware, checkRole('user'), getMyGrievances);

// GET /api/complaints/pending - allows employee to fetch all pending complaints
// Also allowing admin for robustness
router.get('/pending', authMiddleware, getPendingComplaints);

// PUT /api/complaints/:id/resolve - resolve a complaint
router.put('/:id/resolve', authMiddleware, resolveComplaint);

module.exports = router;
