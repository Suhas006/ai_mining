import React, { useState } from 'react';
import { FileText, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function LegalNoticeModal({ anomaly, isOpen, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !anomaly) return null;

  // Exact html2canvas + jsPDF implementation requested
  const generateLegalPDF = async () => {
    setDownloading(true);
    setSuccess(false);
    try {
      const element = document.getElementById("pdf-notice-container");
      if (!element) throw new Error("pdf-notice-container element not found");

      // Temporarily reveal element for html2canvas rendering
      element.style.display = "block";

      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("TN-Mining-Penalty-Notice-2026.pdf");

      element.style.display = "none";
      setSuccess(true);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      // Fallback jsPDF direct generator if html2canvas meets DOM restrictions
      try {
        const doc = new jsPDF();
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 32, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text('GOVERNMENT OF TAMIL NADU', 105, 12, { align: 'center' });
        doc.setFontSize(9.5);
        doc.text('DEPARTMENT OF GEOLOGY & MINING / DILRMP GRID', 105, 20, { align: 'center' });
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(12);
        doc.text('OFFICIAL DEMAND NOTICE OF UNPERMITTED MINING BREACH & COMPOUNDING FINE', 105, 42, { align: 'center' });
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.text('Lease Entity: Kaveri Black Granite Leases Ltd (TN-KRR-GRN-2024-009)', 15, 55);
        doc.text('ULPIN ID: 33672390256600', 15, 62);
        doc.text('Violations: 4,850 sq.m surface breach + 17m pit depth past legal limit (-15m)', 15, 69);
        doc.setFontSize(12);
        doc.setTextColor(220, 38, 38);
        doc.text('TOTAL DEMANDED PENALTY: ₹51,53,12,500/- (₹51.53 CRORES)', 15, 82);
        doc.save("TN-Mining-Penalty-Notice-2026.pdf");
        setSuccess(true);
      } catch (fbErr) {
        console.error("Fallback PDF error:", fbErr);
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131B2B] border border-[#1E293B] rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0EA5E9]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Automated Legal Breach Notice</h2>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white text-sm font-bold">✕</button>
        </div>

        {/* Modal Summary Card */}
        <div className="bg-[#0B0F17] border border-[#1E293B] p-4 rounded-lg space-y-3">
          <div className="text-center space-y-1">
            <ShieldCheck className="w-8 h-8 text-[#0EA5E9] mx-auto" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Government of Tamil Nadu</h3>
            <p className="text-xs text-[#94A3B8]">Department of Geology & Mining / DILRMP Grid</p>
          </div>

          <div className="bg-[#131B2B] p-3 rounded text-xs space-y-1.5 border border-[#1E293B] font-mono">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Offender Entity:</span>
              <span className="text-white font-bold">Kaveri Black Granite Leases Ltd</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Lease ID:</span>
              <span className="text-white font-bold">TN-KRR-GRN-2024-009</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">14-Digit ULPIN:</span>
              <span className="text-[#10B981] font-bold">33672390256600</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Violations Flagged:</span>
              <span className="text-white">4,850 sq.m area + 17m pit depth</span>
            </div>
            <div className="flex justify-between border-t border-[#1E293B] pt-1.5 mt-1">
              <span className="text-white font-bold">Total Demanded Penalty:</span>
              <span className="text-[#EF4444] font-bold text-sm">₹51.53 Crores</span>
            </div>
          </div>

          {success && (
            <div className="bg-[#10B981]/15 border border-[#10B981]/40 p-2.5 rounded text-xs text-[#10B981] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>TN-Mining-Penalty-Notice-2026.pdf Downloaded Successfully!</span>
            </div>
          )}

          <p className="text-[11px] text-[#94A3B8] text-center">
            PDF notice contains official Tamil Nadu Dept. letterhead, offender details, 14-digit ULPIN, Gemini 1.5 Vision evidence, 3D pit volume calculations, and ₹51.53 Cr compounding fine demand.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="bg-[#0B0F17] text-[#94A3B8] border border-[#1E293B] px-4 py-2 rounded text-xs font-medium hover:text-white"
          >
            Close
          </button>

          <button
            onClick={generateLegalPDF}
            disabled={downloading}
            className="bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 shadow-md shadow-[#EF4444]/20 transition-all"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Capturing HTML & Generating PDF...' : 'Download Official Legal Notice (PDF)'}
          </button>
        </div>

        {/* Hidden Div for html2canvas PDF capture */}
        <div
          id="pdf-notice-container"
          style={{ display: 'none', width: '800px', padding: '40px', backgroundColor: '#FFFFFF', color: '#0F172A', fontFamily: 'Arial, sans-serif' }}
        >
          {/* Header */}
          <div style={{ backgroundColor: '#0F172A', color: '#FFFFFF', padding: '20px', textAlign: 'center', borderRadius: '6px', marginBottom: '25px' }}>
            <h1 style={{ fontSize: '22px', margin: '0 0 5px 0', letterSpacing: '1px' }}>GOVERNMENT OF TAMIL NADU</h1>
            <p style={{ fontSize: '12px', margin: '0', color: '#94A3B8' }}>DEPARTMENT OF GEOLOGY & MINING / DILRMP SURVEILLANCE GRID</p>
            <p style={{ fontSize: '11px', margin: '3px 0 0 0', color: '#38BDF8' }}>DEPTHFENCE UNIFIED 3D ULPIN ENFORCEMENT SYSTEM v2.0</p>
          </div>

          {/* Title */}
          <h2 style={{ color: '#DC2626', fontSize: '16px', textAlign: 'center', marginBottom: '20px', textTransform: 'uppercase' }}>
            OFFICIAL DEMAND NOTICE OF UNPERMITTED MINING & COMPOUNDING PENALTY
          </h2>
          <hr style={{ border: '0', borderTop: '1px solid #CBD5E1', marginBottom: '20px' }} />

          {/* Details Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px', marginBottom: '25px', backgroundColor: '#F8FAFC', padding: '15px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div><strong>Notice Ref ID:</strong> GS-LN-2026-8F7D9A1E</div>
            <div><strong>Date of Issuance:</strong> {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
            <div><strong>Offender Entity:</strong> Kaveri Black Granite Leases Ltd</div>
            <div><strong>Mining Lease ID:</strong> TN-KRR-GRN-2024-009</div>
            <div><strong>14-Digit ULPIN:</strong> 33672390256600</div>
            <div><strong>Target Mineral:</strong> Black Granite (Karur Sector)</div>
          </div>

          {/* Evidence Box */}
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '20px', borderRadius: '6px', marginBottom: '25px' }}>
            <h3 style={{ color: '#991B1B', fontSize: '14px', margin: '0 0 10px 0' }}>AI MULTIMODAL SATELLITE & 3D TERRAIN EVIDENTIARY FINDINGS</h3>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '12px', lineHeight: '1.8', color: '#1E293B' }}>
              <li><strong>Violation 1 (Surface Breach):</strong> 4,850 sq.m unpermitted perimeter expansion past legal marker #14.</li>
              <li><strong>Violation 2 (3D Pit Depth):</strong> 17 meters depth violation past legal floor limit (-15m floor level).</li>
              <li><strong>Spatial Centroid Location:</strong> [77.9672° E, 10.9540° N] (Karur Granite Belt)</li>
              <li><strong>Gemini 1.5 Flash Vision Confidence:</strong> 96% (Raster T0 baseline vs T1 breach overlay)</li>
              <li><strong>Ground Verification Status:</strong> Verified Ground Truth by Senior Inspector R. Raman</li>
            </ul>
          </div>

          {/* Penalty Calculation */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '14px', color: '#0F172A', marginBottom: '10px' }}>STATUTORY COMPOUNDING PENALTY CALCULATION</h3>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '15px' }}>
              Under Rule 36(A) of Tamil Nadu Minor Mineral Concession Rules, 1959, unpermitted extraction outside legal lease limits incurs mandatory restitution and compounding fees:
            </p>
            <ul style={{ fontSize: '12px', lineHeight: '1.8', color: '#0F172A', marginBottom: '15px' }}>
              <li><strong>3D Extruded Pit Volume:</strong> 4,850 sq.m area x 17m depth = 82,450 m³</li>
              <li><strong>Total Extracted Tonnage:</strong> 82,450 m³ x 2.5 sp.gr = 206,125 Metric Tons</li>
              <li><strong>Statutory Rate:</strong> ₹2,500 / Metric Ton</li>
            </ul>

            <div style={{ backgroundColor: '#DC2626', color: '#FFFFFF', padding: '15px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
              TOTAL CALCULATED FINE: ₹51,53,12,500/- (₹51.53 CRORES)
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
            <div>
              <strong>Issued By Order Of:</strong><br />
              District Mining Enforcement Officer<br />
              District Collectorate, Karur
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong>Digital Signature Verification:</strong><br />
              SHA256: GS-GRID-2026-8F7D9A1E-STDM<br />
              Verified via DepthFence 3D Grid Engine
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
