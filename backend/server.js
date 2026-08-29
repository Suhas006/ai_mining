const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

// Controllers
const { register, login, getMe } = require('./controllers/authController');
const { registerParcel, getParcels, searchParcels } = require('./controllers/parcelController');
const { analyzeRaster, getAnomalies, updateAnomalyStatus, assignAnomalyOfficer } = require('./controllers/surveillanceController');
const { submitInspection, getPendingInspections } = require('./controllers/inspectionController');
const { generateLegalNotice } = require('./controllers/reportController');
const { authMiddleware } = require('./middleware/authMiddleware');

// Models
const LandParcel = require('./models/LandParcel');
const MiningLease = require('./models/MiningLease');
const SurveillanceAnomaly = require('./models/SurveillanceAnomaly');
const FieldInspection = require('./models/FieldInspection');
const User = require('./models/User');
const AuditLog = require('./models/AuditLog');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const upload = multer({ storage: multer.memoryStorage() });

if (!process.env.MONGODB_URI) {
  console.error('CRITICAL ERROR: process.env.MONGODB_URI is undefined or not set!');
  process.exit(1);
}

const seedDatabase = require('./seed');

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully!');
    const count = await MiningLease.countDocuments();
    if (count === 0) {
      console.log('⚠️ Database is empty. Running auto-seeder...');
      await seedDatabase();
    }
  })
  .catch(err => console.error('⚠️ MongoDB Connection Error:', err));

// Basic Routes
app.get('/', (req, res) => {
  res.status(200).json({ status: "Online", system: "AI Land Survey API Server", version: "1.0.0" });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', system: 'AI Land Survey Gateway', timestamp: new Date().toISOString() });
});

// Authentication & Core Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authMiddleware, getMe);

app.post('/api/parcels/register', registerParcel);
app.get('/api/parcels', getParcels);
app.get('/api/parcels/search', searchParcels);

app.get('/api/anomalies', getAnomalies);
app.patch('/api/anomalies/:id/status', updateAnomalyStatus);
app.patch('/api/anomalies/:id/assign', assignAnomalyOfficer);

// ==============================================================
// 🌟 SMART DEMO AI ROUTE (NEUTRAL LAND MEASUREMENT TOOL) 🌟
// ==============================================================
app.post('/api/ai/analyze-raster', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No satellite image provided' });
    }

    const filename = req.file.originalname.toLowerCase();
    let boundaryData = [];
    let detectedArea = 0;

    // DEMO IMAGE 1: KARUR LAND
    if (filename.includes('karur') || filename.includes('image_1')) {
      detectedArea = 4850;
      boundaryData = [{
        type: "Extracted_Land_Boundary",
        confidence: 0.94,
        location: { lat: 10.9598, lng: 77.9128 },
        boundary_polygon: [[20, 30], [60, 25], [75, 50], [45, 80], [15, 60]]
      }];
    }
    // DEMO IMAGE 2: SALEM LAND
    else if (filename.includes('salem') || filename.includes('image_2')) {
      detectedArea = 8240;
      boundaryData = [{
        type: "Extracted_Land_Boundary",
        confidence: 0.97,
        location: { lat: 11.6643, lng: 78.1460 },
        boundary_polygon: [[40, 10], [80, 20], [90, 70], [60, 90], [30, 60]]
      }];
    }
    // DYNAMIC GENERATOR FOR ANY OTHER RANDOM IMAGE
    else {
      const fileLength = req.file.buffer.length;
      detectedArea = 2500 + (fileLength % 3000);
      const shiftX = fileLength % 15;
      const shiftY = fileLength % 10;
      const confidenceScore = ((85 + (fileLength % 14)) / 100).toFixed(2);

      boundaryData = [{
        type: "Extracted_Land_Boundary",
        confidence: parseFloat(confidenceScore),
        boundary_polygon: [[25 + shiftX, 35 + shiftY], [65 + shiftX, 30 + shiftY], [75 + shiftX, 65 + shiftY], [55 + shiftX, 80 + shiftY], [20 + shiftX, 70 + shiftY]]
      }];
    }

    // Save extracted boundary to MongoDB (Neutral tags)
    const savedBoundaries = [];
    if (boundaryData && boundaryData.length > 0) {
      const defaultLease = await MiningLease.findOne();
      const validLeaseId = defaultLease ? defaultLease._id : new mongoose.Types.ObjectId();

      for (const boundary of boundaryData) {
        const newRecord = new SurveillanceAnomaly({
          leaseId: validLeaseId,
          anomalyType: boundary.type,
          severity: 'Info', // Neutral tag
          aiConfidenceScore: boundary.confidence,
          aiModelVersion: 'AI-Boundary-Vision-v1',
          aiAnalysisLog: `Boundary measured from ${filename}.`,
          detectedCoordinates: {
            type: 'Point',
            coordinates: boundary.location ? [boundary.location.lng, boundary.location.lat] : [78.6569, 10.7905]
          },
          infringingPolygon: {
            type: 'Polygon',
            coordinates: [[[78.65, 10.79], [78.66, 10.79], [78.66, 10.80], [78.65, 10.80], [78.65, 10.79]]]
          },
          breachAreaSqMeters: detectedArea,
          status: 'Mapped_Successfully' // Neutral tag
        });

        const saved = await newRecord.save();
        savedBoundaries.push(saved);
      }
    }

    // Return the response to the frontend UI
    res.json({
      status: "success",
      anomalies: boundaryData,
      detected_area: detectedArea,
      savedToDatabase: savedBoundaries.length
    });

  } catch (error) {
    console.error("AI Proxy Error:", error.message);
    res.status(500).json({ error: "Failed to process image" });
  }
});

// Other Workflow Routes
app.post('/api/inspection/submit', submitInspection);
app.get('/api/inspections/pending/:officerId', getPendingInspections);
app.get('/api/reports/:anomalyId/legal-notice', generateLegalNotice);

app.get('/api/gis/overview-layers', async (req, res) => {
  try {
    const parcels = await LandParcel.find();
    const leases = await MiningLease.find();
    const anomalies = await SurveillanceAnomaly.find().populate('leaseId').populate('assignedOfficerId');
    const inspections = await FieldInspection.find();
    const officers = await User.find({ role: { $in: ['District Mining Officer', 'Field Inspection Squad'] } }).select('-passwordHash');

    res.json({ parcels, leases, anomalies, inspections, officers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve GIS layers.' });
  }
});

app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Z-Axis Elevation Mapping (ESA Copernicus 3D)
app.get('/api/elevation', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'Lat and Lng required' });

    const copernicusUrl = `https://api.opentopodata.org/v1/copernicus30m?locations=${lat},${lng}`;
    const response = await axios.get(copernicusUrl);
    res.json(response.data);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch elevation data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AI Land Survey API Server running on port ${PORT}`);
});