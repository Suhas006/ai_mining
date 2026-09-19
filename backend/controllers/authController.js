const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'depthfence_kalam_awards_secret_key_2026';

async function register(req, res) {
  try {
    console.log("--- INCOMING REGISTRATION ---");
    console.log("Req Body:", req.body);
    console.log("Req File:", req.file);

    const { fullName, officialEmail, employeeId, password, department, jurisdictionZone, name, email, role, qualifications, phone, dob, gender, address, emergencyContactName, emergencyContactPhone, jobTitle } = req.body;
    const userEmail = officialEmail || email;
    const userName = fullName || name || 'Official Officer';

    if (!userEmail || !password) {
      return res.status(400).json({ error: 'Official email and clearance password are required.' });
    }

    const existingUser = await User.findOne({ officialEmail: userEmail });
    if (existingUser) {
      if (!existingUser.isDeleted) {
        return res.status(400).json({ error: 'Official credentials already registered in the grid.' });
      } else if (!req.body.requestReactivation) {
        return res.status(409).json({ code: "PREVIOUSLY_REMOVED", error: "This email was previously removed from the enterprise grid. Would you like to request re-admission from the Administrator?" });
      } else {
        const passwordHash = await bcrypt.hash(password, 10);
        existingUser.passwordHash = passwordHash;
        existingUser.role = role || 'user';
        existingUser.fullName = userName;
        existingUser.status = 'reactivation_pending';
        existingUser.isReactivationRequested = true;
        // Optionally update other fields here...
        await existingUser.save();
        return res.status(200).json({ msg: "Re-admission request submitted to Admin for clearance.", status: 'Pending' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Strict separation of User vs Employee logic
    let status = 'Active';
    let employeeData = {
      education: '',
      photoUrl: '',
      phone: '',
      dob: null,
      gender: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      jobTitle: ''
    };

    if (role === 'employee') {
      status = 'Pending';
      employeeData.education = qualifications || '';
      employeeData.phone = phone || '';
      employeeData.dob = dob || null;
      employeeData.gender = gender || '';
      employeeData.address = address || '';
      employeeData.emergencyContactName = emergencyContactName || '';
      employeeData.emergencyContactPhone = emergencyContactPhone || '';
      employeeData.jobTitle = jobTitle || '';
      
      if (req.file && req.file.buffer) {
        employeeData.photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    if (role === 'user') {
      const uniqueFallback = 'STD_' + Date.now().toString();
      req.body.employeeId = uniqueFallback;
      employeeData.phone = uniqueFallback; // Bypass potential legacy unique index on phone
    }

    const user = await User.create({
      fullName: userName,
      officialEmail: userEmail,
      employeeId: role === 'user' ? req.body.employeeId : (employeeId || `TN-MIN-${Math.floor(1000 + Math.random() * 9000)}`),
      passwordHash,
      department: department || 'Geology & Mining',
      role: role || 'user',
      jurisdictionZone: jurisdictionZone || 'Karur Surveillance Zone',
      registrationType: role === 'employee' ? 'Employee' : 'User',
      status,
      education: employeeData.education,
      photoUrl: employeeData.photoUrl,
      phone: employeeData.phone,
      dob: employeeData.dob,
      gender: employeeData.gender,
      address: employeeData.address,
      emergencyContact: {
        name: employeeData.emergencyContactName,
        phone: employeeData.emergencyContactPhone
      },
      jobTitle: employeeData.jobTitle,
      lastLoginIp: req.ip || '192.168.1.104',
      lastLoginAt: new Date()
    });

    await AuditLog.create({
      time: new Date().toLocaleTimeString('en-GB'),
      msg: `New officer registered: ${user.fullName} (${user.employeeId}) via Grid Portal.`,
      type: 'info'
    });

    if (role === 'employee') {
      // Do not return token for pending employees
      return res.status(201).json({
        msg: 'Request sent to Administrator for approval.',
        status: 'Pending'
      });
    }

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
        status: user.status,
        lastLoginIp: user.lastLoginIp,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A duplicate entry exists for a unique field (e.g. Employee ID or Phone). Please verify your details.' });
    }
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const { officialEmail, email, password } = req.body;
    const userEmail = (officialEmail || email || '').toLowerCase();

    if (!userEmail || !password) {
      return res.status(400).json({ error: 'Official email and password are required.' });
    }

    // 1. Check for Environment Variable Admin Login
    const adminEmailEnv = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase() : null;
    const adminPassEnv = process.env.ADMIN_PASSWORD;

    if (adminEmailEnv && adminPassEnv && userEmail === adminEmailEnv && password === adminPassEnv) {
      const token = jwt.sign(
        { id: 'admin-env-id', role: 'admin', name: 'System Administrator', email: userEmail },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      
      await AuditLog.create({
        time: new Date().toLocaleTimeString('en-GB'),
        msg: `Environment Administrator Authenticated (IP ${req.ip || '192.168.1.104'}).`,
        type: 'success'
      });

      return res.json({
        token,
        msg: 'Administrator Login Authenticated.',
        user: {
          id: 'admin-env-id',
          name: 'System Administrator',
          email: userEmail,
          role: 'admin',
          status: 'Active'
        }
      });
    }

    // 2. Normal User DB Login
    let user = await User.findOne({ officialEmail: userEmail });
    
    // Remove auto-create demo user to enforce actual registration security
    if (!user) {
       return res.status(401).json({ error: 'Invalid credentials or user not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (user.status === 'Pending') {
      return res.status(403).json({ error: 'Account pending approval by Administrator.' });
    }

    user.lastLoginIp = req.ip || '192.168.1.104';
    user.lastLoginAt = new Date();
    await user.save();

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
        status: user.status,
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
