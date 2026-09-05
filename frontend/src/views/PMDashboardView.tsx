import React from 'react';
import { Project, TaskItem, UserItem, ResourceLoading, LoggedInPersona } from '../types';

interface PMDashboardViewProps {
  projects: Project[];
  tasks: TaskItem[];
  users: UserItem[];
  resources: ResourceLoading[];
  currentPersona?: LoggedInPersona | null;
  onNavigate: (tab: any) => void;
  onOpenAssignMemberModal?: () => void;
}

export const PMDashboardView: React.FC<PMDashboardViewProps> = ({
  projects,
  tasks,
  users,
  resources,
  currentPersona,
  onNavigate,
  onOpenAssignMemberModal
}) => {
  const myProjects = projects.filter(p => currentPersona?.assignedProjectCodes?.includes(p.code) || true);
  const myTasks = tasks.filter(t => currentPersona?.assignedProjectCodes?.includes(t.projectCode) || true);

  const teamMembers = users.filter(u => {
    if (!u) return false;
    if (typeof u.role === 'string') return u.role === 'TEAM_MEMBER';
    return u.role && (u.role.code === 'TEAM_MEMBER' || u.role.name === 'TEAM_MEMBER');
  });

  const activeProjects = myProjects.filter(p => p.status === 'ACTIVE').length;
  const overdueTasks = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;
  const teamLoadPct = Math.round(resources.reduce((a, b) => a + b.percentage, 0) / (resources.length || 1));

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex items-center justify-between bg-white p-6 rounded-sm border border-slate-200/80 shadow-2xs">
        <div>
          <nav className="text-xs font-bold uppercase text-slate-500 tracking-wider">Project Manager Portal</nav>
          <h1 className="text-2xl font-extrabold">Project Manager Dashboard</h1>
          <p className="text-sm text-slate-500">Personalized view of projects, tasks and team capacity.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('projects')} className="px-3 py-2 bg-[#00174b] text-white rounded-sm font-bold">Open Projects</button>
          <button onClick={() => onNavigate('tasks')} className="px-3 py-2 bg-slate-100 rounded-sm">My Tasks</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border p-4 rounded-sm shadow-2xs">
          <div className="text-xs font-bold text-slate-500">My Active Projects</div>
          <div className="text-2xl font-bold mt-2">{activeProjects}</div>
          <div className="text-xs text-slate-400 mt-1">Projects you manage or watch</div>
        </div>

        <div className="bg-white border p-4 rounded-sm shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Open Tasks</div>
          <div className="text-2xl font-bold mt-2">{myTasks.length}</div>
          <div className="text-xs text-slate-400 mt-1">Tasks across your projects</div>
        </div>

        <div className="bg-white border p-4 rounded-sm shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Overdue Tasks</div>
          <div className="text-2xl font-bold mt-2 text-red-600">{overdueTasks}</div>
          <div className="text-xs text-slate-400 mt-1">Tasks past due date</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border p-4 rounded-sm shadow-2xs">
          <h3 className="font-bold mb-2">Team Members</h3>
          <div className="space-y-2">
            {teamMembers.slice(0, 8).map(m => (
              <div key={m.id} className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.department}</div>
                </div>
                <div className="text-xs text-slate-400">{m.status}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-right">
            <button onClick={onOpenAssignMemberModal} className="px-3 py-1 bg-indigo-50 border rounded-sm text-indigo-700 text-xs">Assign Member</button>
          </div>
        </div>

        <div className="bg-white border p-4 rounded-sm shadow-2xs">
          <h3 className="font-bold mb-2">Team Capacity</h3>
          <div className="text-3xl font-extrabold">{teamLoadPct}%</div>
          <div className="text-xs text-slate-400 mt-1">Average dept utilization</div>
        </div>
      </div>

      <div className="bg-white border p-4 rounded-sm shadow-2xs">
        <h3 className="font-bold mb-2">Recent Projects</h3>
        <div className="space-y-2">
          {myProjects.slice(0,6).map(p => (
            <div key={p.id} className="flex items-center justify-between">
              <div>
                <div className="font-bold">{p.code} - {p.name}</div>
                <div className="text-xs text-slate-500">{p.department} • {p.owner}</div>
              </div>
              <div className="text-xs text-slate-400">{p.approvalStatus || p.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PMDashboardView;
