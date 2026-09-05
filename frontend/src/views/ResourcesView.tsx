import React, { useEffect, useMemo, useState } from 'react';
import { Project, ResourceLoading, ResourceRecord, UserItem } from '../types';
import { createResourceApi, updateResourceStatusApi } from '../services/api';

interface ResourcesViewProps {
  resources: ResourceLoading[];
  resourceRecords: ResourceRecord[];
  projects: Project[];
  users: UserItem[];
  onSelectUser?: (user: UserItem) => void;
  onOpenAssignMemberModal?: (project?: any) => void;
  onRefresh?: () => Promise<void> | void;
}

interface AllocationRecord {
  id: string | number;
  employee: string;
  role: string;
  project: string;
  task: string;
  hoursAllocated: number;
  status: 'Available' | 'Fully Allocated' | 'Partially Available';
  department: string;
}

interface EmployeeSkill {
  id: string | number;
  userId?: string | number | null;
  employee: string;
  role: string;
  department: string;
  freeCapacity: number;
  utilization: number;
  status: 'Fully Allocated' | 'Partially Available' | 'Available';
}

const getAllocationStatus = (hours: number): AllocationRecord['status'] => {
  if (hours <= 20) return 'Available';
  if (hours <= 30) return 'Partially Available';
  return 'Fully Allocated';
};

export const ResourcesView: React.FC<ResourcesViewProps> = ({ resources, resourceRecords, projects, users, onOpenAssignMemberModal, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Resource Directory' | 'Resource Allocation' | 'Availability' | 'Workload' | 'Assignment Request' | 'Reports'
  >('Overview');

  const [showAllocModal, setShowAllocModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newTask, setNewTask] = useState('Architecture Review');
  const workDaysPerWeek = 5;
  const workHoursPerDay = 9;
  const maxWeeklyHours = workDaysPerWeek * workHoursPerDay;
  const [newHours, setNewHours] = useState(maxWeeklyHours);
  const [allocationError, setAllocationError] = useState<string | null>(null);
  const [allocationSaving, setAllocationSaving] = useState(false);
  const allocationHoursByUser = useMemo(() => resourceRecords
    .filter((record) => record.type === 'ALLOCATION' && record.status === 'ACTIVE' && record.userId)
    .reduce((totals, record) => {
      const userId = String(record.userId);
      totals.set(userId, (totals.get(userId) || 0) + Number(record.hoursPerWeek || 0));
      return totals;
    }, new Map<string, number>()), [resourceRecords]);


  const selectedUserAllocatedHours = allocationHoursByUser.get(newEmployee) || 0;
  const selectedUserAvailableHours = Math.max(0, 40 - selectedUserAllocatedHours);
  const allocationHoursValid = Number(newHours) > 0 && Number(newHours) <= selectedUserAvailableHours;

  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All Statuses');

  const allocatedMembersByDepartment = useMemo(() => {
    const grouped = new Map<string, ResourceRecord[]>();

    resourceRecords
      .filter((record) =>
        ((record.type === 'ALLOCATION' && record.status === 'ACTIVE') ||
          (record.type === 'ASSIGNMENT_REQUEST' && record.status === 'APPROVED')) &&
        (record.user || record.employeeName)
      )
      .forEach((record) => {
        const departmentRecords = grouped.get(record.department) || [];
        grouped.set(record.department, [...departmentRecords, record]);
      });

    return grouped;
  }, [resourceRecords]);

  const allocations = useMemo<AllocationRecord[]>(() => resourceRecords
    .filter((record) =>
      (record.type === 'ALLOCATION' && record.status === 'ACTIVE') ||
      (record.type === 'ASSIGNMENT_REQUEST' && record.status === 'APPROVED')
    )
    .map((record) => ({
      id: record.id,
      employee: record.user?.name || record.employeeName || 'Unknown user',
      role: record.projectRoleTitle || 'Resource',
      project: record.project?.name || record.projectTarget || 'Unknown project',
      task: record.assignedTask || 'Unassigned',
      hoursAllocated: Number(record.hoursPerWeek || 0),
      status: getAllocationStatus(Number(record.hoursPerWeek || 0)),
      department: record.department,
    })), [resourceRecords]);

  const employees = useMemo<EmployeeSkill[]>(() => {
    const byEmployee = new Map<string, ResourceRecord[]>();
    allocations.forEach((allocation) => {
      const record = resourceRecords.find((item) => String(item.id) === String(allocation.id));
      if (record) {
        const employeeName = record.user?.name || record.employeeName || 'Unknown user';
        byEmployee.set(employeeName, [...(byEmployee.get(employeeName) || []), record]);
      }
    });
    return Array.from(byEmployee.entries()).map(([employee, records]) => {
      const hours = records.reduce((sum, record) => sum + Number(record.hoursPerWeek || 0), 0);
      const utilization = Math.min(100, Math.round((hours / 40) * 100));
      return {
        id: records[0].id,
        userId: records[0].userId,
        employee,
        role: records[0].projectRoleTitle || 'Resource',
        department: records[0].department,
        freeCapacity: Math.max(0, 40 - hours),
        utilization,
        status: getAllocationStatus(hours),
      };
    });
  }, [allocations, resourceRecords]);

  const availabilityEmployees = useMemo<EmployeeSkill[]>(() => users
    .filter((user) => {
      const roleCode = typeof user.role === 'string'
        ? user.role
        : (user.role as any)?.code || (user.role as any)?.name;
      return String(roleCode || '').trim().replace(/[\s-]+/g, '_').toUpperCase() === 'TEAM_MEMBER';
    })
    .map((user) => {
    const userAllocations = resourceRecords.filter((record) =>
      record.type === 'ALLOCATION' &&
      record.status === 'ACTIVE' &&
      (record.userId != null
        ? String(record.userId) === String(user.id)
        : record.employeeName === user.name)
    );
    const allocatedHours = userAllocations.reduce(
      (sum, record) => sum + Number(record.hoursPerWeek || 0),
      0
    );
    const freeCapacity = Math.max(0, 40 - allocatedHours);

    return {
      id: user.id,
      userId: user.id,
      employee: user.name,
      role: user.title || user.governanceRole || userAllocations[0]?.projectRoleTitle || 'Resource',
      department: user.department || userAllocations[0]?.department || 'Unassigned',
      freeCapacity,
      utilization: Math.min(100, Math.round((allocatedHours / 40) * 100)),
      status: allocatedHours >= 40
        ? 'Fully Allocated'
        : allocatedHours > 0
        ? 'Partially Available'
        : 'Available',
    };
    }), [resourceRecords, users]);

  const availabilityStatusByUserId = new Map(
    employees
      .filter((employee) => employee.userId != null)
      .map((employee) => [String(employee.userId), employee.status])
  );

  const teamMembers = users.filter((user) => {
    if (user.status !== 'Active') return false;

    const roleCode = typeof user.role === 'string'
      ? user.role
      : (user.role as any)?.code || (user.role as any)?.name;
    const availabilityStatus = availabilityStatusByUserId.get(String(user.id));
    const isAvailableInAvailabilityTab =
      availabilityStatus === 'Available' || availabilityStatus === 'Partially Available';
    const isAvailableTeamMember =
      String(roleCode || '').trim().replace(/[\s-]+/g, '_').toUpperCase() === 'TEAM_MEMBER' &&
      (allocationHoursByUser.get(String(user.id)) || 0) < 40;

    return isAvailableTeamMember || isAvailableInAvailabilityTab;
  });

  const selectedEmployee = teamMembers.find((user) => String(user.id) === newEmployee);

  useEffect(() => {
    setNewDepartment(selectedEmployee?.department || '');
  }, [selectedEmployee?.id, selectedEmployee?.department]);

  const requests = resourceRecords.filter((record) => record.type === 'ASSIGNMENT_REQUEST');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [commentRequest, setCommentRequest] = useState<ResourceRecord | null>(null);
  const [commentAction, setCommentAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [requestComment, setRequestComment] = useState('');
  const [isCommentSaving, setIsCommentSaving] = useState(false);

  const openCommentDialog = (request: ResourceRecord, status: 'APPROVED' | 'REJECTED') => {
    setCommentRequest(request);
    setCommentAction(status);
    setRequestComment('');
    setRequestError(null);
  };

  const closeCommentDialog = () => {
    setCommentRequest(null);
    setCommentAction(null);
    setRequestComment('');
  };

  const handleRequestStatus = async () => {
    if (!commentRequest || !commentAction || !requestComment.trim()) {
      setRequestError('A comment is required before saving.');
      return;
    }

    setIsCommentSaving(true);
    setRequestError(null);
    try {
      await updateResourceStatusApi(commentRequest.id, commentAction, requestComment.trim());
      closeCommentDialog();
      await onRefresh?.();
    } catch (error: any) {
      setRequestError(error.message || 'Failed to update assignment request.');
    } finally {
      setIsCommentSaving(false);
    }
  };

  // Overall calculations
  const totalEmployees = employees.length;
  const allocationHoursByEmployee = resourceRecords
    .filter((record) =>
      (record.type === 'ALLOCATION' && record.status === 'ACTIVE') ||
      (record.type === 'ASSIGNMENT_REQUEST' && record.status === 'APPROVED')
    )
    .reduce((hoursByEmployee, record) => {
      const employeeName = (record.user?.name || record.employeeName || 'Unknown user').trim();
      hoursByEmployee.set(
        employeeName,
        (hoursByEmployee.get(employeeName) || 0) + Number(record.hoursPerWeek || 0)
      );
      return hoursByEmployee;
    }, new Map<string, number>());
  const availableCount = Array.from(allocationHoursByEmployee.values())
    .filter((hours) => hours <= 20).length;
  const hasLoadedResourceRecords = resourceRecords.length > 0;
  const busyCount = Array.from(allocationHoursByEmployee.values())
    .filter((hours) => hours >= 31).length;
  const pendingRequestCount = resourceRecords.filter(
    (record) => record.type === 'ASSIGNMENT_REQUEST' && record.status === 'PENDING'
  ).length;

  const totalPct = resources.reduce((acc, r) => acc + r.percentage, 0);
  const avgUtilization = totalPct;

  // Total Available Bench Hours
  const totalBenchHours = employees.reduce((acc, e) => acc + e.freeCapacity, 0);

  const handleAddAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.trim() || !newDepartment || !newProject || !allocationHoursValid) {
      if (newEmployee && !newDepartment) {
        setAllocationError('This employee does not have a department assigned.');
      }
      return;
    }

    setAllocationError(null);
    setAllocationSaving(true);

    const newRecord: AllocationRecord = {
      id: `al-${Date.now()}`,
      employee: newEmployee,
      role: 'Resource',
      project: newProject,
      task: newTask,
      hoursAllocated: Number(newHours),
      status: getAllocationStatus(newHours),
      department: newDepartment,
    };

    try {
      const created = await createResourceApi({
        type: 'ALLOCATION',
        projectId: newProject,
        userId: Number(newEmployee),
        assignedTask: newTask,
        department: newDepartment,
        hoursPerWeek: Number(newHours),
        status: 'ACTIVE',
      });

      if (created) {
        newRecord.id = String(created.id ?? newRecord.id);
      }

      setNewEmployee('');
      setShowAllocModal(false);

      if (onRefresh) await onRefresh();
    } catch (err: any) {
      setAllocationError(err?.message || 'Failed to save allocation to the database.');
    } finally {
      setAllocationSaving(false);
    }
  };

  const filteredAvailabilityEmployees = availabilityEmployees.filter((e) => {
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
          { key: 'Assignment Request', label: 'Assignment Request' },
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
              <p className="text-3xl font-extrabold text-emerald-600 font-mono">
                {hasLoadedResourceRecords ? availableCount : '--'}
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Busy (Fully Allocated)</span>
              <p className="text-3xl font-extrabold text-red-600 font-mono">{busyCount}</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Requests</span>
              <p className="text-3xl font-extrabold text-amber-600 font-mono">{pendingRequestCount}</p>
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

                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Allocated Members</p>
                    {(allocatedMembersByDepartment.get(res.department) || []).length > 0 ? (
                      <div className="divide-y divide-slate-200">
                        {(allocatedMembersByDepartment.get(res.department) || []).map((record) => (
                          <div key={record.id} className="py-2 first:pt-0 last:pb-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{record.user?.name || record.employeeName}</p>
                                <p className="text-[10px] text-slate-500 truncate">{record.projectRoleTitle || 'Allocated team member'}</p>
                                {record.project?.name && <p className="text-[10px] text-slate-400 truncate">{record.project.name}</p>}
                              </div>
                              <span className="shrink-0 text-[10px] font-mono font-bold text-slate-700">{record.hoursPerWeek} hrs/week</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400">No members currently allocated</p>
                    )}
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

      {/* ASSIGNMENT REQUEST TAB */}
      {activeTab === 'Assignment Request' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Assignment Requests</h3>
            <p className="text-xs text-slate-500 mt-1">Submit and manage requests persisted in the resource database.</p>
          </div>
          {requestError && <p className="text-rose-700">{requestError}</p>}

          <div className="overflow-x-auto border border-slate-200/80 rounded-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead><tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200"><th className="px-4 py-3">Requester</th><th className="px-4 py-3">Member / Project</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Project Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => <tr key={request.id}>
                  <td className="px-4 py-3 font-bold">{request.pmRequesterName}</td>
                  <td className="px-4 py-3"><div className="font-bold">{request.user?.name || request.employeeName || 'Unknown user'}</div><div className="text-slate-500">{request.project?.name || request.projectTarget || 'Unknown project'}</div></td>
                  <td className="px-4 py-3">{request.department}</td>
                  <td className="px-4 py-3">{request.projectRoleTitle}</td>
                  <td className="px-4 py-3 font-bold">
                    <div>{request.status}</div>
                    {request.status === 'APPROVED' && request.approvalComment && <div className="mt-1 text-[10px] font-normal text-emerald-700">Approval Comment: {request.approvalComment}</div>}
                    {request.status === 'REJECTED' && request.rejectionComment && <div className="mt-1 text-[10px] font-normal text-rose-700">Rejection Reason: {request.rejectionComment}</div>}
                  </td>
                  <td className="px-4 py-3">{request.status === 'PENDING' && <div className="flex gap-2"><button onClick={() => openCommentDialog(request, 'APPROVED')} className="text-emerald-700 font-bold">Approve</button><button onClick={() => openCommentDialog(request, 'REJECTED')} className="text-rose-700 font-bold">Reject</button></div>}</td>
                </tr>)}
              </tbody>
            </table>
          </div>

          {commentRequest && commentAction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md space-y-4 rounded-sm border border-slate-300 bg-white p-6 shadow-xl">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className={commentAction === 'APPROVED' ? 'text-emerald-600' : 'text-rose-600'}>{commentAction === 'APPROVED' ? '✓' : '!'}</span>
                  {commentAction === 'REJECTED' ? 'Reject Assignment Request' : 'Approve Assignment Request'}
                </h3>
                {commentAction === 'APPROVED' && (
                  <>
                    <p className="text-xs text-slate-600">Are you sure you want to approve this assignment request?</p>
                    <div className="space-y-3 rounded-sm border border-slate-200 bg-slate-50 p-4 text-xs">
                      <div><p className="font-bold text-slate-500">Requester</p><p className="mt-0.5 font-semibold text-slate-900">{commentRequest.pmRequesterName || 'Unknown requester'}</p></div>
                      <div><p className="font-bold text-slate-500">Project</p><p className="mt-0.5 font-semibold text-slate-900">{commentRequest.project?.name || commentRequest.projectTarget || 'Unknown project'}</p></div>
                      <div><p className="font-bold text-slate-500">Requested Member</p><p className="mt-0.5 font-semibold text-slate-900">{commentRequest.user?.name || commentRequest.employeeName || 'Unknown member'}</p></div>
                      <div><p className="font-bold text-slate-500">Department</p><p className="mt-0.5 font-semibold text-slate-900">{commentRequest.department || 'Unknown department'}</p></div>
                      <div><p className="font-bold text-slate-500">Role</p><p className="mt-0.5 font-semibold text-slate-900">{commentRequest.projectRoleTitle || 'Unspecified role'}</p></div>
                    </div>
                  </>
                )}
                <label className="block text-xs font-bold text-slate-700">
                  {commentAction === 'REJECTED' ? 'Reason for rejection' : 'Approval Comment *'}
                  <textarea
                    value={requestComment}
                    onChange={(event) => setRequestComment(event.target.value)}
                    className="mt-2 min-h-24 w-full resize-y rounded-sm border border-slate-300 p-2 font-normal outline-none focus:border-blue-700"
                    autoFocus
                  />
                </label>
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <button type="button" onClick={closeCommentDialog} disabled={isCommentSaving} className="rounded-sm border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700">Cancel</button>
                  <button type="button" onClick={handleRequestStatus} disabled={isCommentSaving} className="rounded-sm bg-[#00174b] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{isCommentSaving ? 'Saving...' : commentAction === 'APPROVED' ? 'Approve' : 'Save'}</button>
                </div>
              </div>
            </div>
          )}
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
              {resources.map((resource) => (
                <div key={resource.department} className="bg-slate-50/50 border border-slate-200/80 p-5 rounded-sm space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">{resource.department}</h4>
                  <p className="text-3xl font-extrabold text-blue-600 font-mono">{resource.percentage}%</p>
                  <p className="text-xs text-slate-500">{resource.headcount} allocated resource(s).</p>
                </div>
              ))}
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
                <select
                  required
                  value={newEmployee}
                  onChange={(e) => setNewEmployee(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded-sm outline-none focus:border-blue-700"
                >
                  <option value="">Select a team member</option>
                  {teamMembers.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                {newEmployee && (
                  <div className="mt-2 text-[10px] text-slate-500">
                    Weekly capacity: <strong>40 hrs</strong> | Allocated: <strong>{selectedUserAllocatedHours} hrs</strong> | Available: <strong>{selectedUserAvailableHours} hrs</strong>
                    {selectedUserAvailableHours === 0 && <p className="mt-1 font-bold text-rose-700">This member is fully allocated.</p>}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={newDepartment}
                  readOnly
                  disabled={!selectedEmployee}
                  placeholder="Select an employee"
                  className="w-full border border-slate-300 p-2 rounded-sm outline-none bg-slate-100 text-slate-700"
                />
                {selectedEmployee && !selectedEmployee.department && (
                  <p className="mt-1 text-[10px] font-bold text-rose-700">This employee does not have a department assigned.</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Project Target</label>
                <select
                  required
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded-sm outline-none focus:border-blue-700 bg-white"
                >
                  <option value="" disabled>Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.code} - {project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Hours / Week</label>
                <input
                  type="number"
                  min={0}
                  max={maxWeeklyHours}
                  value={newHours}
                  onChange={(e) => setNewHours(Math.min(maxWeeklyHours, Math.max(0, Number(e.target.value))))}
                  className="w-full border border-slate-300 p-2 rounded-sm outline-none focus:border-blue-700 font-mono"
                  required
                />
                <p className="mt-1 text-[10px] text-slate-500">Maximum: {maxWeeklyHours} hours/week (5 days, 8:30 AM - 5:30 PM).</p>
                {newEmployee && Number(newHours) > selectedUserAvailableHours && (
                  <p className="mt-1 text-[10px] font-bold text-rose-700">Only {selectedUserAvailableHours} hours/week are available for this member.</p>
                )}
              </div>

              {allocationError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] p-2 rounded-xs">
                  {allocationError}
                </div>
              )}

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
                  disabled={allocationSaving || !allocationHoursValid || !newDepartment}
                  className="px-4 py-1.5 bg-[#00174b] text-white font-bold rounded-sm uppercase tracking-wider hover:bg-indigo-950 disabled:bg-slate-400"
                >
                  {allocationSaving ? 'Saving…' : 'Save Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
