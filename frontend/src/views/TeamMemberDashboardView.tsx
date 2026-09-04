import React from 'react';
import { Project, TaskItem, RiskItem, LoggedInPersona } from '../types';

interface TeamMemberDashboardViewProps {
  projects: Project[];
  tasks: TaskItem[];
  risks: RiskItem[];
  currentPersona?: LoggedInPersona | null;
  onNavigate?: (tab: any) => void;
}

const TeamMemberDashboardView: React.FC<TeamMemberDashboardViewProps> = ({ projects, tasks, risks, currentPersona, onNavigate }) => {
  const assignedCodes = currentPersona?.assignedProjectCodes || [];
  const myProjects = projects.filter(p => assignedCodes.includes(p.code));
  const myTasks = tasks.filter(t => t.assignee === currentPersona?.name || t.assignee === currentPersona?.email || assignedCodes.includes(t.projectCode));
  const myRisks = risks.filter(r => assignedCodes.includes(r.projectRef || r.projectCode || ''));

  const overdue = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex items-center justify-between bg-white p-6 rounded-sm border border-slate-200/80 shadow-2xs">
        <div>
          <nav className="text-xs font-bold uppercase text-slate-500 tracking-wider">Team Member Portal</nav>
          <h1 className="text-2xl font-extrabold">Welcome, {currentPersona?.name}</h1>
          <p className="text-sm text-slate-500">Your personal work board and project-specific insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate && onNavigate('tasks')} className="px-3 py-2 bg-[#00174b] text-white rounded-sm font-bold">My Tasks</button>
          <button onClick={() => onNavigate && onNavigate('change_requests')} className="px-3 py-2 bg-slate-100 rounded-sm">New Change Request</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border p-4 rounded-sm shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Assigned Projects</div>
          <div className="text-2xl font-bold mt-2">{myProjects.length}</div>
          <div className="text-xs text-slate-400 mt-1">Projects you're assigned to</div>
        </div>

        <div className="bg-white border p-4 rounded-sm shadow-2xs">
          <div className="text-xs font-bold text-slate-500">My Tasks</div>
          <div className="text-2xl font-bold mt-2">{myTasks.length}</div>
          <div className="text-xs text-slate-400 mt-1">Tasks assigned to you</div>
        </div>

        <div className="bg-white border p-4 rounded-sm shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Overdue</div>
          <div className="text-2xl font-bold mt-2 text-red-600">{overdue}</div>
          <div className="text-xs text-slate-400 mt-1">Tasks past due date</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border p-4 rounded-sm shadow-2xs">
          <h3 className="font-bold mb-2">My Projects</h3>
          <div className="space-y-2">
            {myProjects.slice(0,6).map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{p.code} - {p.name}</div>
                  <div className="text-xs text-slate-500">{p.department} • {p.owner}</div>
                </div>
                <div className="text-xs text-slate-400">{p.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border p-4 rounded-sm shadow-2xs">
          <h3 className="font-bold mb-2">My Risks</h3>
          <div className="text-xs text-slate-600">{myRisks.length} issues reported against your projects</div>
        </div>
      </div>

      <div className="bg-white border p-4 rounded-sm shadow-2xs">
        <h3 className="font-bold mb-2">Quick Actions</h3>
        <div className="flex gap-2">
          <button onClick={() => onNavigate && onNavigate('tasks')} className="px-3 py-1 bg-indigo-50 border rounded-sm text-indigo-700 text-xs">Open My Tasks</button>
          <button onClick={() => onNavigate && onNavigate('change_requests')} className="px-3 py-1 bg-amber-50 border rounded-sm text-amber-700 text-xs">Submit Change Request</button>
          <button onClick={() => onNavigate && onNavigate('reports')} className="px-3 py-1 bg-emerald-50 border rounded-sm text-emerald-700 text-xs">Add Report</button>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDashboardView;
