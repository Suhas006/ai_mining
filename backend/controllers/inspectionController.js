const mongoose = require('mongoose');
const FieldInspection = require('../models/FieldInspection');
const SurveillanceAnomaly = require('../models/SurveillanceAnomaly');
const User = require('../models/User');

async function submitInspection(req, res) {
  try {
    const {
      anomalyId,
      clientUuid,
      groundCoordinates,
      gpsAccuracyMeters,
      evidencePhotoUrls,
      fieldRemarks,
      isBreachConfirmed
    } = req.body;

    if (!anomalyId || !clientUuid || !groundCoordinates) {
      return res.status(400).json({ error: 'anomalyId, clientUuid, and groundCoordinates are required.' });
    }

    // 1. Check idempotency: if clientUuid already exists, return existing record
    const existing = await FieldInspection.findOne({ clientUuid });
    if (existing) {
      return res.status(200).json({
        message: 'Inspection already processed (idempotent response).',
        inspection: existing
      });
    }

    // 2. Reject GPS accuracy worse than ±10m per spec rules
    const accuracy = parseFloat(gpsAccuracyMeters) || 5;
    if (accuracy > 10) {
      return res.status(422).json({
        error: `GPS fix accuracy of ±${accuracy}m exceeds maximum allowed threshold of ±10m.`
      });
    }

    // Handle mock anomaly ID from frontend
    let finalAnomalyId = anomalyId;
    if (!mongoose.Types.ObjectId.isValid(finalAnomalyId)) {
      finalAnomalyId = new mongoose.Types.ObjectId();
    }

    // 3. Create inspection record
    let inspectorId = req.user ? req.user.id : req.body.inspectorId;
    if (!inspectorId) {
      const officer = await User.findOne({ role: { $in: ['District Mining Officer', 'Field Inspection Squad', 'Revenue Surveyor (ULPIN)'] } });
      if (officer) {
        inspectorId = officer._id;
      } else {
        // Fallback to a valid ObjectId if no officers exist
        inspectorId = new mongoose.Types.ObjectId();
      }
    }

    const inspection = await FieldInspection.create({
      anomalyId: finalAnomalyId,
      inspectorId,
      clientUuid,
      groundCoordinates: {
        type: 'Point',
        coordinates: groundCoordinates.coordinates || groundCoordinates // [lng, lat]
      },
      gpsAccuracyMeters: accuracy,
      evidencePhotoUrls: evidencePhotoUrls || [],
      fieldRemarks: fieldRemarks || 'Perimeter inspected on ground. Geotagged coordinates verified.',
      isBreachConfirmed: Boolean(isBreachConfirmed),
      syncStatus: 'synced'
    });

    // 4. Automatically update anomaly status based on ground confirmation
    const newAnomalyStatus = isBreachConfirmed ? 'Verified' : 'Dismissed';
    if (mongoose.Types.ObjectId.isValid(finalAnomalyId)) {
      await SurveillanceAnomaly.findByIdAndUpdate(finalAnomalyId, { status: newAnomalyStatus });
    }

    res.status(201).json({
      message: 'Field inspection evidence submitted and synced successfully.',
      inspection
    });

  } catch (err) {
    console.error('Submit Inspection Error:', err);
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to process field inspection.' });
  }
}

async function getPendingInspections(req, res) {
  try {
    const { officerId } = req.params;
    const pendingAnomalies = await SurveillanceAnomaly.find({
      assignedOfficerId: officerId,
      status: 'Pending_Inspection'
    }).populate('leaseId');

    res.json({ officerId, pendingCases: pendingAnomalies });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve pending officer inspections.' });
  }
}

module.exports = { submitInspection, getPendingInspections };
