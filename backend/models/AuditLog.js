const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  time: { type: String, required: true },
  msg: { type: String, required: true },
  type: { type: String, enum: ['alert', 'success', 'info'], default: 'info' },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24h
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
