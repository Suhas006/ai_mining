const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const LandParcel = require('./models/LandParcel');
const MiningLease = require('./models/MiningLease');
const SurveillanceAnomaly = require('./models/SurveillanceAnomaly');
const FieldInspection = require('./models/FieldInspection');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/depthfence';

async function seedDatabase() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
      console.log('🌱 Connected to MongoDB for seeding...');
    }

    // This will wipe all existing data (including the old green dummy boxes)
    await User.deleteMany({});
    await LandParcel.deleteMany({});
    await MiningLease.deleteMany({});
    await SurveillanceAnomaly.deleteMany({});
    await FieldInspection.deleteMany({});

    console.log('🧹 Existing collections cleared.');

    // 1. Create Only Essential Users
    const passwordHash = await bcrypt.hash('admin123', 10);
    const officerHash = await bcrypt.hash('officer123', 10);

    const adminUser = await User.create({
      fullName: 'Dr. S. K. Murugan (District Collector)',
      officialEmail: 'admin@depthfence.tn.gov.in',
      employeeId: 'TN-MIN-2026-ADM1',
      passwordHash,
      role: 'System Administrator'
    });

    const officerUser = await User.create({
      fullName: 'R. Raman (Mining Inspection Officer)',
      officialEmail: 'officer.raman@depthfence.tn.gov.in',
      employeeId: 'TN-MIN-2026-OFF1',
      passwordHash: officerHash,
      role: 'District Mining Officer'
    });

    const surveyorUser = await User.create({
      fullName: 'K. Kumar (Senior Field Surveyor)',
      officialEmail: 'surveyor.kumar@depthfence.tn.gov.in',
      employeeId: 'TN-MIN-2026-SUR1',
      passwordHash: officerHash,
      role: 'Revenue Surveyor (ULPIN)'
    });

    console.log('👤 Base Users created.');
    console.log('🚀 DB Cleanup & Seeding completed successfully! (No dummy parcels created)');

  } catch (err) {
    console.error('❌ Seeding error:', err);
    throw err;
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedDatabase;