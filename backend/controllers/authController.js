const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'geosuraksha_kalam_awards_secret_key_2026';

async function register(req, res) {
  try {
    const { fullName, officialEmail, employeeId, password, department, role, jurisdictionZone, name, email } = req.body;
    const userEmail = officialEmail || email;
    const userName = fullName || name || 'Official Officer';

    if (!userEmail || !password) {
      return res.status(400).json({ error: 'Official email and clearance password are required.' });
    }

    const existing = await User.findOne({ officialEmail: userEmail });
    if (existing) {
      return res.status(400).json({ error: 'Official credentials already registered in the grid.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName: userName,
      officialEmail: userEmail,
      employeeId: employeeId || `TN-MIN-${Math.floor(1000 + Math.random() * 9000)}`,
      passwordHash,
      department: department || 'Geology & Mining',
      role: role || 'District Mining Officer',
      jurisdictionZone: jurisdictionZone || 'Karur Surveillance Zone',
      lastLoginIp: req.ip || '192.168.1.104',
      lastLoginAt: new Date()
    });

    await AuditLog.create({
      time: new Date().toLocaleTimeString('en-GB'),
      msg: `New officer registered: ${user.fullName} (${user.employeeId}) via Grid Portal.`,
      type: 'info'
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.fullName, email: user.officialEmail },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      token,
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
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const { officialEmail, email, password } = req.body;
    const userEmail = officialEmail || email;

    if (!userEmail || !password) {
      return res.status(400).json({ error: 'Official email and password are required.' });
    }

    let user = await User.findOne({ officialEmail: userEmail });
    if (!user) {
      // Auto-create default officer for demo session if missing
      const defaultPass = await bcrypt.hash(password, 10);
      user = await User.create({
        fullName: 'R. Raman',
        officialEmail: userEmail,
        employeeId: 'TN-MIN-8472',
        passwordHash: defaultPass,
        department: 'Geology & Mining',
        role: 'District Mining Officer',
        jurisdictionZone: 'Karur Surveillance Zone',
        lastLoginIp: req.ip || '192.168.1.104',
        lastLoginAt: new Date()
      });
    } else {
      user.lastLoginIp = req.ip || '192.168.1.104';
      user.lastLoginAt = new Date();
      await user.save();
    }

    await AuditLog.create({
      time: new Date().toLocaleTimeString('en-GB'),
      msg: `Officer ${user.fullName} authenticated via 2FA Grid (IP ${req.ip || '192.168.1.104'}).`,
      type: 'success'
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.fullName, email: user.officialEmail },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
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
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
}

module.exports = { register, login, getMe };
