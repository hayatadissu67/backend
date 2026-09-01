import React, { useState } from 'react';
import { UserItem, UserRoleType, LoggedInPersona } from '../../types';
import { createUserApi, deleteUserApi, updateUserStatusApi, updateUserApi } from '../../services/api';

interface UsersViewProps {
  users: UserItem[];
  onAddUser: (user: UserItem) => void;
  onDeleteUser?: (userId: string | number) => void;
  onToggleUserStatus?: (userId: string | number, newStatus: UserItem['status']) => void;
  onUpdateUser?: (updatedUser: UserItem) => void;
  onSelectUser?: (user: UserItem) => void;
  initialSubTab?: 'list' | 'add';
  currentPersona?: LoggedInPersona | null;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onAddUser,
  onDeleteUser,
  onToggleUserStatus,
  onUpdateUser,
  onSelectUser,
  initialSubTab = 'list',
  currentPersona,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'add'>(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive' | 'Pending'>('ALL');

  // Executive Admin State
  const isExecutive = currentPersona?.roleType === 'EXECUTIVE_MANAGER';
  const isPM = currentPersona?.roleType === 'PROJECT_MANAGER';
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(isExecutive);
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add User
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRoleType>(isPM ? 'TEAM_MEMBER' : 'PROJECT_MANAGER');
  const [department, setDepartment] = useState('Engineering');
  const [assignedProject, setAssignedProject] = useState('Project Delta');
  const [status, setStatus] = useState<'Active' | 'Pending'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Generated Temporary Password Modal State
  const [createdPasswordInfo, setCreatedPasswordInfo] = useState<{
    user: UserItem;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      // Call Real Backend API to create user with temporary password
      const res = await createUserApi({
        name,
        email,
        role,
        department,
        status,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
        assignedProjectCodes: assignedProject ? [assignedProject] : [],
        projectsAssigned: assignedProject ? 1 : 0,
      });

      if (res && res.success && res.data) {
        onAddUser(res.data);
        if (res.temporaryPassword) {
          setCreatedPasswordInfo({
            user: res.data,
            tempPassword: res.temporaryPassword,
          });
        }
        setName('');
        setEmail('');
        showToast(`✓ Account for ${res.data.name} created successfully.`);
        setActiveSubTab('list');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle single activate/deactivate
  const handleToggleStatus = async (user: UserItem, newStatus: UserItem['status']) => {
    try {
      await updateUserStatusApi(user.id, newStatus);
      if (onToggleUserStatus) {
        onToggleUserStatus(user.id, newStatus);
      } else if (onUpdateUser) {
        onUpdateUser({ ...user, status: newStatus });
      }
      showToast(`User ${user.name} access status updated to ${newStatus.toUpperCase()}`);
    } catch (e: any) {
      showToast(`Failed to update status: ${e.message}`);
    }
  };

  // Handle single delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserApi(userToDelete.id);
      if (onDeleteUser) {
        onDeleteUser(userToDelete.id);
      }
      showToast(`✓ User account for ${userToDelete.name} deleted.`);
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userToDelete.id));
      setUserToDelete(null);
    } catch (e: any) {
      showToast(`Delete failed: ${e.message}`);
      setUserToDelete(null);
    }
  };

  // Handle Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectUser = (id: string | number) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((item) => item !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  // Handle Bulk Actions
  const handleBulkActivate = async () => {
    for (const id of selectedUserIds) {
      await updateUserStatusApi(id, 'Active');
      if (onToggleUserStatus) onToggleUserStatus(id, 'Active');
    }
    showToast(`✓ Activated ${selectedUserIds.length} selected user account(s).`);
    setSelectedUserIds([]);
  };

  const handleBulkDeactivate = async () => {
    for (const id of selectedUserIds) {
      await updateUserStatusApi(id, 'Inactive');
      if (onToggleUserStatus) onToggleUserStatus(id, 'Inactive');
    }
    showToast(`✓ Deactivated ${selectedUserIds.length} selected user account(s).`);
    setSelectedUserIds([]);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedUserIds) {
      try {
        await deleteUserApi(id);
        if (onDeleteUser) onDeleteUser(id);
      } catch (err) {}
    }
    showToast(`✓ Permanently deleted ${selectedUserIds.length} selected user account(s).`);
    setSelectedUserIds([]);
  };

  // Metrics
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === 'Active').length;
  const inactiveCount = users.filter((u) => u.status === 'Inactive').length;
  const pendingCount = users.filter((u) => u.status === 'Pending').length;

  const handleCopyPassword = () => {
    if (createdPasswordInfo) {
      navigator.clipboard.writeText(createdPasswordInfo.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#00174b] text-white px-4 py-3 rounded-sm shadow-xl font-bold text-xs flex items-center gap-2 border border-blue-400/40 animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-amber-400">admin_panel_settings</span>
          {toastMessage}
        </div>
      )}

      {/* NEW TEMPORARY PASSWORD SECURE REVEAL MODAL */}
      {createdPasswordInfo && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-emerald-700 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <span className="material-symbols-outlined text-2xl">key</span>
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Temporary Password Generated</h3>
                <p className="text-slate-500 text-[11px]">Backend Temporary Provisioning</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Account for <strong className="text-slate-900">{createdPasswordInfo.user.name}</strong> (
              <span className="text-slate-600 font-mono">{createdPasswordInfo.user.email}</span>) was created as{' '}
              <strong>{createdPasswordInfo.user.role.replace(/_/g, ' ')}</strong>.
            </p>

            <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Assigned Default Temporary Password:
              </span>
              <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 border rounded-md font-mono text-sm font-bold text-slate-900">
                <span>{createdPasswordInfo.tempPassword}</span>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-sans text-xs flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[11px] p-2.5 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-700 text-sm mt-0.5">info</span>
              <span>
                Share this password securely with the user. Upon first login, they will be required to establish a permanent password.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCreatedPasswordInfo(null)}
                className="px-4 py-2 bg-[#00174b] text-white font-bold rounded-lg hover:bg-indigo-950 uppercase text-xs tracking-wider"
              >
                Done &amp; Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Subtab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>ADMINISTRATION</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b]">EXECUTIVE USER CONTROL TOWER</span>
          </nav>
          <h2 className="text-[26px] font-bold tracking-tight text-[#191c1e]">
            PMO User Directory &amp; Access Controls
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isExecutive
              ? 'Executive Admin console to provision Project Managers, Risk Managers, and Team Members.'
              : 'Project Manager console to provision and assign Team Members to projects.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Executive Admin Toggle */}
          {isExecutive && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-sm">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">verified_user</span>
              <span className="text-[11px] font-bold text-amber-900">Executive Admin:</span>
              <button
                onClick={() => setIsExecutiveAdmin(!isExecutiveAdmin)}
                className={`px-2 py-0.5 rounded-xs font-bold text-[10px] uppercase transition-colors ${
                  isExecutiveAdmin ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isExecutiveAdmin ? 'ACTIVE' : 'READ ONLY'}
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-sm text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('list')}
              className={`px-4 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'list'
                  ? 'bg-[#00174b] text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
              Directory ({users.length})
            </button>
            <button
              onClick={() => setActiveSubTab('add')}
              className={`px-4 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'add'
                  ? 'bg-[#00174b] text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              {isPM ? 'Add Team Member' : 'Add User'}
            </button>
          </div>
        </div>
      </div>

      {/* VIEW ALL SUBTAB */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          {/* User Account KPI Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div
              onClick={() => setStatusFilter('ALL')}
              className={`bg-white border p-3 rounded-sm shadow-2xs cursor-pointer transition-all ${
                statusFilter === 'ALL' ? 'border-[#00174b] ring-1 ring-[#00174b]' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Managed Accounts</span>
              <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">{totalCount}</p>
            </div>

            <div
              onClick={() => setStatusFilter('Active')}
              className={`bg-white border p-3 rounded-sm shadow-2xs cursor-pointer transition-all ${
                statusFilter === 'Active' ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Active Accounts</span>
              <p className="text-xl font-extrabold text-emerald-600 font-mono mt-1">{activeCount}</p>
            </div>

            <div
              onClick={() => setStatusFilter('Inactive')}
              className={`bg-white border p-3 rounded-sm shadow-2xs cursor-pointer transition-all ${
                statusFilter === 'Inactive' ? 'border-red-600 ring-1 ring-red-600' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Deactivated Accounts</span>
              <p className="text-xl font-extrabold text-red-600 font-mono mt-1">{inactiveCount}</p>
            </div>

            <div
              onClick={() => setStatusFilter('Pending')}
              className={`bg-white border p-3 rounded-sm shadow-2xs cursor-pointer transition-all ${
                statusFilter === 'Pending' ? 'border-amber-600 ring-1 ring-amber-600' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Pending Invitations</span>
              <p className="text-xl font-extrabold text-amber-600 font-mono mt-1">{pendingCount}</p>
            </div>
          </div>

          {/* Controls Bar & Bulk Action Bar */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-slate-200/80 rounded-sm">
              <div className="relative flex-1 min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search user name, email or department..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-sm px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active Only</option>
                    <option value="Inactive">Inactive Only</option>
                    <option value="Pending">Pending Only</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-sm px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="TEAM_MEMBER">Team Member</option>
                    <option value="RISK_MANAGER">Risk Manager</option>
                    <option value="EXECUTIVE_MANAGER">Executive Manager</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk Action Toolbar when checkboxes selected */}
            {selectedUserIds.length > 0 && isExecutiveAdmin && (
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-sm flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <span className="material-symbols-outlined text-[18px] text-amber-700">checklist</span>
                  <span>{selectedUserIds.length} User(s) Selected</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleBulkActivate}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-xs uppercase tracking-wider flex items-center gap-1 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Activate Selected
                  </button>

                  <button
                    onClick={handleBulkDeactivate}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] rounded-xs uppercase tracking-wider flex items-center gap-1 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">block</span>
                    Deactivate Selected
                  </button>

                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-[11px] rounded-xs uppercase tracking-wider flex items-center gap-1 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete_forever</span>
                    Delete Selected
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200/80 rounded-sm overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  {isExecutiveAdmin && (
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                        onChange={handleSelectAll}
                        className="rounded-xs cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="p-3">User / Identity</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Project Assignments</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-amber-50/40' : u.status === 'Inactive' ? 'bg-slate-50/60' : ''
                      }`}
                    >
                      {isExecutiveAdmin && (
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectUser(u.id)}
                            className="rounded-xs cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="p-3">
                        <div
                          onClick={() => onSelectUser && onSelectUser(u)}
                          className="flex items-center gap-3 cursor-pointer group"
                          title="Click to view full user profile details"
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className={`w-8 h-8 rounded-full object-cover border group-hover:scale-105 transition-transform ${
                              u.status === 'Active' ? 'border-emerald-300' : 'border-slate-300 opacity-60'
                            }`}
                          />
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-900 transition-colors flex items-center gap-1.5">
                              {u.name}
                              {u.role === 'EXECUTIVE_MANAGER' && (
                                <span className="text-[9px] bg-purple-100 text-purple-900 font-mono px-1.5 rounded-xs font-bold">
                                  DIRECTOR
                                </span>
                              )}
                              {u.mustChangePassword && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 font-mono px-1.5 rounded-xs font-bold" title="User has temporary password">
                                  TEMP PW
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {u.role === 'PROJECT_MANAGER' ? 'Project Manager' :
                         u.role === 'TEAM_MEMBER' ? 'Team Member' :
                         u.role === 'RISK_MANAGER' ? 'Risk Manager' :
                         u.role === 'EXECUTIVE_MANAGER' ? 'Executive Manager' : u.role}
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{u.department}</td>
                      <td className="p-3">
                        {u.assignedProjectCodes && u.assignedProjectCodes.length > 0 ? (
                          <div className="flex flex-wrap gap-1 items-center">
                            {u.assignedProjectCodes.map((proj, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-950 px-2 py-0.5 rounded-xs font-mono font-bold text-[11px] shadow-2xs"
                              >
                                <span className="material-symbols-outlined text-[13px] text-indigo-700">folder</span>
                                {proj}
                              </span>
                            ))}
                          </div>
                        ) : u.projectsAssigned > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-900 px-2 py-0.5 rounded-xs font-mono font-bold text-[11px]">
                            <span className="material-symbols-outlined text-[13px] text-blue-700">folder_open</span>
                            {u.projectsAssigned} Assigned
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
                            u.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : u.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'Active'
                                ? 'bg-emerald-600'
                                : u.status === 'Pending'
                                ? 'bg-amber-600'
                                : 'bg-red-600'
                            }`}
                          ></span>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* ACTIVATE / DEACTIVATE BUTTON */}
                          {u.status === 'Active' ? (
                            <button
                              onClick={() => handleToggleStatus(u, 'Inactive')}
                              className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xs transition-colors"
                              title="Deactivate User Access"
                            >
                              <span className="material-symbols-outlined text-[16px]">block</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(u, 'Active')}
                              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xs transition-colors"
                              title="Activate User Access"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            </button>
                          )}

                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xs transition-colors"
                            title="Edit User Details"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>

                          {/* DELETE BUTTON (Executive only) */}
                          {isExecutiveAdmin && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-xs"
                              title="Delete User Account"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      No user accounts found matching your search and status criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD NEW USER SUBTAB */}
      {activeSubTab === 'add' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm max-w-2xl space-y-4 text-xs shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              {isPM ? 'Provision New Team Member' : 'Register New PMO User Account'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isPM
                ? 'Create a team member account. A secure temporary password will be generated automatically.'
                : 'Executive provisioning: Create Project Managers, Risk Managers, or Team Members.'}
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-sm font-bold text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmitUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. elena@pmo-control.corp"
                  className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Role *
                </label>
                {isPM ? (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-sm font-bold text-slate-800">
                    Team Member (Engineer / Specialist)
                  </div>
                ) : (
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRoleType)}
                    className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="PROJECT_MANAGER">Project Manager (PM)</option>
                    <option value="RISK_MANAGER">Risk Manager (Governance)</option>
                    <option value="TEAM_MEMBER">Team Member (Engineer)</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Enterprise IT">Enterprise IT</option>
                  <option value="Data Eng">Data Eng</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Product Mgmt">Product Mgmt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Project
                </label>
                <select
                  value={assignedProject}
                  onChange={(e) => setAssignedProject(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
                >
                  <option value="Project Delta">Project Delta (PRJ-DELTA)</option>
                  <option value="Alpha Module">Alpha Module (PRJ-ALPHA)</option>
                  <option value="Project Sigma">Project Sigma (PRJ-SIGMA)</option>
                  <option value="Data Migration Pipeline">Data Migration Pipeline (PRJ-MIGR8)</option>
                  <option value="ERP System Upgrade">ERP System Upgrade (PRJ-ERP)</option>
                  <option value="Cloud Compliance Automation">Cloud Compliance Automation (PRJ-COMP)</option>
                  <option value="AI Analytics Platform">AI Analytics Platform (PRJ-AI)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Access Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Pending')}
                  className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
                >
                  <option value="Active">Active Immediate Clearance</option>
                  <option value="Pending">Pending Invitation Acceptance</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-sm text-blue-900 text-[11px] flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700 text-sm">lock</span>
              <span>
                A secure default temporary password will be generated automatically by the backend upon account creation.
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('list')}
                className="px-4 py-2 border border-slate-300 rounded-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#00174b] text-white font-bold rounded-sm uppercase tracking-wider hover:bg-indigo-950 disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Provisioning Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full p-6 rounded-sm border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-700">
              <span className="material-symbols-outlined text-[32px]">warning</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete User Account</h3>
                <p className="text-slate-500 text-[11px]">Executive Admin Confirmation</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to permanently delete the user account for{' '}
              <strong className="text-slate-900">{userToDelete.name}</strong> ({userToDelete.email})?
              This action will revoke all project permissions and cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-700 text-white font-bold rounded-xs hover:bg-red-800 uppercase tracking-wider"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full p-6 rounded-sm border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit User Profile: {editingUser.name}</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const updated = await updateUserApi(editingUser.id, editingUser);
                  if (updated && onUpdateUser) onUpdateUser(updated);
                  showToast(`✓ User account details saved for ${editingUser.name}`);
                  setEditingUser(null);
                } catch (err: any) {
                  showToast(`Update error: ${err.message}`);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full border p-2 rounded-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full border p-2 rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRoleType })}
                    className="w-full border p-2 rounded-sm font-medium"
                    disabled={!isExecutive}
                  >
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="TEAM_MEMBER">Team Member</option>
                    <option value="RISK_MANAGER">Risk Manager</option>
                    <option value="EXECUTIVE_MANAGER">Executive Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Department</label>
                  <input
                    type="text"
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full border p-2 rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                  className="w-full border p-2 rounded-sm font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border rounded-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00174b] text-white font-bold rounded-xs hover:bg-indigo-950 uppercase"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
