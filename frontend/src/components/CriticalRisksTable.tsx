import React, { useState } from 'react';
import { RiskItem, Severity } from '../types';

interface CriticalRisksTableProps {
  risks: RiskItem[];
  onViewAllRisks: () => void;
  onSelectRisk?: (risk: RiskItem) => void;
  onAddRisk?: () => void;
}

export const CriticalRisksTable: React.FC<CriticalRisksTableProps> = ({
  risks,
  onViewAllRisks,
  onSelectRisk,
  onAddRisk
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'ALL'>('ALL');

  const filteredRisks = risks.filter((r) => {
    if (selectedSeverity === 'ALL') return true;
    return r.severity === selectedSeverity;
  });

  const criticalCount = risks.filter((r) => r.severity === 'CRITICAL').length;
  const highCount = risks.filter((r) => r.severity === 'HIGH').length;
  const mediumCount = risks.filter((r) => r.severity === 'MEDIUM').length;

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded-xs text-[10px] uppercase tracking-wider">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-xs text-[10px] uppercase tracking-wider">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-xs text-[10px] uppercase tracking-wider">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-xs text-[10px] uppercase tracking-wider">
            LOW
          </span>
        );
    }
  };

  return (
    <section className="bg-white border border-slate-200/80 rounded-none shadow-2xs">
      <div className="p-6 border-b border-slate-200/80 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <h3 className="text-[16px] font-semibold text-[#191c1e] uppercase tracking-wide">
            Critical Risks &amp; Issues
          </h3>
          {onAddRisk && (
            <button
              onClick={onAddRisk}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase rounded-xs transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[12px]">add</span>
              Log Risk
            </button>
          )}
        </div>
        <button
          onClick={onViewAllRisks}
          className="text-[#00174b] font-bold text-[11px] tracking-wider uppercase hover:underline"
        >
          VIEW ALL
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#f2f4f6] text-[#45464d] uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
              <th className="px-6 py-3 font-bold">Ref</th>
              <th className="px-6 py-3 font-bold">Subject</th>
              <th className="px-6 py-3 font-bold">Severity</th>
              <th className="px-6 py-3 font-bold">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50">
            {filteredRisks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                  No risks found for selected filter.
                </td>
              </tr>
            ) : (
              filteredRisks.slice(0, 5).map((risk, index) => {
                const isEven = index % 2 === 1;
                return (
                  <tr
                    key={risk.id}
                    onClick={() => onSelectRisk?.(risk)}
                    className={`${
                      isEven ? 'bg-[#f2f4f6]/20' : 'bg-white'
                    } hover:bg-blue-50/40 transition-colors cursor-pointer group`}
                  >
                    <td className="px-6 py-4 font-mono text-[12px] text-slate-700 font-medium">
                      {risk.ref}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#191c1e] group-hover:text-blue-700 transition-colors">
                        {risk.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {risk.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(risk.severity)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                      {risk.owner}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer summary stats */}
      <div className="p-4 border-t border-slate-200/80 bg-[#f2f4f6]/30">
        <div className="flex items-center gap-6 font-mono text-slate-600 text-[11px]">
          <button
            onClick={() => setSelectedSeverity(selectedSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
            className={`flex items-center gap-1.5 hover:text-black transition-colors ${
              selectedSeverity === 'CRITICAL' ? 'font-bold underline text-red-700' : ''
            }`}
          >
            <span className="status-dot bg-red-600"></span>
            {criticalCount} Critical
          </button>
          <button
            onClick={() => setSelectedSeverity(selectedSeverity === 'HIGH' ? 'ALL' : 'HIGH')}
            className={`flex items-center gap-1.5 hover:text-black transition-colors ${
              selectedSeverity === 'HIGH' ? 'font-bold underline text-amber-700' : ''
            }`}
          >
            <span className="status-dot bg-amber-500"></span>
            {highCount} High
          </button>
          <button
            onClick={() => setSelectedSeverity(selectedSeverity === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
            className={`flex items-center gap-1.5 hover:text-black transition-colors ${
              selectedSeverity === 'MEDIUM' ? 'font-bold underline text-blue-700' : ''
            }`}
          >
            <span className="status-dot bg-[#00174b]"></span>
            {mediumCount} Medium
          </button>
          {selectedSeverity !== 'ALL' && (
            <button
              onClick={() => setSelectedSeverity('ALL')}
              className="text-xs text-blue-600 font-sans font-bold hover:underline ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
