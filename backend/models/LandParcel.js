const mongoose = require('mongoose');

const landParcelSchema = new mongoose.Schema({
  ulpin: { type: String, required: true, unique: true, index: true },
  ownerName: { type: String, required: true },
  surveyNumber: { type: String, required: true },
  areaAcres: { type: Number, required: true },
  boundaryPolygon: {
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
  centroid: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

landParcelSchema.index({ boundaryPolygon: '2dsphere' });
landParcelSchema.index({ centroid: '2dsphere' });

module.exports = mongoose.model('LandParcel', landParcelSchema, 'land_parcels');
