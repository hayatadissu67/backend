import React, { useState } from 'react';
import { ChangeRequestItem, Project } from '../types';

interface ChangeRequestsViewProps {
  changeRequests?: ChangeRequestItem[];
  projects?: Project[];
  onAddChangeRequest?: (request: Partial<ChangeRequestItem>) => void;
  onUpdateChangeRequest?: (updated: ChangeRequestItem) => void;
  onDeleteChangeRequest?: (id: string) => void;
  onApproveChangeRequest?: (id: string) => void;
  onRejectChangeRequest?: (id: string, reason: string) => void;
  currentPersona?: any;
}

export const ChangeRequestsView: React.FC<ChangeRequestsViewProps> = ({
  changeRequests: propChangeRequests,
  projects = [],
  onAddChangeRequest,
  onUpdateChangeRequest,
  onDeleteChangeRequest,
  onApproveChangeRequest,
  onRejectChangeRequest,
  currentPersona
}) => {
  // Local state initialized with props or default mock data
  const [localRequests, setLocalRequests] = useState<ChangeRequestItem[]>(propChangeRequests || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | 'PENDING' | 'APPROVED' | 'REJECTED'>('All');

  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<ChangeRequestItem | null>(null);
  const [editingRequest, setEditingRequest] = useState<ChangeRequestItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State for New Change Request
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id || '');
  const [newCategory, setNewCategory] = useState('Infrastructure');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newType, setNewType] = useState('Budget Increase');
  const [newAmount, setNewAmount] = useState('$5,000');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Critical' | 'Low'>('High');
  const [newRequestedBy, setNewRequestedBy] = useState('Sarah Jenkins');
  const [newDescription, setNewDescription] = useState('');

  // Sync if prop updates
  React.useEffect(() => {
    if (propChangeRequests) {
      setLocalRequests(propChangeRequests);
    }
  }, [propChangeRequests]);

  const requestsToDisplay = localRequests.length > 0 ? localRequests : propChangeRequests || [];

  // If team member, only show requests related to their assigned projects or those they requested
  const visibleRequests = currentPersona?.roleType === 'TEAM_MEMBER'
    ? requestsToDisplay.filter(r => {
        const projCode = projects?.find(p => p.id?.toString() === r.projectId?.toString() || p.name === r.project)?.code;
        const assigned = currentPersona?.assignedProjectCodes || [];
        return (projCode && assigned.includes(projCode)) || r.requestedBy === currentPersona?.name || r.requestedBy === currentPersona?.email;
      })
    : requestsToDisplay;

  const filteredRequests = visibleRequests.filter((req) => {
    const projectName = projects?.find(p => p.id?.toString() === req.projectId?.toString() || p.name === req.project)?.name || req.project || 'Unknown Project';
    const matchesSearch =
      req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'All' || req.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle Add New Change Request
  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // We pass projectId to backend.
    const newReq: any = {
      title: newTitle.trim(),
      projectId: newProjectId || undefined,
      category: newCategory,
      date: newDate,
      type: newType,
      amount: newAmount.startsWith('$') ? newAmount : `$${newAmount}`,
      priority: newPriority,
      requestedBy: newRequestedBy,
      description: newDescription || 'Standard PMO change request submitted for executive governance review.',
      status: 'PENDING'
    };

    if (onAddChangeRequest) {
      onAddChangeRequest(newReq);
    } else {
      setLocalRequests((prev) => [newReq, ...prev]);
    }

    // Reset Form & Close Modal
    setNewTitle('');
    setNewDescription('');
    setIsNewModalOpen(false);
  };

  // Handle Update Status directly
  const handleApprove = (req: ChangeRequestItem) => {
    if (onApproveChangeRequest) {
      onApproveChangeRequest(req.id);
    }
    setViewingRequest(null);
  };

  const handleReject = (req: ChangeRequestItem) => {
    const reason = prompt("Enter rejection reason:") || "Not specified";
    if (onRejectChangeRequest) {
      onRejectChangeRequest(req.id, reason);
    }
    setViewingRequest(null);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;

    if (onUpdateChangeRequest) {
      onUpdateChangeRequest(editingRequest);
    } else {
      setLocalRequests((prev) => prev.map((r) => (r.id === editingRequest.id ? editingRequest : r)));
    }

    setEditingRequest(null);
  };

  // Handle Delete
  const ConfirmDelete = (id: string) => {
    if (onDeleteChangeRequest) {
      onDeleteChangeRequest(id);
    } else {
      setLocalRequests((prev) => prev.filter((r) => r.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">PMO Change Requests</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Search, manage, approve, or delete budget change requests.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>+ New Change Request</span>
        </button>
      </div>

      {/* Search Bar Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, project, or category..."
            className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-1.5 self-start sm:self-center overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['All', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md border transition-all cursor-pointer whitespace-nowrap ${
                selectedStatusFilter === st
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Request History Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-black text-slate-900 tracking-tight">Request History</h2>
          <span className="text-xs font-semibold text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md">
            Showing {filteredRequests.length} requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">TITLE</th>
                <th className="px-5 py-3.5">PROJECT</th>
                <th className="px-5 py-3.5">CATEGORY</th>
                <th className="px-5 py-3.5">DATE</th>
                <th className="px-5 py-3.5">TYPE</th>
                <th className="px-5 py-3.5">AMOUNT</th>
                <th className="px-5 py-3.5">PRIORITY</th>
                <th className="px-5 py-3.5">STATUS</th>
                <th className="px-5 py-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-3xl mb-2 block">find_in_page</span>
                    <p className="font-semibold text-xs">No matching change requests found</p>
                    <p className="text-[11px] mt-0.5">Try adjusting your search keywords or filter terms.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-800 text-xs">
                      {req.id}
                    </td>

                    {/* TITLE */}
                    <td className="px-5 py-4 font-bold text-slate-900 text-xs max-w-[200px] truncate">
                      {req.title}
                    </td>

                    {/* PROJECT */}
                    <td className="px-5 py-4 font-bold text-blue-600 text-[11px] uppercase">
                      {projects?.find(p => p.id?.toString() === req.projectId?.toString() || p.name === req.project)?.name || req.project || 'Unknown Project'}
                    </td>

                    {/* CATEGORY */}
                    <td className="px-5 py-4 text-slate-600 font-medium text-xs">
                      {req.category}
                    </td>

                    {/* DATE */}
                    <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                      {req.date}
                    </td>

                    {/* TYPE */}
                    <td className="px-5 py-4 text-slate-600 font-medium text-xs">
                      {req.type}
                    </td>



                    {/* AMOUNT */}
                    <td className="px-5 py-4 font-bold text-slate-900 text-xs">
                      {req.amount}
                    </td>

                    {/* PRIORITY PILL */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold ${
                          req.priority === 'High'
                            ? 'bg-red-100/80 text-red-700 border border-red-200/60'
                            : req.priority === 'Medium'
                            ? 'bg-amber-100/80 text-amber-800 border border-amber-200/60'
                            : req.priority === 'Critical'
                            ? 'bg-purple-100/80 text-purple-800 border border-purple-200/60'
                            : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </td>

                    {/* STATUS PILL */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold ${
                          req.status === 'PENDING'
                            ? 'bg-amber-100/90 text-amber-800 border border-amber-200'
                            : req.status === 'APPROVED'
                            ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200'
                            : 'bg-red-100/90 text-red-800 border border-red-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3 font-semibold text-xs">
                        <button
                          onClick={() => setViewingRequest(req)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                        >
                          View
                        </button>
                        {/* Only allow edit/delete for non-team members (PMs/Execs) */}
                        {currentPersona?.roleType !== 'TEAM_MEMBER' && (
                          <>
                            <button
                              onClick={() => setEditingRequest(req)}
                              className="text-amber-600 hover:text-amber-800 hover:underline cursor-pointer transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeletingId(req.id)}
                              className="text-red-600 hover:text-red-800 hover:underline cursor-pointer transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW CHANGE REQUEST MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400">published_with_changes</span>
                  New PMO Change Request
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Submit a budget or scope alteration proposal for executive clearance.
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="p-5 space-y-4 overflow-y-auto flex-1 custom-scroll">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Change Request Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infrastructure Scale-up"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Design">Design</option>
                    <option value="Security">Security</option>
                    <option value="Backend">Backend</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  >
                    <option value="Budget Increase">Budget Increase</option>
                    <option value="Reallocation">Reallocation</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Performance">Performance</option>
                    <option value="Scope Extension">Scope Extension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($)</label>
                  <input
                    type="text"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Critical">Critical</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requested By</label>
                  <input
                    type="text"
                    value={newRequestedBy}
                    onChange={(e) => setNewRequestedBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Justification / Details</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe why this change request is required and its expected business impact..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CHANGE REQUEST MODAL */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="font-mono text-xs text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded-md border border-amber-800">
                  {viewingRequest.id}
                </span>
                <h3 className="font-black text-lg text-white mt-1">{viewingRequest.title}</h3>
              </div>
              <button
                onClick={() => setViewingRequest(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Project</span>
                  <span className="font-bold text-slate-900">{viewingRequest.project}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Category</span>
                  <span className="font-semibold text-slate-800">{viewingRequest.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Amount</span>
                  <span className="font-black text-slate-900 text-sm">{viewingRequest.amount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Date</span>
                  <span className="font-mono text-slate-700">{viewingRequest.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Type</span>
                  <span className="font-semibold text-slate-800">{viewingRequest.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority</span>
                  <span className="font-bold text-red-600">{viewingRequest.priority}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-900 mb-1">Request Status</h4>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      viewingRequest.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : viewingRequest.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {viewingRequest.status}
                  </span>
                  {viewingRequest.requestedBy && (
                    <span className="text-xs text-slate-500">Requested by: <strong>{viewingRequest.requestedBy}</strong></span>
                  )}
                </div>
              </div>

              {viewingRequest.description && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 mb-1">Description &amp; Justification</h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {viewingRequest.description}
                  </p>
                </div>
              )}

              {/* Executive Decision Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2">
              {viewingRequest.status !== 'APPROVED' && viewingRequest.status !== 'REJECTED' && currentPersona?.roleType === 'EXECUTIVE_MANAGER' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(viewingRequest)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(viewingRequest)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">cancel</span>
                      Reject
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setViewingRequest(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CHANGE REQUEST MODAL */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400">edit</span>
                  Edit Change Request {editingRequest.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingRequest(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingRequest.title}
                  onChange={(e) => setEditingRequest({ ...editingRequest, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project</label>
                  <input
                    type="text"
                    value={editingRequest.project}
                    onChange={(e) => setEditingRequest({ ...editingRequest, project: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingRequest.category}
                    onChange={(e) => setEditingRequest({ ...editingRequest, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount</label>
                  <input
                    type="text"
                    value={editingRequest.amount}
                    onChange={(e) => setEditingRequest({ ...editingRequest, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editingRequest.priority}
                    onChange={(e) => setEditingRequest({ ...editingRequest, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Critical">Critical</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingRequest.status}
                    onChange={(e) => setEditingRequest({ ...editingRequest, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingRequest.description || ''}
                  onChange={(e) => setEditingRequest({ ...editingRequest, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Delete Change Request {deletingId}?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this change request from PMO history?
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => ConfirmDelete(deletingId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
