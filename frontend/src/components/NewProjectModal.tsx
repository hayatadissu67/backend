import React, { useState } from 'react';
import { Project, ProjectStatus, HealthStatus, LifecycleStage } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (newProject: Project) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [owner, setOwner] = useState('Sarah Jenkins');
  const [budget, setBudget] = useState('750000');
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE');
  const [health, setHealth] = useState<HealthStatus>('GREEN');
  const [gate, setGate] = useState('Gate 1');
  const [targetDate, setTargetDate] = useState('2026-12-31');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numBudget = parseFloat(budget) || 500000;
    const stageMap: Record<string, LifecycleStage> = {
      'Gate 1': 'Initiation',
      'Gate 2': 'Planning',
      'Gate 3': 'Execution',
      'Gate 4': 'Governance',
      'Gate 5': 'Closure'
    };
    const stage = stageMap[gate] || 'Initiation';

    const newPrj: Project = {
      id: `p-${Date.now()}`,
      name,
      code: `PRJ-${name.substring(0, 4).toUpperCase()}`,
      department,
      owner,
      status,
      health,
      budget: numBudget,
      spent: Math.round(numBudget * 0.15),
      progress: stage === 'Initiation' ? 20 : stage === 'Planning' ? 40 : stage === 'Execution' ? 60 : stage === 'Governance' ? 80 : 100,
      gate,
      lifecycleStage: stage,
      lifecycle: {
        stage,
        stageNumber: stage === 'Initiation' ? 1 : stage === 'Planning' ? 2 : stage === 'Execution' ? 3 : stage === 'Governance' ? 4 : 5,
        phaseDurationDays: 14,
        health: health === 'GREEN' ? 'Green' : health === 'YELLOW' ? 'Amber' : 'Red',
        approver: owner,
        signOffDate: new Date().toISOString().split('T')[0],
        criteria: [
          { id: 'c1', label: 'Project Charter & Scope Finalized', completed: true },
          { id: 'c2', label: 'Architecture & Technical Sign-off', completed: stage !== 'Initiation' },
          { id: 'c3', label: 'Security & Compliance Clearances', completed: stage === 'Governance' || stage === 'Closure' }
        ]
      },
      targetDate
    };

    onAddProject(newPrj);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-md shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        <div className="bg-[#131b2e] text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#497cff]">add_circle</span>
            <h3 className="font-bold text-[15px]">Create New Portfolio Project</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NextGen Payment Engine"
              className="w-full border border-slate-300 rounded-sm p-2 text-xs focus:border-blue-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-slate-300 rounded-sm p-2 text-xs focus:border-blue-600 outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product Mgmt">Product Mgmt</option>
                <option value="Data Eng">Data Eng</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Enterprise IT">Enterprise IT</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project Owner
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full border border-slate-300 rounded-sm p-2 text-xs focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Budget ($)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border border-slate-300 rounded-sm p-2 text-xs focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gate Phase
              </label>
              <select
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                className="w-full border border-slate-300 rounded-sm p-2 text-xs focus:border-blue-600 outline-none"
              >
                <option value="Gate 1">Gate 1: Charter</option>
                <option value="Gate 2">Gate 2: Architecture</option>
                <option value="Gate 3">Gate 3: Build & QA</option>
                <option value="Gate 4">Gate 4: Pre-Launch</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Launch
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full border border-slate-300 rounded-sm p-2 text-xs focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full border border-slate-300 rounded-sm p-2 text-xs focus:border-blue-600 outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PLANNING">PLANNING</option>
                <option value="DELAYED">DELAYED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Health Indicator
              </label>
              <select
                value={health}
                onChange={(e) => setHealth(e.target.value as HealthStatus)}
                className="w-full border border-slate-300 rounded-sm p-2 text-xs focus:border-blue-600 outline-none"
              >
                <option value="GREEN">GREEN (On Track)</option>
                <option value="YELLOW">YELLOW (At Risk)</option>
                <option value="RED">RED (Off Track)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00174b] text-white hover:bg-indigo-900 rounded-sm font-bold uppercase tracking-wider text-[11px]"
            >
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
