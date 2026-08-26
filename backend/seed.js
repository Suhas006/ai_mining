const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const LandParcel = require('./models/LandParcel');
const MiningLease = require('./models/MiningLease');
const SurveillanceAnomaly = require('./models/SurveillanceAnomaly');
const FieldInspection = require('./models/FieldInspection');
const { generateUlpin } = require('./utils/ulpinGenerator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/geosuraksha';

async function seedDatabase() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
      console.log('🌱 Connected to MongoDB for seeding...');
    }

    // Clear existing collections
    await User.deleteMany({});
    await LandParcel.deleteMany({});
    await MiningLease.deleteMany({});
    await SurveillanceAnomaly.deleteMany({});
    await FieldInspection.deleteMany({});

    console.log('🧹 Existing collections cleared.');

    // 1. Create Seed Users
    const passwordHash = await bcrypt.hash('admin123', 10);
    const officerHash = await bcrypt.hash('officer123', 10);

    const adminUser = await User.create({
      name: 'Dr. S. K. Murugan (District Collector)',
      email: 'admin@geosuraksha.tn.gov.in',
      passwordHash,
      role: 'admin',
      assignedDistrict: 'Karur'
    });

    const officerUser = await User.create({
      name: 'R. Raman (Mining Inspection Officer)',
      email: 'officer.raman@geosuraksha.tn.gov.in',
      passwordHash: officerHash,
      role: 'officer',
      assignedDistrict: 'Karur'
    });

    const surveyorUser = await User.create({
      name: 'K. Kumar (Senior Field Surveyor)',
      email: 'surveyor.kumar@geosuraksha.tn.gov.in',
      passwordHash: officerHash,
      role: 'surveyor',
      assignedDistrict: 'Karur'
    });

    console.log('👤 Users created.');

    // 2. Create Sample Land Parcels in Karur Granite Belt
    // Coordinates [lng, lat]
    const parcel1Polygon = {
      type: 'Polygon',
      coordinates: [[
        [77.9450, 10.9520],
        [77.9490, 10.9520],
        [77.9490, 10.9560],
        [77.9450, 10.9560],
        [77.9450, 10.9520]
      ]]
    };

    const parcel2Polygon = {
      type: 'Polygon',
      coordinates: [[
        [77.9510, 10.9580],
        [77.9570, 10.9580],
        [77.9570, 10.9630],
        [77.9510, 10.9630],
        [77.9510, 10.9580]
      ]]
    };

    const { ulpin: ulpin1, centroid: centroid1 } = generateUlpin(parcel1Polygon, '33');
    const { ulpin: ulpin2, centroid: centroid2 } = generateUlpin(parcel2Polygon, '33');

    const parcel1 = await LandParcel.create({
      ulpin: ulpin1,
      ownerName: 'V. Sundaram & Sons Minerals',
      surveyNumber: 'SF-142/2A Karur North',
      areaAcres: 14.8,
      boundaryPolygon: parcel1Polygon,
      centroid: centroid1,
      registeredBy: surveyorUser._id
    });

    const parcel2 = await LandParcel.create({
      ulpin: ulpin2,
      ownerName: 'Kongu Granite Mining Corp',
      surveyNumber: 'SF-88/4B Aravakurichi',
      areaAcres: 26.3,
      boundaryPolygon: parcel2Polygon,
      centroid: centroid2,
      registeredBy: surveyorUser._id
    });

    console.log(`📌 Land Parcels created. Generated ULPINs: ${ulpin1}, ${ulpin2}`);

    // 3. Create Sample Mining Leases
    const lease1 = await MiningLease.create({
      leaseId: 'TN-KRR-GRN-2024-009',
      leaseHolderName: 'Kaveri Black Granite Leases Ltd',
      mineralType: 'Granite',
      permittedVolumeMetricTons: 50000,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2029-12-31'),
      bufferMeters: 10,
      status: 'Active',
      leasePolygon: {
        type: 'Polygon',
        coordinates: [[
          [77.9600, 10.9480],
          [77.9660, 10.9480],
          [77.9660, 10.9530],
          [77.9600, 10.9530],
          [77.9600, 10.9480]
        ]]
      }
    });

    const lease2 = await MiningLease.create({
      leaseId: 'TN-KRR-SND-2025-014',
      leaseHolderName: 'Amaravathi Sand Extraction Trust',
      mineralType: 'Sand',
      permittedVolumeMetricTons: 80000,
      validFrom: new Date('2025-02-01'),
      validTo: new Date('2030-01-31'),
      bufferMeters: 10,
      status: 'Active',
      leasePolygon: {
        type: 'Polygon',
        coordinates: [[
          [77.9700, 10.9650],
          [77.9780, 10.9650],
          [77.9780, 10.9720],
          [77.9700, 10.9720],
          [77.9700, 10.9650]
        ]]
      }
    });

    console.log('⛏️ Mining Leases created.');

    // 4. Create Sample Surveillance Anomalies (Breaches)
    // Anomaly 1: Unpermitted pit expanding north-east of lease 1
    const breachPolygon1 = {
      type: 'Polygon',
      coordinates: [[
        [77.9660, 10.9525],
        [77.9685, 10.9525],
        [77.9685, 10.9555],
        [77.9660, 10.9555],
        [77.9660, 10.9525]
      ]]
    };

    const anomaly1 = await SurveillanceAnomaly.create({
      leaseId: lease1._id,
      anomalyType: 'Boundary_Breach',
      severity: 'Critical',
      detectedCoordinates: {
        type: 'Point',
        coordinates: [77.9672, 10.9540]
      },
      infringingPolygon: breachPolygon1,
      breachAreaSqMeters: 4850,
      satelliteImageBeforeUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop',
      satelliteImageAfterUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=600&auto=format&fit=crop',
      aiConfidenceScore: 0.96,
      aiAnalysisLog: 'Multi-temporal Sentinel-2 raster comparison indicates 4,850 sq.m unpermitted granite bench removal past legal eastern buffer line.',
      aiModelVersion: 'Gemini-1.5-Flash-Vision-v1',
      status: 'Pending_Inspection',
      assignedOfficerId: officerUser._id
    });

    const anomaly2 = await SurveillanceAnomaly.create({
      leaseId: lease2._id,
      anomalyType: 'Excess_Excavation',
      severity: 'High',
      detectedCoordinates: {
        type: 'Point',
        coordinates: [77.9785, 10.9680]
      },
      infringingPolygon: {
        type: 'Polygon',
        coordinates: [[
          [77.9780, 10.9670],
          [77.9810, 10.9670],
          [77.9810, 10.9695],
          [77.9780, 10.9695],
          [77.9780, 10.9670]
        ]]
      },
      breachAreaSqMeters: 2150,
      satelliteImageBeforeUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop',
      satelliteImageAfterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
      aiConfidenceScore: 0.91,
      aiAnalysisLog: 'Surface riverbed sand dredging encroachment extending 2,150 sq.m into protected riparian buffer zone.',
      aiModelVersion: 'Gemini-1.5-Flash-Vision-v1',
      status: 'Pending_Inspection',
      assignedOfficerId: officerUser._id
    });

    console.log('🚨 Surveillance Anomalies created.');

    // 5. Create Sample Field Inspection
    await FieldInspection.create({
      anomalyId: anomaly1._id,
      inspectorId: officerUser._id,
      clientUuid: '8f7d9a1e-3b2c-4f5e-9a1b-0c9d8e7f6a5b',
      groundCoordinates: {
        type: 'Point',
        coordinates: [77.9672, 10.9540]
      },
      gpsAccuracyMeters: 3.4,
      evidencePhotoUrls: [
        'https://images.unsplash.com/photo-1508873696983-2df515122519?w=600&auto=format&fit=crop'
      ],
      fieldRemarks: 'Ground survey confirmed heavy machinery excavating outside legal boundary marker #14.',
      isBreachConfirmed: true,
      syncStatus: 'synced'
    });

    console.log('✅ Field Inspection created.');
    console.log('🚀 DB Seeding completed successfully!');

  } catch (err) {
    console.error('❌ Seeding error:', err);
    throw err;
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedDatabase;
