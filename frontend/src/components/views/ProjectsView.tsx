import React, { useState, useEffect } from 'react';
import {
  Project,
  HealthStatus,
  ProjectStatus,
  WebRequirement,
  RiskItem,
  TaskItem,
  BudgetItem,
  UserItem,
  LifecycleStage,
  LifecyclePhaseCriterion,
  ProjectLifecycleInfo
} from '../../types';
import { AssignTeamModal } from '../AssignTeamModal';
import { getProjectTeamApi, deleteProjectApi } from '../../services/api';

interface ProjectsViewProps {
  projects: Project[];
  risks?: RiskItem[];
  tasks?: TaskItem[];
  budgets?: BudgetItem[];
  users?: UserItem[];
  selectedProject?: Project | null;
  onSelectProject?: (project: Project | string | null) => void;
  onOpenNewProject: () => void;
  onUpdateProject: (updated: Project) => void;
  onAddProject?: (newProject: Project) => void;
  onOpenAssignMemberModal?: (project?: Project) => void;
  onAddRisk?: (newRisk: RiskItem) => void;
  currentPersona?: any;
  onApproveProject?: (id: string) => void;
  onRejectProject?: (id: string, reason: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  risks = [],
  tasks = [],
  budgets = [],
  users = [],
  selectedProject: propsSelectedProject = null,
  onSelectProject,
  onOpenNewProject,
  onUpdateProject,
  onAddProject,
  onOpenAssignMemberModal,
  onAddRisk,
  currentPersona,
  onApproveProject,
  onRejectProject,
}) => {

  // Navigation sub-tabs inside Projects View
  const [activeSubTab, setActiveSubTab] = useState<
    'Directory' | 'Project Lifecycle' | 'Web Requirements' | 'Gate Roadmap' | 'Kanban Pipeline' | 'AI Charter Generator'
  >('Directory');

  // Directory layout toggle: Grid or Table
  const [layoutMode, setLayoutMode] = useState<'table' | 'grid'>('table');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterHealth, setFilterHealth] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterGate, setFilterGate] = useState('ALL');
  const [selectedLifecycleStageFilter, setSelectedLifecycleStageFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'budget' | 'targetDate'>('progress');

  // Selected Project for Detail Page / Modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(propsSelectedProject);
  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);

  const userRoleMode = currentPersona?.roleType === 'EXECUTIVE_MANAGER' || currentPersona?.roleType === 'PROJECT_MANAGER'
    ? 'Executive Admin'
    : (currentPersona?.roleType === 'TEAM_MEMBER' ? 'Project Member' : 'Stakeholder');

  const [projectDetailTab, setProjectDetailTab] = useState<
    'Overview' | 'Lifecycle' | 'Participants' | 'Works Done' | 'Risks' | 'Chat' | 'Requirements'
  >('Overview');
  const [inspectStage, setInspectStage] = useState<LifecycleStage>('Initiation');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Project | null>(null);
  const [rejectingProjectId, setRejectingProjectId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [projectTeamMembers, setProjectTeamMembers] = useState<UserItem[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {

    setSelectedProject(propsSelectedProject);
    if (propsSelectedProject) {
      setInspectStage(getProjectStage(propsSelectedProject));
      
      // Fetch project team members when a project is selected
      const loadTeam = async () => {
        setLoadingTeam(true);
        try {
          const team = await getProjectTeamApi(propsSelectedProject.id);
          if (team) {
            setProjectTeamMembers(team);
          }
        } catch (error) {
          console.error("Failed to load project team in ProjectsView", error);
        } finally {
          setLoadingTeam(false);
        }
      };
      loadTeam();
    }
  }, [propsSelectedProject]);

  const handleCloseProjectDetail = () => {
    setSelectedProject(null);
    if (onSelectProject) {
      onSelectProject(null);
    }
  };

  // Local tasks state for deliverables management
  const [localTasks, setLocalTasks] = useState<TaskItem[]>(tasks);
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');
  const [newDeliverableAssignee, setNewDeliverableAssignee] = useState('');
  const [newDeliverablePriority, setNewDeliverablePriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newDeliverableDueDate, setNewDeliverableDueDate] = useState('2026-08-20');

  // AI Charter Generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // PROJECT LIFECYCLE HELPER FUNCTIONS
  const STAGES_ORDER: LifecycleStage[] = ['Initiation', 'Planning', 'Execution', 'Monitoring', 'Closure'];

  const getProjectStage = (p: Project): LifecycleStage => {
    if (p.lifecycleStage) return p.lifecycleStage;
    if (p.gate === 'Gate 1') return 'Initiation';
    if (p.gate === 'Gate 2') return 'Planning';
    if (p.gate === 'Gate 3') return 'Execution';
    if (p.gate === 'Gate 4') return 'Monitoring';
    if (p.gate === 'Gate 5' || p.status === 'COMPLETED') return 'Closure';
    return 'Execution';
  };

  const getStageNumber = (stage: LifecycleStage): number => {
    switch (stage) {
      case 'Initiation': return 1;
      case 'Planning': return 2;
      case 'Execution': return 3;
      case 'Monitoring': return 4;
      case 'Governance': return 4;
      case 'Closure': return 5;
    }
  };

  const getStageGateName = (stage: LifecycleStage): string => {
    switch (stage) {
      case 'Initiation': return 'Gate 1';
      case 'Planning': return 'Gate 2';
      case 'Execution': return 'Gate 3';
      case 'Monitoring': return 'Gate 4';
      case 'Governance': return 'Gate 4';
      case 'Closure': return 'Gate 5';
    }
  };

  const getStageProgressPercent = (stage: LifecycleStage): number => {
    switch (stage) {
      case 'Initiation': return 20;
      case 'Planning': return 40;
      case 'Execution': return 60;
      case 'Monitoring': return 80;
      case 'Governance': return 80;
      case 'Closure': return 100;
    }
  };

  const getStageCriteria = (p: Project, stage: LifecycleStage): LifecyclePhaseCriterion[] => {
    if (p.lifecycle?.criteria && p.lifecycle.criteria.length > 0) {
      return p.lifecycle.criteria;
    }
    switch (stage) {
      case 'Initiation':
        return [
          { id: 'c1', label: 'Business Case & Charter Signed Off', completed: true },
          { id: 'c2', label: 'Executive Sponsor & PM Assigned', completed: true },
          { id: 'c3', label: 'Initial Feasibility Study Complete', completed: p.progress >= 15 }
        ];
      case 'Planning':
        return [
          { id: 'c4', label: 'Technical Requirements Matrix Finalized', completed: true },
          { id: 'c5', label: 'Architecture & Security Blueprint Review', completed: true },
          { id: 'c6', label: 'Resource Allocation & Budget Locking', completed: p.progress >= 35 }
        ];
      case 'Execution':
        return [
          { id: 'c7', label: 'Active Development Sprints & Code Commits', completed: true },
          { id: 'c8', label: 'Mid-Build Automated Test Suite Passing', completed: p.progress >= 60 },
          { id: 'c9', label: 'Security & Vulnerability Scanning', completed: p.progress >= 70 }
        ];
      case 'Monitoring':
      case 'Governance':
        return [
          { id: 'c10', label: 'User Acceptance Testing (UAT) & KPI Verification', completed: p.progress >= 85 },
          { id: 'c11', label: 'Risk Manager Assignment & Active Blocker Review', completed: true },
          { id: 'c12', label: 'Production Cutover & Contingency Audit', completed: p.progress >= 90 }
        ];
      case 'Closure':
        return [
          { id: 'c13', label: 'Production Deployment Verification', completed: true },
          { id: 'c14', label: 'Operational Support Handover', completed: true },
          { id: 'c15', label: 'Post-Implementation Review & Asset Archiving', completed: true }
        ];
    }
  };

  const handleAdvanceStage = (p: Project) => {
    const currentStage = getProjectStage(p);
    const currentNum = getStageNumber(currentStage);
    if (currentNum >= 5) return;

    const nextStage = STAGES_ORDER[currentNum]; // 0-indexed: currentNum is next index
    const nextGate = getStageGateName(nextStage);
    const nextProgress = Math.max(p.progress, getStageProgressPercent(nextStage));

    const updated: Project = {
      ...p,
      lifecycleStage: nextStage,
      gate: nextGate,
      progress: nextProgress,
      status: nextStage === 'Closure' ? 'COMPLETED' : 'ACTIVE',
      lifecycle: {
        stage: nextStage,
        stageNumber: currentNum + 1,
        phaseDurationDays: 1,
        health: p.health === 'RED' ? 'Red' : p.health === 'YELLOW' ? 'Amber' : 'Green',
        approver: 'Executive PMO Admin',
        signOffDate: new Date().toISOString().split('T')[0],
        criteria: getStageCriteria(p, nextStage)
      }
    };

    onUpdateProject(updated);
    if (selectedProject?.id === p.id) {
      setSelectedProject(updated);
    }
  };

  const handleDemoteStage = (p: Project) => {
    const currentStage = getProjectStage(p);
    const currentNum = getStageNumber(currentStage);
    if (currentNum <= 1) return;

    const prevStage = STAGES_ORDER[currentNum - 2];
    const prevGate = getStageGateName(prevStage);

    const updated: Project = {
      ...p,
      lifecycleStage: prevStage,
      gate: prevGate,
      status: 'ACTIVE',
      lifecycle: {
        stage: prevStage,
        stageNumber: currentNum - 1,
        phaseDurationDays: 1,
        health: 'Amber',
        approver: 'Executive PMO Admin',
        criteria: getStageCriteria(p, prevStage)
      }
    };

    onUpdateProject(updated);
    if (selectedProject?.id === p.id) {
      setSelectedProject(updated);
    }
  };

  // Default web requirements checklist template for web projects
  const defaultWebReqs: WebRequirement[] = [
    { id: 'wr-1', category: 'Frontend', title: 'Responsive Mobile & Desktop UI (Tailwind CSS)', status: 'Compliant', owner: 'UI/UX Design' },
    { id: 'wr-2', category: 'Backend', title: 'RESTful API Routes & Node.js Middleware', status: 'Compliant', owner: 'Engineering' },
    { id: 'wr-3', category: 'Database', title: 'PostgreSQL Relational Schema & ORM', status: 'Compliant', owner: 'Data Eng' },
    { id: 'wr-4', category: 'Security & Auth', title: 'OAuth 2.0 / JWT Auth & HTTPS Encryption', status: 'In Progress', owner: 'Security' },
    { id: 'wr-5', category: 'DevOps & Cloud', title: 'Automated CI/CD Pipeline & Docker Containerization', status: 'Compliant', owner: 'DevOps' },
    { id: 'wr-6', category: 'UX & Accessibility', title: 'WCAG 2.1 AA Accessibility & Lighthouse > 90', status: 'Pending Review', owner: 'Product Mgmt' }
  ];

  // Helper function to get default tech stack for a project if none provided
  const getTechStack = (p: Project): string[] => {
    if (p.techStack && p.techStack.length > 0) return p.techStack;
    if (p.department === 'Engineering') return ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];
    if (p.department === 'Data Eng') return ['Python', 'PostgreSQL', 'Redis', 'Docker'];
    if (p.department === 'Design') return ['Figma', 'Tailwind CSS', 'React', 'Framer Motion'];
    if (p.department === 'Security') return ['OAuth 2.0', 'JWT', 'TypeScript', 'Node.js'];
    if (p.department === 'Infrastructure') return ['AWS', 'Docker', 'Kubernetes', 'Terraform'];
    return ['React', 'Node.js', 'TypeScript', 'Tailwind CSS'];
  };

  // Helper function to get project requirements
  const getRequirements = (p: Project): WebRequirement[] => {
    return p.requirements && p.requirements.length > 0 ? p.requirements : defaultWebReqs;
  };

  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeliverableTitle.trim() || !selectedProject) return;

    const newTask: TaskItem = {
      id: `t_${Date.now()}`,
      title: newDeliverableTitle,
      projectCode: selectedProject.code,
      assignee: newDeliverableAssignee.trim() || selectedProject.owner,
      status: 'In Progress',
      priority: newDeliverablePriority,
      dueDate: newDeliverableDueDate
    };

    setLocalTasks([newTask, ...localTasks]);
    setNewDeliverableTitle('');
    setNewDeliverableAssignee('');
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setLocalTasks(
      localTasks.map((t) => {
        if (t.id === taskId) {
          const nextStatus: TaskItem['status'] =
            t.status === 'Done' ? 'In Progress' : t.status === 'In Progress' ? 'Review' : 'Done';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Filtering & Sorting logic
  const filteredProjects = projects.filter((p) => {
    if (filterDept !== 'ALL' && p.department !== filterDept) return false;
    if (filterHealth !== 'ALL' && p.health !== filterHealth) return false;
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (filterGate !== 'ALL' && p.gate !== filterGate) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const stack = getTechStack(p).join(' ').toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const codeMatch = p.code.toLowerCase().includes(q);
      const ownerMatch = p.owner.toLowerCase().includes(q);
      const stackMatch = stack.includes(q);
      if (!nameMatch && !codeMatch && !ownerMatch && !stackMatch) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'progress') return b.progress - a.progress;
    if (sortBy === 'budget') return b.budget - a.budget;
    if (sortBy === 'targetDate') return a.targetDate.localeCompare(b.targetDate);
    return a.name.localeCompare(b.name);
  });

  // KPI Computations
  const totalProjectsCount = projects.length;
  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;
  const greenCount = projects.filter((p) => p.health === 'GREEN').length;
  const yellowCount = projects.filter((p) => p.health === 'YELLOW').length;
  const redCount = projects.filter((p) => p.health === 'RED').length;
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);
  const avgProgress = totalProjectsCount > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / totalProjectsCount)
    : 0;

  // Handle Health Badge
  const renderHealthBadge = (health: HealthStatus) => {
    switch (health) {
      case 'GREEN':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-xs uppercase tracking-wider">GREEN (On Track)</span>;
      case 'YELLOW':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-xs uppercase tracking-wider">YELLOW (At Risk)</span>;
      case 'RED':
        return <span className="px-2.5 py-1 bg-red-100 text-red-800 font-bold text-[10px] rounded-xs uppercase tracking-wider">RED (Critical)</span>;
    }
  };

  // Handle Status Badge
  const renderStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] rounded-xs uppercase">Active</span>;
      case 'PLANNING':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-xs uppercase">Planning</span>;
      case 'DELAYED':
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold text-[10px] rounded-xs uppercase">Delayed</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-xs uppercase">Completed</span>;
    }
  };

  // Handle Approval Status Badge
  const renderApprovalBadge = (p: Project) => {
    const approval = p.approvalStatus || 'PENDING';
    if (approval === 'APPROVED') {
      return (
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[9px] rounded-xs uppercase tracking-wider inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">verified</span>
          Approved &amp; Active
        </span>
      );
    }
    if (approval === 'REJECTED') {
      return (
        <span className="px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 font-bold text-[9px] rounded-xs uppercase tracking-wider inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">cancel</span>
          Rejected
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9px] rounded-xs uppercase tracking-wider inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-[12px]">pending_actions</span>
        Pending Executive Approval
      </span>
    );
  };


  // Toggle web requirement status
  const handleToggleRequirement = (project: Project, reqId: string) => {
    const currentReqs = getRequirements(project);
    const updatedReqs = currentReqs.map((r) => {
      if (r.id === reqId) {
        const nextStatus: WebRequirement['status'] =
          r.status === 'Compliant' ? 'In Progress' : r.status === 'In Progress' ? 'Pending Review' : 'Compliant';
        return { ...r, status: nextStatus };
      }
      return r;
    });

    const updated = { ...project, requirements: updatedReqs };
    onUpdateProject(updated);
    if (selectedProject?.id === project.id) {
      setSelectedProject(updated);
    }
  };

  // AI Charter Synthesis
  const handleGenerateAICharter = () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult(null);

    setTimeout(() => {
      setAiLoading(false);
      setAiResult(`### AI WEB PROJECT SPECIFICATION & CHARTER BLUEPRINT
**Initiative Name:** ${aiPrompt}
**Target Web Architecture:** Full-Stack Web Application (React 18 + Vite + Node.js + Express + PostgreSQL)
**Estimated Development Cycle:** 16 Weeks
**Recommended Initial Capital:** $650,000

---
#### 1. Core Web Requirements Checklist
- **Frontend Layer:** React SPA with Tailwind CSS, Lucide Icons, and Motion transitions.
- **Backend Service Layer:** Express.js REST API with CORS headers, JWT session validation, and rate limiting.
- **Database Architecture:** Relational PostgreSQL schema with indexed primary keys and migration scripts.
- **DevOps & Hosting:** Cloud Run containerized deployment behind Nginx reverse proxy on port 3000.
- **Security Compliance:** OAuth 2.0 / SSO single sign-on, HTTPS TLS 1.3, CSP policies.

#### 2. Key Web Milestones & Gate Criteria
- **Gate 1 (Charter & Spec):** Stakeholder sign-off on Figma prototypes and Web Architecture blueprint.
- **Gate 2 (Backend & Database):** REST API endpoints integrated with PostgreSQL database and unit tested (>80% coverage).
- **Gate 3 (Frontend Integration):** Full end-to-end web workflows functional with responsive layout across desktop and mobile.
- **Gate 4 (Security & Performance):** Vulnerability scan cleared, WCAG 2.1 AA accessibility audit passed, Lighthouse performance score > 90.
- **Gate 5 (Production Launch):** CI/CD deployment pipeline active with automated rollbacks.
      `);
    }, 1200);
  };

  // Create project directly from AI
  const handleCreateProjectFromAI = () => {
    if (!aiPrompt.trim()) return;
    const newPrj: Project = {
      id: `p-${Date.now()}`,
      name: aiPrompt,
      code: `PRJ-${aiPrompt.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X')}`,
      department: 'Engineering',
      owner: 'PMO Admin',
      status: 'ACTIVE',
      health: 'GREEN',
      budget: 650000,
      spent: 50000,
      progress: 10,
      gate: 'Gate 1',
      targetDate: '2027-03-31',
      description: `AI-generated web project specification for ${aiPrompt}.`,
      techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      liveUrl: 'https://demo.app.studio/preview',
      repoUrl: 'https://github.com/organization/web-project',
      requirements: defaultWebReqs
    };

    if (onAddProject) {
      onAddProject(newPrj);
    } else {
      onUpdateProject(newPrj);
    }
    setAiPrompt('');
    setAiResult(null);
    setActiveSubTab('Directory');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>GOVERNANCE</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b]">PROJECT MANAGEMENT</span>
          </nav>
          <h2 className="text-[28px] font-extrabold text-[#191c1e] tracking-tight">
            Projects Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage enterprise projects, technical compliance requirements, gate lifecycles, and delivery schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenAssignMemberModal && currentPersona?.roleType !== 'TEAM_MEMBER' && (!selectedProject || selectedProject.approvalStatus === 'APPROVED') && (
            <button
              onClick={() => onOpenAssignMemberModal(selectedProject || undefined)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold flex items-center gap-1.5 text-xs uppercase tracking-wider rounded-xs transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Assign New Member
            </button>
          )}
          {currentPersona?.roleType !== 'TEAM_MEMBER' && (
            <button
              onClick={onOpenNewProject}
              className="px-4 py-2 bg-[#00174b] text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-indigo-950 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Project
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Projects</span>
          <p className="text-2xl font-extrabold text-blue-950 font-mono">{totalProjectsCount}</p>
          <span className="text-[11px] text-slate-500">{activeCount} active in flight</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Completion</span>
          <p className="text-2xl font-extrabold text-indigo-600 font-mono">{avgProgress}%</p>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${avgProgress}%` }}></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Health Summary</span>
          <div className="flex items-center gap-3 pt-1">
            <div className="text-center">
              <span className="text-sm font-bold text-emerald-600 font-mono block">{greenCount}</span>
              <span className="text-[9px] text-slate-500 uppercase">Green</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-amber-600 font-mono block">{yellowCount}</span>
              <span className="text-[9px] text-slate-500 uppercase">Yellow</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-red-600 font-mono block">{redCount}</span>
              <span className="text-[9px] text-slate-500 uppercase">Red</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Capital Budget</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">${(totalBudget / 1000000).toFixed(2)}M</p>
          <span className="text-[11px] text-slate-500">Allocated across portfolio</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Capital Burned</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">${(totalSpent / 1000000).toFixed(2)}M</p>
          <span className="text-[11px] text-emerald-600 font-semibold font-mono">
            {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% Utilized
          </span>
        </div>
      </div>

      {/* Navigation Sub-Pill Bar */}
      <div className="bg-slate-100/90 p-1.5 rounded-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { key: 'Directory', label: 'All Projects', icon: 'topic' },
            { key: 'Project Lifecycle', label: 'Project Lifecycle Engine', icon: 'account_tree' },
            { key: 'Web Requirements', label: 'Requirements Matrix', icon: 'checklist_rtl' },
            { key: 'Gate Roadmap', label: 'Gate Lifecycle Roadmap', icon: 'alt_route' },
            { key: 'Kanban Pipeline', label: 'Kanban Board', icon: 'view_kanban' },
            { key: 'AI Charter Generator', label: 'AI Charter Generator', icon: 'auto_awesome' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xs transition-all flex items-center gap-1.5 ${activeSubTab === tab.key
                  ? 'bg-white text-blue-950 font-bold shadow-2xs border border-slate-200/60'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
                }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${tab.key === 'AI Charter Generator' ? 'text-amber-500' : ''}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeSubTab === 'Directory' && (
          <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-0.5 rounded-xs">
            <button
              onClick={() => setLayoutMode('table')}
              className={`px-2 py-1 rounded-xs flex items-center gap-1 text-[11px] ${layoutMode === 'table' ? 'bg-[#00174b] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">table_rows</span>
              Table
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`px-2 py-1 rounded-xs flex items-center gap-1 text-[11px] ${layoutMode === 'grid' ? 'bg-[#00174b] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">grid_view</span>
              Grid Cards
            </button>
          </div>
        )}
      </div>

      {/* SUB-TAB 1: DIRECTORY (ALL PROJECTS) */}
      {activeSubTab === 'Directory' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 border border-slate-200/80 rounded-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[260px] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-sm">
              <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by name, code, owner, or tech stack (e.g. React, Docker, Python)..."
                className="w-full bg-transparent outline-none text-xs text-slate-800"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">✕</button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="border border-slate-200 rounded-sm p-1.5 text-xs text-slate-700 outline-none bg-slate-50"
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Data Eng">Data Eng</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Enterprise IT">Enterprise IT</option>
                <option value="Security">Security</option>
              </select>

              <select
                value={filterHealth}
                onChange={(e) => setFilterHealth(e.target.value)}
                className="border border-slate-200 rounded-sm p-1.5 text-xs text-slate-700 outline-none bg-slate-50"
              >
                <option value="ALL">All Health</option>
                <option value="GREEN">Green (On Track)</option>
                <option value="YELLOW">Yellow (At Risk)</option>
                <option value="RED">Red (Critical)</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-200 rounded-sm p-1.5 text-xs text-slate-700 outline-none bg-slate-50"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PLANNING">Planning</option>
                <option value="DELAYED">Delayed</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                value={filterGate}
                onChange={(e) => setFilterGate(e.target.value)}
                className="border border-slate-200 rounded-sm p-1.5 text-xs text-slate-700 outline-none bg-slate-50"
              >
                <option value="ALL">All Gates</option>
                <option value="Gate 1">Gate 1 (Charter)</option>
                <option value="Gate 2">Gate 2 (Architecture)</option>
                <option value="Gate 3">Gate 3 (Build/QA)</option>
                <option value="Gate 4">Gate 4 (Pre-Launch)</option>
                <option value="Gate 5">Gate 5 (Production)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-slate-200 rounded-sm p-1.5 text-xs text-slate-700 outline-none bg-slate-50 font-medium"
              >
                <option value="progress">Sort: Progress %</option>
                <option value="budget">Sort: Budget Size</option>
                <option value="targetDate">Sort: Launch Date</option>
                <option value="name">Sort: Project Name</option>
              </select>
            </div>
          </div>

          {/* TABLE VIEW */}
          {layoutMode === 'table' && (
            <div className="bg-white border border-slate-200/80 rounded-sm overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f2f4f6] text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Project Title &amp; Stack</th>
                    <th className="px-4 py-3">Dept &amp; Owner</th>
                    <th className="px-4 py-3">Lifecycle Stage &amp; Gate</th>
                    <th className="px-4 py-3">Completion</th>
                    <th className="px-4 py-3">Budget / Burn</th>
                    <th className="px-4 py-3">Health &amp; Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.map((p) => {
                    const stack = getTechStack(p);
                    const spentPct = Math.round((p.spent / (p.budget || 1)) * 100);
                    const stg = getProjectStage(p);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">{p.code}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setSelectedProject(p); setIsEditing(false); }}
                            className="font-bold text-blue-900 hover:underline text-left block text-xs"
                          >
                            {p.name}
                          </button>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {stack.slice(0, 3).map((tech) => (
                              <span key={tech} className="bg-slate-100 text-slate-600 text-[9px] font-semibold px-1.5 py-0.5 rounded-xs">
                                {tech}
                              </span>
                            ))}
                            {stack.length > 3 && (
                              <span className="text-[9px] text-slate-400">+{stack.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800 block">{p.department}</span>
                          <span className="text-[10px] text-slate-500">{p.owner}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-indigo-950 font-extrabold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-xs text-[10px] block w-fit">
                            {stg}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block mt-0.5">{p.gate}</span>
                        </td>
                        <td className="px-4 py-3 min-w-[110px]">
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                            <span>{p.progress}%</span>
                            <span>{p.targetDate}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#00174b] h-full" style={{ width: `${p.progress}%` }}></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <span className="font-bold text-slate-900">${(p.spent / 1000).toFixed(0)}k</span>
                          <span className="text-slate-400"> / ${(p.budget / 1000).toFixed(0)}k</span>
                          <span className="block text-[10px] text-slate-500">({spentPct}% spent)</span>
                        </td>
                        <td className="px-4 py-3 space-y-1">
                          <div className="flex items-center gap-1.5">
                            {renderStatusBadge(p.status)}
                          </div>
                          <div>{renderHealthBadge(p.health)}</div>
                          <div className="pt-0.5">{renderApprovalBadge(p)}</div>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                          {currentPersona?.roleType === 'EXECUTIVE_MANAGER' && (p.approvalStatus === 'PENDING_APPROVAL' || !p.approvalStatus) && (
                            <>
                              <button
                                onClick={() => onApproveProject && onApproveProject(p.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xs shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                title="Approve Project Charter & Budget"
                              >
                                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingProjectId(p.id);
                                  setRejectionReasonInput('');
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-xs shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                title="Reject Project Charter"
                              >
                                <span className="material-symbols-outlined text-[13px]">cancel</span>
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setSelectedProject(p); setIsEditing(false); }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded-xs cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => {
                              const nextHealth: HealthStatus = p.health === 'GREEN' ? 'YELLOW' : p.health === 'YELLOW' ? 'RED' : 'GREEN';
                              onUpdateProject({ ...p, health: nextHealth });
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-blue-800 hover:bg-blue-50 rounded-xs border border-blue-200 cursor-pointer"
                            title="Cycle Health State"
                          >
                            Cycle Health
                          </button>
                        </td>
                      </tr>
                    );

                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* GRID CARDS VIEW */}
          {layoutMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((p) => {
                const stack = getTechStack(p);
                const spentPct = Math.round((p.spent / (p.budget || 1)) * 100);
                const stg = getProjectStage(p);
                return (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3 hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">{p.code} • {p.department}</span>
                          <h3
                            onClick={() => { setSelectedProject(p); setIsEditing(false); }}
                            className="font-bold text-slate-900 text-sm hover:text-blue-900 hover:underline cursor-pointer leading-tight mt-0.5"
                          >
                            {p.name}
                          </h3>
                        </div>
                        {renderHealthBadge(p.health)}
                      </div>

                      {/* Lifecycle Stage Badge */}
                      <div className="flex items-center gap-1.5 py-0.5">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-950 border border-indigo-200 font-mono font-extrabold text-[10px] rounded-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-indigo-700">account_tree</span>
                          Stage: {stg}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">({p.gate})</span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {stack.map((tech) => (
                          <span key={tech} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-xs">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-1 pt-2 text-xs">
                        <div className="flex justify-between text-slate-600 text-[11px]">
                          <span>Completion:</span>
                          <span className="font-mono font-bold text-slate-900">{p.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-900 rounded-full" style={{ width: `${p.progress}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block">Owner &amp; Budget</span>
                          <span className="font-bold text-slate-800">{p.owner}</span>
                          <span className="text-slate-500 font-mono block text-[11px]">${(p.budget / 1000).toFixed(0)}k</span>
                        </div>
                        <div>
                          {renderApprovalBadge(p)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-slate-50">
                        {currentPersona?.roleType === 'EXECUTIVE_MANAGER' && (p.approvalStatus === 'PENDING_APPROVAL' || !p.approvalStatus) ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => onApproveProject && onApproveProject(p.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xs shadow-2xs cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectingProjectId(p.id);
                                setRejectionReasonInput('');
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-xs shadow-2xs cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Stage: {stg}</span>
                        )}

                        <button
                          onClick={() => { setSelectedProject(p); setIsEditing(false); }}
                          className="px-3 py-1 bg-[#00174b] text-white font-bold text-[11px] rounded-xs hover:bg-indigo-950 cursor-pointer"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB: PROJECT LIFECYCLE ENGINE */}
      {activeSubTab === 'Project Lifecycle' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Lifecycle Overview Header Banner */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-900 text-[22px]">account_tree</span>
                  Enterprise Project Lifecycle Governance Engine
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sequential 5-stage gate framework tracking projects from Initiation through Architecture Planning, Active Sprint Execution, Compliance Audit Governance, and Production Closure.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1.5 rounded-sm font-mono text-xs font-bold">
                <span className="material-symbols-outlined text-[16px] text-indigo-600">verified</span>
                <span>Active Framework: Stage-Gate 5.0</span>
              </div>
            </div>

            {/* 5-Stage Governance Pipeline Stepper Header */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
              {[
                { stage: 'Initiation', num: 1, gate: 'Gate 1', desc: 'Feasibility & Charter', color: 'border-blue-500' },
                { stage: 'Planning', num: 2, gate: 'Gate 2', desc: 'Tech Stack & Budget', color: 'border-cyan-500' },
                { stage: 'Execution', num: 3, gate: 'Gate 3', desc: 'Sprints & Mid-QA', color: 'border-indigo-500' },
                { stage: 'Governance', num: 4, gate: 'Gate 4', desc: 'UAT & Compliance', color: 'border-amber-500' },
                { stage: 'Closure', num: 5, gate: 'Gate 5', desc: 'Production Release', color: 'border-emerald-500' }
              ].map((stg) => {
                const count = projects.filter((p) => getProjectStage(p) === stg.stage).length;
                const isSelected = selectedLifecycleStageFilter === stg.stage;
                return (
                  <button
                    key={stg.stage}
                    onClick={() =>
                      setSelectedLifecycleStageFilter(isSelected ? 'ALL' : stg.stage)
                    }
                    className={`text-left p-3 rounded-sm border transition-all relative overflow-hidden ${isSelected
                        ? 'bg-[#00174b] text-white border-[#00174b] shadow-md ring-2 ring-indigo-400'
                        : 'bg-slate-50 hover:bg-white border-slate-200/80 text-slate-800'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                        STAGE {stg.num} • {stg.gate}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${isSelected ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-800'
                          }`}
                      >
                        {count} Project{count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className={`font-extrabold text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {stg.stage}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {stg.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lifecycle Filter Pills Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-200/80 rounded-sm">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold mr-1">Filter Stage:</span>
              <button
                onClick={() => setSelectedLifecycleStageFilter('ALL')}
                className={`px-3 py-1 rounded-xs transition-colors ${selectedLifecycleStageFilter === 'ALL'
                    ? 'bg-[#00174b] text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                All Stages ({projects.length})
              </button>
              {STAGES_ORDER.map((stage) => {
                const cnt = projects.filter((p) => getProjectStage(p) === stage).length;
                return (
                  <button
                    key={stage}
                    onClick={() => setSelectedLifecycleStageFilter(stage)}
                    className={`px-3 py-1 rounded-xs transition-colors ${selectedLifecycleStageFilter === stage
                        ? 'bg-[#00174b] text-white font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                  >
                    {stage} ({cnt})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Lifecycle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects
              .filter((p) => {
                if (selectedLifecycleStageFilter === 'ALL') return true;
                return getProjectStage(p) === selectedLifecycleStageFilter;
              })
              .map((p) => {
                const stage = getProjectStage(p);
                const stageNum = getStageNumber(stage);
                const criteria = getStageCriteria(p, stage);
                const isCompleted = stage === 'Closure' || p.status === 'COMPLETED';

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200/90 rounded-sm p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
                  >
                    {/* Project Card Header */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[11px] font-bold text-slate-400">{p.code}</span>
                          {renderHealthBadge(p.health)}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-indigo-100 text-indigo-900">
                            Stage {stageNum}/5: {stage}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm hover:text-blue-900 cursor-pointer" onClick={() => setSelectedProject(p)}>
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Owner: <strong className="text-slate-700">{p.owner}</strong> • Dept: <strong className="text-slate-700">{p.department}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Overall Progress</span>
                        <span className="font-mono font-extrabold text-indigo-900 text-sm">{p.progress}%</span>
                      </div>
                    </div>

                    {/* Interactive 5-Step Progress Bar Stepper */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 font-mono">
                        <span>Initiation</span>
                        <span>Planning</span>
                        <span>Execution</span>
                        <span>Governance</span>
                        <span>Closure</span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-sm border border-slate-200/80">
                        {STAGES_ORDER.map((st, idx) => {
                          const stepNum = idx + 1;
                          const isPast = stepNum < stageNum;
                          const isCurrent = stepNum === stageNum;
                          return (
                            <div
                              key={st}
                              className={`h-2.5 rounded-xs transition-all ${isPast
                                  ? 'bg-emerald-500'
                                  : isCurrent
                                    ? 'bg-[#00174b] ring-2 ring-indigo-300'
                                    : 'bg-slate-200'
                                }`}
                              title={`${st} (${stepNum}/5)`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Stage Gate Criteria Checklist */}
                    <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xs space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-indigo-700">fact_check</span>
                          {stage} Phase Criteria Checklist
                        </span>
                        <span className="font-mono text-[#00174b]">
                          {criteria.filter((c) => c.completed).length}/{criteria.length} Verified
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1 text-xs">
                        {criteria.map((c) => (
                          <div key={c.id} className="flex items-center justify-between text-[11px]">
                            <span className={`flex items-center gap-1.5 ${c.completed ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                              <span
                                className={`material-symbols-outlined text-[14px] ${c.completed ? 'text-emerald-600 font-bold' : 'text-slate-300'
                                  }`}
                              >
                                {c.completed ? 'check_circle' : 'radio_button_unchecked'}
                              </span>
                              {c.label}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-xs ${c.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                }`}
                            >
                              {c.completed ? 'PASSED' : 'PENDING'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Executive Control Buttons: Advance / Demote / Inspect */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        {stageNum > 1 && (
                          <button
                            onClick={() => handleDemoteStage(p)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xs text-[11px] flex items-center gap-1 border border-slate-300"
                            title="Rollback to previous lifecycle stage"
                          >
                            <span className="material-symbols-outlined text-[14px]">undo</span>
                            Rollback
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProject(p);
                            setIsEditing(false);
                          }}
                          className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xs text-[11px]"
                        >
                          Lifecycle Audit
                        </button>

                        {stageNum < 5 && (
                          <button
                            onClick={() => handleAdvanceStage(p)}
                            className="px-3.5 py-1.5 bg-[#00174b] hover:bg-indigo-950 text-white font-bold rounded-xs text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-2xs"
                          >
                            <span>Promote to Stage {stageNum + 1}</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        )}

                        {stageNum === 5 && (
                          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 font-extrabold text-[11px] rounded-xs uppercase tracking-wider flex items-center gap-1 font-mono">
                            <span className="material-symbols-outlined text-[14px]">task_alt</span>
                            Lifecycle Complete
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: REQUIREMENTS MATRIX */}
      {activeSubTab === 'Web Requirements' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-blue-800 text-[20px]">checklist_rtl</span>
              Project Architecture &amp; Technical Requirements Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Verification matrix for core technical requirements across projects including Auth, APIs, Databases, Accessibility, and DevOps pipelines.
            </p>
          </div>

          <div className="space-y-6">
            {filteredProjects.slice(0, 6).map((p) => {
              const reqs = getRequirements(p);
              return (
                <div key={p.id} className="border border-slate-200 rounded-xs p-4 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/60 pb-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">{p.code}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Tech Stack:</span>
                      <div className="flex flex-wrap gap-1">
                        {getTechStack(p).map((t) => (
                          <span key={t} className="bg-blue-50 text-blue-800 font-semibold text-[10px] px-2 py-0.5 rounded-xs border border-blue-100">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {reqs.map((req) => (
                      <div
                        key={req.id}
                        onClick={() => handleToggleRequirement(p, req.id)}
                        className="p-3 bg-white border border-slate-200 rounded-xs hover:border-blue-400 cursor-pointer transition-colors space-y-1.5 shadow-2xs"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{req.category}</span>
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded-xs ${req.status === 'Compliant'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-xs leading-snug">{req.title}</p>
                        <p className="text-[10px] text-slate-400">Assigned: {req.owner} • Click to toggle compliance</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: GATE ROADMAP */}
      {activeSubTab === 'Gate Roadmap' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-indigo-700 text-[20px]">alt_route</span>
              PMO Gate Lifecycle Roadmap
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Projects distributed by formal governance approval gates: Gate 1 (Charter), Gate 2 (Architecture), Gate 3 (Build &amp; QA), Gate 4 (Pre-Launch), Gate 5 (Production).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {['Gate 1', 'Gate 2', 'Gate 3', 'Gate 4', 'Gate 5'].map((gateName, idx) => {
              const gateProjects = projects.filter((p) => p.gate === gateName);
              return (
                <div key={gateName} className="bg-slate-50 border border-slate-200 rounded-xs p-3 space-y-3 min-h-[300px]">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phase {idx + 1}</span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{gateName}</h4>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">{gateProjects.length} Projects</span>
                  </div>

                  <div className="space-y-2">
                    {gateProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { setSelectedProject(p); setIsEditing(false); }}
                        className="p-3 bg-white border border-slate-200/80 rounded-xs hover:border-blue-500 cursor-pointer shadow-2xs space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-slate-600">{p.code}</span>
                          {renderHealthBadge(p.health)}
                        </div>
                        <p className="font-bold text-slate-900 text-xs leading-snug">{p.name}</p>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-[#00174b] h-full" style={{ width: `${p.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                    {gateProjects.length === 0 && (
                      <p className="text-[11px] text-slate-400 italic text-center py-6">No projects in this gate stage</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: KANBAN PIPELINE */}
      {activeSubTab === 'Kanban Pipeline' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[#00174b] text-[20px]">view_kanban</span>
              Project Status Kanban Board
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Visual pipeline tracking projects from Planning through Active execution, Delayed remediation, and Final Completion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {[
              { status: 'PLANNING', label: 'Planning', color: 'border-t-purple-600' },
              { status: 'ACTIVE', label: 'Active Execution', color: 'border-t-blue-800' },
              { status: 'DELAYED', label: 'Delayed / At Risk', color: 'border-t-red-600' },
              { status: 'COMPLETED', label: 'Completed', color: 'border-t-emerald-600' }
            ].map((col) => {
              const colProjects = projects.filter((p) => p.status === col.status);
              return (
                <div key={col.status} className={`bg-slate-50 border border-slate-200/80 border-t-4 ${col.color} p-3 rounded-xs space-y-3 min-h-[350px]`}>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{col.label}</h4>
                    <span className="font-mono font-bold text-slate-600 text-xs px-2 py-0.5 bg-slate-200 rounded-full">{colProjects.length}</span>
                  </div>

                  <div className="space-y-3">
                    {colProjects.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 bg-white border border-slate-200 rounded-xs shadow-2xs space-y-2 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[10px] font-bold text-slate-400">{p.code}</span>
                          {renderHealthBadge(p.health)}
                        </div>
                        <h5
                          onClick={() => { setSelectedProject(p); setIsEditing(false); }}
                          className="font-bold text-slate-900 text-xs hover:underline cursor-pointer"
                        >
                          {p.name}
                        </h5>
                        <p className="text-[11px] text-slate-500">{p.department} • Owner: {p.owner}</p>

                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                          <span className="font-mono font-bold text-slate-700">{p.progress}% Done</span>
                          <button
                            onClick={() => { setSelectedProject(p); setIsEditing(false); }}
                            className="text-blue-800 font-bold hover:underline"
                          >
                            Details →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: AI CHARTER GENERATOR */}
      {activeSubTab === 'AI Charter Generator' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
                <span>INTELLIGENCE</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-[#00174b]">AI PROJECT CHARTER SYNTHESIZER</span>
              </nav>
              <h3 className="text-[22px] font-bold tracking-tight text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[28px]">auto_awesome</span>
                Synthesize Strategic Project Blueprint
              </h3>
              <p className="text-slate-600 mt-1">
                Enter an enterprise project initiative, and Gemini AI will construct a complete project charter, technical stack recommendations, and governance gate criteria.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Enterprise E-Commerce Gateway with Real-time Inventory Analytics..."
                className="w-full border border-slate-300 rounded-sm p-3 outline-none focus:border-blue-600 text-xs font-sans"
              />

              <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">Quick Templates:</span>
                  <button
                    onClick={() => setAiPrompt('Cloud Data Lake Analytics Web Portal')}
                    className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-xs text-slate-700 font-medium"
                  >
                    Data Lake Portal
                  </button>
                  <button
                    onClick={() => setAiPrompt('Zero-Trust IAM Access Control Hub')}
                    className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-xs text-slate-700 font-medium"
                  >
                    Zero-Trust Hub
                  </button>
                  <button
                    onClick={() => setAiPrompt('Supplier Procurement & Invoice Portal')}
                    className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-xs text-slate-700 font-medium"
                  >
                    Procurement Portal
                  </button>
                </div>

                <button
                  onClick={handleGenerateAICharter}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="px-5 py-2 bg-[#00174b] disabled:bg-slate-300 text-white font-bold rounded-xs uppercase tracking-wider hover:bg-indigo-950 flex items-center gap-2 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  {aiLoading ? 'Synthesizing Spec...' : 'Generate AI Charter'}
                </button>
              </div>
            </div>
          </div>

          {/* Generated AI Charter Output */}
          {aiResult && (
            <div className="bg-slate-900 text-slate-100 p-6 rounded-sm border border-slate-800 shadow-xl space-y-4 text-xs font-mono leading-relaxed animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Generated Web Project Specification
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreateProjectFromAI}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xs text-[11px] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">add_circle</span>
                    Create This Web Project
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(aiResult)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xs text-[11px] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    Copy Spec
                  </button>
                </div>
              </div>

              <div className="whitespace-pre-wrap text-slate-200">{aiResult}</div>
            </div>
          )}
        </div>
      )}

      {/* COMPREHENSIVE PROJECT DETAILS PAGE / MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white max-w-6xl w-full max-h-[95vh] overflow-y-auto rounded-sm border border-slate-300 shadow-2xl flex flex-col text-xs animate-fadeIn my-auto">

            {/* Top Navigation & Header Banner */}
            <div className="bg-[#00174b] text-white p-5 sm:p-6 rounded-t-sm space-y-4 sticky top-0 z-20 shadow-md">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xs flex items-center gap-1.5 transition-colors border border-white/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Back to Projects Hub</span>
                  </button>

                </div>

                {/* Header Action Controls - Conditional by Role */}
                <div className="flex flex-wrap items-center gap-2">
                  {userRoleMode === 'Executive Admin' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAdvanceStage(selectedProject)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[11px] uppercase tracking-wider rounded-xs flex items-center gap-1 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        Executive Sign-Off
                      </button>

                      {currentPersona?.roleType !== 'TEAM_MEMBER' && selectedProject.approvalStatus === 'APPROVED' && (
                        <button
                          onClick={() => setIsAssignTeamModalOpen(true)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider rounded-xs flex items-center gap-1 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[15px]">person_add</span>
                          Assign Team Members
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditedProject(selectedProject);
                          setIsEditing(!isEditing);
                        }}
                        className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-[11px] rounded-xs flex items-center gap-1 border border-indigo-700"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        {isEditing ? 'Cancel Edit' : 'Edit Project'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmProject(selectedProject)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-xs flex items-center gap-1 border border-rose-700 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                        Delete Project
                      </button>
                    </>
                  )}

                  {userRoleMode === 'Project Member' && (
                    <button
                      onClick={() => setProjectDetailTab('Works Done')}
                      className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-xs flex items-center gap-1 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">add_task</span>
                      Log Work Deliverable
                    </button>
                  )}

                  {currentPersona?.roleType === 'EXECUTIVE_MANAGER' && (selectedProject.approvalStatus === 'PENDING_APPROVAL' || !selectedProject.approvalStatus) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onApproveProject) onApproveProject(selectedProject.id);
                          setSelectedProject({ ...selectedProject, approvalStatus: 'APPROVED', status: 'ACTIVE' });
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xs shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Approve Project Charter
                      </button>
                      <button
                        onClick={() => {
                          setRejectingProjectId(selectedProject.id);
                          setRejectionReasonInput('');
                        }}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xs shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        Reject Charter
                      </button>
                    </div>
                  )}

                  {userRoleMode === 'Stakeholder' && (
                    <span className="text-[11px] font-mono text-slate-300 bg-white/10 px-2.5 py-1 rounded-xs border border-white/15">
                      Read-Only Mode
                    </span>
                  )}

                  <button
                    onClick={() => setSelectedProject(null)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1 cursor-pointer"
                    title="Close"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Project Title, Code & Role Badge */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-t border-white/10 pt-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono mb-1">
                    <span className="bg-white/15 px-2 py-0.5 rounded-xs font-bold text-amber-300">{selectedProject.code}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-200">{selectedProject.department}</span>
                    <span className="text-slate-300">•</span>
                    {renderHealthBadge(selectedProject.health)}
                    {renderStatusBadge(selectedProject.status)}
                    {renderApprovalBadge(selectedProject)}


                    {/* Role Display Badge */}
                    {userRoleMode === 'Executive Admin' && (
                      <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-xs inline-flex items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-[13px]">admin_panel_settings</span>
                        Admin Full View
                      </span>
                    )}
                    {userRoleMode === 'Project Member' && (
                      <span className="bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-xs inline-flex items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-[13px]">badge</span>
                        Team Member View
                      </span>
                    )}
                    {userRoleMode === 'Stakeholder' && (
                      <span className="bg-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-xs inline-flex items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-[13px]">visibility</span>
                        Stakeholder View
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{selectedProject.name}</h2>
                  <p className="text-xs text-indigo-200 mt-1 flex items-center gap-2">
                    <span>Executive PM / Owner: <strong className="text-white">{selectedProject.owner}</strong></span>
                    <span>•</span>
                    <span>Target Launch: <strong className="text-white">{selectedProject.targetDate}</strong></span>
                  </p>
                </div>

                {/* Progress & Gate Quick Stat */}
                <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-sm flex items-center gap-4 text-white min-w-[220px]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-indigo-200 block">Lifecycle Stage</span>
                    <span className="font-mono font-extrabold text-sm text-amber-400">{getProjectStage(selectedProject)}</span>
                  </div>
                  <div className="border-l border-white/20 pl-4">
                    <span className="text-[9px] uppercase font-bold text-indigo-200 block">Completion</span>
                    <span className="font-mono font-extrabold text-sm text-white">{selectedProject.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs Navigation Bar - Role Adaptive */}
              <div className="flex flex-wrap gap-1 pt-2 border-t border-white/10 font-bold text-xs">
                {userRoleMode === 'Executive Admin' && [
                  { key: 'Overview', label: 'Overview & Financials', icon: 'dashboard' },
                  { key: 'Lifecycle', label: 'Lifecycle Governance', icon: 'account_tree' },
                  {
                    key: 'Participants', label: `Participants & Team (${(users || []).filter(u =>
                      u.assignedProjectCodes?.some(c => c?.toLowerCase() === selectedProject.code?.toLowerCase() || selectedProject.code?.toLowerCase().includes(c?.toLowerCase())) ||
                      u.name?.toLowerCase().includes(selectedProject.owner?.toLowerCase() || '') ||
                      (u.department && selectedProject.department && u.department.toLowerCase() === selectedProject.department.toLowerCase())
                    ).length || 3
                      })`, icon: 'groups'
                  },
                  { key: 'Works Done', label: 'Progress & Works Done', icon: 'task_alt' },
                  { key: 'Risks', label: 'Risks & Issues', icon: 'warning' },
                  { key: 'Chat', label: 'Project Chat & Telegram', icon: 'chat' },
                  { key: 'Requirements', label: 'Tech Requirements Matrix', icon: 'checklist_rtl' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setProjectDetailTab(tab.key as any)}
                    className={`px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all text-xs ${projectDetailTab === tab.key
                        ? 'bg-white text-[#00174b] font-extrabold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}

                {userRoleMode === 'Project Member' && [
                  { key: 'Works Done', label: 'My Works & Deliverables', icon: 'task_alt' },
                  { key: 'Chat', label: 'Project Chat & Telegram', icon: 'chat' },
                  { key: 'Risks', label: 'Risks & Issues', icon: 'warning' },
                  { key: 'Overview', label: 'Overview & Objective', icon: 'info' },
                  { key: 'Participants', label: 'Project Teammates', icon: 'groups' },
                  { key: 'Requirements', label: 'Tech Stack & Reqs', icon: 'code' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setProjectDetailTab(tab.key as any)}
                    className={`px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all text-xs ${projectDetailTab === tab.key
                        ? 'bg-white text-[#00174b] font-extrabold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}

                {userRoleMode === 'Stakeholder' && [
                  { key: 'Overview', label: 'Project Summary & Objectives', icon: 'analytics' },
                  { key: 'Works Done', label: 'Deliverables & Completion', icon: 'done_all' },
                  { key: 'Risks', label: 'Risks & Issues', icon: 'warning' },
                  { key: 'Chat', label: 'Project Discussions', icon: 'chat' },
                  { key: 'Participants', label: 'Project Team', icon: 'groups' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setProjectDetailTab(tab.key as any)}
                    className={`px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all text-xs ${projectDetailTab === tab.key
                        ? 'bg-white text-[#00174b] font-extrabold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal / Page Body Content */}
            <div className="p-6 space-y-6 flex-1 bg-slate-50/50">

              {/* Editing Form Toggle */}
              {isEditing && editedProject ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onUpdateProject(editedProject);
                    setSelectedProject(editedProject);
                    setIsEditing(false);
                  }}
                  className="bg-white p-6 border border-slate-200 rounded-sm shadow-2xs space-y-4"
                >
                  <h4 className="font-bold text-slate-900 text-sm border-b pb-2">Edit Project Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Project Name</label>
                      <input
                        type="text"
                        value={editedProject.name}
                        onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                        className="w-full border p-2 rounded-sm outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Department</label>
                      <input
                        type="text"
                        value={editedProject.department}
                        onChange={(e) => setEditedProject({ ...editedProject, department: e.target.value })}
                        className="w-full border p-2 rounded-sm outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {currentPersona?.roleType !== 'PROJECT_MANAGER' && (
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">Budget ($)</label>
                        <input
                          type="number"
                          value={editedProject.budget}
                        className="w-full border p-2 rounded-sm font-mono"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Progress (%)</label>
                      <input
                        type="number"
                        max={100}
                        min={0}
                        value={editedProject.progress}
                        onChange={(e) => setEditedProject({ ...editedProject, progress: Number(e.target.value) })}
                        disabled={editedProject.approvalStatus === 'APPROVED' || editedProject.status === 'ACTIVE' || editedProject.status === 'COMPLETED'}
                        className="w-full border p-2 rounded-sm font-mono disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Gate Stage</label>
                      <select
                        value={editedProject.gate}
                        onChange={(e) => setEditedProject({ ...editedProject, gate: e.target.value })}
                        disabled={editedProject.approvalStatus === 'APPROVED' || editedProject.status === 'ACTIVE' || editedProject.status === 'COMPLETED'}
                        className="w-full border p-2 rounded-sm outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="Gate 1">Gate 1 (Charter)</option>
                        <option value="Gate 2">Gate 2 (Architecture)</option>
                        <option value="Gate 3">Gate 3 (Build/QA)</option>
                        <option value="Gate 4">Gate 4 (Governance)</option>
                        <option value="Gate 5">Gate 5 (Production)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-1.5 border rounded-sm font-bold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#00174b] text-white font-bold rounded-sm uppercase"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW & FINANCIALS */}
                  {projectDetailTab === 'Overview' && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Metric Cards Banner - Executive Admin View (Includes Financials) */}
                      {userRoleMode === 'Executive Admin' && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Capital Budget</span>
                              <p className="text-2xl font-black text-slate-900 font-mono">${(selectedProject.budget / 1000).toFixed(0)}k</p>
                              <span className="text-[11px] text-slate-500">Allocated budget pool</span>
                            </div>

                            <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Capital Burned</span>
                              <p className="text-2xl font-black text-indigo-900 font-mono">${(selectedProject.spent / 1000).toFixed(0)}k</p>
                              <span className="text-[11px] text-emerald-600 font-bold font-mono">
                                {selectedProject.budget > 0 ? Math.round((selectedProject.spent / selectedProject.budget) * 100) : 0}% Utilized
                              </span>
                            </div>

                            <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Remaining Balance</span>
                              <p className="text-2xl font-black text-emerald-700 font-mono">
                                ${(Math.max(0, selectedProject.budget - selectedProject.spent) / 1000).toFixed(0)}k
                              </p>
                              <span className="text-[11px] text-slate-500">Available capital funds</span>
                            </div>

                            <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gate Milestone</span>
                              <p className="text-xl font-black text-slate-900 font-mono">{selectedProject.gate}</p>
                              <span className="text-[11px] text-indigo-700 font-bold uppercase">{getProjectStage(selectedProject)} Stage</span>
                            </div>
                          </div>

                          {/* Executive Admin Oversight & Directives Banner */}
                          <div className="bg-gradient-to-r from-slate-900 to-[#00174b] text-white p-5 rounded-sm shadow-sm space-y-3 border border-slate-800">
                            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-white/10 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-400 text-[20px]">shield_person</span>
                                <div>
                                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Executive Admin Oversight &amp; PMO Governance Authority</h4>
                                  <p className="text-[11px] text-indigo-200">System Level 1 Administrative Clearance Active</p>
                                </div>
                              </div>
                              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold px-2.5 py-0.5 rounded-xs text-[10px] uppercase">
                                Executive Gate Approved
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xs space-y-1">
                                <span className="text-[10px] text-slate-300 font-bold uppercase block">Authorized Administrator</span>
                                <p className="font-bold text-white font-mono">System Admin (Executive PMO)</p>
                                <p className="text-[10px] text-indigo-300">Authority: Level 1 Unrestricted</p>
                              </div>

                              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xs space-y-1">
                                <span className="text-[10px] text-slate-300 font-bold uppercase block">Last Gate Sign-Off</span>
                                <p className="font-bold text-amber-300 font-mono">2026-07-29 • 09:30 AM</p>
                                <p className="text-[10px] text-indigo-300">Phase: {getProjectStage(selectedProject)} Verified</p>
                              </div>

                              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xs space-y-1">
                                <span className="text-[10px] text-slate-300 font-bold uppercase block">Executive Audit &amp; Compliance</span>
                                <p className="font-bold text-emerald-400 font-mono">100% Compliant</p>
                                <p className="text-[10px] text-indigo-300">Zero Critical Governance Blockers</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Metric Cards Banner - Team Member View (Focuses on Execution & Tasks) */}
                      {userRoleMode === 'Project Member' && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Project Completion</span>
                              <p className="text-2xl font-black text-blue-700 font-mono">{selectedProject.progress}%</p>
                              <span className="text-[11px] text-slate-500">Overall deliverable progress</span>
                            </div>

                            <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Gate Phase</span>
                              <p className="text-xl font-black text-slate-900 font-mono">{selectedProject.gate}</p>
                              <span className="text-[11px] text-indigo-700 font-bold uppercase">{getProjectStage(selectedProject)} Stage</span>
                            </div>

                            <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Launch Date</span>
                              <p className="text-lg font-black text-slate-800 font-mono">{selectedProject.targetDate}</p>
                              <span className="text-[11px] text-emerald-600 font-bold">On Schedule</span>
                            </div>

                            <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Lead Executive PM</span>
                              <p className="text-sm font-black text-slate-900">{selectedProject.owner}</p>
                              <span className="text-[11px] text-slate-500">{selectedProject.department}</span>
                            </div>
                          </div>

                          {/* Team Member Workspace Banner */}
                          <div className="bg-blue-900 text-white p-4 rounded-sm shadow-2xs space-y-2 border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-blue-300 text-[24px]">badge</span>
                              <div>
                                <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Team Member Work Portal</h4>
                                <p className="text-[11px] text-blue-200">
                                  Displaying assigned project objectives, deliverables, participant team, and tech stack.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-blue-800 pt-3 md:pt-0 md:pl-4">
                              <div className="text-right">
                                <span className="block text-[10px] text-blue-300 uppercase tracking-wider font-bold">My Responsibility</span>
                                <span className="block text-sm font-black text-amber-400">
                                  {projectTeamMembers.find(m => String(m.id) === String(currentPersona?.id))?.responsibility || 'General Member'}
                                </span>
                              </div>
                              <button
                                onClick={() => setProjectDetailTab('Works Done')}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xs shadow-2xs flex items-center gap-1 whitespace-nowrap"
                              >
                                <span className="material-symbols-outlined text-[15px]">task_alt</span>
                                View Deliverables
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Metric Cards Banner - Stakeholder Read-Only View */}
                      {userRoleMode === 'Stakeholder' && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Initiative Health</span>
                              <div className="pt-1">{renderHealthBadge(selectedProject.health)}</div>
                              <span className="text-[11px] text-slate-500 block pt-1">Executive Health Indicator</span>
                            </div>

                            <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Overall Progress</span>
                              <p className="text-2xl font-black text-slate-900 font-mono">{selectedProject.progress}%</p>
                              <span className="text-[11px] text-slate-500">Milestone completion</span>
                            </div>

                            <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Delivery</span>
                              <p className="text-xl font-black text-indigo-900 font-mono">{selectedProject.targetDate}</p>
                              <span className="text-[11px] text-indigo-700 font-bold uppercase">{selectedProject.gate}</span>
                            </div>
                          </div>

                          <div className="bg-slate-800 text-white p-4 rounded-sm shadow-2xs border border-slate-700 flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-300 text-[22px]">visibility</span>
                            <div>
                              <h4 className="font-extrabold text-xs uppercase tracking-wider text-white">Stakeholder Overview Mode</h4>
                              <p className="text-[11px] text-slate-300">
                                Read-only summary presentation for enterprise stakeholders and executive observers.
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Rejection Banner */}
                      {selectedProject.approvalStatus === 'REJECTED' && selectedProject.rejectionReason && (
                        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xs flex items-start gap-3 shadow-2xs">
                          <span className="material-symbols-outlined text-rose-600 text-[24px]">error</span>
                          <div>
                            <h4 className="text-rose-900 font-extrabold text-sm mb-1">Project Charter Rejected</h4>
                            <p className="text-rose-800 text-xs font-medium">{selectedProject.rejectionReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Project Charter & Objectives */}
                      <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
                        <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                          <span className="material-symbols-outlined text-indigo-700 text-[18px]">description</span>
                          Project Charter &amp; Objective Statement
                        </h4>
                        <p className="text-slate-700 leading-relaxed text-xs">
                          {selectedProject.description ||
                            `Enterprise initiative ${selectedProject.name} (${selectedProject.code}) is commissioned under the ${selectedProject.department} division to deliver critical system capabilities, technical modernization, and governance gate clearances.`}
                        </p>
                      </div>

                      {/* Tech Architecture Stack */}
                      <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
                        <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                          <span className="material-symbols-outlined text-blue-700 text-[18px]">hub</span>
                          Web Architecture &amp; Technology Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {getTechStack(selectedProject).map((tech) => (
                            <span key={tech} className="bg-blue-50 text-blue-900 font-bold px-3 py-1.5 rounded-xs border border-blue-200 text-xs flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-blue-600">code</span>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LIFECYCLE GOVERNANCE & STAGE TEMPLATES */}
                  {projectDetailTab === 'Lifecycle' && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Interactive 5-Stage Stepper Banner */}
                      <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Stage Gate Governance Engine</span>
                            <h4 className="font-extrabold text-slate-900 text-base">5-Stage Project Lifecycle Templates &amp; Gate Clearances</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-950 font-mono font-extrabold text-xs rounded-full">
                              Active Stage {getStageNumber(getProjectStage(selectedProject))}/5: {getProjectStage(selectedProject)}
                            </span>
                            <span className="px-3 py-1 bg-amber-100 text-amber-950 font-mono font-extrabold text-xs rounded-full">
                              Inspecting: {inspectStage}
                            </span>
                          </div>
                        </div>

                        {/* Stage Selector Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                          {STAGES_ORDER.map((stg, idx) => {
                            const curStg = getProjectStage(selectedProject);
                            const curNum = getStageNumber(curStg);
                            const stgNum = idx + 1;
                            const isPast = stgNum < curNum;
                            const isCurrent = stgNum === curNum;
                            const isInspected = inspectStage === stg;

                            return (
                              <button
                                type="button"
                                key={stg}
                                onClick={() => setInspectStage(stg)}
                                className={`p-3 rounded-xs border text-left transition-all relative cursor-pointer ${isInspected
                                    ? 'bg-[#00174b] text-white border-[#00174b] shadow-md ring-2 ring-indigo-400'
                                    : isCurrent
                                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                                      : isPast
                                        ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className={`text-[9px] font-bold font-mono uppercase ${isInspected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    STAGE 0{stgNum} • GATE {stgNum}
                                  </span>
                                  {isPast && (
                                    <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">check_circle</span>
                                  )}
                                  {isCurrent && !isPast && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                  )}
                                </div>
                                <p className={`font-extrabold text-xs ${isInspected ? 'text-white' : 'text-slate-900'}`}>{stg}</p>
                                <p className={`text-[10px] mt-0.5 ${isInspected ? 'text-indigo-100' : 'text-slate-500'}`}>
                                  {stg === 'Initiation' && 'Charter & Feasibility'}
                                  {stg === 'Planning' && 'Tech Stack & Budget'}
                                  {stg === 'Execution' && 'Sprints & Quality QA'}
                                  {stg === 'Governance' && 'UAT & Compliance'}
                                  {stg === 'Closure' && 'Production Cutover'}
                                </p>
                              </button>
                            );
                          })}
                        </div>

                        {/* Executive Promotion / Rollback Bar - Gated by Role */}
                        {userRoleMode === 'Executive Admin' ? (
                          <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t bg-slate-50 p-3 rounded-xs border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">Governance Controls:</span>
                              {getStageNumber(getProjectStage(selectedProject)) > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDemoteStage(selectedProject);
                                    setInspectStage(getProjectStage(selectedProject));
                                  }}
                                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 rounded-xs text-xs flex items-center gap-1 shadow-2xs"
                                >
                                  <span className="material-symbols-outlined text-[16px]">undo</span>
                                  Rollback Active Stage
                                </button>
                              )}
                            </div>

                            {getStageNumber(getProjectStage(selectedProject)) < 5 && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleAdvanceStage(selectedProject);
                                  setInspectStage(getProjectStage(selectedProject));
                                }}
                                className="px-4 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-bold rounded-xs text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                              >
                                <span>Promote Active Stage to Stage {getStageNumber(getProjectStage(selectedProject)) + 1}</span>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between pt-3 border-t bg-slate-100 p-3 rounded-xs border-slate-200 text-xs gap-2">
                            <span className="flex items-center gap-1.5 font-bold text-slate-700">
                              <span className="material-symbols-outlined text-slate-500 text-[16px]">lock</span>
                              Gate Promotion &amp; Stage Rollback Authority
                            </span>
                            <span className="bg-slate-200 text-slate-700 font-mono font-bold px-2.5 py-1 rounded-xs text-[11px]">
                              Executive Admin Clearance Required
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stage Specific Template & Verification Hub */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Column 1 & 2: Stage Template Documents & Output Matrix */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-4">
                            <div className="flex justify-between items-center border-b pb-3">
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                                  <span className="material-symbols-outlined text-indigo-700 text-[20px]">folder_special</span>
                                  {inspectStage} Stage Required Templates &amp; Artifacts
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Official PMO documents, spec sheets, and templates needed for {selectedProject.name} at {inspectStage} phase.
                                </p>
                              </div>
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono text-xs font-bold rounded-xs border border-slate-200">
                                {getStageGateName(inspectStage)} Package
                              </span>
                            </div>

                            {/* Template Documents Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {inspectStage === 'Initiation' && [
                                { title: 'Project Charter & Mandate Document', type: 'PDF / Charter', code: 'PMO-TMP-01', status: 'Approved', icon: 'description' },
                                { title: 'Business Case & ROI Feasibility Model', type: 'XLSX / Financial', code: 'PMO-TMP-02', status: 'Completed', icon: 'payments' },
                                { title: 'Initial Stakeholder & Sponsor Register', type: 'DOCX / Matrix', code: 'PMO-TMP-03', status: 'Signed Off', icon: 'contacts' },
                                { title: 'High-Level Scope & Objectives Spec', type: 'PDF / Spec', code: 'PMO-TMP-04', status: 'Approved', icon: 'target' }
                              ].map((tmp) => (
                                <div key={tmp.code} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xs space-y-2 hover:border-blue-400 transition-all">
                                  <div className="flex justify-between items-start">
                                    <span className="material-symbols-outlined text-indigo-700 text-[20px]">{tmp.icon}</span>
                                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-xs">
                                      {tmp.status}
                                    </span>
                                  </div>
                                  <div>
                                    <h5 className="font-extrabold text-slate-900 text-xs">{tmp.title}</h5>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tmp.code} • {tmp.type}</p>
                                  </div>
                                  <button
                                    onClick={() => alert(`Opening template specimen: ${tmp.title} for project ${selectedProject.code}`)}
                                    className="w-full py-1 text-center bg-white hover:bg-slate-100 text-slate-800 font-bold text-[10px] uppercase border border-slate-300 rounded-xs flex items-center justify-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">download</span>
                                    View / Download Template
                                  </button>
                                </div>
                              ))}

                              {inspectStage === 'Planning' && [
                                { title: 'Work Breakdown Structure (WBS) Matrix', type: 'MS Project / WBS', code: 'PMO-TMP-05', status: 'Approved', icon: 'account_tree' },
                                { title: 'Resource Allocation & Capacity Plan', type: 'XLSX / Staffing', code: 'PMO-TMP-06', status: 'Locked', icon: 'badge' },
                                { title: 'Risk Log & Mitigation Strategy', type: 'PDF / Risk Matrix', code: 'PMO-TMP-07', status: 'Active', icon: 'warning' },
                                { title: 'Technical Architecture & Security Spec', type: 'DOCX / Tech Blueprint', code: 'PMO-TMP-08', status: 'Approved', icon: 'hub' }
                              ].map((tmp) => (
                                <div key={tmp.code} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xs space-y-2 hover:border-blue-400 transition-all">
                                  <div className="flex justify-between items-start">
                                    <span className="material-symbols-outlined text-blue-700 text-[20px]">{tmp.icon}</span>
                                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-xs">
                                      {tmp.status}
                                    </span>
                                  </div>
                                  <div>
                                    <h5 className="font-extrabold text-slate-900 text-xs">{tmp.title}</h5>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tmp.code} • {tmp.type}</p>
                                  </div>
                                  <button
                                    onClick={() => alert(`Opening template specimen: ${tmp.title} for project ${selectedProject.code}`)}
                                    className="w-full py-1 text-center bg-white hover:bg-slate-100 text-slate-800 font-bold text-[10px] uppercase border border-slate-300 rounded-xs flex items-center justify-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">download</span>
                                    View / Download Template
                                  </button>
                                </div>
                              ))}

                              {inspectStage === 'Execution' && [
                                { title: 'Sprint Backlog & Velocity Dashboard', type: 'Jira / Agile Spec', code: 'PMO-TMP-09', status: 'In Execution', icon: 'space_dashboard' },
                                { title: 'Quality Assurance Test Suite Matrix', type: 'PDF / Test Log', code: 'PMO-TMP-10', status: 'Passing 98%', icon: 'fact_check' },
                                { title: 'Change Request (CR) Impact Form', type: 'DOCX / Change Log', code: 'PMO-TMP-11', status: 'Active', icon: 'published_with_changes' },
                                { title: 'Daily Standup & Commit Log Stream', type: 'JSON / Dev Log', code: 'PMO-TMP-12', status: 'Syncing', icon: 'code' }
                              ].map((tmp) => (
                                <div key={tmp.code} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xs space-y-2 hover:border-blue-400 transition-all">
                                  <div className="flex justify-between items-start">
                                    <span className="material-symbols-outlined text-amber-700 text-[20px]">{tmp.icon}</span>
                                    <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-xs">
                                      {tmp.status}
                                    </span>
                                  </div>
                                  <div>
                                    <h5 className="font-extrabold text-slate-900 text-xs">{tmp.title}</h5>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tmp.code} • {tmp.type}</p>
                                  </div>
                                  <button
                                    onClick={() => alert(`Opening template specimen: ${tmp.title} for project ${selectedProject.code}`)}
                                    className="w-full py-1 text-center bg-white hover:bg-slate-100 text-slate-800 font-bold text-[10px] uppercase border border-slate-300 rounded-xs flex items-center justify-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">download</span>
                                    View / Download Template
                                  </button>
                                </div>
                              ))}

                              {inspectStage === 'Governance' && [
                                { title: 'Steering Committee Gate Review Deck', type: 'PPTX / Gate Deck', code: 'PMO-TMP-13', status: 'Ready', icon: 'slideshow' },
                                { title: 'Earned Value Management (EVM) Report', type: 'XLSX / EVM', code: 'PMO-TMP-14', status: 'Calculated', icon: 'query_stats' },
                                { title: 'User Acceptance Testing (UAT) Sign-off', type: 'PDF / Audit Sign', code: 'PMO-TMP-15', status: 'Completed', icon: 'verified' },
                                { title: 'Regulatory Compliance & SLA Audit', type: 'PDF / Compliance', code: 'PMO-TMP-16', status: 'Passed', icon: 'gavel' }
                              ].map((tmp) => (
                                <div key={tmp.code} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xs space-y-2 hover:border-blue-400 transition-all">
                                  <div className="flex justify-between items-start">
                                    <span className="material-symbols-outlined text-purple-700 text-[20px]">{tmp.icon}</span>
                                    <span className="text-[9px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-xs">
                                      {tmp.status}
                                    </span>
                                  </div>
                                  <div>
                                    <h5 className="font-extrabold text-slate-900 text-xs">{tmp.title}</h5>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tmp.code} • {tmp.type}</p>
                                  </div>
                                  <button
                                    onClick={() => alert(`Opening template specimen: ${tmp.title} for project ${selectedProject.code}`)}
                                    className="w-full py-1 text-center bg-white hover:bg-slate-100 text-slate-800 font-bold text-[10px] uppercase border border-slate-300 rounded-xs flex items-center justify-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">download</span>
                                    View / Download Template
                                  </button>
                                </div>
                              ))}

                              {inspectStage === 'Closure' && [
                                { title: 'Project Retrospective & Lessons Learned', type: 'DOCX / Retro Log', code: 'PMO-TMP-17', status: 'Compiled', icon: 'history_edu' },
                                { title: 'Operational Support SLA Handover Form', type: 'PDF / SLA Handover', code: 'PMO-TMP-18', status: 'Signed Off', icon: 'handshake' },
                                { title: 'Financial Account Reconciliation Sheet', type: 'XLSX / Audit Close', code: 'PMO-TMP-19', status: 'Reconciled', icon: 'account_balance' },
                                { title: 'Code Repository Archival Certificate', type: 'PDF / Archive Sign', code: 'PMO-TMP-20', status: 'Archived', icon: 'inventory_2' }
                              ].map((tmp) => (
                                <div key={tmp.code} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xs space-y-2 hover:border-blue-400 transition-all">
                                  <div className="flex justify-between items-start">
                                    <span className="material-symbols-outlined text-emerald-700 text-[20px]">{tmp.icon}</span>
                                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-xs">
                                      {tmp.status}
                                    </span>
                                  </div>
                                  <div>
                                    <h5 className="font-extrabold text-slate-900 text-xs">{tmp.title}</h5>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tmp.code} • {tmp.type}</p>
                                  </div>
                                  <button
                                    onClick={() => alert(`Opening template specimen: ${tmp.title} for project ${selectedProject.code}`)}
                                    className="w-full py-1 text-center bg-white hover:bg-slate-100 text-slate-800 font-bold text-[10px] uppercase border border-slate-300 rounded-xs flex items-center justify-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">download</span>
                                    View / Download Template
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Stage Financial & Budget Breakdown */}
                          <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
                            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center justify-between border-b pb-2">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-emerald-700 text-[18px]">account_balance_wallet</span>
                                {inspectStage} Phase Financial Breakdown
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-600">
                                Allocated Phase Cap: ${(selectedProject.budget * 0.2 / 1000).toFixed(0)}k
                              </span>
                            </h4>
                            <div className="grid grid-cols-3 gap-3 text-center text-xs">
                              <div className="p-2.5 bg-slate-50 rounded-xs border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">Phase Budget</span>
                                <span className="font-mono font-extrabold text-slate-900 text-sm">
                                  ${(selectedProject.budget * 0.2).toLocaleString()}
                                </span>
                              </div>
                              <div className="p-2.5 bg-emerald-50 rounded-xs border border-emerald-200">
                                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Expended Amount</span>
                                <span className="font-mono font-extrabold text-emerald-900 text-sm">
                                  ${(selectedProject.spent * 0.2).toLocaleString()}
                                </span>
                              </div>
                              <div className="p-2.5 bg-indigo-50 rounded-xs border border-indigo-200">
                                <span className="text-[10px] font-bold text-indigo-800 uppercase block">Phase Variance</span>
                                <span className="font-mono font-extrabold text-indigo-950 text-sm">
                                  +$5,400 (Favorable)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Criteria Verification Checklist & Gate Certificate */}
                        <div className="space-y-4">
                          {/* Criteria Verification Checklist */}
                          <div className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
                            <div className="flex justify-between items-center border-b pb-2">
                              <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-indigo-700 text-[18px]">fact_check</span>
                                {inspectStage} Criteria Checklist
                              </h4>
                              <span className="font-mono text-xs font-bold text-[#00174b]">
                                {getStageCriteria(selectedProject, inspectStage).filter(c => c.completed).length} / {getStageCriteria(selectedProject, inspectStage).length} Verified
                              </span>
                            </div>

                            <div className="space-y-2.5 pt-1">
                              {getStageCriteria(selectedProject, inspectStage).map((criterion) => (
                                <div key={criterion.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                                      <span className={`material-symbols-outlined text-[16px] ${criterion.completed ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                                        {criterion.completed ? 'check_circle' : 'radio_button_unchecked'}
                                      </span>
                                      {criterion.label}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] pt-1">
                                    <span className="text-slate-400 font-mono">Signer: {selectedProject.owner}</span>
                                    <span className={`px-2 py-0.5 rounded-xs font-mono font-bold uppercase ${criterion.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                      }`}>
                                      {criterion.completed ? 'PASSED & SIGNED' : 'PENDING'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Gate Sign-Off Certificate Box */}
                          <div className="bg-slate-900 text-white p-5 rounded-sm border border-slate-800 space-y-3 shadow-lg">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                              <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-widest">PMO GOVERNANCE SEAL</span>
                              <span className="material-symbols-outlined text-amber-400 text-[18px]">verified</span>
                            </div>
                            <div>
                              <h5 className="font-extrabold text-sm text-white">{getStageGateName(inspectStage)} Clearance Certificate</h5>
                              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                Authorizes project progression for {selectedProject.code} under PMO governance guidelines.
                              </p>
                            </div>
                            <div className="pt-2 border-t border-slate-800/80 text-[10px] space-y-1 font-mono text-slate-400">
                              <p>Executive Sponsor: Sarah Jenkins (Director)</p>
                              <p>Compliance Ref: PMO-GATE-{selectedProject.code}-{getStageNumber(inspectStage)}</p>
                            </div>
                            <button
                              onClick={() => alert(`Gate Clearance Signed & Logged for ${selectedProject.code} in Stage ${inspectStage}`)}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase rounded-xs tracking-wider transition-colors shadow-sm"
                            >
                              Issue Gate Clearance Sign-off
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PARTICIPANTS IN THE PROJECT */}
                  {projectDetailTab === 'Participants' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center bg-white p-4 border border-slate-200/80 rounded-sm">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-600 text-[20px]">groups</span>
                            Project Participants &amp; Team Allocation
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Personnel, engineers, architects, and project leaders assigned to {selectedProject.name}.
                          </p>
                        </div>
                        {onOpenAssignMemberModal && currentPersona?.roleType !== 'TEAM_MEMBER' && selectedProject.approvalStatus === 'APPROVED' && (
                          <button
                            onClick={() => onOpenAssignMemberModal(selectedProject || undefined)}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xs flex items-center gap-1.5 shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                            Assign New Participant
                          </button>
                        )}
                      </div>

                      {/* Participants Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loadingTeam ? (
                          <div className="text-center text-slate-500 py-8 col-span-full">Loading project team...</div>
                        ) : projectTeamMembers.length === 0 ? (
                          <div className="text-center text-slate-500 italic py-8 col-span-full">No team members assigned to this project yet.</div>
                        ) : (
                          projectTeamMembers.map((usr) => (
                            <div
                              key={usr.id}
                              className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-2xs space-y-3 hover:border-blue-300 transition-all flex flex-col justify-between"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                  <img
                                    src={usr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                    alt={usr.name}
                                    className="w-12 h-12 rounded-full object-cover border border-slate-300"
                                  />
                                  <div>
                                    <h5 className="font-extrabold text-slate-900 text-sm leading-snug">{usr.name}</h5>
                                    <p className="text-[11px] font-semibold text-indigo-900">{usr.role.replace(/_/g, ' ')}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{usr.email}</p>
                                  </div>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                  <div className="flex justify-between text-slate-600">
                                    <span>Department:</span>
                                    <strong className="text-slate-800">{usr.department}</strong>
                                  </div>
                                  <div className="flex justify-between items-center text-slate-600">
                                    <span>Project Role:</span>
                                    {usr.responsibility ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-xs text-[10px] font-bold text-amber-900">
                                        <span className="material-symbols-outlined text-[12px] text-amber-700">badge</span>
                                        {usr.responsibility}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                                    )}
                                  </div>
                                  <div className="flex justify-between text-slate-600">
                                    <span>Clearance Level:</span>
                                    <span className="font-mono text-emerald-700 font-bold">Level 3 - Enterprise</span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-xs font-bold uppercase font-mono">
                                  {usr.status || 'Active'}
                                </span>
                                <span className="text-slate-500 font-bold">100% Allocated</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: PROGRESS & WORKS DONE */}
                  {projectDetailTab === 'Works Done' && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Work Deliverables Header Banner */}
                      <div className="bg-white p-5 border border-slate-200/80 rounded-sm shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Deliverables &amp; Progress Matrix</span>
                            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                              <span className="material-symbols-outlined text-emerald-600 text-[20px]">task_alt</span>
                              Project Progress &amp; Participant Works Executed
                            </h4>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Completion</span>
                              <span className="font-mono font-black text-indigo-950 text-base">{selectedProject.progress}%</span>
                            </div>
                            <div className="w-24 bg-slate-200 h-3 rounded-full overflow-hidden">
                              <div className="bg-[#00174b] h-full" style={{ width: `${selectedProject.progress}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Add New Deliverable Form or Approval Lock Banner */}
                        {selectedProject.approvalStatus === 'PENDING_APPROVAL' || (!selectedProject.approvalStatus && currentPersona?.roleType === 'PROJECT_MANAGER') ? (
                          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xs text-amber-900 text-xs flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-600 text-[24px]">pending_actions</span>
                            <div>
                              <strong className="block text-sm">Project Execution &amp; Task Logging Locked</strong>
                              <p className="text-[11px] text-amber-800 mt-0.5">
                                This project charter and budget allocation are currently awaiting <strong>Executive Manager Approval</strong>. Tasks, deliverables, and active sprints cannot be initiated until the charter is approved.
                              </p>
                            </div>
                          </div>
                        ) : selectedProject.approvalStatus === 'REJECTED' ? (
                          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xs text-rose-900 text-xs flex items-center gap-3">
                            <span className="material-symbols-outlined text-rose-600 text-[24px]">cancel</span>
                            <div>
                              <strong className="block text-sm">Project Charter Rejected</strong>
                              <p className="text-[11px] text-rose-800 mt-0.5">
                                Rejection Note: {selectedProject.rejectionReason || 'Project was rejected by the Executive Manager.'}. Deliverables and task logs are disabled.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleAddDeliverable} className="bg-slate-50 p-3 rounded-xs border border-slate-200 space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 block uppercase">Log New Work Deliverable / Task</span>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <input
                                type="text"
                                placeholder="Deliverable title (e.g. Build API Endpoints)..."
                                value={newDeliverableTitle}
                                onChange={(e) => setNewDeliverableTitle(e.target.value)}
                                className="sm:col-span-2 border p-1.5 rounded-xs text-xs outline-none focus:border-blue-600 bg-white"
                              />
                              <input
                                type="text"
                                placeholder="Assignee Name..."
                                value={newDeliverableAssignee}
                                onChange={(e) => setNewDeliverableAssignee(e.target.value)}
                                className="border p-1.5 rounded-xs text-xs outline-none focus:border-blue-600 bg-white"
                              />
                              <button
                                type="submit"
                                className="bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs uppercase rounded-xs py-1.5 cursor-pointer"
                              >
                                Add Deliverable
                              </button>
                            </div>
                          </form>
                        )}
                      </div>


                      {/* Participant Deliverables / Tasks Table */}
                      <div className="bg-white border border-slate-200/80 rounded-sm overflow-x-auto shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#f2f4f6] text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                              <th className="px-4 py-3">Work Deliverable Title</th>
                              <th className="px-4 py-3">Assigned Participant</th>
                              <th className="px-4 py-3">Priority</th>
                              <th className="px-4 py-3">Due Date</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(() => {
                              const projTasks = localTasks.filter(
                                (t) =>
                                  t.projectCode.toLowerCase() === selectedProject.code.toLowerCase() ||
                                  t.projectCode.toLowerCase() === selectedProject.name.toLowerCase() ||
                                  selectedProject.name.toLowerCase().includes(t.projectCode.toLowerCase())
                              );

                              const itemsToDisplay = projTasks.length > 0 ? projTasks : [
                                { id: 'dt1', title: 'Technical Architecture Blueprint Sign-off', assignee: selectedProject.owner, priority: 'High' as const, dueDate: '2026-08-01', status: 'Done' as const, projectCode: selectedProject.code },
                                { id: 'dt2', title: 'DevOps Automated CI/CD Pipeline Build', assignee: 'S. Gupta', priority: 'High' as const, dueDate: '2026-08-10', status: 'In Progress' as const, projectCode: selectedProject.code },
                                { id: 'dt3', title: 'User Acceptance Testing (UAT) Execution', assignee: 'M. Thompson', priority: 'Medium' as const, dueDate: '2026-08-18', status: 'Review' as const, projectCode: selectedProject.code },
                                { id: 'dt4', title: 'Security Vulnerability Assessment & Compliance Audit', assignee: 'J. Baker', priority: 'High' as const, dueDate: '2026-08-25', status: 'Backlog' as const, projectCode: selectedProject.code }
                              ];

                              return itemsToDisplay.map((task) => (
                                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3 font-bold text-slate-900">{task.title}</td>
                                  <td className="px-4 py-3">
                                    <span className="font-semibold text-indigo-950 block">{task.assignee}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">Participant</span>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-[10px]">
                                    <span className={`px-2 py-0.5 rounded-xs font-bold ${task.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                                      }`}>
                                      {task.priority}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-slate-600">{task.dueDate}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2.5 py-1 rounded-xs font-bold text-[10px] uppercase font-mono ${task.status === 'Done'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : task.status === 'In Progress'
                                          ? 'bg-blue-100 text-blue-800'
                                          : task.status === 'Review'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-slate-200 text-slate-700'
                                      }`}>
                                      {task.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => handleToggleTaskStatus(task.id)}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded-xs border border-slate-300"
                                    >
                                      Toggle Status
                                    </button>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: RISKS & ISSUES */}
                  {projectDetailTab === 'Risks' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-white p-4 border border-slate-200/80 rounded-sm flex justify-between items-center">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-600 text-[20px]">warning</span>
                            Project Risk Register & Threat Matrix
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Identified risks, severity scores, and active mitigation plans for {selectedProject.name}.
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700 bg-amber-50 px-2.5 py-1 rounded-xs border border-amber-200">
                          Project Code: {selectedProject.code}
                        </span>
                      </div>

                      <div className="bg-white border border-slate-200/80 rounded-sm overflow-x-auto shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#f2f4f6] text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                              <th className="px-4 py-3">Ref</th>
                              <th className="px-4 py-3">Subject & Threat Detail</th>
                              <th className="px-4 py-3">Severity</th>
                              <th className="px-4 py-3">Financial Impact</th>
                              <th className="px-4 py-3">Owner</th>
                              <th className="px-4 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(() => {
                              const projRisks = (risks || []).filter((r) => {
                                const projectRef = r.projectRef?.toLowerCase() ?? '';
                                const projectName = selectedProject.name.toLowerCase();
                                return (
                                  projectRef === selectedProject.code.toLowerCase() ||
                                  projectRef === projectName ||
                                  projectName.includes(projectRef)
                                );
                              });

                              const displayRisks: RiskItem[] = projRisks.length > 0 ? projRisks : [
                                {
                                  id: 'r1',
                                  ref: `RSK-${selectedProject.code}-01`,
                                  subject: 'Vendor API Delay & External Dependency Bottleneck',
                                  description: 'External dependency bottleneck affecting delivery timelines.',
                                  severity: 'HIGH',
                                  owner: selectedProject.owner,
                                  category: 'Risk',
                                  projectRef: selectedProject.code,
                                  status: 'OPEN',
                                  createdDate: new Date().toISOString().slice(0, 10)
                                },
                                {
                                  id: 'r2',
                                  ref: `RSK-${selectedProject.code}-02`,
                                  subject: 'Data Migration Schema Compatibility Conflict',
                                  description: 'Schema mismatch discovered during migration rehearsal.',
                                  severity: 'MEDIUM',
                                  owner: 'M. Thompson',
                                  category: 'Issue',
                                  projectRef: selectedProject.code,
                                  status: 'MITIGATED',
                                  createdDate: new Date().toISOString().slice(0, 10)
                                },
                                {
                                  id: 'r3',
                                  ref: `RSK-${selectedProject.code}-03`,
                                  subject: 'Production Load Spike Latency Threshold Breach',
                                  description: 'Sustained peak load exceeded expected latency thresholds.',
                                  severity: 'CRITICAL',
                                  owner: 'S. Gupta',
                                  category: 'Risk',
                                  projectRef: selectedProject.code,
                                  status: 'OPEN',
                                  createdDate: new Date().toISOString().slice(0, 10)
                                }
                              ];

                              return displayRisks.map((risk) => (
                                <tr key={risk.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{risk.ref}</td>
                                  <td className="px-4 py-3 font-bold text-slate-900">{risk.subject}</td>
                                  <td className="px-4 py-3 font-mono text-[10px]">
                                    <span className={`px-2 py-0.5 rounded-xs font-bold ${risk.severity === 'CRITICAL' || risk.severity === 'HIGH'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-amber-100 text-amber-800'
                                      }`}>
                                      {risk.severity}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-slate-700">$25,000</td>
                                  <td className="px-4 py-3 text-slate-700">{risk.owner}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2.5 py-1 rounded-xs font-bold text-[10px] uppercase font-mono ${risk.status === 'OPEN'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                      }`}>
                                      {risk.status}
                                    </span>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: PROJECT CHAT & TELEGRAM */}
                  {projectDetailTab === 'Chat' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-white p-4 border border-slate-200/80 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-700 text-[20px]">chat</span>
                            Project Channel &amp; Telegram Sync
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Real-time stream for #{selectedProject.code.toLowerCase()}-team. Teams and managers posting, watching, and replying.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            TELEGRAM BOT CONNECTED
                          </span>
                        </div>
                      </div>

                      {/* Project Telegram Chat Container */}
                      <div className="bg-slate-900 rounded-sm border border-slate-800 overflow-hidden shadow-xl flex flex-col h-[480px]">
                        {/* Chat Header */}
                        <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex justify-between items-center text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                              #{selectedProject.code.slice(4)}
                            </div>
                            <div>
                              <p className="font-bold text-xs">#{selectedProject.code.toLowerCase()}-live-chat</p>
                              <p className="text-[10px] text-slate-400">4 managers online • Watching and replying</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-xs">
                            Instant Sync Active
                          </span>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scroll bg-[#0e1621]">
                          <div className="flex justify-center my-2">
                            <span className="text-[10px] bg-slate-800/80 text-slate-300 px-3 py-1 rounded-full font-mono">
                              Today's Project Sync Stream
                            </span>
                          </div>

                          <div className="flex gap-2.5 max-w-[85%]">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" alt="Sarah" className="w-7 h-7 rounded-full object-cover" />
                            <div className="bg-slate-800 p-3 rounded-lg text-slate-100 text-xs space-y-1 border border-slate-700">
                              <div className="flex justify-between items-center gap-4">
                                <span className="font-bold text-amber-400 text-[11px]">Sarah Jenkins (PMO Director)</span>
                                <span className="text-[9px] text-slate-400">10:14 AM</span>
                              </div>
                              <p>Welcome team! Please submit all deliverables for {selectedProject.name} Gate review.</p>
                            </div>
                          </div>

                          <div className="flex gap-2.5 max-w-[85%]">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="Dev" className="w-7 h-7 rounded-full object-cover" />
                            <div className="bg-slate-800 p-3 rounded-lg text-slate-100 text-xs space-y-1 border border-slate-700">
                              <div className="flex justify-between items-center gap-4">
                                <span className="font-bold text-blue-400 text-[11px]">M. Thompson (Lead Dev)</span>
                                <span className="text-[9px] text-slate-400">10:20 AM</span>
                              </div>
                              <p>Code deployment for {selectedProject.code} has passed automated testing suite.</p>
                            </div>
                          </div>

                          <div className="flex gap-2.5 max-w-[85%] ml-auto justify-end">
                            <div className="bg-blue-600 p-3 rounded-lg text-white text-xs space-y-1 shadow-md">
                              <div className="flex justify-between items-center gap-4">
                                <span className="font-bold text-indigo-100 text-[11px]">You (Active User)</span>
                                <span className="text-[9px] text-blue-200">10:28 AM</span>
                              </div>
                              <p>Reviewed financial variance report for {selectedProject.code}. Looks ready for executive sign-off.</p>
                              <div className="text-right text-[9px] text-blue-200 flex items-center justify-end gap-1">
                                <span>Read</span>
                                <span className="material-symbols-outlined text-[12px]">done_all</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Chat Input Bar */}
                        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Type message to #${selectedProject.code.toLowerCase()}-team...`}
                            className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xs px-3 py-2 text-xs outline-none focus:border-blue-500"
                          />
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xs flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">send</span>
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 7: REQUIREMENTS MATRIX */}
                  {projectDetailTab === 'Requirements' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-white p-4 border border-slate-200/80 rounded-sm">
                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-800 text-[20px]">checklist_rtl</span>
                          Technical Requirements Status
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Verification matrix for authentication, security, accessibility, and backend integration requirements.
                        </p>
                      </div>

                      <div className="divide-y border rounded-xs bg-white shadow-2xs">
                        {getRequirements(selectedProject).map((req) => (
                          <div key={req.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs hover:bg-slate-50 transition-colors">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">{req.category}</span>
                              <p className="font-bold text-slate-900 text-sm mt-0.5">{req.title}</p>
                              <p className="text-[10px] text-slate-500">Assigned Lead: {req.owner}</p>
                            </div>
                            <button
                              onClick={() => handleToggleRequirement(selectedProject, req.id)}
                              className={`px-3 py-1.5 font-bold rounded-xs text-[10px] uppercase font-mono tracking-wider ${req.status === 'Compliant'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                            >
                              {req.status}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center rounded-b-sm sticky bottom-0 z-20">
              <span className="text-slate-500 text-[11px] font-mono">
                Project Code: <strong className="text-slate-800">{selectedProject.code}</strong>
              </span>
              <button
                onClick={handleCloseProjectDetail}
                className="px-5 py-2 bg-[#00174b] text-white font-bold rounded-xs uppercase tracking-wider text-xs hover:bg-indigo-950 shadow-2xs cursor-pointer"
              >
                Close Project Page
              </button>
            </div>
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
                  if (selectedProject?.id === rejectingProjectId) {
                    setSelectedProject({
                      ...selectedProject,
                      approvalStatus: 'REJECTED',
                      status: 'DELAYED',
                      rejectionReason: rejectionReasonInput.trim() || 'Charter rejected by Executive Manager.'
                    });
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
      {/* Render the AssignTeamModal */}
      <AssignTeamModal
        isOpen={isAssignTeamModalOpen}
        onClose={() => setIsAssignTeamModalOpen(false)}
        project={selectedProject}
        onSuccess={() => {
          // Could optionally trigger a reload of team data here if needed.
          // The API takes care of the backend sync. 
          setIsAssignTeamModalOpen(false);
        }}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-300 rounded-sm max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-rose-700 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-200 text-[24px]">warning</span>
                <h3 className="font-extrabold text-base tracking-tight">Delete Project?</h3>
              </div>
              <button onClick={() => !isDeleting && setDeleteConfirmProject(null)} className="text-rose-200 hover:text-white font-bold text-lg leading-none">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-700 text-sm">
                Are you sure you want to delete the project <strong>"{deleteConfirmProject.name}"</strong>?
              </p>
              
              {(deleteConfirmProject.status === 'PLANNING' || deleteConfirmProject.approvalStatus === 'PENDING_APPROVAL') ? (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xs text-rose-800 text-xs flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">delete_forever</span>
                  <div>
                    <strong>This action cannot be undone.</strong> The draft project and its settings will be permanently destroyed.
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xs text-blue-800 text-xs flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">archive</span>
                  <div>
                    <strong>This is an active or approved project.</strong> It will be safely archived to preserve its history, tasks, and team assignments, but it will no longer be active.
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button 
                onClick={() => setDeleteConfirmProject(null)} 
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xs transition-colors text-xs uppercase tracking-wider disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    const success = await deleteProjectApi(deleteConfirmProject.id);
                    if (success) {
                      window.location.reload(); // Quick refresh to sync state
                    }
                  } catch (err: any) {
                    alert(err.message || "Failed to delete project");
                    setIsDeleting(false);
                  }
                }} 
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xs uppercase tracking-wider text-xs shadow-2xs disabled:bg-slate-400 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    {deleteConfirmProject.status === 'PLANNING' ? 'Delete Project' : 'Archive Project'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
