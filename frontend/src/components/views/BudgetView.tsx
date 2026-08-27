import React, { useState } from 'react';
import { BudgetItem } from '../../types';

interface BudgetViewProps {
  budgets?: BudgetItem[];
  onUpdateBudget?: (budgetId: string, allocated: number, spent: number) => void;
  currentPersona?: any;
}

type SubTab = 'Overview' | 'Planning' | 'Allocation' | 'Expenses' | 'Approvals' | 'Monitoring' | 'Forecast';

interface BudgetPlan {
  id: string;
  planName: string;
  projectName: string;
  category: string;
  timeline: string;
  estimatedCost: number;
}

interface ProjectAllocation {
  id: string;
  department: string;
  projectName: string;
  allocatedAmount: number;
}

interface AllocationHistoryItem {
  id: string;
  action: string;
  projectName: string;
  amount: number;
  timestamp: string;
  modifiedBy: string;
}

interface PendingApproval {
  id: string;
  requestTitle: string;
  department: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  amount: number;
}

interface ApprovalHistoryItem {
  id: string;
  requestTitle: string;
  amount: number;
  status: 'Approved' | 'Rejected';
  comments: string;
  date: string;
}

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ budgets, currentPersona }) => {
  const [activeTab, setActiveTab] = useState<SubTab>('Overview');


  // KPI Overall State
  const [totalBudget, setTotalBudget] = useState<number>(150000);
  const [totalExpense, setTotalExpense] = useState<number>(117750);

  const remainingBudget = totalBudget - totalExpense;
  const budgetUtilization = ((totalExpense / totalBudget) * 100).toFixed(1);

  // Planning State
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([
    {
      id: 'bp-1',
      planName: 'Q1 Cloud Upgrade',
      projectName: 'PMO Control Tower',
      category: 'Infrastructure',
      timeline: '2026-08-01',
      estimatedCost: 25000,
    },
  ]);

  const [planNameInput, setPlanNameInput] = useState('');
  const [projectNameInput, setProjectNameInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [estimatedCostInput, setEstimatedCostInput] = useState('');
  const [timelineInput, setTimelineInput] = useState('');

  // Allocation State
  const [allocations, setAllocations] = useState<ProjectAllocation[]>([
    { id: 'al-1', department: 'Cloud & Infrastructure', projectName: 'PMO Tower', allocatedAmount: 20000 },
    { id: 'al-2', department: 'Human Resources', projectName: 'Team Stipends', allocatedAmount: 35000 },
  ]);

  const [selectedAllocationProject, setSelectedAllocationProject] = useState<string>('PMO Tower');
  const [newAllocationAmount, setNewAllocationAmount] = useState<string>('');
  const [allocationHistory, setAllocationHistory] = useState<AllocationHistoryItem[]>([
    { id: 'ah-1', action: 'Initial Allocation', projectName: 'PMO Tower', amount: 20000, timestamp: '2026-07-10 10:30 AM', modifiedBy: 'Admin' },
    { id: 'ah-2', action: 'Initial Allocation', projectName: 'Team Stipends', amount: 35000, timestamp: '2026-07-12 02:15 PM', modifiedBy: 'Manager' },
  ]);

  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: 'ex-1', name: 'Cloud Infrastructure (AWS)', amount: 1200, date: '2026-07-28', category: 'Infrastructure' },
    { id: 'ex-2', name: 'UI/UX Software Licensing', amount: 450, date: '2026-07-25', category: 'Software' },
  ]);

  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Infrastructure');

  // Approvals State
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([
    { id: 'pa-1', requestTitle: 'Cloud Infrastructure Upgrade', department: 'Infrastructure', status: 'Pending', amount: 15000 },
    { id: 'pa-2', requestTitle: 'Marketing Campaign Q3', department: 'Marketing', status: 'Pending', amount: 8500 },
  ]);

  const [selectedRequestToReview, setSelectedRequestToReview] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistoryItem[]>([
    { id: 'aph-1', requestTitle: 'Q2 Office Supplies', amount: 3200, status: 'Approved', comments: 'Looks good.', date: '2026-07-10' },
  ]);

  // Handle Save Budget Plan
  const handleSaveBudgetPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planNameInput.trim()) return;

    const cost = parseFloat(estimatedCostInput) || 0;
    const newPlan: BudgetPlan = {
      id: `bp-${Date.now()}`,
      planName: planNameInput.trim(),
      projectName: projectNameInput.trim() || 'PMO Tower',
      category: categoryInput.trim() || 'General',
      timeline: timelineInput || new Date().toISOString().split('T')[0],
      estimatedCost: cost,
    };

    setBudgetPlans((prev) => [newPlan, ...prev]);
    setPlanNameInput('');
    setProjectNameInput('');
    setCategoryInput('');
    setEstimatedCostInput('');
    setTimelineInput('');
  };

  // Handle Update Allocation
  const handleUpdateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newAllocationAmount);
    if (isNaN(amount)) return;

    setAllocations((prev) =>
      prev.map((al) => (al.projectName === selectedAllocationProject ? { ...al, allocatedAmount: amount } : al))
    );

    const newHistory: AllocationHistoryItem = {
      id: `ah-${Date.now()}`,
      action: 'Updated Allocation',
      projectName: selectedAllocationProject,
      amount: amount,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      modifiedBy: 'Admin',
    };

    setAllocationHistory((prev) => [newHistory, ...prev]);
    setNewAllocationAmount('');
  };

  // Handle Record Expense
  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName.trim()) return;
    const amt = parseFloat(expenseAmount) || 0;

    const newExp: ExpenseItem = {
      id: `ex-${Date.now()}`,
      name: expenseName.trim(),
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      category: expenseCategory,
    };

    setExpenses((prev) => [newExp, ...prev]);
    setTotalExpense((prev) => prev + amt);
    setExpenseName('');
    setExpenseAmount('');
  };

  // Handle Approval / Rejection
  const handleDecision = (decision: 'Approved' | 'Rejected') => {
    if (!selectedRequestToReview) return;
    const req = pendingApprovals.find((r) => r.id === selectedRequestToReview || r.requestTitle === selectedRequestToReview);
    if (!req) return;

    // Remove from pending
    setPendingApprovals((prev) => prev.filter((r) => r.id !== req.id));

    // Add to history
    const historyItem: ApprovalHistoryItem = {
      id: `aph-${Date.now()}`,
      requestTitle: req.requestTitle,
      amount: req.amount,
      status: decision,
      comments: reviewComment.trim() || (decision === 'Approved' ? 'Approved by governance committee.' : 'Rejected per budget constraints.'),
      date: new Date().toISOString().split('T')[0],
    };

    setApprovalHistory((prev) => [historyItem, ...prev]);
    setSelectedRequestToReview('');
    setReviewComment('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Navigation Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Budget &amp; Governance Module</h1>
        </div>

        {/* Subtabs Pill Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['Overview', 'Planning', 'Allocation', 'Expenses', 'Approvals', 'Monitoring', 'Forecast'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Project Manager Read-Only Notice Banner */}
      {currentPersona?.roleType === 'PROJECT_MANAGER' && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-700 text-[24px]">lock</span>
            <div>
              <strong className="block text-sm">Project Manager Budget View (Read-Only)</strong>
              <p className="text-[11px] text-blue-800 mt-0.5">
                Project budgets are established during project creation and submitted for Executive Approval. The Project Manager has read-only access to portfolio budgets. Reallocations or modifications require Executive Manager approval.
              </p>
            </div>
          </div>
          <span className="bg-blue-100 text-blue-900 border border-blue-300 font-mono font-bold text-[10px] uppercase px-3 py-1 rounded-md shrink-0">
            Read-Only Access
          </span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (

        <div className="space-y-6 animate-fadeIn">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Total Budget */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                TOTAL BUDGET
              </span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                ${totalBudget.toLocaleString()}
              </p>
            </div>

            {/* Card 2: Total Expense */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                TOTAL EXPENSE
              </span>
              <p className="text-2xl font-black text-red-600 tracking-tight">
                ${totalExpense.toLocaleString()}
              </p>
            </div>

            {/* Card 3: Remaining Budget */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                REMAINING BUDGET
              </span>
              <p className="text-2xl font-black text-emerald-600 tracking-tight">
                ${remainingBudget.toLocaleString()}
              </p>
            </div>

            {/* Card 4: Budget Utilization */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                BUDGET UTILIZATION
              </span>
              <p className="text-2xl font-black text-blue-600 tracking-tight">
                {budgetUtilization}%
              </p>
            </div>

            {/* Card 5: Budget Status */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                BUDGET STATUS
              </span>
              <p className="text-2xl font-black text-amber-600 tracking-tight">
                Active / Warning
              </p>
            </div>

            {/* Card 6: Budget Alerts */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                BUDGET ALERTS
              </span>
              <p className="text-2xl font-black text-purple-600 tracking-tight">
                2 Active
              </p>
            </div>
          </div>

          {/* Bottom Grid: Recent Expenses & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Recent Expenses */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Recent Expenses</h2>

              <div className="space-y-2">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex justify-between items-center bg-slate-50/70 p-3.5 rounded-lg border border-slate-100 text-xs"
                  >
                    <span className="font-semibold text-slate-700">{exp.name}</span>
                    <span className="font-extrabold text-slate-900">${exp.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Quick Actions</h2>

              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveTab('Planning')}
                  className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-2xs transition-all cursor-pointer text-center block"
                >
                  + New Budget Plan
                </button>
                <button
                  onClick={() => setActiveTab('Expenses')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-lg transition-all cursor-pointer text-center block"
                >
                  Record Expense
                </button>
                <button
                  onClick={() => setActiveTab('Forecast')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-lg transition-all cursor-pointer text-center block"
                >
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLANNING */}
      {activeTab === 'Planning' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h1 className="text-xl font-black text-slate-900">Budget Planning</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create budget plans, assign categories, and manage project timelines.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900">Create Budget Plan</h2>

              <form onSubmit={handleSaveBudgetPlan} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Budget Plan Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Fkn: Phase 1 Core Dev"
                    value={planNameInput}
                    onChange={(e) => setPlanNameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Budget / Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Fkn: PMO Tower"
                    value={projectNameInput}
                    onChange={(e) => setProjectNameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Budget Categories *</label>
                  <input
                    type="text"
                    required
                    placeholder="Fkn: Software &amp; Tools"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Costs ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={estimatedCostInput}
                    onChange={(e) => setEstimatedCostInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Budget Timeline *</label>
                  <input
                    type="date"
                    required
                    value={timelineInput}
                    onChange={(e) => setTimelineInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  Save Budget Plan
                </button>
              </form>
            </div>

            {/* Table Column */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900">Planned Projects &amp; Estimated Costs</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      <th className="py-2.5 px-3">PLAN NAME</th>
                      <th className="py-2.5 px-3">PROJECT NAME</th>
                      <th className="py-2.5 px-3">CATEGORY</th>
                      <th className="py-2.5 px-3">TIMELINE</th>
                      <th className="py-2.5 px-3 text-right">ESTIMATED COST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {budgetPlans.map((bp) => (
                      <tr key={bp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-slate-900">{bp.planName}</td>
                        <td className="py-3.5 px-3 text-slate-600">{bp.projectName}</td>
                        <td className="py-3.5 px-3">
                          <span className="bg-purple-50 text-purple-700 border border-purple-200/60 px-2.5 py-0.5 rounded-md font-bold text-[11px]">
                            {bp.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-500">{bp.timeline}</td>
                        <td className="py-3.5 px-3 text-right font-black text-slate-900">
                          ${bp.estimatedCost.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALLOCATION */}
      {activeTab === 'Allocation' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Table Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Department &amp; Project Allocation</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Project</th>
                    <th className="py-2.5 px-3 text-right">Allocated Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocations.map((al) => (
                    <tr key={al.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{al.department}</td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">{al.projectName}</td>
                      <td className="py-3.5 px-3 text-right font-black text-slate-900">
                        ${al.allocatedAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Update Allocation Form */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Update Allocation</h2>
              <p className="text-xs text-slate-500 mt-0.5">Modify existing budget amounts assigned to specific projects.</p>
            </div>

            <form onSubmit={handleUpdateAllocation} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <select
                value={selectedAllocationProject}
                onChange={(e) => setSelectedAllocationProject(e.target.value)}
                className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600"
              >
                {allocations.map((al) => (
                  <option key={al.id} value={al.projectName}>
                    {al.projectName} ({al.department})
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="New Allocated Amount ($)"
                value={newAllocationAmount}
                onChange={(e) => setNewAllocationAmount(e.target.value)}
                className="w-full sm:flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
              />

              <button
                type="submit"
                className="w-full sm:w-auto bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              >
                Update Allocation
              </button>
            </form>
          </div>

          {/* Allocation History */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Allocation History</h2>
              <p className="text-xs text-slate-500 mt-0.5">Log of previous adjustments and creation records.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Project Name</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Modified By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocationHistory.map((ah) => (
                    <tr key={ah.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 text-slate-700 font-medium">{ah.action}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">{ah.projectName}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">${ah.amount.toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{ah.timestamp}</td>
                      <td className="py-3.5 px-3 text-slate-600 font-semibold">{ah.modifiedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPENSES */}
      {activeTab === 'Expenses' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h1 className="text-xl font-black text-slate-900">Expense Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">Track, record, and log project operational expenses.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900">Record New Expense</h2>
              <form onSubmit={handleRecordExpense} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expense Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Cloud Services"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Software">Software</option>
                    <option value="Design">Design</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  Record Expense
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900">Expense Log History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      <th className="py-2.5 px-3">EXPENSE NAME</th>
                      <th className="py-2.5 px-3">CATEGORY</th>
                      <th className="py-2.5 px-3">DATE</th>
                      <th className="py-2.5 px-3 text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-slate-900">{exp.name}</td>
                        <td className="py-3.5 px-3 text-slate-600 font-medium">{exp.category}</td>
                        <td className="py-3.5 px-3 font-mono text-slate-500">{exp.date}</td>
                        <td className="py-3.5 px-3 text-right font-black text-red-600">
                          ${exp.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: APPROVALS */}
      {activeTab === 'Approvals' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Pending Approvals Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Pending Approvals</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3">Request Title</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingApprovals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 font-semibold">
                        No pending budget approval requests.
                      </td>
                    </tr>
                  ) : (
                    pendingApprovals.map((pa) => (
                      <tr key={pa.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-slate-900">{pa.requestTitle}</td>
                        <td className="py-3.5 px-3 text-slate-600">{pa.department}</td>
                        <td className="py-3.5 px-3">
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md font-bold text-[11px]">
                            {pa.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-slate-900">
                          ${pa.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Review Request Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Review Request</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select a pending request to approve, reject, and add review comments.</p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={selectedRequestToReview}
                  onChange={(e) => setSelectedRequestToReview(e.target.value)}
                  className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600"
                >
                  <option value="">Select Request to Review</option>
                  {pendingApprovals.map((pa) => (
                    <option key={pa.id} value={pa.requestTitle}>
                      {pa.requestTitle} (${pa.amount.toLocaleString()})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Add comments / reasons..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full sm:flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDecision('Rejected')}
                  className="px-5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Reject Budget
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('Approved')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  Approve Budget
                </button>
              </div>
            </div>
          </div>

          {/* Approval History */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Approval History</h2>
              <p className="text-xs text-slate-500 mt-0.5">Log of past decisions and review notes.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3">Request Title</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Comments</th>
                    <th className="py-2.5 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvalHistory.map((aph) => (
                    <tr key={aph.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{aph.requestTitle}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">${aph.amount.toLocaleString()}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                            aph.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {aph.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{aph.comments}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-500">{aph.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MONITORING */}
      {activeTab === 'Monitoring' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                REMAINING BUDGET
              </span>
              <p className="text-2xl font-black text-emerald-600 tracking-tight">${remainingBudget.toLocaleString()}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Overall utilization rate is at {budgetUtilization}%</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                MONTHLY SUMMARY
              </span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">${totalExpense.toLocaleString()} Spent</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Tracked across all active departments and projects.</p>
            </div>
          </div>

          {/* Overspending Alerts */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Overspending Alerts</h2>

            <div className="space-y-3">
              <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Cloud Infrastructure</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Utilization has exceeded 85% of allocated limit.</p>
                </div>
                <span className="bg-amber-100 text-amber-800 font-bold text-[11px] px-3 py-1 rounded-md border border-amber-300">
                  Warning
                </span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Marketing &amp; Ads</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Approaching monthly spending threshold.</p>
                </div>
                <span className="bg-amber-100/80 text-amber-800 font-bold text-[11px] px-3 py-1 rounded-md border border-amber-200">
                  Info
                </span>
              </div>
            </div>
          </div>

          {/* Spending Trends */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Spending Trends</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">May</span>
                <p className="text-xl font-black text-slate-900">$34,000</p>
                <span className="text-[11px] font-bold text-emerald-600 block">Stable Trend</span>
              </div>

              <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">June</span>
                <p className="text-xl font-black text-slate-900">$41,000</p>
                <span className="text-[11px] font-bold text-amber-600 block">High Trend</span>
              </div>

              <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">July</span>
                <p className="text-xl font-black text-slate-900">$42,750</p>
                <span className="text-[11px] font-bold text-red-600 block">Critical Trend</span>
              </div>
            </div>
          </div>

          {/* Budget Forecast */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Budget Forecast</h2>
              <p className="text-xs text-slate-500 mt-0.5">Projected spending estimates and anticipated variances.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Projected Spend</th>
                    <th className="py-2.5 px-3 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">Q3 Forecast</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">$135,000</td>
                    <td className="py-3.5 px-3 text-right font-black text-blue-600">+$10,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: FORECAST */}
      {activeTab === 'Forecast' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Budget Forecast &amp; Financial Report</h1>
            <p className="text-xs text-slate-500">
              Comprehensive forecast summary analyzing department variances and upcoming expenditure projections.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Department Variance Analysis</h2>
              <p className="text-xs text-slate-500 mt-0.5">Comparison between active allocations and forecasted expenses.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Current Allocation</th>
                    <th className="py-2.5 px-3">Projected Expense</th>
                    <th className="py-2.5 px-3 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">Cloud &amp; Infrastructure</td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">$45,000</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">$48,000</td>
                    <td className="py-3.5 px-3 text-right font-black text-red-600">+$3,000</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">Design &amp; Software</td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">$30,000</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">$27,500</td>
                    <td className="py-3.5 px-3 text-right font-black text-emerald-600">-$2,500</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">Human Resources</td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">$35,000</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">$35,000</td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-500">$0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
