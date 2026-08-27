import React, { useState } from 'react';
import { Milestone } from '../types';

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);

  return (
    <section className="mt-8 bg-white border border-slate-200/80 p-6 mb-12 shadow-2xs">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[16px] font-semibold text-[#191c1e] uppercase tracking-wide">
          Strategic Milestones Timeline
        </h3>
        <span className="text-xs text-slate-400 font-mono">Q4 2026 Strategic Office Horizon</span>
      </div>

      <div className="relative py-12 px-4 flex items-center">
        {/* Horizontal Timeline Line */}
        <div className="absolute w-full h-0.5 bg-slate-200 left-0 top-1/2 -translate-y-1/2 z-0"></div>

        <div className="flex-1 flex justify-between items-center relative z-10">
          {milestones.map((m) => {
            if (m.isToday) {
              return (
                <div key={m.id} className="relative flex flex-col items-center group cursor-pointer">
                  <div className="w-0.5 bg-[#191c1e] h-28 absolute -top-10 z-0"></div>
                  <div className="w-6 h-6 bg-[#191c1e] rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center">
                    <span className="material-symbols-filled text-white text-[12px]">
                      play_arrow
                    </span>
                  </div>
                  <p className="absolute top-10 whitespace-nowrap font-bold text-[11px] tracking-wider text-[#191c1e] bg-slate-100 px-2.5 py-1 rounded-sm border border-slate-200 shadow-2xs">
                    {m.title}
                  </p>
                </div>
              );
            }

            const isWarning = m.title.includes('Audit');
            const isCompleted = m.status === 'completed';

            return (
              <div
                key={m.id}
                onClick={() => setActiveMilestone(activeMilestone?.id === m.id ? null : m)}
                className={`group relative cursor-pointer ${isCompleted ? 'opacity-90' : 'opacity-100'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full ring-4 transition-transform group-hover:scale-125 ${
                    isWarning
                      ? 'bg-amber-500 ring-amber-500/20'
                      : isCompleted
                      ? 'bg-slate-400 ring-slate-200'
                      : 'bg-[#00174b] ring-[#00174b]/20'
                  }`}
                ></div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap flex flex-col items-center">
                  <p
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isWarning
                        ? 'text-amber-700 bg-amber-50'
                        : isCompleted
                        ? 'text-slate-600 bg-slate-100'
                        : 'text-[#00174b] bg-indigo-50'
                    }`}
                  >
                    {m.date}
                  </p>
                  <p className="text-[13px] font-bold mt-1 text-center text-[#191c1e] group-hover:text-blue-700 transition-colors">
                    {m.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Milestone Details Panel */}
      {activeMilestone && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-sm text-xs flex justify-between items-center animate-fadeIn">
          <div>
            <span className="font-bold text-slate-800 uppercase tracking-wider">{activeMilestone.title} ({activeMilestone.date})</span>
            <p className="text-slate-600 mt-1">{activeMilestone.description}</p>
            {activeMilestone.owner && <p className="text-slate-500 mt-0.5 font-mono">Owner: {activeMilestone.owner}</p>}
          </div>
          <button onClick={() => setActiveMilestone(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}
    </section>
  );
};
