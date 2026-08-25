const mongoose = require('mongoose');

const fieldInspectionSchema = new mongoose.Schema({
  anomalyId: { type: mongoose.Schema.Types.ObjectId, ref: 'SurveillanceAnomaly', required: true },
  inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientUuid: { type: String, required: true, unique: true, index: true },
  groundCoordinates: {
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
  gpsAccuracyMeters: { type: Number, default: 5 },
  evidencePhotoUrls: [{ type: String }],
  fieldRemarks: { type: String, default: '' },
  isBreachConfirmed: { type: Boolean, required: true },
  submittedAt: { type: Date, default: Date.now },
  syncStatus: { 
    type: String, 
    enum: ['synced', 'offline_buffer'], 
    default: 'synced' 
  }
});

module.exports = mongoose.model('FieldInspection', fieldInspectionSchema, 'field_inspections');
