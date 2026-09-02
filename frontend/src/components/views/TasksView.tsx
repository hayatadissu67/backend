import React, { useState, useEffect } from 'react';
import { TaskItem, TaskItemComment, Project, UserItem, LoggedInPersona, RiskItem, Severity } from '../../types';

interface TasksViewProps {
  tasks: TaskItem[];
  projects?: Project[];
  users?: UserItem[];
  risks?: RiskItem[];
  onAddTask: (task: TaskItem) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskItem['status']) => void;
  onUpdateTask?: (task: TaskItem) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddRisk?: (risk: RiskItem) => void;
  currentPersona?: LoggedInPersona;
  onNotifyPM?: (task: TaskItem, memberName: string, notes?: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  projects = [],
  users = [],
  risks = [],
  onAddTask,
  onUpdateTaskStatus,
  onUpdateTask,
  onDeleteTask,
  onAddRisk,
  currentPersona,
  onNotifyPM
}) => {

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<
    | 'Overview'
    | 'My Tasks'
    | 'Task List'
    | 'Create Task'
    | 'Assign Members'
    | 'Kanban Board'
    | 'Calendar & Deadlines'
    | 'Reports'
  >(currentPersona && currentPersona.roleType !== 'PROJECT_MANAGER' && currentPersona.roleType !== 'EXECUTIVE_MANAGER' ? 'My Tasks' : 'Overview');

  // Developer Workspace Active User
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>(
    currentPersona ? currentPersona.name : 'M. Thompson'
  );

  useEffect(() => {
    if (currentPersona) {
      setSelectedDeveloper(currentPersona.name);
      if (currentPersona.roleType !== 'PROJECT_MANAGER' && currentPersona.roleType !== 'EXECUTIVE_MANAGER') {
        setActiveTab('My Tasks');
      }
    }
  }, [currentPersona]);

  // Filters
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [quickUpdateTask, setQuickUpdateTask] = useState<TaskItem | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');

  // Form State (for Create Task)
  const [title, setTitle] = useState<string>('');
  const [projectCode, setProjectCode] = useState<string>(projects[0]?.code || 'PRJ-DELTA');
  const [assignee, setAssignee] = useState<string>('M. Thompson');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [estimatedHours, setEstimatedHours] = useState<number>(20);
  const startDate = new Date().toISOString().split('T')[0];
  const [description, setDescription] = useState<string>('');
  const [initialStatus, setInitialStatus] = useState<TaskItem['status']>('Backlog');

  // Report Risk to PM State (Team Member Feature)
  const [showReportRiskModal, setShowReportRiskModal] = useState<boolean>(false);
  const [riskSubject, setRiskSubject] = useState<string>('');
  const [riskDescription, setRiskDescription] = useState<string>('');
  const [riskProject, setRiskProject] = useState<string>(projects[0]?.code || 'PMO-101');
  const [riskSeverity, setRiskSeverity] = useState<Severity>('HIGH');
  const [riskCategory, setRiskCategory] = useState<'Risk' | 'Issue'>('Issue');
  const [viewingResolutionRisk, setViewingResolutionRisk] = useState<RiskItem | null>(null);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReportRiskToPM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskSubject.trim()) return;

    if (onAddRisk) {
      const newRisk: RiskItem = {
        id: `r-${Date.now()}`,
        ref: `${riskCategory === 'Risk' ? 'R' : 'I'}-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: riskSubject,
        description: riskDescription,
        severity: riskSeverity,
        category: riskCategory,
        projectRef: riskProject,
        owner: 'Alex Rivers (Project Manager)',
        assignedProjectManager: 'Alex Rivers (Project Manager)',
        flaggedBy: `${currentPersona?.name || selectedDeveloper} (Team Member)`,
        submittedBy: currentPersona?.email || 'team@pmo.com',
        status: 'REPORTED',
        createdDate: new Date().toISOString().split('T')[0]
      };
      onAddRisk(newRisk);
      setShowReportRiskModal(false);
      setRiskSubject('');
      setRiskDescription('');
      showToast(`✓ ${riskCategory} submitted to Project Manager successfully`);
    }
  };


  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedProject = projects.find((p) => p.code === projectCode);

    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title,
      projectCode,
      projectName: matchedProject ? matchedProject.name : projectCode,
      assignee,
      status: initialStatus,
      priority,
      dueDate,
      startDate,
      progress: initialStatus === 'Done' ? 100 : 0,
      estimatedHours: Number(estimatedHours) || 16,
      hoursLogged: 0,
      description: description || 'Task assigned by Project Manager.',
      comments: []
    };

    onAddTask(newTask);
    showToast(`Task "${title}" created and assigned to ${assignee}!`);
    
    // Reset form
    setTitle('');
    setDescription('');
    setShowAddModal(false);

    // If on Create Task tab, switch to Kanban or My Tasks
    if (activeTab === 'Create Task') {
      setActiveTab('Task List');
    }
  };

  const handleProgressChange = (task: TaskItem, newProgress: number) => {
    let newStatus = task.status;
    if (newProgress === 100) newStatus = 'Done';
    else if (newProgress > 0 && task.status === 'Backlog') newStatus = 'In Progress';

    const updated: TaskItem = {
      ...task,
      progress: newProgress,
      status: newStatus
    };

    if (onUpdateTask) {
      onUpdateTask(updated);
    } else {
      onUpdateTaskStatus(task.id, newStatus);
    }
    showToast(`Updated progress for "${task.title}" to ${newProgress}%`);
  };

  const handleStatusChange = (task: TaskItem, newStatus: TaskItem['status']) => {
    let newProg = task.progress ?? 0;
    if (newStatus === 'Done') newProg = 100;
    else if (newStatus === 'Backlog') newProg = 0;

    const updated: TaskItem = {
      ...task,
      status: newStatus,
      progress: newProg
    };

    if (onUpdateTask) {
      onUpdateTask(updated);
    } else {
      onUpdateTaskStatus(task.id, newStatus);
    }
    showToast(`Task status updated to ${newStatus}`);
  };

  const handleAddComment = (task: TaskItem) => {
    if (!newCommentText.trim()) return;

    const commentObj: TaskItemComment = {
      id: `c-${Date.now()}`,
      author: selectedDeveloper || 'Project Member',
      text: newCommentText.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated: TaskItem = {
      ...task,
      comments: [...(task.comments || []), commentObj]
    };

    if (onUpdateTask) {
      onUpdateTask(updated);
    }

    if (quickUpdateTask && quickUpdateTask.id === task.id) {
      setQuickUpdateTask(updated);
    }

    setNewCommentText('');
    showToast('Developer comment added');
  };

  const handleLogHours = (task: TaskItem, addedHours: number) => {
    const updated: TaskItem = {
      ...task,
      hoursLogged: (task.hoursLogged || 0) + addedHours
    };
    if (onUpdateTask) {
      onUpdateTask(updated);
    }
    if (quickUpdateTask && quickUpdateTask.id === task.id) {
      setQuickUpdateTask(updated);
    }
    showToast(`Logged ${addedHours} hours on task`);
  };

  // Helper calculation functions
  const isOverdue = (task: TaskItem): boolean => {
    if (task.status === 'Done') return false;
    const today = '2026-07-30';
    return task.dueDate < today;
  };

  const totalTasksCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'Backlog').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Done').length;
  const blockedCount = tasks.filter((t) => t.status === 'Blocked').length;
  const overdueCount = tasks.filter((t) => isOverdue(t)).length;

  const overallAvgProgress = totalTasksCount > 0
    ? Math.round(tasks.reduce((sum, t) => sum + (t.progress ?? (t.status === 'Done' ? 100 : 0)), 0) / totalTasksCount)
    : 0;

  // Filtered tasks for general list and board
  const filteredTasks = tasks.filter((t) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterProject !== 'ALL' && t.projectCode !== filterProject) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchAssignee = t.assignee.toLowerCase().includes(q);
      const matchProject = (t.projectName || t.projectCode).toLowerCase().includes(q);
      if (!matchTitle && !matchAssignee && !matchProject) return false;
    }
    return true;
  });

  const kanbanColumns: { status: TaskItem['status']; title: string; color: string; border: string; icon: string }[] = [
    { status: 'Backlog', title: 'To Do / Backlog', color: 'bg-slate-100 text-slate-800', border: 'border-slate-300', icon: 'list_alt' },
    { status: 'In Progress', title: 'In Progress', color: 'bg-blue-100 text-blue-900', border: 'border-blue-300', icon: 'directions_run' },
    { status: 'Blocked', title: 'Blocked', color: 'bg-red-100 text-red-900', border: 'border-red-300', icon: 'block' },
    { status: 'Review', title: 'In Review', color: 'bg-amber-100 text-amber-900', border: 'border-amber-300', icon: 'rate_review' },
    { status: 'Done', title: 'Completed', color: 'bg-emerald-100 text-emerald-900', border: 'border-emerald-300', icon: 'task_alt' }
  ];

  // List of unique assignees
  const assigneeList: string[] = (Array.from(new Set(tasks.map((t) => t.assignee))).filter(Boolean) as string[]);
  if (users.length > 0) {
    users.forEach((u) => {
      if (!assigneeList.includes(u.name)) assigneeList.push(u.name);
    });
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#00174b] text-white px-4 py-2.5 rounded-sm shadow-xl flex items-center gap-2 border border-blue-400 text-xs font-bold animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>PMO PORTFOLIO HUB</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b] font-extrabold">TASK MANAGEMENT DIRECTORY</span>
          </nav>
          <h2 className="text-[26px] font-black tracking-tight text-[#191c1e] flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-700 text-[30px]">assignment_turned_in</span>
            Task Management Directory
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track, assign, and organize team productivity across active projects. Manage deadlines, progress %, and developer work logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentPersona?.roleType !== 'TEAM_MEMBER' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5 shadow-md transition-all transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Create New Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar (Matching User's Specs) */}
      <div className="bg-slate-100/90 p-1.5 rounded-sm border border-slate-200 flex flex-wrap gap-1 text-xs font-bold">
        {[
          { key: 'Overview', label: 'Overview', icon: 'grid_view' },
          { key: 'My Tasks', label: 'My Tasks', icon: 'badge' },
          { key: 'Task List', label: 'Task List', icon: 'format_list_bulleted' },
          { key: 'Create Task', label: 'Create Task', icon: 'add_task' },
          { key: 'Assign Members', label: 'Assign Members', icon: 'group_add' },
          { key: 'Kanban Board', label: 'Kanban Board', icon: 'view_kanban' },
          { key: 'Calendar & Deadlines', label: 'Calendar & Deadlines', icon: 'event' },
          { key: 'Reports', label: 'Reports', icon: 'assessment' }
        ].filter(tab => {
          if (currentPersona?.roleType === 'TEAM_MEMBER') {
            return tab.key !== 'Create Task' && tab.key !== 'Assign Members';
          }
          return true;
        }).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-xs transition-all flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-white text-[#00174b] shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Metrics Cards Grid (Exactly matching user screenshot) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* TOTAL TASKS */}
            <div className="bg-white border border-slate-200/90 p-3.5 rounded-sm shadow-2xs space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">TOTAL TASKS</span>
              <p className="text-3xl font-black text-blue-700 font-mono">{totalTasksCount}</p>
            </div>

            {/* TO DO */}
            <div className="bg-white border border-slate-200/90 p-3.5 rounded-sm shadow-2xs space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">TO DO</span>
              <p className="text-3xl font-black text-slate-700 font-mono">{todoCount}</p>
            </div>

            {/* COMPLETED */}
            <div className="bg-white border border-slate-200/90 p-3.5 rounded-sm shadow-2xs space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">COMPLETED</span>
              <p className="text-3xl font-black text-emerald-600 font-mono">{completedCount}</p>
            </div>

            {/* IN PROGRESS */}
            <div className="bg-white border border-slate-200/90 p-3.5 rounded-sm shadow-2xs space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">IN PROGRESS</span>
              <p className="text-3xl font-black text-amber-500 font-mono">{inProgressCount}</p>
            </div>

            {/* BLOCKED */}
            <div className="bg-white border border-slate-200/90 p-3.5 rounded-sm shadow-2xs space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">BLOCKED</span>
              <p className="text-3xl font-black text-red-600 font-mono">{blockedCount}</p>
            </div>

            {/* OVERDUE / DELAYED */}
            <div className="bg-white border border-slate-200/90 p-3.5 rounded-sm shadow-2xs space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">OVERDUE / DELAYED</span>
              <p className="text-3xl font-black text-red-700 font-mono">{overdueCount}</p>
            </div>
          </div>

          {/* Task Completion Overview & Deadlines Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Completion Progress Section */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-sm shadow-2xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">donut_large</span>
                  Task Completion Overview
                </h3>
                <span className="text-xs font-mono font-bold text-slate-500">Updated Real-Time</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Overall Project Progress</span>
                  <span className="text-emerald-600 font-mono font-black">{overallAvgProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${overallAvgProgress}%` }}
                  />
                </div>
              </div>

              {/* Progress Breakdown by Project */}
              <div className="pt-2 space-y-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Project Progress Breakdown</h4>
                <div className="space-y-2.5">
                  {(projects.length > 0 ? projects : [
                    { code: 'PRJ-DELTA', name: 'Project Delta' },
                    { code: 'PRJ-MIGR8', name: 'Data Migration Pipeline' },
                    { code: 'PRJ-ERP', name: 'ERP System Upgrade' }
                  ]).map((prj) => {
                    const prjTasks = tasks.filter((t) => t.projectCode === prj.code);
                    const prjAvg = prjTasks.length > 0
                      ? Math.round(prjTasks.reduce((sum, t) => sum + (t.progress ?? (t.status === 'Done' ? 100 : 0)), 0) / prjTasks.length)
                      : 0;

                    return (
                      <div key={prj.code} className="bg-slate-50 p-2.5 rounded-xs border border-slate-200/70 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-800">
                            {prj.name} <span className="font-mono text-slate-500">({prj.code})</span>
                          </span>
                          <span className="font-mono font-bold text-indigo-900">{prjAvg}% ({prjTasks.length} tasks)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              prjAvg >= 80 ? 'bg-emerald-500' : prjAvg >= 40 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${prjAvg}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tasks Due Today & Urgent Deadlines */}
            <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-2xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">alarm</span>
                  Upcoming Deadlines
                </h3>
                <span className="bg-amber-100 text-amber-900 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {tasks.filter((t) => isOverdue(t) || t.dueDate <= '2026-08-05').length} Urgent
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
                {tasks
                  .filter((t) => t.status !== 'Done')
                  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                  .slice(0, 5)
                  .map((t) => {
                    const overdue = isOverdue(t);
                    return (
                      <div
                        key={t.id}
                        onClick={() => setQuickUpdateTask(t)}
                        className={`p-3 rounded-xs border transition-all cursor-pointer space-y-1.5 ${
                          overdue
                            ? 'bg-red-50 border-red-200 hover:border-red-400'
                            : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded-xs border text-slate-700">
                            {t.projectCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs font-mono ${
                              overdue ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                            }`}
                          >
                            {overdue ? 'OVERDUE' : `Due ${t.dueDate}`}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 leading-snug">{t.title}</h4>
                        <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[13px]">person</span>
                            {t.assignee}
                          </span>
                          <span className="font-mono font-bold text-blue-700">{t.progress ?? 0}% Done</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY TASKS */}
      {activeTab === 'My Tasks' && (
        <div className="space-y-6">
          {/* Developer Selector Banner */}
          <div className="bg-[#00174b] text-white p-5 rounded-sm shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[24px]">badge</span>
                <div>
                  <h3 className="font-black text-base text-white">My Assigned Tasks &amp; Work Log</h3>
                  <p className="text-xs text-indigo-200">View assigned tasks, update progress %, log work hours, and send completion updates.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReportRiskModal(true)}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-sm flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>Report Risk/Issue to PM</span>
                </button>
                <label className="text-xs font-bold text-indigo-200 uppercase">Select Member:</label>
                <select
                  value={selectedDeveloper}
                  onChange={(e) => setSelectedDeveloper(e.target.value)}
                  className="bg-white text-slate-900 border border-slate-300 font-bold text-xs rounded-sm px-3 py-1.5 outline-none shadow-xs"
                >
                  {assigneeList.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Developer Stats Summary */}
            {(() => {
              const myTasksList = tasks.filter((t) => t.assignee === selectedDeveloper);
              const myInProgress = myTasksList.filter((t) => t.status === 'In Progress').length;
              const myBlocked = myTasksList.filter((t) => t.status === 'Blocked').length;
              const totalHours = myTasksList.reduce((sum, t) => sum + (t.hoursLogged || 0), 0);

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="bg-white/10 border border-white/15 p-2.5 rounded-xs">
                    <span className="text-[10px] text-slate-300 font-bold uppercase block">Assigned Tasks</span>
                    <p className="font-black text-xl text-white font-mono">{myTasksList.length}</p>
                  </div>
                  <div className="bg-white/10 border border-white/15 p-2.5 rounded-xs">
                    <span className="text-[10px] text-slate-300 font-bold uppercase block">In Execution</span>
                    <p className="font-black text-xl text-amber-300 font-mono">{myInProgress}</p>
                  </div>
                  <div className="bg-white/10 border border-white/15 p-2.5 rounded-xs">
                    <span className="text-[10px] text-slate-300 font-bold uppercase block">Blocked Items</span>
                    <p className="font-black text-xl text-red-300 font-mono">{myBlocked}</p>
                  </div>
                  <div className="bg-white/10 border border-white/15 p-2.5 rounded-xs">
                    <span className="text-[10px] text-slate-300 font-bold uppercase block">Hours Logged</span>
                    <p className="font-black text-xl text-emerald-300 font-mono">{totalHours} hrs</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Developer Task Cards List */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">task</span>
              Tasks Assigned to <span className="text-blue-700">{selectedDeveloper}</span>
            </h3>

            {(() => {
              const devTasks = tasks.filter((t) => t.assignee === selectedDeveloper);

              if (devTasks.length === 0) {
                return (
                  <div className="bg-white border border-slate-200 p-8 text-center rounded-sm space-y-2">
                    <span className="material-symbols-outlined text-slate-400 text-[36px]">assignment_turned_in</span>
                    <h4 className="font-bold text-slate-700 text-sm">No tasks assigned to {selectedDeveloper} yet</h4>
                    <p className="text-xs text-slate-500">
                      Use the "Create Task" or "Assign Members" tab to assign new tasks to this developer.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {devTasks.map((t) => {
                    const overdue = isOverdue(t);
                    return (
                      <div
                        key={t.id}
                        className="bg-white border border-slate-200/90 p-4 rounded-sm shadow-2xs space-y-3 hover:border-blue-400 transition-all"
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-xs border border-indigo-200">
                              {t.projectCode} • {t.projectName || t.projectCode}
                            </span>
                            <h4 className="font-black text-slate-900 text-sm mt-1.5 leading-snug">{t.title}</h4>
                          </div>

                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-xs ${
                              t.priority === 'High'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : t.priority === 'Medium'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>

                        {/* Description */}
                        {t.description && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xs border border-slate-100 leading-relaxed">
                            {t.description}
                          </p>
                        )}

                        {/* Status & Deadline Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-600">Status:</span>
                            <select
                              value={t.status}
                              onChange={(e) => handleStatusChange(t, e.target.value as any)}
                              className={`font-bold text-xs rounded-xs px-2 py-1 border outline-none ${
                                t.status === 'Done'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : t.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : t.status === 'Blocked'
                                  ? 'bg-red-100 text-red-900 border-red-300'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              <option value="Backlog">To Do / Backlog</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Blocked">Blocked</option>
                              <option value="Review">In Review</option>
                              <option value="Done">Completed</option>
                            </select>
                          </div>

                          <span className={`text-[11px] font-bold ${overdue ? 'text-red-600' : 'text-slate-500'}`}>
                            {overdue ? '⚠️ Overdue' : `Due ${t.dueDate}`}
                          </span>
                        </div>

                        {/* Progress Slider & % Control */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-blue-600">trending_up</span>
                              Task Progress %:
                            </span>
                            <span className="font-mono font-black text-indigo-900 text-sm">{t.progress ?? 0}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={t.progress ?? 0}
                              onChange={(e) => handleProgressChange(t, parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleProgressChange(t, 100)}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase rounded-xs"
                              >
                                100%
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Hours Logged Section */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                          <span className="text-slate-600 font-medium">
                            Hours: <strong className="font-mono text-slate-900">{t.hoursLogged || 0}</strong> /{' '}
                            <span className="font-mono text-slate-500">{t.estimatedHours || 16} hrs est.</span>
                          </span>

                          <button
                            onClick={() => handleLogHours(t, 2)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xs border border-slate-300 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">more_time</span>
                            + Log 2 Hours
                          </button>
                        </div>

                        {/* Recent Comments / Work Notes */}
                        {t.comments && t.comments.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Status Notes &amp; Updates:</span>
                            {t.comments.slice(-2).map((c) => (
                              <div key={c.id} className="bg-slate-50 p-2 rounded-xs text-[11px] border border-slate-200">
                                <div className="flex justify-between font-bold text-slate-700">
                                  <span>{c.author}</span>
                                  <span className="font-mono text-[10px] text-slate-400">{c.timestamp}</span>
                                </div>
                                <p className="text-slate-600 mt-0.5">{c.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quick Action & Notify PM Row */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              handleProgressChange(t, 100);
                              if (onNotifyPM) {
                                onNotifyPM(t, selectedDeveloper, 'Finished task & updated progress to 100%.');
                              }
                              showToast(`Task completed & notification sent to Project Manager.`);
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-sm shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[16px]">send</span>
                            <span>Mark Completed &amp; Notify Project Manager</span>
                          </button>

                          <button
                            onClick={() => setQuickUpdateTask(t)}
                            className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">mode_comment</span>
                            Add Work Note / Open Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* MY SUBMITTED RISKS & ISSUES (RESOLUTION TRACKER) */}
          {(() => {
            const mySubmittedRisks = risks.filter(
              (r) =>
                r.submittedBy === currentPersona?.email ||
                r.flaggedBy?.toLowerCase().includes(selectedDeveloper.toLowerCase()) ||
                r.flaggedBy?.toLowerCase().includes('team')
            );

            return (
              <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-2xs space-y-3 mt-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600 text-[22px]">crisis_alert</span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        My Submitted Risks &amp; Issues (PM Resolution Tracker)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Track live resolution status for blockers and risks you submitted to the Project Manager.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowReportRiskModal(true)}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-sm flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">add_alert</span>
                    Report New Issue to PM
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                        <th className="p-3">Ref</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Subject &amp; Description</th>
                        <th className="p-3">Project</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Resolution Lifecycle Status</th>
                        <th className="p-3 text-right">Resolution Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mySubmittedRisks.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400">
                            No risks or operational blockers submitted yet. Click &quot;Report Risk/Issue to PM&quot; to report an issue.
                          </td>
                        </tr>
                      ) : (
                        mySubmittedRisks.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-900">{r.ref}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 font-bold rounded-xs text-[10px] uppercase font-mono ${
                                  r.category === 'Issue'
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                }`}
                              >
                                {r.category}
                              </span>
                            </td>
                            <td className="p-3 max-w-xs">
                              <p className="font-bold text-slate-900">{r.subject}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{r.description}</p>
                            </td>
                            <td className="p-3 font-mono text-slate-700">{r.projectRef || 'PMO-101'}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 font-bold rounded-xs text-[10px] uppercase ${
                                  r.severity === 'CRITICAL'
                                    ? 'bg-red-100 text-red-800'
                                    : r.severity === 'HIGH'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {r.severity}
                              </span>
                            </td>
                            <td className="p-3">
                              {r.status === 'RESOLVED' || r.status === 'MITIGATED' ? (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-xs uppercase font-mono flex items-center gap-1 w-max">
                                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                  {r.status === 'RESOLVED' ? 'Solved by PM' : 'Solved by Risk Manager'}
                                </span>
                              ) : r.status === 'ESCALATED' ? (
                                <span className="px-2.5 py-1 bg-purple-100 text-purple-900 font-bold text-[10px] rounded-xs uppercase font-mono flex items-center gap-1 w-max">
                                  <span className="material-symbols-outlined text-[13px]">crisis_alert</span>
                                  Escalated to Risk Mgr
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-xs uppercase font-mono flex items-center gap-1 w-max">
                                  <span className="material-symbols-outlined text-[13px]">pending</span>
                                  Under PM Review
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {r.status === 'RESOLVED' || r.status === 'MITIGATED' ? (
                                <button
                                  onClick={() => setViewingResolutionRisk(r)}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] rounded-xs border border-emerald-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[13px]">task_alt</span>
                                  View Solution &amp; Notes
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Pending PM Review</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: TASK LIST (TABLE VIEW) */}
      {(activeTab === 'Task List' || activeTab === 'Reports') && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-2xs flex flex-wrap gap-3 justify-between items-center">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search tasks by title, assignee, or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-sm text-xs outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="ALL">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Backlog">To Do / Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Review">In Review</option>
                <option value="Done">Completed</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3">Project &amp; Code</th>
                    <th className="p-3">Task Deliverable</th>
                    <th className="p-3">Assignee / Developer</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Deadline</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 text-xs font-medium">
                        No tasks matching current search filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t) => {
                      const overdue = isOverdue(t);
                      return (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-bold text-indigo-900">
                            <span className="bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-xs text-[11px]">
                              {t.projectCode}
                            </span>
                          </td>
                          <td className="p-3">
                            <h4 className="font-bold text-slate-900 leading-snug">{t.title}</h4>
                            {t.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
                              {t.assignee}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-xs ${
                                t.priority === 'High'
                                  ? 'bg-red-100 text-red-800'
                                  : t.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                t.status === 'Done'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : t.status === 'Blocked'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="w-24 space-y-1">
                              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-600">
                                <span>{t.progress ?? 0}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-blue-600 h-full rounded-full"
                                  style={{ width: `${t.progress ?? 0}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono">
                            <span className={`font-bold ${overdue ? 'text-red-600' : 'text-slate-700'}`}>
                              {t.dueDate}
                            </span>
                            {overdue && (
                              <span className="block text-[9px] font-bold text-red-600 uppercase">Overdue</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end items-center gap-1">
                              <button
                                onClick={() => setQuickUpdateTask(t)}
                                className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xs text-[11px]"
                                title="Update Progress & Details"
                              >
                                Edit / Progress
                              </button>
                              {onDeleteTask && (
                                <button
                                  onClick={() => onDeleteTask(t.id)}
                                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-xs text-[11px] font-bold"
                                  title="Delete Task"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CREATE TASK FORM (PROJECT MANAGER VIEW) */}
      {activeTab === 'Create Task' && (
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 p-6 rounded-sm shadow-sm space-y-5">
          <div className="border-b pb-3">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00174b] text-[22px]">add_task</span>
              Project Manager Task Assignment Form
            </h3>
            <p className="text-xs text-slate-500">
              Create a new work item, assign it to a developer or team member, set estimated hours, and specify the completion deadline.
            </p>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 uppercase mb-1">Task Title / Deliverable Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Build API Gateway Auth Middleware or Database Indexing..."
                className="w-full border border-slate-300 p-2.5 rounded-sm text-xs outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Target Project *</label>
                <select
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-sm text-xs font-bold text-slate-800 outline-none"
                >
                  {(projects.length > 0
                    ? projects
                    : [
                        { code: 'PRJ-DELTA', name: 'Project Delta' },
                        { code: 'PRJ-MIGR8', name: 'Data Migration Pipeline' },
                        { code: 'PRJ-ERP', name: 'ERP System Upgrade' },
                        { code: 'PRJ-COMP', name: 'Cloud Compliance Automation' }
                      ]
                  ).map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Assignee / Developer *</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-sm text-xs font-bold text-slate-800 outline-none"
                >
                  {assigneeList.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full border border-slate-300 p-2.5 rounded-sm text-xs font-bold outline-none"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Estimated Work Hours</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 16)}
                  className="w-full border border-slate-300 p-2.5 rounded-sm text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Completion Deadline *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-sm text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 uppercase mb-1">Initial Status</label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as any)}
                className="w-full border border-slate-300 p-2.5 rounded-sm text-xs font-bold outline-none"
              >
                <option value="Backlog">To Do / Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Review">In Review</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 uppercase mb-1">Deliverable Instructions &amp; Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details, acceptance criteria, tech stack notes, or links for the developer..."
                className="w-full border border-slate-300 p-2.5 rounded-sm text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('Task List')}
                className="px-4 py-2 border rounded-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-wider rounded-sm shadow-md"
              >
                Assign Task to {assignee}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: ASSIGN MEMBERS (PM WORKLOAD MATRIX) */}
      {activeTab === 'Assign Members' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-2xs">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-700 text-[20px]">group_add</span>
              Team Member Workload &amp; Task Allocation Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Overview of team member task assignments, active workload hours, and direct assignment options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assigneeList.map((person) => {
              const assignedTasks = tasks.filter((t) => t.assignee === person);
              const activeCount = assignedTasks.filter((t) => t.status !== 'Done').length;
              const totalEstHours = assignedTasks.reduce((sum, t) => sum + (t.estimatedHours || 16), 0);
              const loggedHours = assignedTasks.reduce((sum, t) => sum + (t.hoursLogged || 0), 0);
              const matchedUser = users.find((u) => u.name === person);

              return (
                <div key={person} className="bg-white border border-slate-200/90 p-4 rounded-sm shadow-2xs space-y-3">
                  <div className="flex items-center gap-3 border-b pb-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-900 text-white font-black text-sm flex items-center justify-center">
                      {person.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{person}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {matchedUser?.role || 'Senior Project Member'} • {matchedUser?.department || 'Engineering'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-50 p-2 rounded-xs border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Active Tasks</span>
                      <span className="text-lg font-black text-blue-700">{activeCount} tasks</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xs border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Work Hours</span>
                      <span className="text-lg font-black text-slate-800">{loggedHours} / {totalEstHours} hrs</span>
                    </div>
                  </div>

                  {/* Tasks List snippet */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assigned Work Items:</span>
                    {assignedTasks.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No tasks currently assigned</span>
                    ) : (
                      assignedTasks.slice(0, 3).map((t) => (
                        <div key={t.id} className="text-[11px] flex justify-between items-center bg-slate-50 p-1.5 rounded-xs border">
                          <span className="font-bold text-slate-800 truncate max-w-[180px]">{t.title}</span>
                          <span className="font-mono font-bold text-blue-600">{t.progress ?? 0}%</span>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setAssignee(person);
                      setActiveTab('Create Task');
                    }}
                    className="w-full py-1.5 bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs rounded-xs flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    Assign New Task to {person.split(' ')[0]}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: KANBAN BOARD */}
      {activeTab === 'Kanban Board' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-3 rounded-sm border border-slate-200">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">view_kanban</span>
              Interactive Stage Swimlanes
            </span>

            <div className="flex items-center gap-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-sm px-2.5 py-1 text-xs font-bold"
              >
                <option value="ALL">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {kanbanColumns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.status);
              return (
                <div key={col.status} className="bg-slate-100/80 border border-slate-200 p-2.5 rounded-sm flex flex-col min-h-[520px]">
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-200">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase flex items-center gap-1 ${col.color}`}>
                      <span className="material-symbols-outlined text-[14px]">{col.icon}</span>
                      {col.title}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600">{colTasks.length}</span>
                  </div>

                  {/* Task Cards Container */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto custom-scroll pr-0.5">
                    {colTasks.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-[11px] border border-dashed border-slate-300 rounded-sm">
                        Empty column
                      </div>
                    ) : (
                      colTasks.map((t) => {
                        const overdue = isOverdue(t);
                        return (
                          <div
                            key={t.id}
                            className="bg-white border border-slate-200/90 p-3 rounded-sm shadow-2xs space-y-2 hover:border-blue-400 transition-colors"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-mono text-[9px] font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded-xs border border-indigo-200">
                                {t.projectCode}
                              </span>
                              <span
                                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-xs ${
                                  t.priority === 'High'
                                    ? 'bg-red-100 text-red-800'
                                    : t.priority === 'Medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {t.priority}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-xs leading-snug">{t.title}</h4>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-600">
                                <span>Progress</span>
                                <span>{t.progress ?? 0}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${t.progress ?? 0}%` }} />
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                              <span className="flex items-center gap-1 font-medium">
                                <span className="material-symbols-outlined text-[13px]">person</span>
                                {t.assignee}
                              </span>
                              <span className={`font-mono ${overdue ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                                {t.dueDate}
                              </span>
                            </div>

                            {/* Move Controls */}
                            <div className="pt-1 flex justify-between gap-1 border-t border-slate-100">
                              {col.status !== 'Backlog' && (
                                <button
                                  onClick={() => {
                                    const prev =
                                      col.status === 'Done'
                                        ? 'Review'
                                        : col.status === 'Review'
                                        ? 'Blocked'
                                        : col.status === 'Blocked'
                                        ? 'In Progress'
                                        : 'Backlog';
                                    handleStatusChange(t, prev);
                                  }}
                                  className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center font-bold"
                                >
                                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                                  Back
                                </button>
                              )}
                              <button
                                onClick={() => setQuickUpdateTask(t)}
                                className="text-[10px] text-slate-600 hover:text-slate-900 font-bold"
                              >
                                Edit
                              </button>
                              {col.status !== 'Done' && (
                                <button
                                  onClick={() => {
                                    const next =
                                      col.status === 'Backlog'
                                        ? 'In Progress'
                                        : col.status === 'In Progress'
                                        ? 'Review'
                                        : col.status === 'Review'
                                        ? 'Done'
                                        : 'Done';
                                    handleStatusChange(t, next);
                                  }}
                                  className="text-[10px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-0.5 ml-auto"
                                >
                                  Advance
                                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: CALENDAR & DEADLINES */}
      {activeTab === 'Calendar & Deadlines' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-2xs">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[20px]">calendar_month</span>
              Task Schedule &amp; Deadline Governance
            </h3>
            <p className="text-xs text-slate-500">
              Track critical completion dates, upcoming milestone deadlines, and overdue developer deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overdue Section */}
            <div className="bg-red-50/70 border border-red-200 p-4 rounded-sm space-y-3">
              <div className="flex justify-between items-center border-b border-red-200 pb-2">
                <h4 className="font-extrabold text-red-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-red-600 text-[18px]">warning</span>
                  Overdue Deadlines ({tasks.filter(isOverdue).length})
                </h4>
              </div>

              <div className="space-y-2.5">
                {tasks.filter(isOverdue).length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 text-center">Zero overdue task deadlines!</p>
                ) : (
                  tasks.filter(isOverdue).map((t) => (
                    <div key={t.id} className="bg-white border border-red-300 p-3 rounded-xs shadow-2xs space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-mono font-bold text-slate-700">{t.projectCode}</span>
                        <span className="font-mono font-bold text-red-600 uppercase">Due {t.dueDate}</span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900">{t.title}</h5>
                      <div className="flex justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                        <span>Assignee: <strong>{t.assignee}</strong></span>
                        <button
                          onClick={() => setQuickUpdateTask(t)}
                          className="font-bold text-blue-700 hover:underline"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Deadlines (Next 14 days) */}
            <div className="md:col-span-2 bg-white border border-slate-200 p-4 rounded-sm space-y-3 shadow-2xs">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">event_available</span>
                  Active Milestone Deadlines Timeline
                </h4>
              </div>

              <div className="space-y-3">
                {tasks
                  .filter((t) => t.status !== 'Done' && !isOverdue(t))
                  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                  .map((t) => (
                    <div
                      key={t.id}
                      className="bg-slate-50 border border-slate-200 p-3 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-400 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-900 px-2 py-0.5 rounded-xs">
                            {t.projectCode}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{t.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Assigned to <strong>{t.assignee}</strong> • Status: {t.status}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-mono text-xs font-black text-indigo-900 block">
                            Target: {t.dueDate}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600">{t.progress ?? 0}% Complete</span>
                        </div>

                        <button
                          onClick={() => setQuickUpdateTask(t)}
                          className="px-3 py-1.5 bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs rounded-xs"
                        >
                          Update Progress
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK UPDATE & WORK NOTE MODAL */}
      {quickUpdateTask && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-sm border border-slate-300 shadow-2xl space-y-4 text-xs animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="font-mono text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-xs border">
                  {quickUpdateTask.projectCode} • {quickUpdateTask.projectName || quickUpdateTask.projectCode}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-1 leading-snug">
                  {quickUpdateTask.title}
                </h3>
              </div>
              <button
                onClick={() => setQuickUpdateTask(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            {quickUpdateTask.description && (
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Deliverable Description</span>
                <p className="text-slate-700 leading-relaxed">{quickUpdateTask.description}</p>
              </div>
            )}

            {/* Status & Progress % Controls */}
            <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 p-3 rounded-xs border border-indigo-100">
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Task Status</label>
                <select
                  value={quickUpdateTask.status}
                  onChange={(e) => handleStatusChange(quickUpdateTask, e.target.value as any)}
                  className="w-full bg-white border border-slate-300 p-2 rounded-xs font-bold text-xs"
                >
                  <option value="Backlog">To Do / Backlog</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Review">In Review</option>
                  <option value="Done">Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Deadline Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={quickUpdateTask.dueDate}
                  onChange={(e) => {
                    const updated = { ...quickUpdateTask, dueDate: e.target.value };
                    if (onUpdateTask) onUpdateTask(updated);
                    setQuickUpdateTask(updated);
                  }}
                  className="w-full bg-white border border-slate-300 p-2 rounded-xs font-mono font-bold text-xs"
                />
              </div>
            </div>

            {/* Progress Slider */}
            <div className="space-y-1 bg-slate-50 p-3 rounded-xs border border-slate-200">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Update Progress Percentage:</span>
                <span className="font-mono font-black text-blue-700 text-sm">{quickUpdateTask.progress ?? 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={quickUpdateTask.progress ?? 0}
                onChange={(e) => handleProgressChange(quickUpdateTask, parseInt(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Hours Logged */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xs border border-slate-200 font-bold">
              <span>Logged Work Hours: <span className="font-mono text-indigo-900">{quickUpdateTask.hoursLogged || 0} hrs</span></span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleLogHours(quickUpdateTask, 1)}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-xs text-[11px]"
                >
                  +1 hr
                </button>
                <button
                  onClick={() => handleLogHours(quickUpdateTask, 4)}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-xs text-[11px]"
                >
                  +4 hrs
                </button>
              </div>
            </div>

            {/* Work Notes / Comments */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">Add Developer Work Note</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., Code reviewed, pushed to staging, awaiting QA test..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddComment(quickUpdateTask);
                    }
                  }}
                  className="flex-1 border border-slate-300 p-2 rounded-xs text-xs outline-none"
                />
                <button
                  onClick={() => handleAddComment(quickUpdateTask)}
                  className="px-4 py-2 bg-[#00174b] text-white font-bold rounded-xs hover:bg-indigo-950 uppercase text-[11px]"
                >
                  Post Note
                </button>
              </div>

              {/* Existing Comments */}
              {quickUpdateTask.comments && quickUpdateTask.comments.length > 0 && (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {quickUpdateTask.comments.map((c) => (
                    <div key={c.id} className="bg-slate-50 p-2 rounded-xs border border-slate-200">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{c.author}</span>
                        <span className="font-mono text-[10px] text-slate-400">{c.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setQuickUpdateTask(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xs uppercase tracking-wider text-xs"
              >
                Close &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL (accessible via top button) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-sm border border-slate-300 shadow-xl space-y-4 text-xs animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600">add_task</span>
                Create &amp; Assign New Work Item
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-base font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full border border-slate-300 p-2 rounded-sm outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Project</label>
                  <select
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-sm font-bold"
                  >
                    {(projects.length > 0 ? projects : [
                      { code: 'PRJ-DELTA', name: 'Project Delta' },
                      { code: 'PRJ-MIGR8', name: 'Data Migration Pipeline' },
                      { code: 'PRJ-ERP', name: 'ERP System Upgrade' }
                    ]).map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Assignee</label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-sm font-bold"
                  >
                    {assigneeList.map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full border border-slate-300 p-2 rounded-sm font-bold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task instructions..."
                  className="w-full border border-slate-300 p-2 rounded-sm"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border rounded-sm font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00174b] text-white font-bold rounded-sm uppercase tracking-wider"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT RISK / ISSUE TO PROJECT MANAGER MODAL */}
      {showReportRiskModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[22px]">warning</span>
                <h3 className="font-extrabold text-slate-900 text-sm">Report Risk / Issue to Project Manager</h3>
              </div>
              <button onClick={() => setShowReportRiskModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleReportRiskToPM} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Category Type *</label>
                  <select
                    value={riskCategory}
                    onChange={(e) => setRiskCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                  >
                    <option value="Issue">Issue (Active Blocker)</option>
                    <option value="Risk">Risk (Potential Hazard)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Severity Rating *</label>
                  <select
                    value={riskSeverity}
                    onChange={(e) => setRiskSeverity(e.target.value as Severity)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                  >
                    <option value="CRITICAL">CRITICAL (Blocking Progress)</option>
                    <option value="HIGH">HIGH (Major Risk)</option>
                    <option value="MEDIUM">MEDIUM (Moderate)</option>
                    <option value="LOW">LOW (Minor Advisory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Associated Project *</label>
                <select
                  value={riskProject}
                  onChange={(e) => setRiskProject(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                >
                  {projects.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                  <option value="PMO-101">PMO-101 - Phoenix Cloud Platform</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Subject / Threat Summary *</label>
                <input
                  type="text"
                  required
                  value={riskSubject}
                  onChange={(e) => setRiskSubject(e.target.value)}
                  placeholder="e.g. Database connection pool exhausted under 50 concurrent sessions"
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Detailed Description &amp; Technical Impact *</label>
                <textarea
                  required
                  rows={3}
                  value={riskDescription}
                  onChange={(e) => setRiskDescription(e.target.value)}
                  placeholder="Explain what is failing, the steps taken, and why PM intervention is needed..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportRiskModal(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 text-white font-bold rounded-lg uppercase tracking-wider hover:bg-red-800 flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Send to Project Manager
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
                <h3 className="font-extrabold text-slate-900 text-sm">Resolution &amp; Fix Details</h3>
              </div>
              <button onClick={() => setViewingResolutionRisk(null)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <div className="space-y-2.5">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Reported Blocker: {viewingResolutionRisk.ref}</span>
                <p className="font-bold text-slate-900 text-xs">{viewingResolutionRisk.subject}</p>
                <p className="text-[11px] text-slate-500 mt-1">{viewingResolutionRisk.description}</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-emerald-800 border-b border-emerald-200 pb-1">
                  <span>Solved By: {viewingResolutionRisk.resolvedBy || 'Project Manager'}</span>
                  <span>{viewingResolutionRisk.resolvedAt ? new Date(viewingResolutionRisk.resolvedAt).toLocaleDateString() : 'Resolved'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Resolution &amp; Action Notes:</span>
                  <p className="text-xs leading-relaxed mt-0.5">{viewingResolutionRisk.resolutionNotes || 'Risk has been mitigated and verified.'}</p>
                </div>
              </div>

              {viewingResolutionRisk.escalationNotes && (
                <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-purple-900 text-[11px]">
                  <strong className="block font-bold uppercase text-[9px]">Escalation Reason:</strong>
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
    </div>
  );
};

