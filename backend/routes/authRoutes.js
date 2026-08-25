const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a new government official with role and jurisdiction clearance
router.post('/register', async (req, res) => {
  try {
    const { fullName, officialEmail, employeeId, password, department, role, jurisdictionZone } = req.body;

    // Check if officer credentials already exist
    let user = await User.findOne({ $or: [{ officialEmail }, { employeeId }] });
    if (user) {
      return res.status(400).json({ msg: 'Official credentials already registered in the grid.' });
    }

    user = new User({
      fullName: fullName || 'Official Officer',
      officialEmail,
      employeeId: employeeId || `TN-MIN-${Math.floor(1000 + Math.random() * 9000)}`,
      passwordHash: password || 'default_pass',
      department: department || 'Geology & Mining',
      role: role || 'District Mining Officer',
      jurisdictionZone: jurisdictionZone || 'Karur Surveillance Zone',
      lastLoginIp: req.ip || '192.168.1.104',
      lastLoginAt: new Date()
    });

    await user.save();

    res.json({
      token: `mock-jwt-token-${Date.now()}`,
      msg: 'Security Clearance Granted.',
      user: {
        id: user._id,
        name: user.fullName,
        email: user.officialEmail,
        employeeId: user.employeeId,
        department: user.department,
        role: user.role,
        jurisdiction: user.jurisdictionZone,
        lastLoginIp: user.lastLoginIp,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (err) {
    console.error('Register Auth Error:', err.message);
    res.status(500).json({ error: 'Authentication Server Error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate officer & get clearance token
router.post('/login', async (req, res) => {
  try {
    const { officialEmail, password } = req.body;

    let user = await User.findOne({ officialEmail });
    if (!user) {
      // Create automatic default session officer for demo convenience
      user = new User({
        fullName: 'R. Raman',
        officialEmail: officialEmail || 'officer@tn.gov.in',
        employeeId: 'TN-MIN-8472',
        passwordHash: password || 'pass',
        department: 'Geology & Mining',
        role: 'District Mining Officer',
        jurisdictionZone: 'Karur Surveillance Zone',
        lastLoginIp: req.ip || '192.168.1.104',
        lastLoginAt: new Date()
      });
      await user.save();
    } else {
      user.lastLoginIp = req.ip || '192.168.1.104';
      user.lastLoginAt = new Date();
      await user.save();
    }

    res.json({
      token: `mock-jwt-token-${Date.now()}`,
      msg: 'Official Login Authenticated.',
      user: {
        id: user._id,
        name: user.fullName,
        email: user.officialEmail,
        employeeId: user.employeeId,
        department: user.department,
        role: user.role,
        jurisdiction: user.jurisdictionZone,
        lastLoginIp: user.lastLoginIp,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (err) {
    console.error('Login Auth Error:', err.message);
    res.status(500).json({ error: 'Authentication Server Error' });
  }
});

module.exports = router;
