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
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get available team members from users
  const availableTeamMembers = users.filter(u => u.role === 'TEAM_MEMBER');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<{userId: string, responsibility: string}[]>([]);
  const [tempUserId, setTempUserId] = useState('');
  const [tempResp, setTempResp] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Project name is required';
    else if (name.length > 100) newErrors.name = 'Project name must be under 100 characters';
    
    if (!owner.trim()) newErrors.owner = 'Project Manager/Owner is required';
    
    if (description && description.length > 2000) newErrors.description = 'Description is too long';

    const numBudget = parseFloat(budget);
    if (budget === '' || isNaN(numBudget) || numBudget < 0) {
      newErrors.budget = 'Budget must be a valid non-negative number';
    }

    if (!startDate || isNaN(Date.parse(startDate))) newErrors.startDate = 'Invalid start date';
    if (!targetDate || isNaN(Date.parse(targetDate))) newErrors.targetDate = 'Invalid target date';
    if (startDate && targetDate && new Date(targetDate) < new Date(startDate)) {
      newErrors.targetDate = 'End date must be after start date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

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
      startDate,
      targetDate,
      description,
      assignedTeamMembers: selectedTeamMembers.map(m => ({ userId: Number(m.userId), responsibility: m.responsibility }))
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
              className={`w-full border rounded-sm p-2 text-xs outline-none ${errors.name ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-300 focus:border-blue-600'}`}
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">warning</span>{errors.name}</p>}
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
                className={`w-full border rounded-sm p-2 text-xs outline-none ${errors.owner ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-300 focus:border-blue-600'}`}
              />
              {errors.owner && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">warning</span>{errors.owner}</p>}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project..."
              className={`w-full border rounded-sm p-2 text-xs outline-none h-16 resize-none ${errors.description ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-300 focus:border-blue-600'}`}
            />
            {errors.description && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">warning</span>{errors.description}</p>}
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assign Initial Team Members
            </label>
            <div className="border border-slate-300 rounded-sm p-3 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2">
                <select
                  value={tempUserId}
                  onChange={(e) => setTempUserId(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-sm p-1.5 text-xs focus:border-blue-600 outline-none"
                >
                  <option value="">Select Member...</option>
                  {availableTeamMembers.filter(tm => !selectedTeamMembers.find(s => s.userId === String(tm.id))).map(tm => (
                    <option key={tm.id} value={tm.id}>{tm.name} ({tm.email})</option>
                  ))}
                </select>
                <select
                  value={tempResp}
                  onChange={(e) => setTempResp(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-sm p-1.5 text-xs focus:border-blue-600 outline-none"
                >
                  <option value="">Select Responsibility...</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Database Developer">Database Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="QA/Tester">QA/Tester</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="General Member">General Member</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (tempUserId && tempResp) {
                      // Check for duplicates
                      if (selectedTeamMembers.some(m => m.userId === tempUserId)) {
                        setErrors({...errors, team: 'This team member is already assigned'});
                        return;
                      }
                      setSelectedTeamMembers([...selectedTeamMembers, { userId: tempUserId, responsibility: tempResp }]);
                      setTempUserId('');
                      setTempResp('');
                      setErrors(prev => { const { team, ...rest } = prev; return rest; }); // clear error
                    } else {
                      setErrors({...errors, team: 'Please select both a Team Member and a Responsibility'});
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xs shrink-0"
                >
                  + Add
                </button>
              </div>

              {selectedTeamMembers.length > 0 && (
                <div className="border border-slate-200 rounded-xs overflow-hidden">
                  <table className="w-full text-left text-xs bg-white">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-2 border-b">Member Name</th>
                        <th className="p-2 border-b">Responsibility</th>
                        <th className="p-2 border-b w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTeamMembers.map((m, idx) => {
                        const usr = users.find(u => String(u.id) === m.userId);
                        return (
                          <tr key={idx}>
                            <td className="p-2 font-bold text-slate-800">{usr?.name || 'Unknown'}</td>
                            <td className="p-2 font-mono text-indigo-700">{m.responsibility}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedTeamMembers(selectedTeamMembers.filter(sm => sm.userId !== m.userId))}
                                className="text-rose-600 hover:text-rose-800 font-bold"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {errors.team && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">warning</span>{errors.team}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project Budget ($) *
              </label>
              <input
                type="text"
                required
                value={budget}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d+(\.\d*)?$/.test(val)) {
                    setBudget(val);
                  }
                }}
                placeholder="e.g. 750000"
                className={`w-full border rounded-sm p-2 text-xs outline-none font-mono font-bold ${errors.budget ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-300 focus:border-blue-600'}`}
              />
              {errors.budget && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 leading-tight"><span className="material-symbols-outlined text-[12px]">warning</span>{errors.budget}</p>}
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
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full border rounded-sm p-2 text-xs outline-none font-mono ${errors.startDate ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-300 focus:border-blue-600'}`}
              />
              {errors.startDate && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">warning</span>{errors.startDate}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Launch (End)
              </label>
              <input
                type="date"
                required
                min={startDate || new Date().toISOString().split('T')[0]}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={`w-full border rounded-sm p-2 text-xs outline-none font-mono ${errors.targetDate ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-slate-300 focus:border-blue-600'}`}
              />
              {errors.targetDate && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">warning</span>{errors.targetDate}</p>}
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
