import React from 'react';
import { Project, RiskItem, ApprovalRequest } from '../types';

interface KPIBannerProps {
  projects: Project[];
  risks: RiskItem[];
  approvals: ApprovalRequest[];
  onSelectFilter?: (filterType: string) => void;
}

export const KPIBanner: React.FC<KPIBannerProps> = ({
  projects,
  risks,
  approvals,
  onSelectFilter
}) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
  const delayedProjects = projects.filter((p) => p.status === 'DELAYED').length;
  const openRisks = risks.filter((r) => r.status !== 'MITIGATED').length;
  const highImpactRisks = risks.filter((r) => r.severity === 'CRITICAL' || r.severity === 'HIGH').length;
  const pendingApprovals = approvals.filter((a) => a.status === 'Pending').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* TOTAL PROJECTS */}
      <div
        onClick={() => onSelectFilter?.('all')}
        className="bg-white border border-slate-200/80 p-4 flex flex-col justify-between hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1">
            TOTAL PROJECTS
          </p>
          <p className="text-[30px] leading-tight font-bold text-[#191c1e]">
            {totalProjects}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-emerald-600 font-mono text-[12px] font-medium">
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          +2 this month
        </div>
      </div>

      {/* ACTIVE */}
      <div
        onClick={() => onSelectFilter?.('ACTIVE')}
        className="bg-white border border-slate-200/80 p-4 flex flex-col justify-between hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#497cff] mb-1">
            ACTIVE
          </p>
          <p className="text-[30px] leading-tight font-bold text-[#191c1e]">
            {activeProjects}
          </p>
        </div>
        <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#00174b] h-full transition-all duration-500"
            style={{ width: `${Math.round((activeProjects / (totalProjects || 1)) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* COMPLETED */}
      <div
        onClick={() => onSelectFilter?.('COMPLETED')}
        className="bg-white border border-slate-200/80 p-4 flex flex-col justify-between hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1">
            COMPLETED
          </p>
          <p className="text-[30px] leading-tight font-bold text-[#191c1e]">
            {completedProjects}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-1 font-mono text-[12px] text-slate-500">
          Target: 6
        </div>
      </div>

      {/* DELAYED */}
      <div
        onClick={() => onSelectFilter?.('DELAYED')}
        className="bg-white border border-slate-200/80 p-4 flex flex-col justify-between hover:border-red-400 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-red-600 mb-1">
            DELAYED
          </p>
          <p className="text-[30px] leading-tight font-bold text-red-600">
            {delayedProjects}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-1 text-red-600 font-mono text-[12px] font-medium">
          <span className="material-symbols-outlined text-[16px]">priority_high</span>
          Critical attention
        </div>
      </div>

      {/* OPEN RISKS */}
      <div
        onClick={() => onSelectFilter?.('risks')}
        className="bg-white border border-slate-200/80 p-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1">
            OPEN RISKS
          </p>
          <p className="text-[30px] leading-tight font-bold text-[#191c1e]">
            {openRisks}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 font-mono text-[12px] text-slate-600">
          <span className="status-dot bg-amber-500"></span>
          {highImpactRisks} High Impact
        </div>
      </div>

      {/* PENDING APPROVALS */}
      <div
        onClick={() => onSelectFilter?.('approvals')}
        className="bg-white border border-slate-200/80 p-4 flex flex-col justify-between hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1">
            PENDING APPROVALS
          </p>
          <p className="text-[30px] leading-tight font-bold text-[#191c1e]">
            {pendingApprovals}
          </p>
        </div>
        <button className="mt-4 text-[#00174b] hover:underline text-[11px] font-bold text-left tracking-wider">
          VIEW ALL
        </button>
      </div>
    </div>
  );
};
