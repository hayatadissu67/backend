import React, { useState } from 'react';
import { ApprovalRequest, NavigationTab, Project } from '../../types';
import { ExecutiveProjectDetailsModal } from '../ExecutiveProjectDetailsModal';

interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  onAction: (id: string, status: 'Approved' | 'Rejected') => void;
  onApproveMemberAssignment?: (id: string, loginEmail: string, generatedPassword: string) => void;
  onNavigate?: (tab: NavigationTab) => void;
  onOpenAssignModal?: () => void;
  projects?: Project[];
  onApproveProject?: (id: string) => void;
  onRejectProject?: (id: string, reason: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  onAction,
  onApproveMemberAssignment,
  onNavigate,
  onOpenAssignModal,
  projects = [],
  onApproveProject,
  onRejectProject
}) => {
  const [rejectingProjectId, setRejectingProjectId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  
  // Project Details Modal State
  const [detailsProject, setDetailsProject] = useState<Project | null>(null);

  // Provision Modal State for Executive
  const [provisioningRequest, setProvisioningRequest] = useState<ApprovalRequest | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let pass = 'Exec';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '!';
    setGeneratedPassword(pass);
  };

  const handleOpenProvisionModal = (app: ApprovalRequest) => {
    setProvisioningRequest(app);
    setLoginEmail(app.memberEmail || `${(app.memberName || 'user').toLowerCase().replace(/\s+/g, '.')}@enterprise-pmo.com`);
    
    // Generate initial strong password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Pass#';
    for (let i = 0; i < 5; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '!';
    setGeneratedPassword(pass);
  };

  const handleConfirmProvisioning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisioningRequest) return;

    if (onApproveMemberAssignment) {
      onApproveMemberAssignment(provisioningRequest.id, loginEmail.trim(), generatedPassword.trim());
    } else {
      onAction(provisioningRequest.id, 'Approved');
    }

    setToastMsg(`✓ Access Approved! Login credentials issued to ${loginEmail}`);
    setTimeout(() => setToastMsg(null), 4000);
    setProvisioningRequest(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#00174b] text-white px-5 py-3 rounded-xs shadow-2xl font-bold text-xs flex items-center gap-2 border border-amber-400 animate-fadeIn">
          <span className="material-symbols-outlined text-[20px] text-amber-400">key</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 border border-slate-200 rounded-sm shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00174b] text-[24px]">verified</span>
            <h2 className="text-[22px] font-extrabold text-[#191c1e] tracking-tight">Executive Governance &amp; Access Approvals</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review PM team member assignment requests, issue official login credentials (email &amp; password), and approve budget &amp; gate clearances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenAssignModal && (
            <button
              onClick={onOpenAssignModal}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xs flex items-center gap-1.5 shadow-2xs transition-colors uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>PM Member Request</span>
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('templates')}
              className="px-3.5 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs rounded-xs flex items-center gap-1.5 shadow-2xs transition-colors uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span>Action Templates</span>
            </button>
          )}
        </div>
      </div>

      {/* PROJECT CHARTERS & BUDGET APPROVALS TABLE */}
      {projects.filter(p => p.approvalStatus === 'PENDING_APPROVAL' || !p.approvalStatus).length > 0 && (
        <div className="bg-white border-2 border-amber-300 rounded-sm overflow-hidden shadow-xs animate-fadeIn">
          <div className="p-4 bg-amber-50/80 border-b border-amber-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-800 text-[20px]">account_balance</span>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-950">
                Project Charters &amp; Budget Allocations Pending Executive Approval ({projects.filter(p => p.approvalStatus === 'PENDING_APPROVAL' || !p.approvalStatus).length})
              </h3>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-200/80 border border-amber-300 px-2.5 py-0.5 rounded-xs">
              Executive Gate Decision Required
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-amber-100/40 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-amber-200">
                  <th className="px-5 py-3">Project Code &amp; Title</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">PM Requester</th>
                  <th className="px-5 py-3">Requested Budget</th>
                  <th className="px-5 py-3">Gate Phase</th>
                  <th className="px-5 py-3">Target Launch</th>
                  <th className="px-5 py-3 text-right">Executive Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 font-sans">
                {projects.filter(p => p.approvalStatus === 'PENDING_APPROVAL' || !p.approvalStatus).map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-900 block">{p.code}</span>
                      <strong className="text-blue-950 font-bold text-xs">{p.name}</strong>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">{p.department}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{p.owner}</td>
                    <td className="px-5 py-4 font-mono font-extrabold text-emerald-800 text-sm">
                      ${p.budget?.toLocaleString() || '0'}
                    </td>
                    <td className="px-5 py-4 font-mono text-indigo-900 font-bold">{p.gate || 'Gate 1'}</td>
                    <td className="px-5 py-4 font-mono text-slate-600">{p.targetDate}</td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setDetailsProject(p)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase rounded-xs shadow-2xs cursor-pointer inline-flex items-center gap-1 transition-colors"
                        title="View Project Details"
                      >
                        <span className="material-symbols-outlined text-[15px]">info</span>
                        Details
                      </button>
                      <button
                        onClick={() => onApproveProject && onApproveProject(p.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase rounded-xs shadow-2xs cursor-pointer inline-flex items-center gap-1 transition-colors"
                        title="Approve Project Charter & Budget"
                      >
                        <span className="material-symbols-outlined text-[15px]">check_circle</span>
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectingProjectId(p.id);
                          setRejectionReasonInput('');
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] uppercase rounded-xs shadow-2xs cursor-pointer inline-flex items-center gap-1 transition-colors"
                        title="Reject Project Charter"
                      >
                        <span className="material-symbols-outlined text-[15px]">cancel</span>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approvals Table */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-900 text-[18px]">gavel</span>
            Pending &amp; Processed Steering Requests ({approvals.length})
          </h3>
          <span className="text-[11px] font-mono font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-xs">
            {approvals.filter(a => a.status === 'Pending').length} Action Required
          </span>

        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f2f4f6] text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Request Category</th>
                <th className="px-5 py-3">PM Requester</th>
                <th className="px-5 py-3">Member / Details</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Executive Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {approvals.map((app) => {
                const isMemberAssignment = app.requestType.includes('Member') || !!app.memberName;

                return (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-[#191c1e] whitespace-nowrap">
                      {app.project}
                    </td>

                    <td className="px-5 py-4">
                      {isMemberAssignment ? (
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-xs text-[10px]">
                          <span className="material-symbols-outlined text-[14px] text-indigo-800">badge</span>
                          Team Member Assignment
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-800">{app.requestType}</span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700 whitespace-nowrap">
                      {app.requestedBy}
                    </td>

                    <td className="px-5 py-4">
                      {isMemberAssignment ? (
                        <div className="space-y-0.5">
                          <strong className="text-slate-900 font-bold block">{app.memberName}</strong>
                          <span className="text-[10px] text-indigo-900 font-mono block">{app.memberRole || app.memberEmail}</span>
                          {app.justification && (
                            <p className="text-[10px] text-slate-500 line-clamp-1 italic">{app.justification}</p>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{app.amount || 'N/A'}</span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-500 whitespace-nowrap">{app.date}</td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 font-extrabold text-[10px] rounded-xs uppercase tracking-wider ${
                          app.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : app.status === 'Rejected'
                            ? 'bg-red-100 text-red-900 border border-red-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      {app.status === 'Pending' ? (
                        <div className="flex justify-end gap-2">
                          {isMemberAssignment ? (
                            <button
                              onClick={() => handleOpenProvisionModal(app)}
                              className="px-3 py-1.5 bg-[#00174b] hover:bg-indigo-950 text-white font-extrabold text-[10px] rounded-xs uppercase tracking-wider flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px] text-amber-400">key</span>
                              Approve &amp; Issue Password
                            </button>
                          ) : (
                            <button
                              onClick={() => onAction(app.id, 'Approved')}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[10px] rounded-xs uppercase tracking-wider transition-colors"
                            >
                              Approve
                            </button>
                          )}

                          <button
                            onClick={() => onAction(app.id, 'Rejected')}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-xs uppercase transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : isMemberAssignment && app.loginEmail ? (
                        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xs text-left">
                          <span className="material-symbols-outlined text-emerald-700 text-[16px]">verified</span>
                          <div>
                            <div className="text-[10px] font-bold text-slate-900">
                              Email: <span className="font-mono text-indigo-950">{app.loginEmail}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
                              <span>Pass:</span>
                              <strong className="text-slate-900">
                                {showPassword[app.id] ? app.generatedPassword || 'ExecPass#1' : '••••••••'}
                              </strong>
                              <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, [app.id]: !showPassword[app.id] })}
                                className="text-indigo-900 underline text-[9px] ml-1 font-sans"
                              >
                                {showPassword[app.id] ? 'Hide' : 'Show'}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(`Email: ${app.loginEmail}\nPassword: ${app.generatedPassword}`, app.id)}
                                className="text-slate-500 hover:text-slate-900 ml-1"
                                title="Copy Credentials"
                              >
                                <span className="material-symbols-outlined text-[12px]">content_copy</span>
                              </button>
                              {copiedId === app.id && <span className="text-emerald-700 font-bold text-[9px]">Copied!</span>}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Decision Logged</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXECUTIVE CREDENTIAL PROVISIONING MODAL */}
      {provisioningRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-300 rounded-sm max-w-lg w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#00174b] text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[22px]">admin_panel_settings</span>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">Executive Access Provisioning</h3>
                  <p className="text-xs text-indigo-200">Generate &amp; approve official user login credentials</p>
                </div>
              </div>
              <button
                onClick={() => setProvisioningRequest(null)}
                className="text-slate-300 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmProvisioning} className="p-5 space-y-4 text-xs">
              {/* Target Details Card */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                  <span>Project Target</span>
                  <span className="text-indigo-950 font-mono">{provisioningRequest.project}</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">{provisioningRequest.memberName}</p>
                <p className="text-slate-600 font-medium">
                  Role: <span className="font-bold text-slate-800">{provisioningRequest.memberRole || 'Team Member'}</span> | Dept: {provisioningRequest.memberDepartment || 'Engineering'}
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Official Work Login Email *
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-900"
                  required
                />
              </div>

              {/* Password Generator */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-800">
                    Generated Temporary Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[#00174b] hover:underline font-bold text-[10px] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[12px]">refresh</span>
                    Generate Random Strong Password
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedPassword}
                    onChange={(e) => setGeneratedPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2 rounded-xs font-mono font-bold text-emerald-800 outline-none focus:border-indigo-900 text-sm tracking-wider"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedPassword, 'modal-pass')}
                    className="px-3 py-2 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold rounded-xs shrink-0 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    {copiedId === 'modal-pass' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Executive Notice */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xs text-emerald-900 text-[11px] flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">check_circle</span>
                <div>
                  <strong>Executive Clearance Granted:</strong> Upon clicking Approve, member status will be set to <strong>Active</strong> in PMO user directory, and login credentials will be stored for immediate access.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setProvisioningRequest(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-extrabold rounded-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-400">verified</span>
                  Approve &amp; Issue Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT PROJECT CHARTER MODAL */}
      {rejectingProjectId && (

        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[22px]">cancel</span>
                <h3 className="font-extrabold text-slate-900 text-sm">Reject Project Charter</h3>
              </div>
              <button onClick={() => setRejectingProjectId(null)} className="text-slate-400 hover:text-slate-700 font-bold text-base cursor-pointer">✕</button>
            </div>

            <div className="space-y-3">
              <p className="text-slate-600">
                Please provide an executive rejection note explaining why this project charter or budget allocation is rejected:
              </p>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Budget allocation exceeds departmental cap; please revise resource plan and resubmit..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none focus:border-rose-600"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setRejectingProjectId(null)}
                className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onRejectProject && rejectingProjectId) {
                    onRejectProject(rejectingProjectId, rejectionReasonInput.trim() || 'Charter rejected by Executive Manager.');
                  }
                  setRejectingProjectId(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg uppercase tracking-wider shadow-2xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXECUTIVE PROJECT DETAILS MODAL */}
      <ExecutiveProjectDetailsModal 
        isOpen={!!detailsProject}
        onClose={() => setDetailsProject(null)}
        project={detailsProject}
      />
    </div>
  );
};

