const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  officialEmail: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true, unique: true }, // e.g. TN-MIN-2026-91
  passwordHash: { type: String, required: true },
  
  department: {
    type: String,
    enum: ['Geology & Mining', 'Land Resources (DILRMP)', 'State Police Cyber-Cell'],
    default: 'Geology & Mining'
  },
  role: {
    type: String,
    enum: [
      'District Mining Officer',
      'Revenue Surveyor (ULPIN)',
      'Field Inspection Squad',
      'System Administrator'
    ],
    default: 'District Mining Officer'
  },
  jurisdictionZone: {
    type: String,
    enum: [
      'Karur Surveillance Zone',
      'Coimbatore Mineral Belt',
      'Salem Iron & Granite Zone',
      'Trichy Cauvery Basin'
    ],
    default: 'Karur Surveillance Zone'
  },
  
  lastLoginIp: { type: String, default: '192.168.1.104' },
  lastLoginAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
