import React, { useState } from 'react';
import { UserItem, Project } from '../types';

interface UserProfileModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser?: (updatedUser: UserItem) => void;
  allProjects?: Project[];
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  allProjects = []
}) => {
  if (!isOpen || !user) return null;

  const [activeTab, setActiveTab] = useState<'Overview' | 'Projects' | 'Permissions' | 'Activity' | 'Edit'>('Overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    title: user.title || user.role,
    department: user.department,
    role: user.role,
    phone: user.phone || '+1 (555) 019-2834',
    location: user.location || 'New York Headquarters',
    clearanceLevel: user.clearanceLevel || 'Top Secret / Zero-Trust Tier 1',
    budgetCap: user.budgetCap || '$10,000,000+',
    bio: user.bio || 'Senior Executive leader overseeing enterprise modernization, capital allocation, and strategic Stage-Gate governance across high-impact PMO initiatives.'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserItem = {
      ...user,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      title: formData.title,
      phone: formData.phone,
      location: formData.location,
      clearanceLevel: formData.clearanceLevel,
      budgetCap: formData.budgetCap,
      bio: formData.bio
    };

    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    showToast('✓ Profile details updated successfully!');
    setActiveTab('Overview');
  };

  // Find assigned projects
  const assignedProjectsList = allProjects.filter(p => 
    p.owner.toLowerCase().includes(user.name.toLowerCase().split(' ')[0]) ||
    user.assignedProjectCodes?.includes(p.code) ||
    p.owner.toLowerCase().includes('sarah') ||
    p.department === user.department
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#00174b] text-white px-4 py-3 rounded-xs shadow-xl font-bold text-xs flex items-center gap-2 border border-amber-400">
          <span className="material-symbols-outlined text-[18px] text-amber-400">check_circle</span>
          {toastMessage}
        </div>
      )}

      <div className="bg-white border border-slate-300 rounded-sm max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Profile Banner */}
        <div className="bg-gradient-to-r from-[#00174b] via-indigo-950 to-slate-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={user.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9Qk18On07Qppv6HGSnKpjcxgKfGaZRpbTEDuciSU_CoSL2Ccc8IjVifNACvvJi2Pin8mMMFTkDnKdzFxYjbInymgs8Cw5v3Z56W1p8mBSM9CWQBTJ_r6nUE1oigZ1k9qUNsbO99QyX1bKzL59shHBo0RtUDmv9ISyYCn3pUwPIET5BmxGHmPbfQ2kQl2D-Z69AO8TCSWdRibYzdAnOg-8YobmkQLafY2lXOq5YTpNkdecONE0SK4mA_BHf-J9vFZO9S2_l8E2WXs'}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-md bg-slate-200"
              />
              <span
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                  user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={user.status}
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-white">{formData.name}</h2>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/50 font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                  {user.status || 'Active'}
                </span>
                <span className="bg-white/10 text-slate-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs">
                  ID: {user.id || 'EMP-98201'}
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-semibold">{formData.title || user.role}</p>
              <div className="flex flex-wrap gap-4 text-[11px] text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-400">corporate_fare</span>
                  {formData.department}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-400">mail</span>
                  {formData.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex flex-wrap gap-1 shrink-0 text-xs font-bold">
          {[
            { id: 'Overview', label: 'Overview & Contact', icon: 'person' },
            { id: 'Projects', label: `Assigned Projects (${assignedProjectsList.length})`, icon: 'folder_open' },
            { id: 'Permissions', label: 'Governance & Clearances', icon: 'admin_panel_settings' },
            { id: 'Activity', label: 'Recent Activity', icon: 'history' },
            { id: 'Edit', label: 'Edit Details', icon: 'edit' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#00174b] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Executive Bio */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs space-y-1">
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-500">
                  Executive Brief / Bio
                </h4>
                <p className="text-slate-700 leading-relaxed font-medium">{formData.bio}</p>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200 p-3 rounded-xs space-y-2">
                  <p className="font-bold text-slate-500 uppercase text-[10px] border-b border-slate-100 pb-1">
                    Contact &amp; Location
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Phone:</span>
                    <strong className="text-slate-900 font-mono">{formData.phone}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Location:</span>
                    <strong className="text-slate-900">{formData.location}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Member Since:</span>
                    <strong className="text-slate-900 font-mono">{user.joinDate || 'October 2024'}</strong>
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-3 rounded-xs space-y-2">
                  <p className="font-bold text-slate-500 uppercase text-[10px] border-b border-slate-100 pb-1">
                    Authority &amp; Limits
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Role Tier:</span>
                    <strong className="text-indigo-950 font-bold">{formData.role}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Capital Limit:</span>
                    <strong className="text-emerald-700 font-mono font-bold">{formData.budgetCap}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Clearance:</span>
                    <strong className="text-amber-900 font-bold">{formData.clearanceLevel}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED PROJECTS */}
          {activeTab === 'Projects' && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-slate-500 text-[11px]">
                Showing projects owned, sponsored, or assigned under {formData.name}'s governance scope.
              </p>

              <div className="space-y-2">
                {assignedProjectsList.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xs flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-xs">
                          {p.code}
                        </span>
                        <h4 className="font-bold text-slate-900">{p.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Dept: {p.department} | Owner: {p.owner} | Stage: {p.lifecycleStage || p.gate}
                      </p>
                    </div>

                    <div className="text-right font-mono text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded-xs font-bold uppercase text-[10px] ${
                          p.health === 'GREEN'
                            ? 'bg-emerald-100 text-emerald-900'
                            : p.health === 'YELLOW'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-900'
                        }`}
                      >
                        {p.health}
                      </span>
                      <p className="text-slate-600 mt-1">{p.progress}% Complete</p>
                    </div>
                  </div>
                ))}

                {assignedProjectsList.length === 0 && (
                  <div className="p-8 text-center text-slate-400 font-bold border border-dashed border-slate-200 rounded-xs">
                    No active projects assigned to this profile.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GOVERNANCE & CLEARANCES */}
          {activeTab === 'Permissions' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">verified_user</span>
                  Executive Governance &amp; Stage-Gate Sign-off Privileges
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                    <div>
                      <strong className="block text-slate-900">Gate 1 Charter Release</strong>
                      <span className="text-slate-500">Authorized to sign strategic charter</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                    <div>
                      <strong className="block text-slate-900">Gate 2 Architecture Exception</strong>
                      <span className="text-slate-500">Authorized technical waiver sign-off</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                    <div>
                      <strong className="block text-slate-900">Gate 3 Execution Baseline</strong>
                      <span className="text-slate-500">Capital variance &amp; budget unlock</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                    <div>
                      <strong className="block text-slate-900">Gate 4 &amp; 5 Governance Closure</strong>
                      <span className="text-slate-500">Final operational handover clearance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVITY HISTORY */}
          {activeTab === 'Activity' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="border-l-2 border-indigo-900 pl-4 space-y-4">
                {[
                  { action: 'Approved Executive Template Request REQ-1002 (Budget Variance)', time: '2 hours ago' },
                  { action: 'Signed Gate 3 Execution Waiver for PRJ-SIGMA', time: 'Yesterday' },
                  { action: 'Reallocated $150k budget contingency to Data Migration Pipeline', time: '3 days ago' },
                  { action: 'Updated Zero-Trust Security Clearance credentials for Q3', time: '1 week ago' }
                ].map((act, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="font-bold text-slate-800">{act.action}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{act.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EDIT PROFILE */}
          {activeTab === 'Edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-3 animate-fadeIn">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Title / Position</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-mono font-semibold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Executive Summary / Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs text-slate-800 font-medium outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('Overview')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00174b] hover:bg-indigo-950 text-white font-bold rounded-xs uppercase tracking-wider shadow-2xs"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span className="font-mono text-[10px]">Security Clearance: Verified Active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00174b] text-white font-bold rounded-xs hover:bg-indigo-950 transition-colors uppercase tracking-wider"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
