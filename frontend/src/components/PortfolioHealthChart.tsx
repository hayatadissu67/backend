import React from 'react';
import { Project } from '../types';

interface PortfolioHealthChartProps {
  projects: Project[];
  onSelectHealthFilter?: (health: 'GREEN' | 'YELLOW' | 'RED' | 'ALL') => void;
}

export const PortfolioHealthChart: React.FC<PortfolioHealthChartProps> = ({
  projects,
  onSelectHealthFilter
}) => {
  const greenCount = projects.filter((p) => p.health === 'GREEN').length;
  const yellowCount = projects.filter((p) => p.health === 'YELLOW').length;
  const redCount = projects.filter((p) => p.health === 'RED').length;
  const total = projects.length || 1;

  const greenPct = Math.round((greenCount / total) * 100);
  const yellowPct = Math.round((yellowCount / total) * 100);
  const redPct = Math.round((redCount / total) * 100);

  // SVG ring stroke dash math (r=16, circumference = 2 * PI * 16 ~ 100.53)
  // Standardized to dasharray / 100
  const greenDash = greenPct;
  const yellowDash = yellowPct;
  const redDash = redPct;

  const yellowOffset = -greenDash;
  const redOffset = -(greenDash + yellowDash);

  return (
    <section className="bg-white border border-slate-200/80 p-6 h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[16px] font-semibold text-[#191c1e] uppercase tracking-wide">
          Portfolio Health
        </h3>
        <span
          className="material-symbols-outlined text-slate-400 cursor-help hover:text-slate-600 transition-colors"
          title="Calculated from project schedule variance, budget burn rate, and unresolved critical risks."
        >
          info
        </span>
      </div>

      <div className="flex flex-col items-center">
        {/* Doughnut SVG Chart */}
        <div className="relative w-48 h-48 mb-6 group cursor-pointer" onClick={() => onSelectHealthFilter?.('ALL')}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            {/* Background ring */}
            <circle
              className="stroke-emerald-100"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3"
            />
            {/* Green Segment */}
            <circle
              className="stroke-emerald-500 chart-ring hover:stroke-emerald-600 cursor-pointer"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3.2"
              strokeDasharray={`${greenDash}, 100`}
              strokeDashoffset="0"
              strokeLinecap="round"
              onClick={(e) => {
                e.stopPropagation();
                onSelectHealthFilter?.('GREEN');
              }}
            />
            {/* Yellow Segment */}
            <circle
              className="stroke-amber-500 chart-ring hover:stroke-amber-600 cursor-pointer"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3.2"
              strokeDasharray={`${yellowDash}, 100`}
              strokeDashoffset={yellowOffset}
              strokeLinecap="round"
              onClick={(e) => {
                e.stopPropagation();
                onSelectHealthFilter?.('YELLOW');
              }}
            />
            {/* Red Segment */}
            <circle
              className="stroke-red-500 chart-ring hover:stroke-red-600 cursor-pointer"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3.2"
              strokeDasharray={`${redDash}, 100`}
              strokeDashoffset={redOffset}
              strokeLinecap="round"
              onClick={(e) => {
                e.stopPropagation();
                onSelectHealthFilter?.('RED');
              }}
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[36px] font-bold text-[#191c1e] leading-none">
              {greenPct}%
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
              On Track
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full space-y-3 pt-2">
          <div
            onClick={() => onSelectHealthFilter?.('GREEN')}
            className="flex justify-between items-center cursor-pointer p-1.5 hover:bg-emerald-50/60 rounded-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="status-dot bg-emerald-500"></span>
              <span className="text-[13px] font-bold tracking-wide text-slate-700">
                ON TRACK (GREEN)
              </span>
            </div>
            <span className="font-mono text-[13px] font-semibold text-[#191c1e]">
              {greenCount}
            </span>
          </div>

          <div
            onClick={() => onSelectHealthFilter?.('YELLOW')}
            className="flex justify-between items-center border-t border-slate-100 pt-3 cursor-pointer p-1.5 hover:bg-amber-50/60 rounded-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="status-dot bg-amber-500"></span>
              <span className="text-[13px] font-bold tracking-wide text-slate-700">
                AT RISK (YELLOW)
              </span>
            </div>
            <span className="font-mono text-[13px] font-semibold text-[#191c1e]">
              {yellowCount}
            </span>
          </div>

          <div
            onClick={() => onSelectHealthFilter?.('RED')}
            className="flex justify-between items-center border-t border-slate-100 pt-3 cursor-pointer p-1.5 hover:bg-red-50/60 rounded-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="status-dot bg-red-500"></span>
              <span className="text-[13px] font-bold tracking-wide text-slate-700">
                OFF TRACK (RED)
              </span>
            </div>
            <span className="font-mono text-[13px] font-semibold text-[#191c1e]">
              {redCount}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
