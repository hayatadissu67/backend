import React, { useState, useEffect } from 'react';
import { Project, UserItem } from '../types';
import { fetchUsersFromApi, assignProjectTeamApi, getProjectTeamApi } from '../services/api';

interface AssignTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess?: () => void;
}

export const AssignTeamModal: React.FC<AssignTeamModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess
}) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string | number>>(new Set());
  const [responsibilities, setResponsibilities] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && project) {
      // Fetch all users and currently assigned team members
      const loadData = async () => {
        setLoading(true);
        try {
          const [allUsers, teamMembers] = await Promise.all([
            fetchUsersFromApi(),
            getProjectTeamApi(project.id)
          ]);
          if (allUsers) setUsers(allUsers);
          if (teamMembers) {
            const initialIds = new Set(teamMembers.map(u => u.id));
            setSelectedUserIds(initialIds);
            
            const initialResp: Record<string, string> = {};
            teamMembers.forEach(u => {
              if (u.responsibility) {
                initialResp[u.id] = u.responsibility;
              }
            });
            setResponsibilities(initialResp);
          }
        } catch (err) {
          console.error("Failed to load users", err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [isOpen, project]);

  const toggleUserSelection = (id: string | number) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedUserIds(newSelection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    setLoading(true);
    setError('');
    try {
      const assignments = Array.from(selectedUserIds).map(id => ({
        userId: id,
        responsibility: responsibilities[id] || ''
      }));
      await assignProjectTeamApi(project.id, assignments);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign team members.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-sm max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#00174b] text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">group_add</span>
              <h3 className="font-extrabold text-base tracking-tight">Assign Team Members</h3>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Assign existing users to {project.name}.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white font-bold text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden h-full">
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {error && <div className="text-red-600 bg-red-50 p-2 rounded text-xs font-bold">{error}</div>}
            
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-sm">Loading users...</div>
            ) : (
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex flex-col gap-2 p-3 border border-slate-200 rounded-sm hover:bg-slate-50 cursor-pointer" onClick={() => toggleUserSelection(user.id)}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => {}} // handled by parent div click
                        className="w-4 h-4 text-[#00174b] bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.role.replace(/_/g, ' ')} • {user.department}</div>
                      </div>
                    </div>
                    {selectedUserIds.has(user.id) && (
                      <div className="ml-7" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          placeholder="Project Responsibility (e.g. Frontend Developer)"
                          value={responsibilities[user.id] || ''}
                          onChange={(e) => setResponsibilities({ ...responsibilities, [user.id]: e.target.value })}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded-xs outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xs transition-colors text-xs">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-bold rounded-xs uppercase tracking-wider text-xs shadow-2xs disabled:bg-slate-400">
              {loading ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
