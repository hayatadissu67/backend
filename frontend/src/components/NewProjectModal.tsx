import React, { useState } from 'react';
import { Project, ProjectStatus, HealthStatus, LifecycleStage } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (newProject: Project) => void;
  currentUserName?: string;
  users?: any[];
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
  currentUserName,
  users = []
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [owner, setOwner] = useState(currentUserName || 'Alex Rivers');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');
  const [health, setHealth] = useState<HealthStatus>('GREEN');
  const [gate, setGate] = useState('Gate 1');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  
  // Get available team members from users
  const availableTeamMembers = users.filter(u => u.role === 'TEAM_MEMBER');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numBudget = parseFloat(budget);
    if (isNaN(numBudget) || numBudget <= 0) {
      alert('Please enter a valid project budget allocation.');
      return;
    }

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
      code: `PRJ-${name.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'PMO'}`,
      department,
      owner,
      status: 'PLANNING',
      health,
      budget: numBudget,
      spent: 0,
      progress: 0,
      gate,
      lifecycleStage: stage,
      approvalStatus: 'PENDING_APPROVAL',
      lifecycle: {
        stage,
        stageNumber: 1,
        phaseDurationDays: 14,
        health: health === 'GREEN' ? 'Green' : health === 'YELLOW' ? 'Amber' : 'Red',
        approver: owner,
        signOffDate: new Date().toISOString().split('T')[0],
        criteria: [
          { id: 'c1', label: 'Project Charter & Scope Finalized', completed: true },
          { id: 'c2', label: 'Architecture & Technical Sign-off', completed: false },
          { id: 'c3', label: 'Security & Compliance Clearances', completed: false }
        ]
      },
      targetDate,
      assignedTeamMembers: selectedTeamMembers.map(id => Number(id))
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
            <h3 className="font-bold text-[15px]">Create New Project &amp; Initial Budget</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="bg-blue-50 border-b border-blue-100 p-3 text-xs text-blue-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">verified_user</span>
          <span>
            <strong>Executive Governance:</strong> Newly created projects and their initial budgets are submitted for <strong>Executive Manager Approval</strong> before project execution can begin.
          </span>
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
                Project Manager / Owner
              </label>
              <input
                type="text"
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full border border-slate-300 rounded-sm p-2 text-xs focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assign Initial Team Members
            </label>
            <div className="border border-slate-300 rounded-sm p-2 max-h-32 overflow-y-auto bg-slate-50 space-y-1">
              {availableTeamMembers.length === 0 ? (
                <p className="text-slate-500 italic text-xs">No team members available in the database.</p>
              ) : (
                availableTeamMembers.map(tm => (
                  <label key={tm.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded-sm">
                    <input 
                      type="checkbox"
                      value={tm.id}
                      checked={selectedTeamMembers.includes(String(tm.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeamMembers([...selectedTeamMembers, String(tm.id)]);
                        } else {
                          setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== String(tm.id)));
                        }
                      }}
                      className="accent-blue-600"
                    />
                    {tm.name} <span className="text-slate-400">({tm.email})</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project Budget ($) *
              </label>
              <input
                type="number"
                required
                min="1000"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 750000"
                className="w-full border border-slate-300 rounded-sm p-2 text-xs focus:border-blue-600 outline-none font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">Read-only after creation</span>
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
                <option value="Gate 3">Gate 3: Build &amp; QA</option>
                <option value="Gate 4">Gate 4: Pre-Launch</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Launch
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full border border-slate-300 rounded-sm p-2 text-xs focus:border-blue-600 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Approval Submission
              </label>
              <div className="p-2 bg-slate-50 rounded-sm border border-slate-200 text-amber-800 font-bold text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-600 text-[16px]">pending_actions</span>
                <span>Pending Executive Approval</span>
              </div>
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
              className="px-5 py-2 bg-[#00174b] text-white hover:bg-indigo-900 rounded-sm font-bold uppercase tracking-wider text-[11px] shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
