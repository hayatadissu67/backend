import React, { useState, useEffect } from 'react';
import { BudgetItem, Project } from '../types';
import { fetchProjectsFromApi, fetchBudgetsFromApi, createBudgetApi, updateBudgetApi, deleteBudgetApi, approveBudgetApi, rejectBudgetApi, fetchAllocationsFromApi, updateAllocationApi, fetchExpensesFromApi, createExpenseApi, fetchBudgetOverviewFromApi } from '../services/api';

interface BudgetViewProps {
  budgets?: BudgetItem[];
  projects?: Project[];
  onUpdateBudget?: (budgetId: string, allocated: number, spent: number) => void;
  onApproveProject?: (projectId: string) => void;
  onRejectProject?: (projectId: string, reason: string) => void;
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
  status: 'pending' | 'approved' | 'rejected';
}

interface ProjectAllocation {
  id: string;
  department: string;
  projectName: string;
  allocatedAmount: number;
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

const budgetCategoryOptions = [
  'Infrastructure',
  'Software & Tools',
  'Human Resources',
  'Design',
  'Operations',
];

const normalizeBudgetPlan = (budget: any, projectLookup: Record<string, Project>): BudgetPlan => {
  const projectId = budget?.projectId ?? budget?.project_id;
  const projectName = budget?.projectName || projectLookup[String(projectId)]?.name || 'Unknown Project';
  return {
    id: String(budget?.id ?? `bp-${Date.now()}`),
    planName: budget?.planName || budget?.description || `Budget Plan ${budget?.id ?? ''}`,
    projectName,
    category: budget?.category || 'Infrastructure',
    timeline: budget?.timeline || new Date().toISOString().split('T')[0],
    estimatedCost: Number(budget?.amount ?? budget?.estimatedCost ?? 0),
    status: String(budget?.status || 'pending').toLowerCase() as BudgetPlan['status'],
  };
};

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  projects = [],
  onApproveProject,
  onRejectProject,
  currentPersona,
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('Overview');
  const [projectOptions, setProjectOptions] = useState<Project[]>(projects);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [editingBudgetPlan, setEditingBudgetPlan] = useState<BudgetPlan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [planNameInput, setPlanNameInput] = useState('');
  const [projectNameInput, setProjectNameInput] = useState(projects[0]?.name || '');
  const [categoryInput, setCategoryInput] = useState('Infrastructure');
  const [estimatedCostInput, setEstimatedCostInput] = useState('');
  const [timelineInput, setTimelineInput] = useState('');

  // Allocation State
  const [allocations, setAllocations] = useState<ProjectAllocation[]>([]);
  const [selectedAllocationProject, setSelectedAllocationProject] = useState<string>('PMO Tower');
  const [newAllocationAmount, setNewAllocationAmount] = useState<string>('');

  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseProjectId, setExpenseProjectId] = useState(projects[0]?.id || '');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseCategory, setExpenseCategory] = useState('Infrastructure');
  const [expenseError, setExpenseError] = useState('');

  // Approvals State
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [selectedRequestToReview, setSelectedRequestToReview] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistoryItem[]>([]);
  const [overviewTotals, setOverviewTotals] = useState({ totalBudget: 0, totalExpense: 0 });

  useEffect(() => {
    if (projects && projects.length > 0) {
      setProjectOptions(projects);
      setProjectNameInput((prev) => prev || projects[0].name);
      setExpenseProjectId((prev) => prev || projects[0].id);
    } else {
      let isMounted = true;
      fetchProjectsFromApi().then((apiProjects) => {
        if (!isMounted || !apiProjects || apiProjects.length === 0) return;
        setProjectOptions(apiProjects);
        setProjectNameInput((prev) => prev || apiProjects[0].name);
        setExpenseProjectId((prev) => prev || apiProjects[0].id);
      }).catch((err) => {
        console.warn('Failed to load projects for budget planning:', err);
      });

      return () => {
        isMounted = false;
      };
    }
  }, [projects]);

  useEffect(() => {
    if (projectOptions.length > 0 && !projectOptions.some((project) => String(project.id) === String(expenseProjectId))) {
      setExpenseProjectId(projectOptions[0].id);
    }
  }, [projectOptions, expenseProjectId]);

  useEffect(() => {
    let isMounted = true;
    fetchBudgetOverviewFromApi().then((overview) => {
      if (isMounted && overview) setOverviewTotals(overview);
    });
    return () => {
      isMounted = false;
    };
  }, [projects, budgets]);

  useEffect(() => {
    const projectLookup = Object.fromEntries(projectOptions.map((project) => [String(project.id), project]));

    if (budgets && budgets.length > 0) {
      setBudgetPlans(budgets.map((budget) => normalizeBudgetPlan(budget, projectLookup)));
      return;
    }

    let isMounted = true;
    fetchBudgetsFromApi().then((apiBudgets) => {
      if (!isMounted || !apiBudgets || apiBudgets.length === 0) return;
      setBudgetPlans(apiBudgets.map((budget) => normalizeBudgetPlan(budget, projectLookup)));
    }).catch((err) => {
      console.warn('Failed to fetch saved budget plans:', err);
    });

    return () => {
      isMounted = false;
    };
  }, [budgets, projectOptions]);

  useEffect(() => {
    let isMounted = true;
    fetchAllocationsFromApi().then((apiAllocations) => {
      if (!isMounted || !apiAllocations) return;
      setAllocations(apiAllocations.map((allocation: any) => ({
        id: String(allocation.id),
        department: allocation.project?.department || projectOptions.find((project) => String(project.id) === String(allocation.projectId || allocation.project_id))?.department || 'Unassigned',
        projectName: allocation.project?.name || projectOptions.find((project) => String(project.id) === String(allocation.projectId || allocation.project_id))?.name || 'Unknown Project',
        allocatedAmount: Number(allocation.amount) || 0,
      })));
    });
    fetchExpensesFromApi().then((apiExpenses) => {
      if (!isMounted || !apiExpenses) return;
      setExpenses(apiExpenses.map((expense: any) => ({
        id: String(expense.id),
        name: expense.name,
        amount: Number(expense.amount) || 0,
        date: expense.date,
        category: expense.category,
      })));
    });
    return () => {
      isMounted = false;
    };
  }, [projects]);

  useEffect(() => {
    if (allocations.length > 0 && !allocations.some((allocation) => allocation.projectName === selectedAllocationProject)) {
      setSelectedAllocationProject(allocations[0].projectName);
    }
  }, [allocations, selectedAllocationProject]);

  useEffect(() => {
    const projectApprovals: PendingApproval[] = projects
      .map((project) => ({
        id: String(project.id),
        requestTitle: `${project.name} - Initial Budget`,
        department: project.department,
        status: project.approvalStatus === 'APPROVED'
          ? 'Approved'
          : project.approvalStatus === 'REJECTED'
            ? 'Rejected'
            : 'Pending',
        amount: Number(project.budget) || 0,
      }));

    setPendingApprovals(projectApprovals);
  }, [projects]);

  // KPI Overall State
  const totalBudget = overviewTotals.totalBudget;
  const totalExpense = overviewTotals.totalExpense;

  const remainingBudget = totalBudget - totalExpense;
  const budgetUtilization = ((totalExpense / totalBudget) * 100).toFixed(1);

  const [budgetFormError, setBudgetFormError] = useState('');

  // Handle Save Budget Plan
  const handleSaveBudgetPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = Number(estimatedCostInput);
    const planName = planNameInput.trim();
    if (!planName || /^\d+(?:\.\d+)?$/.test(planName)) {
      setBudgetFormError('Plan Name must contain text and cannot be only numbers.');
      return;
    }
    if (!projectNameInput.trim() || !categoryInput.trim() || !timelineInput) {
      setBudgetFormError('Complete all required fields.');
      return;
    }
    if (!Number.isFinite(cost) || cost <= 0) {
      setBudgetFormError('Amount must be a valid positive number.');
      return;
    }
    setBudgetFormError('');

    const selectedProject = projectOptions.find((project) => project.name === projectNameInput.trim()) || projectOptions[0];
    const payload = {
      projectId: selectedProject?.id || null,
      projectName: selectedProject?.name || projectNameInput.trim() || 'PMO Tower',
      planName,
      category: categoryInput.trim() || 'Infrastructure',
      timeline: timelineInput || new Date().toISOString().split('T')[0],
      amount: cost,
      description: `${planName} - ${categoryInput}`,
      status: 'pending',
    };

    try {
      const createdPlan = await createBudgetApi(payload);
      if (!createdPlan) {
        throw new Error('The budget plan was not saved.');
      }

      const projectLookup = Object.fromEntries(projectOptions.map((project) => [String(project.id), project]));
      const normalizedPlan = normalizeBudgetPlan(createdPlan, projectLookup);
      setBudgetPlans((prev) => [normalizedPlan, ...prev.filter((bp) => bp.id !== normalizedPlan.id)]);

      const refreshedBudgets = await fetchBudgetsFromApi();
      if (refreshedBudgets) {
        setBudgetPlans(refreshedBudgets.map((budget) => normalizeBudgetPlan(budget, projectLookup)));
      }
    } catch (err: any) {
      console.warn('Budget plan save failed via API:', err);
      setBudgetFormError(err.message || 'Failed to save budget plan.');
      return;
    }

    setPlanNameInput('');
    setProjectNameInput(projectOptions[0]?.name || '');
    setCategoryInput('Infrastructure');
    setEstimatedCostInput('');
    setTimelineInput('');
  };

  const handleUpdateBudgetPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudgetPlan) return;

    const selectedProject = projectOptions.find((project) => project.name === editingBudgetPlan.projectName.trim()) || projectOptions[0];
    const payload = {
      projectId: selectedProject?.id || null,
      projectName: editingBudgetPlan.projectName.trim() || 'PMO Tower',
      planName: editingBudgetPlan.planName.trim() || 'Untitled Budget Plan',
      category: editingBudgetPlan.category || 'Infrastructure',
      timeline: editingBudgetPlan.timeline || new Date().toISOString().split('T')[0],
      amount: Number(editingBudgetPlan.estimatedCost) || 0,
      description: `${editingBudgetPlan.planName.trim()} - ${editingBudgetPlan.category}`,
      status: 'pending',
    };

    try {
      const updatedBudget = await updateBudgetApi(editingBudgetPlan.id, payload);
      const normalizedPlan = updatedBudget ? normalizeBudgetPlan(updatedBudget, Object.fromEntries(projectOptions.map((project) => [String(project.id), project]))) : {
        ...editingBudgetPlan,
        planName: editingBudgetPlan.planName.trim() || 'Untitled Budget Plan',
        projectName: editingBudgetPlan.projectName.trim() || 'PMO Tower',
        category: editingBudgetPlan.category || 'Infrastructure',
        timeline: editingBudgetPlan.timeline || new Date().toISOString().split('T')[0],
        estimatedCost: Number(editingBudgetPlan.estimatedCost) || 0,
      };

      setBudgetPlans((prev) => prev.map((bp) => bp.id === normalizedPlan.id ? normalizedPlan : bp));
    } catch (err) {
      console.warn('Failed to update budget plan via API:', err);
    }

    setEditingBudgetPlan(null);
  };

  const handleDeleteBudgetPlan = async (id: string) => {
    try {
      await deleteBudgetApi(id);
      setBudgetPlans((prev) => prev.filter((bp) => bp.id !== id));
    } catch (err) {
      console.warn('Failed to delete budget plan via API:', err);
      setBudgetPlans((prev) => prev.filter((bp) => bp.id !== id));
    }
    setDeletingPlanId(null);
  };

  const handleBudgetApproval = async (id: string, decision: 'approved' | 'rejected') => {
    try {
      const updatedBudget = decision === 'approved'
        ? await approveBudgetApi(id)
        : await rejectBudgetApi(id);
      if (!updatedBudget) throw new Error(`Budget ${decision} was not saved.`);

      const projectLookup = Object.fromEntries(projectOptions.map((project) => [String(project.id), project]));
      setBudgetPlans((prev) => prev.map((plan) => (
        plan.id === id ? normalizeBudgetPlan(updatedBudget, projectLookup) : plan
      )));

      const refreshedBudgets = await fetchBudgetsFromApi();
      if (refreshedBudgets) {
        setBudgetPlans(refreshedBudgets.map((budget) => normalizeBudgetPlan(budget, projectLookup)));
      }
    } catch (err: any) {
      alert(err.message || `Failed to ${decision} budget.`);
    }
  };

  // Handle Update Allocation
  const handleUpdateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newAllocationAmount);
    const selectedAllocation = allocations.find((allocation) => allocation.projectName === selectedAllocationProject);
    if (!selectedAllocation || !Number.isFinite(amount) || amount <= 0) return;
    if (currentPersona?.roleType !== 'EXECUTIVE_MANAGER' && amount > 999999999) {
      alert('Allocation amounts over $999,999,999 require Executive Manager authorization.');
      return;
    }

    try {
      const savedAllocation = await updateAllocationApi(selectedAllocation.id, amount);
      if (!savedAllocation) return;

      setAllocations((prev) =>
        prev.map((al) => (al.id === selectedAllocation.id ? { ...al, allocatedAmount: amount } : al))
      );

      setNewAllocationAmount('');
    } catch (err: any) {
      alert(err.message || 'Failed to update allocation.');
    }
  };

  // Handle Record Expense
  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError('');
    const normalizedExpenseName = expenseName.trim();
    if (!normalizedExpenseName) {
      setExpenseError('Expense name is required.');
      return;
    }
    if (/^\d+(?:\.\d+)?$/.test(normalizedExpenseName)) {
      setExpenseError('Expense Item Name must contain text and cannot be only numbers.');
      return;
    }
    const amt = parseFloat(expenseAmount) || 0;
    const projectId = expenseProjectId;
    if (!projectId) {
      setExpenseError('A project is required before recording an expense.');
      return;
    }
    if (amt <= 0) {
      setExpenseError('Amount must be a valid positive number.');
      return;
    }
    if (!expenseDate) {
      setExpenseError('Expense date is required.');
      return;
    }

    try {
      const savedExpense = await createExpenseApi({
        projectId,
        name: normalizedExpenseName,
        amount: amt,
        date: expenseDate,
        category: expenseCategory,
      });
      if (!savedExpense) throw new Error('The expense was not saved.');

      const refreshedExpenses = await fetchExpensesFromApi();
      if (refreshedExpenses) {
        setExpenses(refreshedExpenses.map((expense: any) => ({
          id: String(expense.id),
          name: expense.name,
          amount: Number(expense.amount) || 0,
          date: expense.date,
          category: expense.category,
        })));
      }
      setExpenseName('');
      setExpenseAmount('');
      setExpenseProjectId(projectOptions[0]?.id || '');
      setExpenseDate(new Date().toISOString().split('T')[0]);
    } catch (err: any) {
      setExpenseError(err.response?.data?.message || err.message || 'Failed to save expense.');
    }
  };

  // Handle Approval / Rejection
  const handleDecision = (decision: 'Approved' | 'Rejected') => {
    if (!selectedRequestToReview) return;
    const req = pendingApprovals.find((r) => r.id === selectedRequestToReview || r.requestTitle === selectedRequestToReview);
    if (!req) return;

    handleProjectApprovalAction(req.id, decision);

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

  const handleProjectApprovalAction = (projectId: string, decision: 'Approved' | 'Rejected') => {
    const reason = reviewComment.trim() || 'Rejected from Budget Approvals.';

    if (decision === 'Approved') {
      onApproveProject?.(projectId);
    } else {
      onRejectProject?.(projectId, reason);
    }

    setPendingApprovals((prev) => prev.map((approval) => (
      approval.id === projectId ? { ...approval, status: decision } : approval
    )));
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
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === tab
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

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Quick Actions</h2>

              {currentPersona?.roleType !== 'EXECUTIVE_MANAGER' && (
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
              )}
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
            {/* Create Plan Form - Hidden for Project Managers */}
            {currentPersona?.roleType !== 'PROJECT_MANAGER' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
                <h2 className="text-sm font-extrabold text-slate-900">Create New Budget Plan</h2>
                <form onSubmit={handleSaveBudgetPlan} className="space-y-3.5">
                  {budgetFormError && <p className="text-xs font-semibold text-red-600" role="alert">{budgetFormError}</p>}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Plan Name *</label>
                    <input
                      type="text"
                      required
                      pattern=".*[A-Za-z].*"
                      title="Enter a plan name containing text; numbers alone are not allowed."
                      placeholder="e.g. Q1 Expansion"
                      value={planNameInput}
                      onChange={(e) => setPlanNameInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Project Budget / Project Name *</label>
                    <select
                      required
                      value={projectNameInput}
                      onChange={(e) => setProjectNameInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                    >
                      {projectOptions.length === 0 ? (
                        <option value="">No projects available</option>
                      ) : (
                        projectOptions.map((project) => (
                          <option key={project.id} value={project.name}>
                            {project.name} ({project.code})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Budget Categories *</label>
                    <select
                      required
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                    >
                      {budgetCategoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Costs ($) *</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
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
                      min={new Date().toISOString().split('T')[0]}
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
            )}

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
                      {currentPersona?.roleType !== 'PROJECT_MANAGER' && (
                        <th className="py-2.5 px-3 text-right">ACTIONS</th>
                      )}
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
                        {currentPersona?.roleType !== 'PROJECT_MANAGER' && (
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-3 font-semibold text-xs">
                              <button
                                onClick={() => setEditingBudgetPlan(bp)}
                                className="text-amber-600 hover:text-amber-800 hover:underline cursor-pointer transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeletingPlanId(bp.id)}
                                className="text-red-600 hover:text-red-800 hover:underline cursor-pointer transition-colors"
                              >
                                Delete
                              </button>
                              {currentPersona?.roleType === 'EXECUTIVE_MANAGER' && bp.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleBudgetApproval(bp.id, 'approved')}
                                    className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleBudgetApproval(bp.id, 'rejected')}
                                    className="text-red-600 hover:text-red-800 hover:underline cursor-pointer transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingBudgetPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base">Edit Budget Plan</h3>
                <p className="text-xs text-slate-300 mt-0.5">Update the selected project budget plan.</p>
              </div>
              <button
                onClick={() => setEditingBudgetPlan(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateBudgetPlan} className="p-5 space-y-4 overflow-y-auto custom-scroll">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={editingBudgetPlan.planName}
                  onChange={(e) => setEditingBudgetPlan({ ...editingBudgetPlan, planName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Budget / Project Name *</label>
                <select
                  required
                  value={editingBudgetPlan.projectName}
                  onChange={(e) => setEditingBudgetPlan({ ...editingBudgetPlan, projectName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                >
                  {projectOptions.length === 0 ? (
                    <option value="">No projects available</option>
                  ) : (
                    projectOptions.map((project) => (
                      <option key={project.id} value={project.name}>
                        {project.name} ({project.code})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Budget Categories *</label>
                <select
                  required
                  value={editingBudgetPlan.category}
                  onChange={(e) => setEditingBudgetPlan({ ...editingBudgetPlan, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                >
                  {budgetCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Costs ($) *</label>
                  <input
                    type="number"
                    required
                    value={editingBudgetPlan.estimatedCost}
                    onChange={(e) => setEditingBudgetPlan({ ...editingBudgetPlan, estimatedCost: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Budget Timeline *</label>
                  <input
                    type="date"
                    required
                    value={editingBudgetPlan.timeline}
                    onChange={(e) => setEditingBudgetPlan({ ...editingBudgetPlan, timeline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBudgetPlan(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingPlanId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5">
              <h3 className="font-extrabold text-base text-slate-900">Delete Budget Plan?</h3>
              <p className="text-xs text-slate-600 mt-2">Are you sure you want to remove this budget plan from your project planning list?</p>
            </div>

            <div className="flex justify-end gap-3 bg-slate-50 p-4 border-t border-slate-200">
              <button
                onClick={() => setDeletingPlanId(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBudgetPlan(deletingPlanId)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                Delete
              </button>
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

          {/* Update Allocation Form - Hidden for Project Managers */}
          {currentPersona?.roleType !== 'PROJECT_MANAGER' && (
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
          )}

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
            {currentPersona?.roleType !== 'PROJECT_MANAGER' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
                <h2 className="text-sm font-extrabold text-slate-900">Record New Expense</h2>
                <form onSubmit={handleRecordExpense} className="space-y-3.5">
                  {expenseError && <p className="text-xs font-semibold text-red-600" role="alert">{expenseError}</p>}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
                    <select
                      required
                      value={expenseProjectId}
                      onChange={(e) => setExpenseProjectId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600"
                    >
                      <option value="">Select a project</option>
                      {projectOptions.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name} ({project.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expense Item Name *</label>
                    <input
                      type="text"
                      required
                      pattern=".*[A-Za-z].*"
                      title="Enter an expense name containing text; numbers alone are not allowed."
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expense Date *</label>
                    <input
                      type="date"
                      required
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
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
            )}

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
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-xs text-slate-400">No saved expenses found.</td>
                      </tr>
                    ) : expenses.map((exp) => (
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
                    {currentPersona?.roleType !== 'PROJECT_MANAGER' && (
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingApprovals.length === 0 ? (
                    <tr>
                      <td colSpan={currentPersona?.roleType !== 'PROJECT_MANAGER' ? 5 : 4} className="py-6 text-center text-slate-400 font-semibold">
                        No budget approval requests.
                      </td>
                    </tr>
                  ) : (
                    pendingApprovals.map((pa) => (
                      <tr key={pa.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-slate-900">{pa.requestTitle}</td>
                        <td className="py-3.5 px-3 text-slate-600">{pa.department}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${pa.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : pa.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                            {pa.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-slate-900">
                          ${pa.amount.toLocaleString()}
                        </td>
                        {currentPersona?.roleType !== 'PROJECT_MANAGER' && (
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-3 font-semibold">
                              {pa.status === 'Pending' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleProjectApprovalAction(pa.id, 'Rejected')}
                                    className="text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleProjectApprovalAction(pa.id, 'Approved')}
                                    className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                </>
                              ) : (
                                <span className="text-slate-400">Completed</span>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
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
