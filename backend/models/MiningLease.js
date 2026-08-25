const mongoose = require('mongoose');

const miningLeaseSchema = new mongoose.Schema({
  leaseId: { type: String, required: true, unique: true },
  leaseHolderName: { type: String, required: true },
  mineralType: { 
    type: String, 
    enum: ['Granite', 'Sand', 'Coal', 'Limestone'], 
    default: 'Granite' 
  },
  permittedVolumeMetricTons: { type: Number, required: true },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  leasePolygon: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon',
      required: true
    },
    coordinates: {
      type: [[[Number]]], // [[[lng, lat], [lng, lat], ...]]
      required: true
    }
  },
  bufferMeters: { type: Number, default: 10 },
  status: { 
    type: String, 
    enum: ['Active', 'Suspended', 'Expired'], 
    default: 'Active' 
  },
  createdAt: { type: Date, default: Date.now }
});

miningLeaseSchema.index({ leasePolygon: '2dsphere' });

module.exports = mongoose.model('MiningLease', miningLeaseSchema, 'mining_leases');
