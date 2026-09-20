const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  complainantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  governmentId: { type: String, required: true },
  
  propertyDetails: {
    type: { type: String, required: true },
    address: { type: String, required: true },
    surveyNumber: { type: String },
    areaAffected: { type: String }
  },
  
  encroacherDetails: {
    name: { type: String },
    contact: { type: String },
    relationship: { type: String }
  },
  
  complaintDetails: {
    dateNoticed: { type: Date },
    description: { type: String, required: true },
    policeIntervention: { type: Boolean, default: false }
  },
  
  status: {
    type: String,
    enum: ['pending', 'under_investigation', 'resolved', 'rejected'],
    default: 'pending'
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
