import React, { useState, useEffect } from 'react';
import { Project, UserItem } from '../types';
import { getProjectTeamApi } from '../services/api';

interface ExecutiveProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
}

export const ExecutiveProjectDetailsModal: React.FC<ExecutiveProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  onApprove,
  onReject
}) => {
  const [teamMembers, setTeamMembers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (isOpen && project) {
      const loadTeam = async () => {
        setLoading(true);
        try {
          const members = await getProjectTeamApi(project.id);
          if (members) setTeamMembers(members);
        } catch (err) {
          console.error("Failed to load project team", err);
        } finally {
          setLoading(false);
        }
      };
      loadTeam();
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-sm max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#00174b] text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">info</span>
              <h3 className="font-extrabold text-base tracking-tight">Executive Project Details</h3>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Review project information and assigned team structure.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white font-bold text-lg leading-none">✕</button>
        </div>

        <div className="flex flex-col overflow-y-auto h-full p-6 space-y-6">
          {/* Rejection Banner */}
          {project.approvalStatus === 'REJECTED' && project.rejectionReason && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xs flex items-start gap-3 shadow-2xs">
              <span className="material-symbols-outlined text-rose-600 text-[24px]">error</span>
              <div>
                <h4 className="text-rose-900 font-extrabold text-sm mb-1">Project Charter Rejected</h4>
                <p className="text-rose-800 text-xs font-medium">{project.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-800 border-b pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">assignment</span>
              Project Information
            </h4>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
                <span className="block text-slate-500 font-bold uppercase text-[10px]">Status</span>
                <span className="text-slate-900 font-bold">{project.status}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
                <span className="block text-slate-500 font-bold uppercase text-[10px]">Approval</span>
                <span className={`font-bold ${project.approvalStatus === 'REJECTED' ? 'text-rose-600' : project.approvalStatus === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {project.approvalStatus || 'PENDING_APPROVAL'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
                <span className="block text-slate-500 font-bold uppercase text-[10px]">Project Name</span>
                <span className="text-slate-900 font-bold text-sm">{project.name}</span>
                <span className="block text-slate-400 font-mono text-[10px]">{project.code}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
                <span className="block text-slate-500 font-bold uppercase text-[10px]">Project Manager</span>
                <span className="text-slate-900 font-bold">{project.owner}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
                <span className="block text-slate-500 font-bold uppercase text-[10px]">Department</span>
                <span className="text-slate-900 font-bold">{project.department}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
                <span className="block text-slate-500 font-bold uppercase text-[10px]">Budget Requested</span>
                <span className="text-emerald-700 font-mono font-bold text-sm">${project.budget?.toLocaleString() || '0'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
                <span className="block text-slate-500 font-bold uppercase text-[10px]">Start Date</span>
                <span className="text-slate-900 font-bold">{project.startDate || 'Not specified'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
                <span className="block text-slate-500 font-bold uppercase text-[10px]">Target Date</span>
                <span className="text-slate-900 font-bold">{project.targetDate}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200 col-span-2">
                <span className="block text-slate-500 font-bold uppercase text-[10px]">Description & Objectives</span>
                <span className="text-slate-800">{project.description || 'No description provided.'}</span>
              </div>
            </div>
          </div>

          {/* Assigned Team */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-800 border-b pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">groups</span>
              Assigned Project Team
            </h4>

            {loading ? (
              <div className="text-center py-4 text-slate-500 text-xs">Loading team members...</div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 border border-slate-200 rounded-xs text-slate-500 text-xs italic">
                No team members assigned yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-3 border border-slate-200 rounded-xs flex items-start gap-3 bg-white shadow-2xs">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{member.name}</div>
                      <div className="text-[10px] text-slate-500 mb-1">{member.role.replace(/_/g, ' ')} • {member.department}</div>
                      {member.responsibility ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-xs">
                          <span className="material-symbols-outlined text-[12px] text-amber-700">badge</span>
                          <span className="text-[10px] font-bold text-amber-900">{member.responsibility}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No specific responsibility assigned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isRejecting ? (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3 shrink-0">
            <h4 className="text-slate-800 font-bold text-sm">Reason for Rejection</h4>
            <textarea
              className="w-full border border-slate-300 p-2 rounded-xs text-sm"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this project..."
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsRejecting(false)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xs transition-colors text-xs uppercase tracking-wider">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onReject) onReject(project.id, rejectionReason);
                  onClose();
                }}
                disabled={!rejectionReason.trim()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xs transition-colors text-xs uppercase tracking-wider"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between shrink-0 items-center">
            <button onClick={onClose} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xs transition-colors text-xs uppercase tracking-wider">
              Close
            </button>

            {((project.approvalStatus || '').toUpperCase().trim() !== 'APPROVED' && (project.approvalStatus || '').toUpperCase().trim() !== 'REJECTED' && (project.approvalStatus || '').toUpperCase().trim() !== 'ARCHIVED') && onApprove && onReject && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRejecting(true)}
                  className="px-5 py-2 border border-rose-600 text-rose-600 hover:bg-rose-50 font-bold rounded-xs transition-colors text-xs uppercase tracking-wider"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    onApprove(project.id);
                    onClose();
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xs transition-colors text-xs uppercase tracking-wider shadow-2xs"
                >
                  Approve Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
