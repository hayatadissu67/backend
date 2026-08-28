import React, { useState } from 'react';
import { Project, ApprovalRequest } from '../types';

interface AssignMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onRequestAssignment: (request: Partial<ApprovalRequest>) => void;
}

export const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
  isOpen,
  onClose,
  projects,
  onRequestAssignment
}) => {
  if (!isOpen) return null;

  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Senior Software Engineer');
  const [memberDepartment, setMemberDepartment] = useState('Engineering');
  const [selectedProject, setSelectedProject] = useState(projects[0]?.name || 'Project Delta');
  const [requestedBy, setRequestedBy] = useState('Sarah Jenkins (Project Manager)');
  const [justification, setJustification] = useState('');
  const [submittedToast, setSubmittedToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    const newRequest: Partial<ApprovalRequest> = {
      id: `app-member-${Date.now()}`,
      project: selectedProject,
      requestType: 'New Team Member Assignment & Access Provisioning',
      requestedBy: requestedBy.trim() || 'Project Manager',
      memberName: memberName.trim(),
      memberEmail: memberEmail.trim(),
      memberRole: memberRole.trim(),
      memberDepartment,
      justification: justification.trim() || 'Resource requested for sprint capacity and delivery milestones.',
      amount: 'Access Credentials Required',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    onRequestAssignment(newRequest);
    setSubmittedToast(true);

    setTimeout(() => {
      setSubmittedToast(false);
      onClose();
      // Reset
      setMemberName('');
      setMemberEmail('');
      setJustification('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-sm max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#00174b] text-white p-5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">person_add</span>
              <h3 className="font-extrabold text-base tracking-tight">Request Member Assignment</h3>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Submit new team member access request for Executive Steering Committee approval &amp; login credential issuance.
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
            <h4 className="font-extrabold text-slate-900 text-lg">Assignment Request Submitted!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your member onboarding request for <strong className="text-indigo-950">{memberName}</strong> has been sent to Executive Steering Committee approvals. Upon review, the Executive will approve and generate official login credentials.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* PM Requester & Project */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">PM Requester Name *</label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-semibold text-slate-800 outline-none focus:border-indigo-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Project *</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-bold text-slate-800 outline-none focus:border-indigo-900"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Member Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Member Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Vance"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-bold text-slate-900 outline-none focus:border-indigo-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Requested Work Email *</label>
                <input
                  type="email"
                  placeholder="e.g. marcus.vance@enterprise-pmo.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-mono font-semibold text-slate-900 outline-none focus:border-indigo-900"
                  required
                />
              </div>
            </div>

            {/* Department & Role */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <select
                  value={memberDepartment}
                  onChange={(e) => setMemberDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-semibold text-slate-800 outline-none focus:border-indigo-900"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Data Eng">Data Engineering</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Product Mgmt">Product Management</option>
                  <option value="Design">UX &amp; Design</option>
                  <option value="Enterprise IT">Enterprise IT</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Backend Specialist"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-semibold text-slate-800 outline-none focus:border-indigo-900"
                />
              </div>
            </div>

            {/* Business Justification */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Business Justification / Milestone Need</label>
              <textarea
                rows={2}
                placeholder="Explain why this team member is needed and what project deliverables they will own..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs text-slate-800 outline-none focus:border-indigo-900 font-medium"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xs flex items-start gap-2 text-[11px] text-amber-900">
              <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">info</span>
              <div>
                <strong>Executive Workflow Notice:</strong> Upon submission, Executive Steering Committee will review this assignment request. Once approved, the Executive will provision and issue official login credentials (email &amp; temporary password).
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-bold rounded-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                Submit for Approval
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
