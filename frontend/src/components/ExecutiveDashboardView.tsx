import React, { useState } from 'react';
import {
  Project,
  RiskItem,
  ActivityItem,
  Milestone,
  ResourceLoading,
  ApprovalRequest,
  TaskItem,
  BudgetItem,
  MeetingItem
} from '../types';

interface ExecutiveDashboardViewProps {
  projects: Project[];
  risks: RiskItem[];
  activities: ActivityItem[];
  milestones: Milestone[];
  resources: ResourceLoading[];
  approvals: ApprovalRequest[];
  tasks: TaskItem[];
  budgets: BudgetItem[];
  meetings: MeetingItem[];
  onNavigate: (tab: any) => void;
  onOpenNewProject: () => void;
  onOpenExportPDF: () => void;
  onApprovalAction: (id: string, status: 'Approved' | 'Rejected') => void;
  onUpdateRiskStatus: (updatedRisk: RiskItem) => void;
  onSelectProject?: (project: Project | string) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  projects,
  risks,
  activities,
  milestones,
  resources,
  approvals,
  tasks,
  budgets,
  meetings,
  onNavigate,
  onOpenNewProject,
  onOpenExportPDF,
  onApprovalAction,
  onUpdateRiskStatus,
  onSelectProject
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HEALTH' | 'GATE' | 'RISKS'>('ALL');
  const [showAiSummary, setShowAiSummary] = useState(true);

  // Financial Calculations
  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocated, 0) || 4200000;
  const totalSpent = budgets.reduce((acc, b) => acc + b.actualSpent, 0) || 1850000;
  const remainingBudget = totalAllocated - totalSpent;
  const budgetBurnRate = Math.round((totalSpent / totalAllocated) * 100);

  // Project Metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
  const delayedProjects = projects.filter((p) => p.status === 'DELAYED').length;
  const greenProjects = projects.filter((p) => p.health === 'GREEN').length;
  const healthPercentage = totalProjects > 0 ? Math.round((greenProjects / totalProjects) * 100) : 100;

  // Pending Approvals
  const pendingApprovals = approvals.filter((a) => a.status === 'Pending');

  // Critical Risks
  const criticalRisks = risks.filter((r) => (r.severity === 'CRITICAL' || r.severity === 'HIGH') && r.status !== 'MITIGATED');

  // Tasks metrics
  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const totalTasks = tasks.length || 1;
  const taskCompletionPct = Math.round((completedTasks / totalTasks) * 100);

  // Department Load Overload alert
  const overloadedDepts = resources.filter((r) => r.percentage >= 85);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Executive Command Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-sm border border-slate-200/80 shadow-2xs">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>EXECUTIVE CONTROL TOWER</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b]">PORTFOLIO COMMAND CENTER</span>
          </nav>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#191c1e] flex items-center gap-2">
            Executive Admin Dashboard
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-wider uppercase border border-emerald-200">
              Live Telemetry
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Real-time portfolio intelligence for executive decision-making. Monitor stage-gate approvals, budget allocation, resource constraints, and critical strategic risks.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('templates')}
            className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-indigo-100 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            Action Templates
          </button>
          <button
            onClick={onOpenExportPDF}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export Executive Brief
          </button>
          <button
            onClick={() => onNavigate('approvals')}
            className="relative px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            Approvals ({pendingApprovals.length})
          </button>
          <button
            onClick={onOpenNewProject}
            className="px-4 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            New Project Charter
          </button>
        </div>
      </div>

      {/* AI Intelligence Briefing Banner */}
      {showAiSummary && (
        <div className="bg-gradient-to-r from-[#00174b] to-[#12285e] text-white p-5 rounded-sm border border-indigo-900 shadow-xs relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 max-w-4xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[20px]">auto_awesome</span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
                  AI Portfolio Briefing • Executive Advisory
                </span>
              </div>
              <p className="text-xs text-slate-100 font-medium leading-relaxed">
                <strong className="text-white">Executive Summary:</strong> Overall portfolio health is standing at{' '}
                <span className="text-emerald-300 font-bold">{healthPercentage}% Green</span>. Budget utilization is currently at{' '}
                <span className="text-amber-300 font-bold">{budgetBurnRate}% (${(totalSpent / 1000000).toFixed(2)}M of ${(totalAllocated / 1000000).toFixed(2)}M)</span> with a positive cost variance. Total{' '}
                <span className="text-amber-300 font-bold">{pendingApprovals.length} Gate Pass requests</span> are currently pending executive sign-off.{' '}
                {overloadedDepts.length > 0 && (
                  <span className="text-red-300">
                    Warning: {overloadedDepts.map((d) => d.department).join(', ')} department is operating near capacity limit ({overloadedDepts[0]?.percentage}%).
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowAiSummary(false)}
              className="text-slate-300 hover:text-white text-xs font-bold px-2 py-1"
              title="Dismiss Briefing"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Executive Key Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* TOTAL BUDGET & SPEND */}
        <div
          onClick={() => onNavigate('budget')}
          className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs hover:border-blue-500 transition-all cursor-pointer group"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            PORTFOLIO BUDGET
          </span>
          <p className="text-xl font-extrabold text-[#191c1e] font-mono">
            ${(totalAllocated / 1000000).toFixed(2)}M
          </p>
          <div className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[14px]">trending_down</span>
            ${(remainingBudget / 1000000).toFixed(2)}M Remaining
          </div>
        </div>

        {/* ACTIVE PROJECTS */}
        <div
          onClick={() => onNavigate('projects')}
          className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs hover:border-blue-500 transition-all cursor-pointer group"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            ACTIVE PROJECTS
          </span>
          <p className="text-xl font-extrabold text-[#191c1e] font-mono">
            {activeProjects} <span className="text-xs font-normal text-slate-400">/ {totalProjects}</span>
          </p>
          <div className="mt-2 text-[10px] font-bold text-slate-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {healthPercentage}% On-Track
          </div>
        </div>

        {/* PENDING EXECUTIVE DECISIONS */}
        <div
          onClick={() => onNavigate('approvals')}
          className="bg-white border border-amber-200/80 bg-amber-50/20 p-4 rounded-sm shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
            DECISION QUEUE
          </span>
          <p className="text-xl font-extrabold text-amber-700 font-mono">
            {pendingApprovals.length}
          </p>
          <div className="mt-2 text-[10px] font-bold text-amber-700 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[14px]">pending_actions</span>
            Requires Sign-off
          </div>
        </div>

        {/* CRITICAL RISKS */}
        <div
          onClick={() => onNavigate('risks')}
          className="bg-white border border-red-200/80 bg-red-50/20 p-4 rounded-sm shadow-2xs hover:border-red-400 transition-all cursor-pointer group"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block mb-1">
            CRITICAL RISKS
          </span>
          <p className="text-xl font-extrabold text-red-700 font-mono">
            {criticalRisks.length}
          </p>
          <div className="mt-2 text-[10px] font-bold text-red-600 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            High Exposure
          </div>
        </div>

        {/* RESOURCE LOAD */}
        <div
          onClick={() => onNavigate('resources')}
          className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs hover:border-blue-500 transition-all cursor-pointer group"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            DEPT RESOURCE LOAD
          </span>
          <p className="text-xl font-extrabold text-[#191c1e] font-mono">
            {Math.round(resources.reduce((a, b) => a + b.percentage, 0) / (resources.length || 1))}%
          </p>
          <div className="mt-2 text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[14px]">groups</span>
            {overloadedDepts.length} Dept Overloaded
          </div>
        </div>

        {/* TASK COMPLETION */}
        <div
          onClick={() => onNavigate('tasks')}
          className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs hover:border-blue-500 transition-all cursor-pointer group"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            DELIVERABLE TASKS
          </span>
          <p className="text-xl font-extrabold text-[#191c1e] font-mono">
            {completedTasks} <span className="text-xs font-normal text-slate-400">/ {totalTasks}</span>
          </p>
          <div className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {taskCompletionPct}% Completed
          </div>
        </div>
      </div>

      {/* Main Command Tower Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (8 cols): Executive Decision Center & Financial Telemetry */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Executive Decision Queue: Pending Stage Gate & Budget Approvals */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">gavel</span>
                  Executive Gate &amp; Budget Decision Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Requests awaiting formal sign-off from the Executive Admin and Steering Committee.
                </p>
              </div>
              <button
                onClick={() => onNavigate('approvals')}
                className="text-xs font-bold text-blue-700 hover:underline uppercase tracking-wider"
              >
                View Approval Register ({approvals.length})
              </button>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="p-6 border border-dashed border-emerald-200 bg-emerald-50/50 rounded-xs text-center space-y-1">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
                <p className="text-xs font-bold text-emerald-900">Decision Queue Cleared!</p>
                <p className="text-[11px] text-emerald-700">All gate pass and budget requests have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#00174b] text-white font-mono font-bold text-[10px] rounded-xs uppercase">
                          {req.project}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{req.requestType}</span>
                        {req.amount && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-xs">
                            {req.amount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Requested by <strong className="text-slate-700">{req.requestedBy}</strong> on {req.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onApprovalAction(req.id, 'Approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xs uppercase tracking-wider flex items-center gap-1 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                        Approve
                      </button>
                      <button
                        onClick={() => onApprovalAction(req.id, 'Rejected')}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xs uppercase tracking-wider flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio Financial Governance & Budget Telemetry */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700 text-[20px]">account_balance_wallet</span>
                  Portfolio Financial Governance &amp; Budget Telemetry
                </h3>
                <p className="text-xs text-slate-500">
                  Capital Allocation, Cost Variance, and Expenditure Rate across key project accounts.
                </p>
              </div>
              <button
                onClick={() => onNavigate('budget')}
                className="text-xs font-bold text-blue-700 hover:underline uppercase tracking-wider"
              >
                Financial Details →
              </button>
            </div>

            {/* Financial Overview Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Total Portfolio Expenditure Burn</span>
                <span className="font-mono font-bold text-blue-900">
                  ${(totalSpent / 1000000).toFixed(2)}M / ${(totalAllocated / 1000000).toFixed(2)}M ({budgetBurnRate}%)
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-700 transition-all duration-500 rounded-l-full"
                  style={{ width: `${budgetBurnRate}%` }}
                ></div>
                <div
                  className="h-full bg-emerald-400 opacity-60"
                  style={{ width: `${100 - budgetBurnRate}%` }}
                ></div>
              </div>
            </div>

            {/* Individual Budget Accounts Table */}
            <div className="overflow-x-auto border border-slate-200/80 rounded-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="p-2.5">Project</th>
                    <th className="p-2.5">Allocated</th>
                    <th className="p-2.5">Actual Spent</th>
                    <th className="p-2.5">Committed</th>
                    <th className="p-2.5">Variance</th>
                    <th className="p-2.5">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-sans">
                  {budgets.slice(0, 4).map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => onSelectProject ? onSelectProject(b.projectCode) : onNavigate('projects')}
                      className="hover:bg-slate-50 cursor-pointer"
                      title="Click to view Project Dashboard"
                    >
                      <td className="p-2.5 font-bold text-slate-900">
                        <span className="font-mono text-slate-500 mr-1.5">{b.projectCode}</span>
                        {b.projectName}
                      </td>
                      <td className="p-2.5 font-mono text-slate-700">${b.allocated.toLocaleString()}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">${b.actualSpent.toLocaleString()}</td>
                      <td className="p-2.5 font-mono text-slate-600">${b.committed.toLocaleString()}</td>
                      <td className="p-2.5 font-mono font-bold text-emerald-600">
                        +${b.variance.toLocaleString()}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-xs font-bold text-[9px] uppercase ${
                            b.health === 'On Track'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.health}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Portfolio Health & Stage Gate Progression Pipeline */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00174b] text-[20px]">account_tree</span>
                  Stage-Gate Project Lifecycle Pipeline
                </h3>
                <p className="text-xs text-slate-500">
                  Full 5-Stage Lifecycle: Initiation (Gate 1), Planning (Gate 2), Execution (Gate 3), Governance (Gate 4), and Closure (Gate 5).
                </p>
              </div>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs font-bold text-blue-700 hover:underline uppercase tracking-wider"
              >
                All Projects ({projects.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {[
                { stage: 'Initiation', gate: 'Gate 1', label: 'Stage 1: Initiation' },
                { stage: 'Planning', gate: 'Gate 2', label: 'Stage 2: Planning' },
                { stage: 'Execution', gate: 'Gate 3', label: 'Stage 3: Execution' },
                { stage: 'Governance', gate: 'Gate 4', label: 'Stage 4: Governance' },
                { stage: 'Closure', gate: 'Gate 5', label: 'Stage 5: Closure' }
              ].map((stg) => {
                const gateProjects = projects.filter((p) => {
                  const stage = p.lifecycleStage || (
                    p.gate === 'Gate 1' ? 'Initiation' :
                    p.gate === 'Gate 2' ? 'Planning' :
                    p.gate === 'Gate 3' ? 'Execution' :
                    p.gate === 'Gate 4' ? 'Governance' : 'Closure'
                  );
                  return stage === stg.stage || p.gate === stg.gate;
                });
                return (
                  <div key={stg.stage} className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                      <span className="font-extrabold text-[11px] text-slate-800 uppercase">{stg.label}</span>
                      <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-100 px-1.5 rounded-xs">
                        {gateProjects.length}
                      </span>
                    </div>
                    {gateProjects.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic py-2">No active projects</p>
                    ) : (
                      <div className="space-y-1.5">
                        {gateProjects.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => onSelectProject ? onSelectProject(p) : onNavigate('projects')}
                            className="p-2 bg-white border border-slate-200 rounded-xs hover:border-blue-400 cursor-pointer shadow-2xs space-y-1 transition-all hover:shadow-md"
                            title={`Open ${p.name} Dashboard`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-[10px] text-slate-700">{p.code}</span>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  p.health === 'GREEN'
                                    ? 'bg-emerald-500'
                                    : p.health === 'YELLOW'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                              ></span>
                            </div>
                            <p className="font-bold text-slate-900 text-xs line-clamp-1">{p.name}</p>
                            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-0.5">
                              <span>{p.gate}</span>
                              <span className="font-bold text-indigo-900">{p.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div className="bg-[#00174b] h-full" style={{ width: `${p.progress}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): Department Capacity, Critical Risks, Meetings & Audit Feed */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Department Capacity Overload Matrix */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-indigo-700">groups</span>
                Department Capacity Utilization
              </h4>
              <button
                onClick={() => onNavigate('resources')}
                className="text-[10px] font-bold text-blue-700 hover:underline uppercase"
              >
                Rebalance
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {resources.map((res) => (
                <div key={res.department} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{res.department}</span>
                    <span
                      className={`font-mono font-bold text-[11px] ${
                        res.percentage >= 90
                          ? 'text-red-600'
                          : res.percentage >= 80
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {res.percentage}% Utilization ({res.headcount} FTEs)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        res.percentage >= 90
                          ? 'bg-red-600'
                          : res.percentage >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${res.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Strategic Risks Needing Triage */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-red-600">warning</span>
                Critical Portfolio Risks
              </h4>
              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded-xs font-mono">
                {criticalRisks.length} Active
              </span>
            </div>

            {criticalRisks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No critical unmitigated risks logged.</p>
            ) : (
              <div className="space-y-2">
                {criticalRisks.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-2.5 bg-red-50/60 border border-red-200/80 rounded-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-red-900 text-[10px]">{r.ref}</span>
                      <button
                        onClick={() =>
                          onUpdateRiskStatus({
                            ...r,
                            status: r.status === 'MITIGATED' ? 'OPEN' : 'MITIGATED'
                          })
                        }
                        className="text-[10px] font-bold text-blue-800 hover:underline uppercase"
                      >
                        {r.status === 'MITIGATED' ? 'Reopen' : 'Mark Mitigated'}
                      </button>
                    </div>
                    <p className="font-bold text-slate-900 text-xs line-clamp-1">{r.subject}</p>
                    <p className="text-[10px] text-slate-500">Owner: {r.owner}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Steering Committee Governance & Upcoming Meetings */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-blue-800">event</span>
                Governance &amp; Steering Calendar
              </h4>
              <button
                onClick={() => onNavigate('meetings')}
                className="text-[10px] font-bold text-blue-700 hover:underline uppercase"
              >
                Schedule Meeting
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {meetings.slice(0, 3).map((m) => (
                <div key={m.id} className="p-2 bg-slate-50 border border-slate-200 rounded-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{m.title}</span>
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1 rounded-xs">
                      {m.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    📅 {m.date} • 🕒 {m.time} • 📍 {m.location}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Executive Activity Feed */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Executive Telemetry Log</span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">● LIVE</span>
            </h4>
            <div className="space-y-3 text-xs">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="flex gap-2.5 items-start border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="p-1 bg-slate-100 rounded-xs text-slate-700 flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">
                      {act.badgeType === 'check'
                        ? 'check_circle'
                        : act.badgeType === 'warning'
                        ? 'warning'
                        : act.badgeType === 'document'
                        ? 'description'
                        : 'notifications'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{act.title}</p>
                    <p className="text-[10px] text-slate-400">{act.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
