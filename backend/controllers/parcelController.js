const LandParcel = require('../models/LandParcel');
const { generateUlpin } = require('../utils/ulpinGenerator');
const geojsonValidation = require('geojson-validation');

async function registerParcel(req, res) {
  try {
    const { ownerName, surveyNumber, areaAcres, boundaryPolygon, districtCode } = req.body;

    if (!ownerName || !surveyNumber || !areaAcres || !boundaryPolygon) {
      return res.status(400).json({ error: 'ownerName, surveyNumber, areaAcres, and boundaryPolygon are required.' });
    }

    // GeoJSON validation check
    if (!geojsonValidation.isPolygon(boundaryPolygon)) {
      return res.status(400).json({ error: 'Invalid GeoJSON Polygon format for boundaryPolygon.' });
    }

    // 1. Derive centroid & generate ULPIN
    const { ulpin, centroid } = generateUlpin(boundaryPolygon, districtCode || '33');

    // 2. Duplicate check using $near query on centroids within ~1m (0.00001 deg approx)
    const existingNear = await LandParcel.findOne({
      centroid: {
        $near: {
          $geometry: centroid,
          $maxDistance: 2 // 2 meters radius duplicate check
        }
      }
    });

    if (existingNear) {
      return res.status(409).json({
        error: 'Land parcel duplicate detected. A parcel with near-identical centroid already exists.',
        existingUlpin: existingNear.ulpin
      });
    }

    // 3. Create parcel record
    const parcel = await LandParcel.create({
      ulpin,
      ownerName,
      surveyNumber,
      areaAcres,
      boundaryPolygon,
      centroid,
      registeredBy: req.user ? req.user.id : null
    });

    res.status(201).json({
      message: 'Land parcel registered successfully.',
      parcel
    });
  } catch (err) {
    console.error('Register Parcel Error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A land parcel with this ULPIN already exists.' });
    }
    res.status(500).json({ error: 'Failed to register land parcel.' });
  }
}

async function getParcels(req, res) {
  try {
    const parcels = await LandParcel.find().sort({ createdAt: -1 });
    res.json(parcels);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve land parcels.' });
  }
}

async function searchParcels(req, res) {
  try {
    const { lng, lat, maxDistanceMeters } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({ error: 'lng and lat query parameters are required.' });
    }

    const point = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    };

    const maxDist = parseInt(maxDistanceMeters) || 500;

    const parcels = await LandParcel.find({
      boundaryPolygon: {
        $near: {
          $geometry: point,
          $maxDistance: maxDist
        }
      }
    });

    res.json({ count: parcels.length, parcels });
  } catch (err) {
    res.status(500).json({ error: 'Spatial query search failed.' });
  }
}

module.exports = { registerParcel, getParcels, searchParcels };
