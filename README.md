# GeoSuraksha
**Unified 3D ULPIN & Mining Surveillance Grid**

## 1. Project Overview
GeoSuraksha is an advanced, AI-powered GIS platform built to monitor, detect, and enforce legal boundaries for mining leases. By integrating multi-temporal satellite raster imagery, the platform identifies illegal excavation, boundary breaches, and environmental encroachments in real-time. It bridges the gap between high-level satellite surveillance and on-the-ground mobile inspection squads, ensuring rapid triage and enforcement against illegal mining activities.

## 2. Tech Stack
The system is built on a modern **MERN** stack architecture optimized for geospatial data:
* **Frontend:** React (Vite), Tailwind CSS, Lucide Icons.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (Mongoose) with Geospatial indexing (2dsphere).
* **GIS Mapping:** Leaflet.js for rendering interactive layers, polygons, and satellite tiles.
* **Geospatial Math:** **Turf.js** for on-the-fly polygon differences, centroid calculations, and precise area (Sq. Meters) computation for infringements.
* **AI Analysis:** Google **Gemini 1.5 Flash Vision API** for parsing before/after satellite rasters to classify anomalies (e.g., Unpermitted Pit, Boundary Breach) and generate confidence scores.

## 3. Database Schema
The database strictly enforces the following Mongoose schemas:
* **Users (`User`):** Stores credentials, roles (e.g., District Mining Officer, Field Inspection Squad), and jurisdiction zones for RBAC.
* **Land Parcels (`LandParcel`):** Represents legal land registries tied to ULPINs, holding ownership details and exact GeoJSON boundaries.
* **Mining Leases (`MiningLease`):** Tracks active, permitted excavation zones including mineral types (Granite, Sand), volumetric caps, and legal buffer zones.
* **Anomalies (`SurveillanceAnomaly`):** AI-generated flags containing infringing GeoJSON polygons, severity classifications, and before/after satellite imagery links.
* **Inspections (`FieldInspection`):** Ground-truth verification records synced from mobile devices, featuring geotagged coordinates, GPS accuracy, and photo evidence to confirm or dismiss anomalies.

## 4. API Routes
Core functionality is exposed via the following Express endpoints:
* `GET /api/gis/layers` - Aggregates all active land parcels, leases, pending anomalies, and officers into a single payload for the master map dashboard.
* `POST /api/surveillance/analyze-raster` - Receives a target lease ID, triggers the Gemini Vision model to detect raster changes, calculates infringements via Turf.js, and generates a `SurveillanceAnomaly` record.
* `POST /api/inspection/submit` - Ingests geotagged mobile payload data from field officers, verifying ground evidence and automatically updating the status of the associated anomaly.
* `GET /api/inspection/pending/:officerId` - Feeds the mobile triage queue for a specific officer with their assigned pending inspections.

## 5. Environment Setup
To run this project locally, ensure you have the following environment variables configured:

**Backend (`backend/.env`):**
```env
# Required for database connection
MONGODB_URI=mongodb://127.0.0.1:27017/geosuraksha

# Required for AI Raster Change Detection
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (Defaults to 5000)
PORT=5000
```

**Frontend (`frontend/.env`):**
```env
# Required to point to the backend server
VITE_API_BASE_URL=http://localhost:5000
```

**Running Locally:**
1. Navigate to the `backend` directory, run `npm install`, and start the server with `npm run dev`.
   *(Note: The server includes an auto-seeder that will populate the database automatically if it detects an empty MongoDB cluster).*
2. Navigate to the `frontend` directory, run `npm install`, and start the UI with `npm run dev`.
