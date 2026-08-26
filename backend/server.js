const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { register, login, getMe } = require('./controllers/authController');
const { registerParcel, getParcels, searchParcels } = require('./controllers/parcelController');
const { analyzeRaster, getAnomalies, updateAnomalyStatus, assignAnomalyOfficer } = require('./controllers/surveillanceController');
const { submitInspection, getPendingInspections } = require('./controllers/inspectionController');
const { generateLegalNotice } = require('./controllers/reportController');
const { authMiddleware } = require('./middleware/authMiddleware');

const LandParcel = require('./models/LandParcel');
const MiningLease = require('./models/MiningLease');
const SurveillanceAnomaly = require('./models/SurveillanceAnomaly');
const FieldInspection = require('./models/FieldInspection');
const User = require('./models/User');
const AuditLog = require('./models/AuditLog');

const app = express();
// Enable CORS for all origins (e.g. Vercel frontend)
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection (Strictly use production URI)
if (!process.env.MONGODB_URI) {
  console.error('CRITICAL ERROR: process.env.MONGODB_URI is undefined or not set!');
  process.exit(1);
}

const seedDatabase = require('./seed');

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

// Base route to check if API is live
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "Online", 
    system: "GeoSuraksha API Server",
    version: "1.0.0" 
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'GeoSuraksha Unified 3D ULPIN & Mining Surveillance Grid API',
    timestamp: new Date().toISOString()
  });
});

// Authentication Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authMiddleware, getMe);

// Land Parcels & ULPIN Generator Routes
app.post('/api/parcels/register', registerParcel);
app.get('/api/parcels', getParcels);
app.get('/api/parcels/search', searchParcels);

// Satellite AI Surveillance Routes
app.post('/api/surveillance/analyze-raster', analyzeRaster);
app.get('/api/anomalies', getAnomalies);
app.patch('/api/anomalies/:id/status', updateAnomalyStatus);
app.patch('/api/anomalies/:id/assign', assignAnomalyOfficer);

// Field Inspection Routes
app.post('/api/inspection/submit', submitInspection);
app.get('/api/inspections/pending/:officerId', getPendingInspections);

// GIS Layers Overview Payload for React Leaflet Dashboard
app.get('/api/gis/overview-layers', async (req, res) => {
  try {
    const parcels = await LandParcel.find();
    const leases = await MiningLease.find();
    const anomalies = await SurveillanceAnomaly.find().populate('leaseId').populate('assignedOfficerId');
    const inspections = await FieldInspection.find();
    const officers = await User.find({ role: { $in: ['District Mining Officer', 'Field Inspection Squad', 'Revenue Surveyor (ULPIN)'] } }).select('-passwordHash');

    res.json({
      parcels,
      leases,
      anomalies,
      inspections,
      officers
    });
  } catch (err) {
    console.error('GIS Overview Layers Error:', err);
    res.status(500).json({ error: 'Failed to retrieve GIS overview layers.' });
  }
});

// Reports & Legal Notices
app.get('/api/reports/:anomalyId/legal-notice', generateLegalNotice);

// Audit Logs
app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GeoSuraksha API Server running on port ${PORT}`);
});
