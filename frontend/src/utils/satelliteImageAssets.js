// Real Satellite & Field Inspection Image Data URIs (100% Offline & Network Fail-Proof)

function createSatelliteCanvasImage({ title, subtitle, tag, isBreach, type }) {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  // Ground Terrain Base Layer (Satellite Orthophoto texture simulation)
  const grad = ctx.createLinearGradient(0, 0, 800, 500);
  if (type === 't30') {
    grad.addColorStop(0, '#1E293B');
    grad.addColorStop(0.5, '#16233B');
    grad.addColorStop(1, '#0F172A');
  } else if (type === 't15') {
    grad.addColorStop(0, '#262817');
    grad.addColorStop(0.5, '#1E2419');
    grad.addColorStop(1, '#0F172A');
  } else if (type === 't0') {
    grad.addColorStop(0, '#311414');
    grad.addColorStop(0.5, '#241216');
    grad.addColorStop(1, '#0F172A');
  } else {
    grad.addColorStop(0, '#1E293B');
    grad.addColorStop(1, '#0B0F17');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 500);

  // Satellite Grid Lines (0.5m GSD Mesh)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 800; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 500);
    ctx.stroke();
  }
  for (let y = 0; y < 500; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(800, y);
    ctx.stroke();
  }

  // Draw Realistic Satellite Quarry Pit Features
  // Legal Boundary Box (Cyan)
  ctx.strokeStyle = '#0EA5E9';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(100, 80, 480, 320);
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
  ctx.fillRect(100, 80, 480, 320);

  ctx.fillStyle = '#0EA5E9';
  ctx.font = 'bold 14px JetBrains Mono, monospace';
  ctx.fillText('LEGAL LEASE BOUNDARY: TN-KRR-GRN-2024-009', 115, 110);

  if (type === 't15') {
    // Clearing Vegetation Box (Yellow)
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.fillRect(400, 80, 180, 180);
    ctx.strokeRect(400, 80, 180, 180);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 13px JetBrains Mono, monospace';
    ctx.fillText('VEGETATION CLEARING', 410, 110);
    ctx.fillText('1,200 sq.m Excavation', 410, 130);
  }

  if (type === 't0' || isBreach) {
    // Unpermitted Breach Box (Crimson Red)
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.fillRect(420, 60, 260, 240);
    ctx.strokeRect(420, 60, 260, 240);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px JetBrains Mono, monospace';
    ctx.fillText('UNPERMITTED PIT BREACH', 435, 95);
    ctx.fillText('+4,850 sq.m ENCROACHMENT', 435, 120);
    ctx.fillText('Depth: 17m past limit (-32m)', 435, 145);
  }

  if (type === 'field') {
    // Geotagged Ground Photo Overlay
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 18px JetBrains Mono, monospace';
    ctx.fillText('MOBILE FIELD INSPECTION EVIDENCE', 40, 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px JetBrains Mono, monospace';
    ctx.fillText('Inspector: R. Raman (Mining Enforcement Officer)', 40, 95);
    ctx.fillText('Geotagged Centroid: [77.9672° E, 10.9540° N]', 40, 120);
    ctx.fillText('GPS Dwell Fix Accuracy: ±3.4 meters', 40, 145);
    ctx.fillText('Quarry Pit Wall Bench Cut: Verified Breach past Marker #14', 40, 170);

    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 740, 440);
  }

  // Header Banner
  ctx.fillStyle = 'rgba(11, 15, 23, 0.9)';
  ctx.fillRect(0, 430, 800, 70);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px JetBrains Mono, monospace';
  ctx.fillText(title, 20, 458);

  ctx.fillStyle = isBreach ? '#EF4444' : '#10B981';
  ctx.font = 'bold 13px JetBrains Mono, monospace';
  ctx.fillText(subtitle, 20, 482);

  ctx.fillStyle = '#0EA5E9';
  ctx.font = 'bold 13px JetBrains Mono, monospace';
  ctx.fillText(tag, 580, 470);

  return canvas.toDataURL('image/png');
}

export function getSatelliteImage(type) {
  if (type === 't30') {
    return createSatelliteCanvasImage({
      title: 'T-30 DAYS BASELINE ORBITAL RASTER (25 JULY 2026)',
      subtitle: '✓ 0 sq.m Breach • Clean Legal Lease Perimeter',
      tag: 'SENTINEL-2B • 0.5m GSD',
      isBreach: false,
      type: 't30'
    });
  } else if (type === 't15') {
    return createSatelliteCanvasImage({
      title: 'T-15 DAYS REVISIT PASS (10 AUGUST 2026)',
      subtitle: '⚠️ 1,200 sq.m Unpermitted Vegetation Clearing Detected',
      tag: 'SENTINEL-2B • 0.5m GSD',
      isBreach: false,
      type: 't15'
    });
  } else if (type === 't0') {
    return createSatelliteCanvasImage({
      title: 'T-0 TODAY SENTINEL INTERCEPT (25 AUGUST 2026)',
      subtitle: '🚨 4,850 sq.m CRITICAL BREACH • ₹51.53 Cr FINE DEMAND',
      tag: 'GEMINI 1.5 VISION 96%',
      isBreach: true,
      type: 't0'
    });
  } else if (type === 'field') {
    return createSatelliteCanvasImage({
      title: 'GEOTAGGED GROUND SURVEY EVIDENCE • INSPECTOR R. RAMAN',
      subtitle: '✓ Verified Dwell GPS Fix [77.9672° E, 10.9540° N]',
      tag: 'HIVE MOBILE VERIFIED',
      isBreach: true,
      type: 'field'
    });
  }
  return '';
}
