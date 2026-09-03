import React, { useState } from 'react';
import { RiskItem, Severity, LoggedInPersona, Project } from '../../types';

interface RisksViewProps {
  risks: RiskItem[];
  onAddRisk: (risk: RiskItem) => void;
  onUpdateRisk: (updated: RiskItem) => void;
  currentPersona?: LoggedInPersona | null;
  projects?: Project[];
}

export const RisksView: React.FC<RisksViewProps> = ({
  risks,
  onAddRisk,
  onUpdateRisk,
  currentPersona,
  projects = [],
}) => {
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Risk Register' | 'Team Escalations' | 'My Risks' | 'Report Risk' | 'Risk Matrix' | 'Active Issues' | 'Reports'
  >('Overview');

  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'ALL'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'Project Manager' | 'Team Member' | 'Risk Manager' | 'Executive Director'>('ALL');
  
  // New Risk state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('Alex Rivers (Project Manager)');
  const [assignedRiskManager, setAssignedRiskManager] = useState('Marcus Vance (Risk Manager)');
  const [flaggedBy, setFlaggedBy] = useState<'Project Manager' | 'Team Member' | 'Executive Director'>(
    currentPersona?.roleType === 'TEAM_MEMBER' ? 'Team Member' : 'Project Manager'
  );
  const [projectRef, setProjectRef] = useState(projects[0]?.code || '');
  const [milestoneRef, setMilestoneRef] = useState('Gate 2 Security Audit');
  const [delegationNotes, setDelegationNotes] = useState('');
  const [severity, setSeverity] = useState<Severity>('HIGH');
  const [category, setCategory] = useState<'Risk' | 'Issue'>('Risk');

  // Edit / Delegate Risk state
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editAssignedRiskManager, setEditAssignedRiskManager] = useState('');
  const [editProjectRef, setEditProjectRef] = useState('');
  const [editMilestoneRef, setEditMilestoneRef] = useState('');
  const [editDelegationNotes, setEditDelegationNotes] = useState('');
  const [editSeverity, setEditSeverity] = useState<Severity>('HIGH');
  const [editCategory, setEditCategory] = useState<'Risk' | 'Issue'>('Risk');
  const [editStatus, setEditStatus] = useState<RiskItem['status']>('OPEN');

  // PM Resolve Issue Modal
  const [resolvingRisk, setResolvingRisk] = useState<RiskItem | null>(null);
  const [resolutionNotesInput, setResolutionNotesInput] = useState('');

  // PM Escalate to Risk Manager Modal
  const [escalatingRisk, setEscalatingRisk] = useState<RiskItem | null>(null);
  const [escalationNotesInput, setEscalationNotesInput] = useState('');

  // Risk Manager Mitigate Modal
  const [mitigatingRisk, setMitigatingRisk] = useState<RiskItem | null>(null);
  const [mitigationNotesInput, setMitigationNotesInput] = useState('');

  // View Resolution Details Modal
  const [viewingResolutionRisk, setViewingResolutionRisk] = useState<RiskItem | null>(null);

  // Quick Delegate Modal state
  const [delegatingRisk, setDelegatingRisk] = useState<RiskItem | null>(null);
  const [quickRiskManager, setQuickRiskManager] = useState('Marcus Vance (Risk Manager)');
  const [quickNotes, setQuickNotes] = useState('');

  // Stats calculation
  const totalRisks = risks.length;
  const openRisks = risks.filter((r) => r.status === 'OPEN' || r.status === 'REPORTED').length;
  const inReviewRisks = risks.filter((r) => r.status === 'IN_REVIEW' || r.status === 'ESCALATED').length;
  const mitigatedRisks = risks.filter((r) => r.status === 'MITIGATED' || r.status === 'RESOLVED').length;
  const highRisks = risks.filter((r) => r.severity === 'HIGH').length;
  const criticalRisks = risks.filter((r) => r.severity === 'CRITICAL').length;

  const mitigatedPercentage = totalRisks > 0 ? Math.round((mitigatedRisks / totalRisks) * 100) : 0;
  const openPct = totalRisks > 0 ? Math.round((openRisks / totalRisks) * 100) : 0;
  const reviewPct = totalRisks > 0 ? Math.round((inReviewRisks / totalRisks) * 100) : 0;
  const criticalPct = totalRisks > 0 ? Math.round(((highRisks + criticalRisks) / totalRisks) * 100) : 0;

  const handleCreateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const newRisk: RiskItem = {
      id: `r-${Date.now()}`,
      ref: `${category === 'Risk' ? 'R' : 'I'}-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      description,
      severity,
      owner: assignedRiskManager || owner,
      assignedRiskManager,
      flaggedBy: currentPersona?.roleType === 'TEAM_MEMBER' ? `${currentPersona.name} (Team Member)` : flaggedBy,
      submittedBy: currentPersona?.email || 'team@pmo.com',
      projectRef,
      milestoneRef,
      category,
      status: currentPersona?.roleType === 'TEAM_MEMBER' ? 'REPORTED' : 'OPEN',
      createdDate: new Date().toISOString().split('T')[0],
      delegationNotes,
      delegatedAt: new Date().toLocaleString()
    };

    onAddRisk(newRisk);
    setSubject('');
    setDescription('');
    setDelegationNotes('');
    setActiveTab('Risk Register');
  };

  const handleOpenEditModal = (risk: RiskItem) => {
    setEditingRisk(risk);
    setEditSubject(risk.subject);
    setEditDescription(risk.description || '');
    setEditOwner(risk.owner);
    setEditAssignedRiskManager(risk.assignedRiskManager || risk.owner);
    setEditProjectRef(risk.projectRef || '');
    setEditMilestoneRef(risk.milestoneRef || '');
    setEditDelegationNotes(risk.delegationNotes || '');
    setEditSeverity(risk.severity);
    setEditCategory(risk.category);
    setEditStatus(risk.status);
  };

  const handleSaveEditRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRisk || !editSubject.trim()) return;

    const updated: RiskItem = {
      ...editingRisk,
      subject: editSubject,
      description: editDescription,
      owner: editAssignedRiskManager || editOwner,
      assignedRiskManager: editAssignedRiskManager,
      projectRef: editProjectRef,
      milestoneRef: editMilestoneRef,
      delegationNotes: editDelegationNotes,
      severity: editSeverity,
      category: editCategory,
      status: editStatus
    };

    onUpdateRisk(updated);
    setEditingRisk(null);
  };

  // Project Manager solves issue
  const handleResolveRiskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingRisk) return;
    const updated: RiskItem = {
      ...resolvingRisk,
      status: 'RESOLVED',
      resolutionNotes: resolutionNotesInput || 'Issue resolved.'
    };
    onUpdateRisk(updated);
    setResolvingRisk(null);
    setResolutionNotesInput('');
  };

  // Project Manager escalates issue to Risk Manager
  const handleEscalateRiskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalatingRisk) return;
    const updated: RiskItem = {
      ...escalatingRisk,
      status: 'ESCALATED',
      escalationNotes: escalationNotesInput || 'Escalated by Project Manager to Risk Manager for enterprise governance review.'
    };
    onUpdateRisk(updated);
    setEscalatingRisk(null);
    setEscalationNotesInput('');
  };

  // Risk Manager solves / mitigates escalated risk
  const handleMitigateRiskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mitigatingRisk) return;
    const updated: RiskItem = {
      ...mitigatingRisk,
      status: 'MITIGATED',
      resolutionNotes: mitigationNotesInput || 'Mitigation controls applied.'
    };
    onUpdateRisk(updated);
    setMitigatingRisk(null);
    setMitigationNotesInput('');
  };

  const handleQuickDelegateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegatingRisk) return;

    const updated: RiskItem = {
      ...delegatingRisk,
      owner: quickRiskManager,
      assignedRiskManager: quickRiskManager,
      status: 'IN_REVIEW',
      delegationNotes: quickNotes || `Delegated by PMO Manager to ${quickRiskManager}`,
      delegatedAt: new Date().toLocaleString()
    };

    onUpdateRisk(updated);
    setDelegatingRisk(null);
    setQuickNotes('');
  };

  const filteredRisks = risks.filter((r) => {
    const isTeamMember = currentPersona?.roleType === 'TEAM_MEMBER';
    const isPM = currentPersona?.roleType === 'PROJECT_MANAGER';
    const isRM = currentPersona?.roleType === 'RISK_MANAGER';
    const userEmail = currentPersona?.email || '';

    if (activeTab === 'Team Escalations') {
      if (isRM) {
        // RM only sees ESCALATED risks or risks they resolved
        return r.status === 'ESCALATED' || r.status === 'MITIGATED' || r.assignedRiskManager === userEmail;
      }
      if (isPM) {
        // PM sees REPORTED risks sent to them, or ESCALATED risks they own
        return (r.status === 'REPORTED' || r.status === 'ESCALATED' || r.status === 'RESOLVED') && (r.owner === userEmail || r.submittedBy === userEmail);
      }
      return r.status === 'REPORTED' || r.status === 'ESCALATED' || r.status === 'RESOLVED';
    }

    if (activeTab === 'My Risks') {
      // Show risks owned by or submitted by the current user
      if (r.owner !== userEmail && r.submittedBy !== userEmail && r.assignedRiskManager !== userEmail) {
        return false;
      }
    }
    if (activeTab === 'Active Issues') {
      if (r.category !== 'Issue') return false;
    }
    if (selectedSeverity !== 'ALL' && r.severity !== selectedSeverity) {
      return false;
    }
    if (roleFilter !== 'ALL') {
      if (roleFilter === 'Project Manager' && r.flaggedBy !== 'Project Manager' && r.flaggedBy !== undefined) return false;
      if (roleFilter === 'Team Member' && (r.flaggedBy?.toLowerCase().includes('team') || r.submittedBy)) return true;
      if (roleFilter === 'Risk Manager' && r.assignedRiskManager) return true;
      if (roleFilter === 'Executive Director' && (r.severity === 'CRITICAL' || r.severity === 'HIGH')) return true;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>RISK GOVERNANCE</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b]">PORTFOLIO ESCALATION &amp; MITIGATION</span>
          </nav>
          <h2 className="text-[26px] font-bold text-[#191c1e] tracking-tight">Risk &amp; Issue Management</h2>
          <p className="text-xs text-slate-500">
            Monitor, assess, resolve, and escalate team member blockers, project risks, and compliance threats.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('Report Risk')}
          className="px-4 py-2 bg-red-700 text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-800 transition-colors shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">warning</span>
          Report New Risk / Issue
        </button>
      </div>

      {/* Horizontal Sub-navigation Pill Bar */}
      <div className="bg-slate-100/80 p-1.5 rounded-lg border border-slate-200/80 flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-600">
        {[
          { key: 'Overview', label: 'Overview', icon: 'dashboard' },
          { key: 'Risk Register', label: 'Risk Register', icon: 'table_chart' },
          {
            key: 'Team Escalations',
            label: 'Team Submissions & Escalations',
            icon: 'crisis_alert',
            badge: risks.filter((r) => r.status === 'REPORTED' || r.status === 'ESCALATED').length,
          },
          { key: 'My Risks', label: 'My Risks', icon: 'person' },
          { key: 'Report Risk', label: 'Report Risk', icon: 'add_alert' },
          { key: 'Risk Matrix', label: 'Risk Matrix', icon: 'grid_view' },
          { key: 'Active Issues', label: 'Active Issues', icon: 'report' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-white text-blue-900 font-bold shadow-2xs border border-slate-200/60'
                : 'hover:bg-slate-200/60 text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="bg-amber-500 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'Overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Portfolio Risks</span>
              <p className="text-2xl font-black text-slate-900 font-mono">{totalRisks}</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#00174b] h-full" style={{ width: '100%' }} />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">100% register coverage across active programs.</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Open &amp; Reported Items</span>
              <p className="text-2xl font-black text-amber-600 font-mono">{openRisks}</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${openPct}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">{openPct}% pending review or resolution.</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Escalated Governance Items</span>
              <p className="text-2xl font-black text-purple-700 font-mono">{inReviewRisks}</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full" style={{ width: `${reviewPct}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">In escalation or SLA mitigation audit.</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Resolved / Mitigated</span>
              <p className="text-2xl font-black text-emerald-600 font-mono">{mitigatedRisks}</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: `${mitigatedPercentage}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">{mitigatedPercentage}% resolution efficiency.</p>
            </div>
          </div>
        </div>
      )}

      {/* RISK REGISTER / TEAM ESCALATIONS / MY RISKS / ACTIVE ISSUES TAB CONTENT */}
      {(activeTab === 'Risk Register' || activeTab === 'Team Escalations' || activeTab === 'My Risks' || activeTab === 'Active Issues') && (
        <div className="space-y-4 animate-fadeIn">
          {/* Role Perspective & Severity Filters Header */}
          <div className="bg-white p-3 border border-slate-200/80 rounded-xl shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-700 text-[18px]">badge</span>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Role Perspective:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {(['ALL', 'Project Manager', 'Team Member', 'Risk Manager', 'Executive Director'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      roleFilter === role
                        ? 'bg-[#00174b] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Filters */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity Filter:</span>
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md transition-colors cursor-pointer ${
                    selectedSeverity === sev
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sev} (
                  {sev === 'ALL'
                    ? filteredRisks.length
                    : filteredRisks.filter((r) => r.severity === sev).length}
                  )
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                  <th className="px-5 py-3">Ref</th>
                  <th className="px-5 py-3">Subject &amp; Escalation Notes</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Reported By / Owner</th>
                  <th className="px-5 py-3">Lifecycle Status</th>
                  <th className="px-5 py-3 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-sans">
                {filteredRisks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-medium">
                      No risks or operational issues match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredRisks.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">{r.ref}</td>
                      <td className="px-5 py-4 max-w-sm">
                        <div className="font-bold text-[#191c1e] text-xs flex items-center gap-1.5">
                          {r.category === 'Issue' ? (
                            <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md font-mono uppercase">ISSUE</span>
                          ) : (
                            <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md font-mono uppercase">RISK</span>
                          )}
                          {r.subject}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{r.description}</div>

                        {/* Escalation Notes Badge */}
                        {r.escalationNotes && (
                          <div className="mt-1.5 text-[10px] text-purple-900 bg-purple-50 p-1.5 rounded-md border border-purple-200 font-mono">
                            <span className="font-bold block">Escalation Note (to Risk Manager):</span> {r.escalationNotes}
                          </div>
                        )}

                        {/* Resolution Notes Badge */}
                        {r.resolutionNotes && (
                          <div className="mt-1.5 text-[10px] text-emerald-900 bg-emerald-50 p-1.5 rounded-md border border-emerald-200 font-mono">
                            <span className="font-bold block">✓ Solved by {r.Resolver?.name ? `${r.Resolver.name} (${r.resolvedByRole})` : r.resolvedByRole || 'Admin'}:</span> {r.resolutionNotes}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px]">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md block w-max">
                          {r.projectRef || 'None'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 font-bold rounded-md text-[10px] uppercase tracking-wider ${
                            r.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : r.severity === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {r.severity}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        <div className="font-bold text-slate-900 text-xs">
                          {r.assignedRiskManager || r.owner}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Submitted by: {r.flaggedBy || 'Team Member'}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {r.status === 'RESOLVED' || r.status === 'MITIGATED' ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md uppercase font-mono flex items-center gap-1 w-max">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Solved by {r.Resolver?.name ? `${r.Resolver.name} (${r.resolvedByRole})` : r.resolvedByRole || 'Admin'}
                          </span>
                        ) : r.status === 'ESCALATED' ? (
                          <span className="px-2.5 py-1 bg-purple-100 text-purple-900 font-bold text-[10px] rounded-md uppercase font-mono flex items-center gap-1 w-max">
                            <span className="material-symbols-outlined text-[13px]">crisis_alert</span>
                            Escalated to Risk Mgr
                          </span>
                        ) : r.status === 'REPORTED' ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-md uppercase font-mono flex items-center gap-1 w-max">
                            <span className="material-symbols-outlined text-[13px]">pending</span>
                            Reported to PM
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md uppercase font-mono">
                            {r.status}
                          </span>
                        )}
                      </td>

                      {/* WORKFLOW ACTION BUTTONS */}
                      <td className="px-5 py-4 text-right space-x-1.5">
                        {/* If status is REPORTED or OPEN: PM can Solve or Escalate */}
                        {(r.status === 'REPORTED' || r.status === 'OPEN') && (
                          <>
                            <button
                              onClick={() => {
                                setResolvingRisk(r);
                                setResolutionNotesInput('');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Resolve / Solve this issue"
                            >
                              <span className="material-symbols-outlined text-[13px]">check</span>
                              Solve Issue
                            </button>

                            {currentPersona?.roleType !== 'RISK_MANAGER' && (
                              <button
                                onClick={() => {
                                  setEscalatingRisk(r);
                                  setEscalationNotesInput('');
                                }}
                                className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] uppercase rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Cannot solve? Escalate to Risk Manager"
                              >
                                <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                                Escalate to RM
                              </button>
                            )}
                          </>
                        )}


                        {/* If status is ESCALATED: Risk Manager can Mitigate / Solve */}
                        {r.status === 'ESCALATED' && (
                          <button
                            onClick={() => {
                              setMitigatingRisk(r);
                              setMitigationNotesInput('');
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Risk Manager: Solve and mitigate escalated risk"
                          >
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            Solve / Mitigate
                          </button>
                        )}

                        {/* If already solved: View Resolution Notes */}
                        {(r.status === 'RESOLVED' || r.status === 'MITIGATED') && (
                          <button
                            onClick={() => setViewingResolutionRisk(r)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] uppercase rounded-md border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">info</span>
                            Resolution Details
                          </button>
                        )}

                        {/* Quick Edit button */}
                        <button
                          onClick={() => handleOpenEditModal(r)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase rounded-md border border-slate-200 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[13px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT RISK TAB */}
      {activeTab === 'Report Risk' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-2xs max-w-3xl space-y-4 text-xs animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[20px]">warning</span>
                Raise &amp; Submit Risk / Issue to Project Manager
              </h3>
              <p className="text-[11px] text-slate-500">
                Submit operational blockers or project risks directly to the Project Manager for immediate resolution or escalation.
              </p>
            </div>
            <span className="font-mono text-[10px] bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-md border border-red-200">
              FORM REF: RSK-SUBMIT-{Date.now().toString().slice(-4)}
            </span>
          </div>

          <form onSubmit={handleCreateRisk} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Type *</label>
                <div className="flex gap-4 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                    <input type="radio" name="cat" checked={category === 'Risk'} onChange={() => setCategory('Risk')} />
                    <span>Risk (Future Threat)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-red-700">
                    <input type="radio" name="cat" checked={category === 'Issue'} onChange={() => setCategory('Issue')} />
                    <span>Issue (Active Blocker)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Severity Rating *</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white"
                >
                  <option value="CRITICAL">CRITICAL - Severe Blocker</option>
                  <option value="HIGH">HIGH - Major Impact</option>
                  <option value="MEDIUM">MEDIUM - Moderate Impact</option>
                  <option value="LOW">LOW - Minor Advisory</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Associated Project Code *</label>
                <select
                  value={projectRef}
                  onChange={(e) => setProjectRef(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-800 bg-white"
                >
                  {projects.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Linked Milestone / Lifecycle Gate</label>
                <input
                  type="text"
                  value={milestoneRef}
                  onChange={(e) => setMilestoneRef(e.target.value)}
                  placeholder="e.g. Gate 2 Technical Architecture Sign-off"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:border-blue-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject / Threat Summary *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Test environment database latency exceeding 450ms SLA"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-700 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Detailed Description &amp; Technical Impact *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the root cause, systems impacted, and immediate blocker details..."
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-700"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('Risk Register')}
                className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-700 text-white font-bold rounded-lg uppercase tracking-wider hover:bg-red-800 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                Submit to Project Manager
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESOLVE RISK MODAL (PROJECT MANAGER) */}
      {resolvingRisk && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">check_circle</span>
                <h3 className="font-extrabold text-slate-900 text-sm">Resolve &amp; Solve Risk/Issue</h3>
              </div>
              <button onClick={() => setResolvingRisk(null)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Target Ref: {resolvingRisk.ref} ({resolvingRisk.projectRef})</span>
              <p className="font-bold text-slate-900 text-xs">{resolvingRisk.subject}</p>
              <p className="text-[11px] text-slate-600">{resolvingRisk.description}</p>
              <p className="text-[10px] text-slate-400 font-mono">Flagged by: {resolvingRisk.flaggedBy || 'Team Member'}</p>
            </div>

            <form onSubmit={handleResolveRiskSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">
                  Resolution &amp; Fix Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionNotesInput}
                  onChange={(e) => setResolutionNotesInput(e.target.value)}
                  placeholder="Explain how this risk or issue was solved, actions taken, and verification results..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingRisk(null)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg uppercase tracking-wider hover:bg-emerald-700 flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Mark as Solved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESCALATE RISK MODAL (PROJECT MANAGER -> RISK MANAGER) */}
      {escalatingRisk && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700 text-[22px]">crisis_alert</span>
                <h3 className="font-extrabold text-slate-900 text-sm">Escalate Risk/Issue to Risk Manager</h3>
              </div>
              <button onClick={() => setEscalatingRisk(null)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-purple-900 uppercase">Target Ref: {escalatingRisk.ref}</span>
              <p className="font-bold text-slate-900 text-xs">{escalatingRisk.subject}</p>
              <p className="text-[11px] text-slate-600">{escalatingRisk.description}</p>
            </div>

            <form onSubmit={handleEscalateRiskSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">
                  Escalation Reason &amp; Risk Governance Request *
                </label>
                <textarea
                  required
                  rows={4}
                  value={escalationNotesInput}
                  onChange={(e) => setEscalationNotesInput(e.target.value)}
                  placeholder="Explain why this cannot be resolved at the PM level (e.g. cross-program architectural block, external vendor dependency, budget variance)..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-purple-700"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEscalatingRisk(null)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 text-white font-bold rounded-lg uppercase tracking-wider hover:bg-purple-800 flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  Escalate to Risk Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MITIGATE RISK MODAL (RISK MANAGER) */}
      {mitigatingRisk && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
                <h3 className="font-extrabold text-slate-900 text-sm">Risk Manager: Mitigate &amp; Solve Risk</h3>
              </div>
              <button onClick={() => setMitigatingRisk(null)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Target Ref: {mitigatingRisk.ref}</span>
              <p className="font-bold text-slate-900 text-xs">{mitigatingRisk.subject}</p>
              {mitigatingRisk.escalationNotes && (
                <p className="text-[11px] text-purple-900 bg-purple-50 p-1.5 rounded-md border border-purple-100">
                  <strong>PM Escalation Note:</strong> {mitigatingRisk.escalationNotes}
                </p>
              )}
            </div>

            <form onSubmit={handleMitigateRiskSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">
                  Governance Mitigation Strategy &amp; Resolution Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={mitigationNotesInput}
                  onChange={(e) => setMitigationNotesInput(e.target.value)}
                  placeholder="Detail risk mitigation steps, policy controls applied, or architecture exceptions granted..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMitigatingRisk(null)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg uppercase tracking-wider hover:bg-emerald-700 flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Mark as Mitigated &amp; Solved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RESOLUTION DETAILS MODAL */}
      {viewingResolutionRisk && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">task_alt</span>
                <h3 className="font-extrabold text-slate-900 text-sm">Resolution &amp; Mitigation Record</h3>
              </div>
              <button onClick={() => setViewingResolutionRisk(null)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <div className="space-y-2.5">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Threat Subject</span>
                <p className="font-bold text-slate-900 text-xs">{viewingResolutionRisk.subject}</p>
                <p className="text-[11px] text-slate-500 mt-1">{viewingResolutionRisk.description}</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-emerald-800 border-b border-emerald-200 pb-1">
                  <span>Solved by {viewingResolutionRisk.Resolver?.name ? `${viewingResolutionRisk.Resolver.name} (${viewingResolutionRisk.resolvedByRole})` : viewingResolutionRisk.resolvedByRole || 'Admin'}</span>
                  <span>{viewingResolutionRisk.resolvedAt ? new Date(viewingResolutionRisk.resolvedAt).toLocaleDateString() : 'Resolved'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Resolution Notes:</span>
                  <p className="text-xs leading-relaxed mt-0.5">{viewingResolutionRisk.resolutionNotes || 'No notes provided.'}</p>
                </div>
              </div>

              {viewingResolutionRisk.escalationNotes && (
                <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-purple-900 text-[11px]">
                  <strong className="block font-bold uppercase text-[9px]">Historical Escalation Reason:</strong>
                  {viewingResolutionRisk.escalationNotes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setViewingResolutionRisk(null)}
                className="px-4 py-2 bg-[#00174b] text-white font-bold rounded-lg uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RISK MODAL */}
      {editingRisk && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-xl w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">Edit Risk: {editingRisk.ref}</h3>
              <button onClick={() => setEditingRisk(null)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleSaveEditRisk} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">Subject</label>
                <input
                  type="text"
                  required
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">Severity</label>
                  <select
                    value={editSeverity}
                    onChange={(e) => setEditSeverity(e.target.value as Severity)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="REPORTED">REPORTED</option>
                    <option value="OPEN">OPEN</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="ESCALATED">ESCALATED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="MITIGATED">MITIGATED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">Owner</label>
                  <input
                    type="text"
                    value={editOwner}
                    onChange={(e) => setEditOwner(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRisk(null)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00174b] text-white font-bold rounded-lg uppercase"
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
