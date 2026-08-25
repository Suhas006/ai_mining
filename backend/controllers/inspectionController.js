const FieldInspection = require('../models/FieldInspection');
const SurveillanceAnomaly = require('../models/SurveillanceAnomaly');

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

    // 3. Create inspection record
    const inspectorId = req.user ? req.user.id : req.body.inspectorId;
    const inspection = await FieldInspection.create({
      anomalyId,
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
    await SurveillanceAnomaly.findByIdAndUpdate(anomalyId, { status: newAnomalyStatus });

    res.status(201).json({
      message: 'Field inspection evidence submitted and synced successfully.',
      inspection
    });

  } catch (err) {
    console.error('Submit Inspection Error:', err);
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
