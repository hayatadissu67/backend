import React, { useState } from 'react';
import { Project, ResourceRecord, UserItem } from '../types';
import { fetchUsersFromApi } from '../services/api';

type AssignmentRequestPayload = {
  projectId: string;
  userId: number;
  pmRequesterName: string;
  projectTarget: string;
  employeeName: string;
  requestedWorkEmail: string;
  department: string;
  projectRoleTitle: string;
  businessJustification: string;
};

interface AssignMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  selectedProject?: Project | null;
  users: UserItem[];
  resourceRecords: ResourceRecord[];
  onAssign: (projectId: string, userIds: string[]) => Promise<void>;
  mode?: 'assign' | 'request';
  requesterName?: string;
  onRequest?: (payload: AssignmentRequestPayload) => Promise<void>;
}

export const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
  isOpen,
  onClose,
  projects,
  selectedProject: passedSelectedProject,
  users,
  resourceRecords,
  onAssign,
  mode = 'assign',
  requesterName = 'Project Manager',
  onRequest
}) => {
  if (!isOpen) return null;

  const approvedProjects = projects.filter((p) => p.approvalStatus === 'APPROVED');
  const selectableProjects = mode === 'request' ? projects : approvedProjects;
  const projectManagers = users.filter((user) => {
    const roleCode = typeof user.role === 'string' ? user.role : user.role?.code || user.role?.name;
    return String(roleCode).trim().replace(/[\s-]+/g, '_').toUpperCase() === 'PROJECT_MANAGER';
  });
  const standardDepartments = [
    'Engineering',
    'Design',
    'Infrastructure',
    'Data Eng',
    'Security',
    'QA & Compliance',
    'Enterprise IT',
  ];
  const departments = Array.from(
    new Set([
      ...standardDepartments,
      ...users.map((user) => user.department).filter(Boolean),
    ])
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    passedSelectedProject?.id || (selectableProjects.length > 0 ? selectableProjects[0].id : '')
  );
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [requesterNameValue, setRequesterNameValue] = useState('');
  const [requestDepartment, setRequestDepartment] = useState('');
  const [submittedToast, setSubmittedToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserItem[]>(users || []);
  const [loadingUsers, setLoadingUsers] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedProjectId(passedSelectedProject?.id || (selectableProjects.length > 0 ? selectableProjects[0].id : ''));
      setSelectedUserId('');
      setRequesterNameValue(projectManagers[0]?.name || '');
      setRequestDepartment('');
    }
  }, [isOpen, passedSelectedProject, projects]);

  React.useEffect(() => {
    if (!isOpen) return;
    setLoadingUsers(true);
    const loadUsers = async () => {
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

  React.useEffect(() => {
    if (!selectedUserId) {
      setRequestDepartment('');
      return;
    }
    const selectedUser =
      availableUsers.find((user) => String(user.id) === selectedUserId) ||
      users.find((user) => String(user.id) === selectedUserId);
    if (selectedUser?.department) {
      setRequestDepartment(selectedUser.department);
    } else {
      setRequestDepartment('');
    }
  }, [selectedUserId, availableUsers, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedUserId) return;

    if (mode === 'request' && !requestDepartment) {
      alert('The selected team member does not have a department assigned.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProject = selectableProjects.find((project) => project.id === selectedProjectId);
      const selectedUser = availableUsers.find((user) => String(user.id) === selectedUserId) || users.find((user) => String(user.id) === selectedUserId);
      if (mode === 'request') {
        if (!onRequest || !selectedProject || !selectedUser) return;
        await onRequest({
          projectId: selectedProject.id,
          userId: Number(selectedUser.id),
          pmRequesterName: requesterNameValue,
          projectTarget: selectedProject.name,
          employeeName: selectedUser.name,
          requestedWorkEmail: selectedUser.email,
          department: requestDepartment,
          projectRoleTitle: typeof selectedUser.role === 'string' ? selectedUser.role : 'Team Member',
          businessJustification: 'Request for project team assignment.',
        });
      } else {
        await onAssign(selectedProjectId, [selectedUserId]);
      }
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
              <h3 className="font-extrabold text-base tracking-tight">{mode === 'request' ? 'Send Assignment Request' : 'Assign Team Member'}</h3>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              {mode === 'request' ? 'Send a request for executive approval.' : 'Assign an existing user to the selected project.'}
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
            <h4 className="font-extrabold text-slate-900 text-lg">{mode === 'request' ? 'Request Sent!' : 'Member Assigned!'}</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              {mode === 'request' ? 'The assignment request was saved for approval.' : 'The team member has been successfully assigned to the project.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div className="space-y-4">
              {mode === 'request' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Requested By PM Name *</label>
                  <select
                    value={requesterNameValue}
                    onChange={(e) => setRequesterNameValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner"
                    required
                  >
                    <option value="" disabled>Select a PM</option>
                    {projectManagers.map((manager) => (
                      <option key={manager.id} value={manager.name}>{manager.name}</option>
                    ))}
                  </select>
                  </div>
              )}
              {mode === 'request' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department *</label>
                  <input
                    type="text"
                    value={requestDepartment}
                    readOnly
                    disabled={!selectedUserId}
                    placeholder="Select a member first"
                    className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-800 font-medium bg-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    required
                  />
                  {selectedUserId && !requestDepartment && (
                    <p className="mt-1 text-[10px] font-bold text-rose-700">The selected team member does not have a department assigned.</p>
                  )}
                </div>
              )}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Project *</label>
                <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner"
              required
            >
              <option value="" disabled>Select a Project</option>
              {selectableProjects.map((p) => (
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
                      const roleCode = typeof u.role === 'string' ? u.role : u.role?.code || u.role?.name;
                      if (String(roleCode).toUpperCase() !== 'TEAM_MEMBER') return false;
                      const allocatedHours = resourceRecords
                        .filter((record) =>
                          record.type === 'ALLOCATION' &&
                          record.status === 'ACTIVE' &&
                          (record.userId != null
                            ? String(record.userId) === String(u.id)
                            : record.employeeName === u.name)
                        )
                        .reduce((total, record) => total + Number(record.hoursPerWeek || 0), 0);
                      return allocatedHours < 40;
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
                {isSubmitting ? (mode === 'request' ? 'Sending...' : 'Assigning...') : (mode === 'request' ? 'Send Request' : 'Assign Member')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
