import React, { useState } from 'react';
import { ResourceLoading } from '../../types';

interface ResourcesViewProps {
  resources: ResourceLoading[];
  onUpdateResource: (dept: string, newPct: number) => void;
  onOpenAssignMemberModal?: () => void;
}

interface AllocationRecord {
  id: string;
  employee: string;
  role: string;
  project: string;
  task: string;
  hoursAllocated: number;
  status: 'Available' | 'Fully Allocated' | 'Partially Available' | 'On Leave';
  department: string;
}

interface EmployeeSkill {
  id: string;
  employee: string;
  role: string;
  skills: string[];
  department: string;
  freeCapacity: number;
  utilization: number;
  status: 'Fully Allocated' | 'Partially Available' | 'Available' | 'On Leave';
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({ resources, onUpdateResource, onOpenAssignMemberModal }) => {
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Resource Directory' | 'Resource Allocation' | 'Availability' | 'Workload' | 'Skills & Roles' | 'Reports'
  >('Overview');

  const [showAllocModal, setShowAllocModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState('');
  const [newProject, setNewProject] = useState('Cloud Data Lake Migration');
  const [newTask, setNewTask] = useState('Architecture Review');
  const [newHours, setNewHours] = useState(35);

  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All Statuses');

  // Employee dataset for Availability, Skills, and Reports
  const employees: EmployeeSkill[] = [
    {
      id: 'emp-1',
      employee: 'Sarah Connor',
      role: 'Lead Fullstack Dev',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      department: 'Engineering',
      freeCapacity: 0,
      utilization: 100,
      status: 'Fully Allocated'
    },
    {
      id: 'emp-2',
      employee: 'David Miller',
      role: 'UI/UX Designer',
      skills: ['Figma', 'User Research', 'Wireframing', 'CSS/Tailwind'],
      department: 'Design',
      freeCapacity: 16,
      utilization: 60,
      status: 'Partially Available'
    },
    {
      id: 'emp-3',
      employee: 'Elena Rostova',
      role: 'DevOps Engineer',
      skills: ['AWS', 'Kubernetes', 'CI/CD Pipelines', 'Terraform'],
      department: 'Infrastructure',
      freeCapacity: 32,
      utilization: 20,
      status: 'Available'
    },
    {
      id: 'emp-4',
      employee: 'Marcus Vance',
      role: 'Backend Developer',
      skills: ['Python', 'Django', 'Redis', 'GraphQL'],
      department: 'Engineering',
      freeCapacity: 40,
      utilization: 0,
      status: 'On Leave'
    }
  ];

  const [allocations, setAllocations] = useState<AllocationRecord[]>([
    {
      id: 'al-1',
      employee: 'Sarah Connor',
      role: 'Lead Fullstack Dev',
      project: 'Cloud Data Lake Migration',
      task: 'Database Schema Tuning',
      hoursAllocated: 40,
      status: 'Fully Allocated',
      department: 'Engineering'
    },
    {
      id: 'al-2',
      employee: 'David Miller',
      role: 'UI/UX Designer',
      project: 'Zero-Trust Framework',
      task: 'IAM Policy Review & Design',
      hoursAllocated: 24,
      status: 'Partially Available',
      department: 'Design'
    },
    {
      id: 'al-3',
      employee: 'Elena Rostova',
      role: 'DevOps Engineer',
      project: 'CRM Analytics Platform',
      task: 'Data Pipeline Specs & Terraform',
      hoursAllocated: 8,
      status: 'Available',
      department: 'Infrastructure'
    },
    {
      id: 'al-4',
      employee: 'Marcus Vance',
      role: 'Backend Developer',
      project: 'ERP Modernization',
      task: 'API Penetration Test',
      hoursAllocated: 0,
      status: 'On Leave',
      department: 'Engineering'
    }
  ]);

  // Overall calculations
  const totalEmployees = employees.length;
  const availableCount = employees.filter((a) => a.status === 'Available' || a.status === 'Partially Available').length;
  const busyCount = employees.filter((a) => a.status === 'Fully Allocated').length;
  const onLeaveCount = employees.filter((a) => a.status === 'On Leave').length;

  const totalPct = resources.reduce((acc, r) => acc + r.percentage, 0);
  const avgUtilization = resources.length > 0 ? Math.round(totalPct / resources.length) : 45;

  // Total Available Bench Hours
  const totalBenchHours = employees.reduce((acc, e) => acc + e.freeCapacity, 0);

  const handleAddAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.trim()) return;

    const newRecord: AllocationRecord = {
      id: `al-${Date.now()}`,
      employee: newEmployee,
      role: 'Resource Specialist',
      project: newProject,
      task: newTask,
      hoursAllocated: Number(newHours),
      status: newHours >= 35 ? 'Fully Allocated' : 'Partially Available',
      department: 'Engineering'
    };

    setAllocations([newRecord, ...allocations]);
    setNewEmployee('');
    setShowAllocModal(false);
  };

  const filteredAvailabilityEmployees = employees.filter((e) => {
    if (availabilityFilter === 'All Statuses') return true;
    return e.status === availabilityFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>GOVERNANCE</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b]">RESOURCE MANAGEMENT</span>
          </nav>
          <h2 className="text-[28px] font-extrabold text-[#191c1e] tracking-tight">Resource Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitor capacity, assign projects, manage workloads, and analyze utilization across departments.
          </p>
        </div>

        {onOpenAssignMemberModal && (
          <button
            onClick={onOpenAssignMemberModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xs flex items-center gap-1.5 shadow-2xs transition-colors uppercase tracking-wider shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Request Member Assignment</span>
          </button>
        )}
      </div>

      {/* Sub-navigation Pill Bar */}
      <div className="bg-slate-100/80 p-1.5 rounded-sm border border-slate-200/80 flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-600">
        {[
          { key: 'Overview', label: 'Overview' },
          { key: 'Resource Directory', label: 'Resource Directory' },
          { key: 'Resource Allocation', label: 'Resource Allocation' },
          { key: 'Availability', label: 'Availability' },
          { key: 'Workload', label: 'Workload' },
          { key: 'Skills & Roles', label: 'Skills & Roles' },
          { key: 'Reports', label: 'Reports' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-1.5 rounded-xs transition-all ${
              activeTab === tab.key
                ? 'bg-white text-blue-900 font-bold shadow-2xs border border-slate-200/60'
                : 'hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB CONTENT */}
      {activeTab === 'Overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Employees</span>
              <p className="text-3xl font-extrabold text-blue-900 font-mono">{totalEmployees}</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Resources</span>
              <p className="text-3xl font-extrabold text-emerald-600 font-mono">{availableCount}</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Busy (Fully Allocated)</span>
              <p className="text-3xl font-extrabold text-red-600 font-mono">{busyCount}</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">On Leave</span>
              <p className="text-3xl font-extrabold text-slate-700 font-mono">{onLeaveCount}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs max-w-sm space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Resource Utilization (%)
            </span>
            <p className="text-4xl font-black text-indigo-600 font-mono">{avgUtilization}%</p>
          </div>

          <div className="grid grid-cols-12 gap-6 items-start">
            <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-600">assignment</span>
                  Recent Resource Assignments
                </h3>
                <button
                  onClick={() => setShowAllocModal(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xs flex items-center gap-1"
                >
                  + New Allocation
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f2f4f6] text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                      <th className="px-4 py-2.5">Employee</th>
                      <th className="px-4 py-2.5">Project</th>
                      <th className="px-4 py-2.5">Task</th>
                      <th className="px-4 py-2.5">Hours Allocated</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allocations.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{a.employee}</div>
                          <div className="text-[10px] text-slate-500">{a.role}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{a.project}</td>
                        <td className="px-4 py-3 text-slate-600">{a.task}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">{a.hoursAllocated} hrs/wk</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-xs font-bold text-[10px] uppercase ${
                              a.status === 'Available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : a.status === 'Partially Available'
                                ? 'bg-amber-100 text-amber-800'
                                : a.status === 'Fully Allocated'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="material-symbols-outlined text-[18px] text-amber-500">bolt</span>
                Quick Statistics
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Resource Utilization Rate</span>
                  <span className="text-indigo-600 font-mono">{avgUtilization}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${avgUtilization}%` }}></div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                  Capacity Loading by Department
                </span>

                {resources.map((r) => (
                  <div key={r.department} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span className="font-medium">{r.department}</span>
                      <span className="font-mono font-bold">{r.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          r.percentage >= 90 ? 'bg-red-600' : 'bg-blue-900'
                        }`}
                        style={{ width: `${r.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESOURCE DIRECTORY TAB */}
      {activeTab === 'Resource Directory' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4 animate-fadeIn">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Departmental Staffing &amp; Capacity Controls
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => {
              const isOverloaded = res.percentage >= 90;
              return (
                <div key={res.department} className="bg-slate-50 border border-slate-200/80 p-5 rounded-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">{res.department}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{res.headcount} Allocated FTEs</p>
                    </div>
                    <span className={`text-xl font-bold font-mono ${isOverloaded ? 'text-red-600' : 'text-[#00174b]'}`}>
                      {res.percentage}%
                    </span>
                  </div>

                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${isOverloaded ? 'bg-red-600' : 'bg-[#00174b]'}`}
                      style={{ width: `${res.percentage}%` }}
                    ></div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Adjust Loading Target:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onUpdateResource(res.department, Math.max(10, res.percentage - 5))}
                        className="w-7 h-7 bg-white border border-slate-300 hover:bg-slate-100 rounded-xs font-bold text-slate-700 flex items-center justify-center"
                      >
                        -
                      </button>
                      <button
                        onClick={() => onUpdateResource(res.department, Math.min(120, res.percentage + 5))}
                        className="w-7 h-7 bg-white border border-slate-300 hover:bg-slate-100 rounded-xs font-bold text-slate-700 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESOURCE ALLOCATION TAB */}
      {activeTab === 'Resource Allocation' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Active Project Allocations</h3>
            <button
              onClick={() => setShowAllocModal(true)}
              className="px-3 py-1.5 bg-[#00174b] text-white font-bold text-xs rounded-xs"
            >
              + Create New Allocation
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {allocations.map((a) => (
              <div key={a.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900">{a.employee} ({a.role})</p>
                  <p className="text-slate-500 mt-0.5">
                    Assigned to <span className="font-bold text-slate-700">{a.project}</span> • Task: {a.task}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-900 block">{a.hoursAllocated} hrs / week</span>
                  <span className="text-[10px] text-slate-400 uppercase">{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AVAILABILITY TAB (Matching Screenshot 3) */}
      {activeTab === 'Availability' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Availability Status Tracker</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600">Filter Status:</span>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="border border-slate-300 rounded-sm px-3 py-1.5 font-medium text-slate-700 outline-none focus:border-blue-700"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Fully Allocated">Fully Allocated</option>
                <option value="Partially Available">Partially Available</option>
                <option value="Available">Available</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailabilityEmployees.map((emp) => (
              <div key={emp.id} className="p-4 bg-slate-50/60 border border-slate-200/80 rounded-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{emp.employee}</h4>
                    <p className="text-xs text-slate-500 font-medium">{emp.role}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                      emp.status === 'Fully Allocated'
                        ? 'bg-red-100 text-red-800'
                        : emp.status === 'Partially Available'
                        ? 'bg-amber-100 text-amber-800'
                        : emp.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        emp.status === 'Fully Allocated'
                          ? 'bg-red-600'
                          : emp.status === 'Partially Available'
                          ? 'bg-amber-600'
                          : emp.status === 'Available'
                          ? 'bg-emerald-600'
                          : 'bg-slate-600'
                      }`}
                    ></span>
                    {emp.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Free Capacity:</span>
                    <span className="font-mono font-bold text-slate-900">{emp.freeCapacity} hrs/wk</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Current Utilization:</span>
                    <span className="font-mono font-bold text-slate-900">{emp.utilization}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORKLOAD TAB */}
      {activeTab === 'Workload' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4 animate-fadeIn">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Individual &amp; Team Workload Distribution</h3>
            <p className="text-xs text-slate-500">Weekly allocation breakdown per team member.</p>
          </div>

          <div className="space-y-4">
            {employees.map((emp) => (
              <div key={emp.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xs space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{emp.employee}</span>
                    <span className="text-slate-500 ml-2">({emp.role})</span>
                  </div>
                  <span className="font-mono font-bold text-blue-900">{40 - emp.freeCapacity} / 40 hrs allocated</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      emp.utilization >= 100
                        ? 'bg-red-600'
                        : emp.utilization >= 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${emp.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SKILLS & ROLES TAB (Matching Screenshot 2) */}
      {activeTab === 'Skills & Roles' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-slate-700 text-[20px]">build</span>
            <h3 className="font-bold text-slate-900 text-sm">Employee Skills &amp; Functional Roles</h3>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Skills Matrix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{emp.employee}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{emp.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {emp.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-sm text-[11px] border border-blue-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS TAB (Matching Screenshot 1) */}
      {activeTab === 'Reports' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Card 1: Departmental Capacity Summary */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[20px]">check_box</span>
                Departmental Capacity Summary
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Overview of team capacity allocation across departments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Engineering */}
              <div className="bg-slate-50/50 border border-slate-200/80 p-5 rounded-sm space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Engineering</h4>
                <p className="text-3xl font-extrabold text-blue-600 font-mono">50%</p>
                <p className="text-xs text-slate-500">40 / 80 total hours allocated across 2 resource(s).</p>
              </div>

              {/* Design */}
              <div className="bg-slate-50/50 border border-slate-200/80 p-5 rounded-sm space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Design</h4>
                <p className="text-3xl font-extrabold text-blue-600 font-mono">60%</p>
                <p className="text-xs text-slate-500">24 / 40 total hours allocated across 1 resource(s).</p>
              </div>

              {/* Infrastructure */}
              <div className="bg-slate-50/50 border border-slate-200/80 p-5 rounded-sm space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Infrastructure</h4>
                <p className="text-3xl font-extrabold text-blue-600 font-mono">20%</p>
                <p className="text-xs text-slate-500">8 / 40 total hours allocated across 1 resource(s).</p>
              </div>
            </div>
          </div>

          {/* Card 2: Availability Report */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  Availability Report
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Unassigned capacity and bench strength breakdown.</p>
              </div>
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-sm font-mono">
                Total Available Bench: {totalBenchHours} hrs/wk
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Current Status</th>
                    <th className="px-6 py-3">Available Hours</th>
                    <th className="px-6 py-3">Availability %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{emp.employee}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{emp.role}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{emp.status}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{emp.freeCapacity} hrs/wk</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{100 - emp.utilization}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NEW ALLOCATION MODAL */}
      {showAllocModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-sm border border-slate-300 shadow-xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm uppercase">Assign Resource Allocation</h3>
              <button onClick={() => setShowAllocModal(false)} className="text-slate-400 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleAddAllocation} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={newEmployee}
                  onChange={(e) => setNewEmployee(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full border border-slate-300 p-2 rounded-sm outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Project Target</label>
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded-sm outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Assigned Task</label>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded-sm outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Hours / Week</label>
                <input
                  type="number"
                  value={newHours}
                  onChange={(e) => setNewHours(Number(e.target.value))}
                  className="w-full border border-slate-300 p-2 rounded-sm outline-none focus:border-blue-700 font-mono"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAllocModal(false)}
                  className="px-3 py-1.5 border rounded-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00174b] text-white font-bold rounded-sm uppercase tracking-wider hover:bg-indigo-950"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
