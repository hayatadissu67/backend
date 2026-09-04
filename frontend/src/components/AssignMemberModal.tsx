import React, { useState } from 'react';
import { Project, UserItem } from '../types';
import { fetchUsersFromApi } from '../services/api';

interface AssignMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  selectedProject?: Project | null;
  users: UserItem[];
  onAssign: (projectId: string, userIds: string[]) => Promise<void>;
}

export const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
  isOpen,
  onClose,
  projects,
  selectedProject: passedSelectedProject,
  users,
  onAssign
}) => {
  if (!isOpen) return null;

  const approvedProjects = projects.filter((p) => p.approvalStatus === 'APPROVED');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    passedSelectedProject?.id || (approvedProjects.length > 0 ? approvedProjects[0].id : '')
  );
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [submittedToast, setSubmittedToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserItem[]>(users || []);
  const [loadingUsers, setLoadingUsers] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedProjectId(passedSelectedProject?.id || (approvedProjects.length > 0 ? approvedProjects[0].id : ''));
      setSelectedUserId('');
    }
  }, [isOpen, passedSelectedProject, projects]);

  // Load latest users from backend when modal opens so dropdown reflects executive-created users
  React.useEffect(() => {
    const loadUsers = async () => {
      if (!isOpen) return;
      setLoadingUsers(true);
      try {
        const fetched = await fetchUsersFromApi();
        if (Array.isArray(fetched)) {
          setAvailableUsers(fetched as UserItem[]);
        }
      } catch (err) {
        // keep existing `users` prop as fallback
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedUserId) return;

    setIsSubmitting(true);
    try {
      await onAssign(selectedProjectId, [selectedUserId]);
      setSubmittedToast(true);
      setTimeout(() => {
        setSubmittedToast(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to assign member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-sm max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#00174b] text-white p-5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">person_add</span>
              <h3 className="font-extrabold text-base tracking-tight">Assign Team Member</h3>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Assign an existing user to the selected project.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white font-bold text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {submittedToast ? (
          <div className="p-8 text-center space-y-3 animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600 text-[48px]">check_circle</span>
            <h4 className="font-extrabold text-slate-900 text-lg">Member Assigned!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              The team member has been successfully assigned to the project.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Project *</label>
                <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner"
              required
            >
              <option value="" disabled>Select a Project</option>
              {approvedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Team Member *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-bold text-slate-800 outline-none focus:border-indigo-900"
                  required
                >
                  <option value="" disabled>Select a member</option>
                  {(!loadingUsers ? (availableUsers.length ? availableUsers : users) : [])
                    .filter(u => {
                      if (!u) return false;
                      if (typeof u.role === 'string') return u.role === 'TEAM_MEMBER';
                      return u.role && (u.role.code === 'TEAM_MEMBER' || u.role.name === 'TEAM_MEMBER');
                    })
                    .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                  {loadingUsers && (
                    <option value="" disabled>Loading members...</option>
                  )}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xs transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-bold rounded-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                {isSubmitting ? 'Assigning...' : 'Assign Member'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
