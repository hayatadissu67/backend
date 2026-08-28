import React from 'react';
import { Project, RiskItem, ResourceLoading } from '../types';

interface ExportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  risks: RiskItem[];
  resources: ResourceLoading[];
}

export const ExportPDFModal: React.FC<ExportPDFModalProps> = ({
  isOpen,
  onClose,
  projects,
  risks,
  resources
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
  const criticalRisks = risks.filter((r) => r.severity === 'CRITICAL');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-3xl w-full rounded-md shadow-2xl border border-slate-300 p-8 space-y-6 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700">picture_as_pdf</span>
            <h3 className="font-bold text-slate-900 text-base">Executive Control Tower PDF Preview</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#00174b] text-white font-bold text-xs rounded-sm hover:bg-indigo-950 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print / Save PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-6 text-xs text-slate-800">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-xl font-bold text-[#131b2e]">Enterprise PMO Executive Brief</h1>
              <p className="text-slate-500 font-mono">Strategic Portfolio Office • Control Tower Telemetry</p>
            </div>
            <div className="text-right text-slate-500 font-mono text-[11px]">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Classification: CONFIDENTIAL</p>
            </div>
          </div>

          {/* Executive Metrics */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 text-center">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Total Projects</p>
              <p className="text-lg font-bold text-[#131b2e]">{projects.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Active</p>
              <p className="text-lg font-bold text-blue-700">{activeProjects}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Open Risks</p>
              <p className="text-lg font-bold text-amber-600">{risks.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Critical Blockers</p>
              <p className="text-lg font-bold text-red-600">{criticalRisks.length}</p>
            </div>
          </div>

          {/* Critical Risks Summary */}
          <div>
            <h4 className="font-bold uppercase text-slate-900 tracking-wider mb-2 border-b border-slate-200 pb-1">
              Critical Risks &amp; Immediate Action Items
            </h4>
            <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
              <thead className="bg-slate-100 font-bold uppercase text-slate-600">
                <tr>
                  <th className="p-2 border border-slate-200">Ref</th>
                  <th className="p-2 border border-slate-200">Subject</th>
                  <th className="p-2 border border-slate-200">Severity</th>
                  <th className="p-2 border border-slate-200">Owner</th>
                </tr>
              </thead>
              <tbody>
                {risks.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td className="p-2 border border-slate-200 font-mono font-bold">{r.ref}</td>
                    <td className="p-2 border border-slate-200">{r.subject}</td>
                    <td className="p-2 border border-slate-200 font-bold text-red-700">{r.severity}</td>
                    <td className="p-2 border border-slate-200">{r.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resource Capacity Summary */}
          <div>
            <h4 className="font-bold uppercase text-slate-900 tracking-wider mb-2 border-b border-slate-200 pb-1">
              Resource Loading Telemetry
            </h4>
            <div className="grid grid-cols-3 gap-3 font-mono">
              {resources.map((res) => (
                <div key={res.department} className="p-2 border border-slate-200 rounded-xs">
                  <span className="font-bold text-slate-700 text-[10px] uppercase block">{res.department}</span>
                  <span className={`text-sm font-bold ${res.percentage >= 90 ? 'text-red-600' : 'text-blue-900'}`}>
                    {res.percentage}% Utilization
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-right pt-4 border-t border-slate-200 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-xs rounded-sm text-slate-700"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
