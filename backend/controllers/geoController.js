const axios = require('axios');

exports.calculateZAxis = async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon || !Array.isArray(polygon) || polygon.length === 0) {
      return res.status(400).json({ error: 'Polygon coordinates array is required.' });
    }

    // Attempt to call OpenTopoData API (Copernicus DEM)
    // If it fails or times out, fallback to a mocked deterministic algorithm.
    let elevations = [];
    let usedMock = false;

    try {
      // Taking up to 5 points to prevent too long of a URL or API limits
      const samplePoints = polygon.slice(0, 5);
      const locationsParam = samplePoints.map(p => `${p[0]},${p[1]}`).join('|');
      
      const copernicusUrl = `https://api.opentopodata.org/v1/copernicus30m?locations=${locationsParam}`;
      const response = await axios.get(copernicusUrl, { timeout: 5000 });
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        elevations = response.data.results.map(r => r.elevation);
      } else {
        throw new Error("No results from DEM API");
      }
    } catch (apiError) {
      usedMock = true;
      console.warn("DEM API failed, using fallback algorithms.", apiError.message);
      // Deterministic Mock Generation based on coordinates
      elevations = polygon.map(point => {
        const lat = point[0] || point.lat;
        const lng = point[1] || point.lng;
        // Generate realistic looking elevation between 200 and 400 meters
        return 300 + (Math.sin(lat * 100) * 50) + (Math.cos(lng * 100) * 50);
      });
    }

    let min = Math.min(...elevations);
    let max = Math.max(...elevations);
    let avg = elevations.reduce((a, b) => a + b, 0) / elevations.length;

    res.json({
      averageElevation: parseFloat(avg.toFixed(2)),
      maxElevation: parseFloat(max.toFixed(2)),
      minElevation: parseFloat(min.toFixed(2)),
      dataSource: usedMock ? 'Copernicus DEM (Simulated Fallback)' : 'Copernicus DEM (Live)',
      rawElevations: elevations
    });

  } catch (error) {
    console.error('Error calculating Z-Axis:', error);
    res.status(500).json({ error: 'Failed to calculate Z-Axis depth.' });
  }
};
