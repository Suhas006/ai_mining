const mongoose = require('mongoose');

const surveillanceAnomalySchema = new mongoose.Schema({
  leaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'MiningLease', required: true },
  anomalyType: { 
    type: String, 
    enum: ['Boundary_Breach', 'Excess_Excavation', 'Unpermitted_Pit'], 
    default: 'Boundary_Breach' 
  },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'High' 
  },
  detectedCoordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  infringingPolygon: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]]
    }
  },
  breachAreaSqMeters: { type: Number, default: 0 },
  satelliteImageBeforeUrl: { type: String, default: '' },
  satelliteImageAfterUrl: { type: String, default: '' },
  aiConfidenceScore: { type: Number, default: 0.92 },
  aiAnalysisLog: { type: String, default: '' },
  aiModelVersion: { type: String, default: 'Gemini-1.5-Flash-Vision-v1' },
  status: { 
    type: String, 
    enum: ['Pending_Inspection', 'Verified', 'Dismissed', 'Legal_Notice_Issued'], 
    default: 'Pending_Inspection' 
  },
  assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

surveillanceAnomalySchema.index({ detectedCoordinates: '2dsphere' });

module.exports = mongoose.model('SurveillanceAnomaly', surveillanceAnomalySchema, 'surveillance_anomalies');
