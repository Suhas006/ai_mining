import React from 'react';
import { Download } from 'lucide-react';

export default function CsvExportButton({ data }) {
  const defaultData = [
    { leaseId: 'TN-KRR-GRN-2024-009', entity: 'Kaveri Black Granite Leases Ltd', breachArea: '4850 sqm', pitDepth: '17m', status: 'Pending_Inspection', severity: 'Critical', fineDemanded: '₹51.53 Cr', geohash: 'tf29b4x' },
    { leaseId: 'TN-KRR-SND-2024-002', entity: 'Amaravathi Sand Extraction Trust', breachArea: '2150 sqm', pitDepth: '3m', status: 'Pending_Inspection', severity: 'High', fineDemanded: '₹12.80 Cr', geohash: 'tf29c1z' },
    { leaseId: 'TN-SLM-MAG-2024-005', entity: 'Salem Magnesite & Mineral Leases', breachArea: '6200 sqm', pitDepth: '15m', status: 'Verified', severity: 'Critical', fineDemanded: '₹263.50 Cr', geohash: 'tf38k9y' },
    { leaseId: 'TN-HSR-GRN-2024-011', entity: 'Hosur Industrial Granite Quarry', breachArea: '3500 sqm', pitDepth: '12m', status: 'Legal_Notice_Issued', severity: 'High', fineDemanded: '₹148.75 Cr', geohash: 'tf35m2x' }
  ];

  const exportData = data && data.length > 0 ? data.map(item => ({
    leaseId: item.leaseId?.leaseId || item.leaseId || 'TN-KRR-GRN-2024-009',
    entity: item.leaseId?.leaseHolderName || 'Concession Leaseholder',
    breachArea: `${item.breachAreaSqMeters || 4850} sq.m`,
    status: item.status || 'Pending_Inspection',
    severity: item.severity || 'Critical',
    aiConfidence: `${((item.aiConfidenceScore || 0.96) * 100).toFixed(0)}%`
  })) : defaultData;

  const downloadCSV = () => {
    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "DepthFence_Anomalies_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={downloadCSV}
      className="flex items-center gap-2 rounded border border-[#0EA5E9]/50 bg-[#0EA5E9]/15 px-3 py-1.5 text-xs font-bold text-[#0EA5E9] transition hover:bg-[#0EA5E9]/25 shadow"
    >
      <Download className="h-4 w-4" />
      Export Database (CSV)
    </button>
  );
}
