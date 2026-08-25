const turf = require('@turf/turf');
const ngeohash = require('ngeohash');

/**
 * Generates a deterministic 14-digit ULPIN (Unique Land Parcel Identification Number)
 * based on the spatial centroid of a given GeoJSON polygon.
 * 
 * @param {Object} polygonGeoJson - GeoJSON Polygon object
 * @param {String} districtCode - 2-digit district/state code (default: '33')
 * @returns {Object} { ulpin, centroid: [lng, lat] }
 */
function generateUlpin(polygonGeoJson, districtCode = '33') {
  // 1. Calculate centroid [lng, lat]
  const centroidPoint = turf.centroid(polygonGeoJson);
  const coordinates = centroidPoint.geometry.coordinates; // [lng, lat]
  const lng = coordinates[0];
  const lat = coordinates[1];

  // 2. Compute 10-char high-precision geohash (~1m precision)
  const geohash = ngeohash.encode(lat, lng, 10);

  // 3. Convert geohash alphanumeric characters to numeric representation
  let numericRepresentation = '';
  for (let i = 0; i < geohash.length; i++) {
    const code = geohash.charCodeAt(i);
    numericRepresentation += (code % 10).toString();
  }

  // 4. Concatenate district code + numeric geohash digits to form 13-digit base
  const rawBase = (districtCode + numericRepresentation).slice(0, 13).padEnd(13, '0');

  // 5. Compute mod-10 check digit
  const digits = rawBase.split('').map(Number);
  const sum = digits.reduce((acc, digit, idx) => {
    const weight = idx % 2 === 0 ? 1 : 3;
    return acc + digit * weight;
  }, 0);
  const checkDigit = (10 - (sum % 10)) % 10;

  const ulpin = `${rawBase}${checkDigit}`;

  return {
    ulpin, // 14 digits
    centroid: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  };
}

module.exports = { generateUlpin };
