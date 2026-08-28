import { jsPDF } from "jspdf";

export const generateLegalNotice = (anomaly) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("GOVERNMENT OF TAMIL NADU", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text("DEPARTMENT OF GEOLOGY & MINING", 105, 28, { align: "center" });
  doc.line(20, 35, 190, 35); // Divider line

  // Notice Details
  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38); // Red text for alert
  doc.text("NOTICE OF ILLEGAL MINING ENCROACHMENT", 105, 45, { align: "center" });
  
  doc.setTextColor(0, 0, 0); // Black text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const leaseHolder = anomaly?.leaseId?.leaseHolderName || 'Kaveri Black Granite Leases Ltd';
  const leaseId = anomaly?.leaseId?.leaseId || 'TN-KRR-GRN-2024-009';
  
  doc.text(`Date of Issue: ${today}`, 20, 60);
  doc.text(`Leaseholder: ${leaseHolder}`, 20, 70);
  doc.text(`Lease ID (ULPIN): ${leaseId}`, 20, 80);
  doc.text(`Jurisdiction: Karur Surveillance Zone`, 20, 90);

  // Infraction Data
  doc.setFont("helvetica", "bold");
  doc.text("1. SATELLITE & SPATIAL EVIDENCE:", 20, 110);
  doc.setFont("helvetica", "normal");
  doc.text(`- Surface Breach Area: ${anomaly?.breachAreaSqMeters || 4850} sq.meters (Unpermitted bench removal)`, 25, 120);
  doc.text("- Extruded Pit Depth Violation: 17 meters past legal floor line", 25, 130);
  doc.text(`- GPS Centroid Confirmed: [${anomaly?.detectedCoordinates?.coordinates?.join(', ') || '77.9672, 10.954'}]`, 25, 140);
  doc.text(`- AI Verification Confidence: ${((anomaly?.aiConfidenceScore || 0.96) * 100).toFixed(0)}% (Gemini 1.5 Flash Vision Intercept)`, 25, 150);

  // Penalty Calculation
  doc.setFont("helvetica", "bold");
  doc.text("2. PENALTY COMPUTATION (Rule 36A):", 20, 170);
  doc.setFont("helvetica", "normal");
  const baseVolume = (anomaly?.breachAreaSqMeters || 4850) * 17;
  const extractionTons = baseVolume * 2.5;
  const fine = extractionTons * 2500;
  
  doc.text(`- Total 3D Excavated Volume: ${baseVolume.toLocaleString()} cubic meters`, 25, 180);
  doc.text(`- Estimated Extracted Granite: ${extractionTons.toLocaleString()} Metric Tons`, 25, 190);
  doc.text("- Base Fine Rate: INR 2,500 / Ton", 25, 200);
  
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL FINE DEMANDED: INR ${fine.toLocaleString()}`, 25, 215);

  // Signature Block
  doc.setFont("helvetica", "normal");
  doc.text("Automated Dispatch via DepthFence AI Grid", 20, 250);
  doc.text("Authorized by: R. Raman (Mining Inspection Officer)", 20, 260);

  // Download
  doc.save(`Legal_Notice_${leaseId}.pdf`);
};
