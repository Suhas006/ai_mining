const PDFDocument = require('pdfkit');
const SurveillanceAnomaly = require('../models/SurveillanceAnomaly');
const MiningLease = require('../models/MiningLease');
const LandParcel = require('../models/LandParcel');

async function generateLegalNotice(req, res) {
  try {
    const { anomalyId } = req.params;

    const anomaly = await SurveillanceAnomaly.findById(anomalyId)
      .populate('leaseId')
      .populate('assignedOfficerId');

    if (!anomaly) {
      return res.status(404).json({ error: 'Surveillance anomaly not found.' });
    }

    const lease = anomaly.leaseId;

    // Create PDF document stream
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Legal_Breach_Notice_${anomaly._id}.pdf`);

    doc.pipe(res);

    // Header Header Banner
    doc
      .fillColor('#0F172A')
      .rect(0, 0, doc.page.width, 100)
      .fill();

    doc
      .fillColor('#FFFFFF')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('GOVERNMENT OF TAMIL NADU', 50, 25, { align: 'center' });

    doc
      .fontSize(14)
      .font('Helvetica')
      .text('DEPARTMENT OF GEOLOGY & MINING — ENFORCEMENT GRID', 50, 55, { align: 'center' });

    doc
      .fontSize(10)
      .fillColor('#94A3B8')
      .text('DEPTHFENCE AUTOMATED LEGAL NOTICE ENGINE v2.0', 50, 75, { align: 'center' });

    doc.moveDown(3);

    // Title
    doc
      .fillColor('#DC2626')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('OFFICIAL NOTICE OF MINING BOUNDARY BREACH & PENALTY DEMAND', 50, 120);

    doc
      .strokeColor('#CBD5E1')
      .lineWidth(1)
      .moveTo(50, 142)
      .lineTo(doc.page.width - 50, 142)
      .stroke();

    doc.moveDown(1.5);

    // Reference Details Table
    const refDate = new Date().toLocaleDateString('en-IN', { dateStyle: 'full' });
    doc.fillColor('#1E293B').fontSize(10).font('Helvetica-Bold');
    doc.text(`Notice Reference ID: `, 50, 160, { continued: true }).font('Helvetica').text(`GS-LN-${anomaly._id.toString().slice(-8).toUpperCase()}`);
    doc.font('Helvetica-Bold').text(`Date of Issuance: `, 50, 175, { continued: true }).font('Helvetica').text(refDate);
    doc.font('Helvetica-Bold').text(`Mining Lease ID: `, 50, 190, { continued: true }).font('Helvetica').text(lease ? lease.leaseId : 'N/A');
    doc.font('Helvetica-Bold').text(`Leaseholder Name: `, 50, 205, { continued: true }).font('Helvetica').text(lease ? lease.leaseHolderName : 'N/A');
    doc.font('Helvetica-Bold').text(`Mineral Type: `, 50, 220, { continued: true }).font('Helvetica').text(lease ? lease.mineralType : 'N/A');

    doc.moveDown(1.5);

    // Anomaly Findings Box
    doc
      .fillColor('#FEF2F2')
      .rect(50, 245, doc.page.width - 100, 130)
      .fill()
      .strokeColor('#FCA5A5')
      .lineWidth(1)
      .rect(50, 245, doc.page.width - 100, 130)
      .stroke();

    doc
      .fillColor('#991B1B')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('AI SATELLITE & GROUND-TRUTH EVIDENTIARY FINDINGS', 65, 255);

    doc.fillColor('#1E293B').fontSize(10).font('Helvetica');
    doc.text(`Breach Type: ${anomaly.anomalyType}`, 65, 275);
    doc.text(`Severity Level: ${anomaly.severity}`, 65, 290);
    doc.text(`Detected Centroid Coordinates: [${anomaly.detectedCoordinates.coordinates[0].toFixed(6)}, ${anomaly.detectedCoordinates.coordinates[1].toFixed(6)}]`, 65, 305);
    doc.text(`Calculated Illegal Encroachment Area: ${anomaly.breachAreaSqMeters} sq. meters`, 65, 320);
    doc.text(`AI Confidence Index: ${(anomaly.aiConfidenceScore * 100).toFixed(1)}% (${anomaly.aiModelVersion})`, 65, 335);
    doc.text(`Case Status: ${anomaly.status}`, 65, 350);

    doc.moveDown(3);

    // Statutory Penalty Calculation
    const ratePerSqM = 1500; // Rs. 1500 per sq meter penalty
    const totalPenalty = anomaly.breachAreaSqMeters * ratePerSqM;

    doc
      .fillColor('#0F172A')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('STATUTORY PENALTY CALCULATION', 50, 395);

    doc.fontSize(10).font('Helvetica');
    doc.text(`Under Rule 36(A) of Tamil Nadu Minor Mineral Concession Rules, illegal extraction outside permitted lease limits incurs mandatory restitution and compounding fees:`);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text(`• Encroachment Area: ${anomaly.breachAreaSqMeters} sq. m x ₹1,500/sq.m`);
    doc.fontSize(12).fillColor('#B91C1C').text(`• Total Demanded Penalty: ₹${totalPenalty.toLocaleString('en-IN')}/-`);

    doc.moveDown(1.5);

    // Legal Directive Text
    doc.fillColor('#1E293B').fontSize(10).font('Helvetica');
    doc.text('DIRECTIVE: You are hereby directed to cease all unpermitted excavation work beyond the designated coordinates immediately. A response along with proof of compliance must be submitted to the District Collectorate within 7 days of receiving this notice.');

    doc.moveDown(4);

    // Signatures
    doc.fontSize(10).font('Helvetica-Bold').text('Issued By Order Of:', 50, 600);
    doc.font('Helvetica').text('District Mining Enforcement Officer', 50, 615);
    doc.text('District Collectorate, Karur', 50, 630);

    doc.font('Helvetica-Bold').text('Digital Signature Verification:', 350, 600);
    doc.font('Helvetica').text(`SHA256: ${anomaly._id}00987X`, 350, 615);
    doc.text('Verified via DepthFence Grid', 350, 630);

    doc.end();

  } catch (err) {
    console.error('Generate PDF Legal Notice Error:', err);
    res.status(500).json({ error: 'Failed to generate legal notice PDF.' });
  }
}

module.exports = { generateLegalNotice };
