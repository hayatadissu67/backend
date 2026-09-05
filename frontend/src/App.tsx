import { useState, useEffect, useMemo } from 'react';
import {
  fetchProjectsFromApi,
  createProjectApi,
  updateProjectApi,
  approveProjectApi,
  rejectProjectApi,
  fetchRisksFromApi,
  createRiskApi,
  updateRiskApi,
  fetchTasksFromApi,
  createTaskApi,
  updateTaskApi,
  fetchBudgetsFromApi,
  assignProjectTeamMembersApi,
  fetchChangeRequestsFromApi,
  createChangeRequestApi,
  approveChangeRequestApi,
  rejectChangeRequestApi,
  fetchReportsApi,
  fetchTemplatesApi,
  createDiscussionApi,
  createMeetingApi,
  markNotificationsReadApi,
  clearNotificationsApi,
  fetchUsersFromApi,
  deleteUserApi,
  updateUserStatusApi,
  updateUserApi,
  getCurrentUserApi,
  fetchDepartmentLoadingApi,
  fetchResourcesFromApi,
  createAssignmentRequestApi,
} from './services/api';


import {
  UserRoleType,
  NavigationTab,
  Project,
  RiskItem,
  ActivityItem,
  ResourceLoading,
  ResourceRecord,
  ApprovalRequest,
  UserItem,
  TaskItem,
  BudgetItem,
  MeetingItem,
  DiscussionItem,
  NotificationItem,
  LoggedInPersona,
  ChangeRequestItem,
  ReportItem,
  ReportTemplate
} from './types';
import { RestrictedAccessView } from "./views/RestrictedAccessView";

import { SidebarNav } from './components/SidebarNav';
import { TopHeader } from './components/TopHeader';
import { AIAssistantModal } from './components/AIAssistantModal';
import { NewProjectModal } from './components/NewProjectModal';
import { ExportPDFModal } from './components/ExportPDFModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AssignMemberModal } from './components/AssignMemberModal';
import { FirstLoginChangePasswordModal } from './components/FirstLoginChangePasswordModal';

import { ExecutiveDashboardView } from "./views/ExecutiveDashboardView";
import PMDashboardView from './views/PMDashboardView';
import TeamMemberDashboardView from './views/TeamMemberDashboardView';
import { ProjectsView } from "./views/ProjectsView";
import { PortfolioView } from "./views/PortfolioView";
import { UsersView } from "./views/UsersView";
import { TasksView } from "./views/TasksView";
import { RisksView } from "./views/RisksView";
import { ResourcesView } from "./views/ResourcesView";
import { BudgetView } from "./views/BudgetView";
import { CommunicationView } from "./views/CommunicationView";
import { AdminView } from "./views/AdminView";
import { ApprovalsView } from "./views/ApprovalsView";
import { ChangeRequestsView } from "./views/ChangeRequestsView";
import { ReportsView } from "./views/ReportsView";
import { TemplatesView } from "./views/TemplatesView";
import { SettingsView } from "./views/SettingsView";
import { LoginView } from "./views/LoginView";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Authentication lifecycle: CHECKING (resolving session) ->
  // AUTHENTICATED (valid server-verified JWT) -> NOT_AUTHENTICATED (no/invalid session).
  // Authentication is NEVER inferred from a stored boolean; it requires a real
  // token validated against the backend /auth/me endpoint.
  type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');

  // Stale/boolean auth keys left by previous dev builds or legacy localStorage
  // sessions. These must never act as proof of authentication.
  const STALE_AUTH_KEYS = [
    'isAuthenticated', 'loggedIn', 'user', 'currentUser',
    'authToken', 'accessToken', 'refreshToken', 'session', 'auth', 'persona',
  ];

  // Clear ONLY authentication-related persisted data. Unrelated application
  // storage is intentionally left untouched.
  const clearAuthData = () => {
    ['token', ...STALE_AUTH_KEYS].forEach((key) => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
  };

  // Restore session on startup using the REAL backend-verified JWT mechanism.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      // One-time purge of stale/boolean auth state so a persisted
      // "isAuthenticated=true" or a legacy localStorage token can never
      // shortcut authentication. The active session token lives only in
      // sessionStorage under "token" and is re-validated below.
      STALE_AUTH_KEYS.forEach((key) => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      });
      localStorage.removeItem('token');

      const token = sessionStorage.getItem('token');
      if (!token) {
        if (!cancelled) {
          setCurrentUser(null);
          setAuthStatus('unauthenticated');
        }
        return;
      }

      try {
        const user = await getCurrentUserApi();
        if (cancelled) return;

        if (user) {
          setCurrentUser(user);
          setAuthStatus('authenticated');
          // restore navigation based on role
          if (window.location.hash) {
            const hash = window.location.hash.replace('#', '') as NavigationTab;
            if (isTabAllowedForRole(user.role, hash)) {
              setCurrentTab(hash);
            } else {
              // pick default tab for role
              if (user.role === 'RISK_MANAGER') setCurrentTab('risks');
              else if (user.role === 'TEAM_MEMBER') setCurrentTab('tasks');
              else setCurrentTab('dashboard');
            }
          } else {
            if (user.role === 'RISK_MANAGER') setCurrentTab('risks');
            else if (user.role === 'TEAM_MEMBER') setCurrentTab('tasks');
            else if (user.role === 'PROJECT_MANAGER') setCurrentTab('dashboard');
            else setCurrentTab('dashboard');
          }
        } else {
          // token invalid or expired -> clear it, do NOT enter the application
          clearAuthData();
          if (!cancelled) {
            setCurrentUser(null);
            setAuthStatus('unauthenticated');
          }
        }
      } catch {
        if (cancelled) return;
        clearAuthData();
        setCurrentUser(null);
        setAuthStatus('unauthenticated');
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync navigation with browser back/forward buttons via hash
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.replace('#', '') as NavigationTab;
      if (hash && currentUser) {
        if (isTabAllowedForRole(currentUser.role, hash)) {
          setCurrentTab(hash);
        }
      }
    };

    window.addEventListener('hashchange', handleHashNavigation);
    window.addEventListener('popstate', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
      window.removeEventListener('popstate', handleHashNavigation);
    };
  }, [currentUser]);

  const handleSelectTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
    window.location.hash = tab;
  };

  const handleLoginSuccess = (token: string, user: UserItem) => {
    sessionStorage.setItem('token', token);
    setCurrentUser(user);
    setAuthStatus('authenticated');

    // Role-based redirection upon verified login
    let targetTab: NavigationTab = 'dashboard';
    if (user.role === 'RISK_MANAGER') {
      targetTab = 'risks';
    } else if (user.role === 'TEAM_MEMBER') {
      targetTab = 'tasks';
    } else if (user.role === 'PROJECT_MANAGER') {
      targetTab = 'dashboard';
    } else {
      targetTab = 'dashboard';
    }
    setCurrentTab(targetTab);
    window.location.hash = targetTab;
  };

  const handleLogout = () => {
    clearAuthData();
    setCurrentUser(null);
    setAuthStatus('unauthenticated');
    window.location.hash = '';
    window.location.replace('/');
  };

  const isTabAllowedForRole = (role?: UserRoleType, tab?: NavigationTab): boolean => {
    if (!role || !tab) return false;
    if (role === 'EXECUTIVE_MANAGER') return true;

    if (role === 'PROJECT_MANAGER') {
      const restrictedForPM: NavigationTab[] = ['admin', 'approvals'];
      return !restrictedForPM.includes(tab);
    }

    if (role === 'RISK_MANAGER') {
      const allowedForRisk: NavigationTab[] = [
        'risks',
        'issues',
        'projects',
        'tasks',
        'collaboration',
        'communication',
        'chat',
        'meetings',
        'notifications',
        'documents',
        'settings'
      ];
      return allowedForRisk.includes(tab);
    }

    if (role === 'TEAM_MEMBER') {
      const allowedForTeam: NavigationTab[] = [
        'dashboard',
        'tasks',
        'change_requests',
        'reports',
        'templates',
        'projects',
        'risks',
        'collaboration',
        'communication',
        'chat',
        'meetings',
        'notifications',
        'documents',
        'settings'
      ];
      return allowedForTeam.includes(tab);
    }

    return false;
  };

  // Project Approval Handlers for Executive Manager
  const handleApproveProject = async (projectId: string) => {
    try {
      const updated = await approveProjectApi(projectId);
      if (updated) {
        setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
      } else {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? { ...p, approvalStatus: 'APPROVED', status: 'ACTIVE', approvedBy: currentUser?.name }
              : p
          )
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve project.');
    }
  };

  const handleRejectProject = async (projectId: string, reason: string) => {
    try {
      const updated = await rejectProjectApi(projectId, reason);
      if (updated) {
        setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
      } else {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? { ...p, approvalStatus: 'REJECTED', status: 'DELAYED', rejectionReason: reason }
              : p
          )
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reject project.');
    }
  };

  const handleAssignTeamMember = async (projectId: string, userIds: string[]) => {
    try {
      const assignedMembers = await assignProjectTeamMembersApi(projectId, userIds);
      if (assignedMembers) {
        // Optimistically, we could just alert success, 
        // but let's re-fetch the users to ensure the UI updates if necessary.
        const apiUsers = await fetchUsersFromApi();
        if (apiUsers) setUsers(apiUsers);
      }
    } catch (err: any) {
      throw err;
    }
  };

  const currentPersona: LoggedInPersona | null = currentUser ? {
    id: String(currentUser.id),
    name: currentUser.name,
    roleType: currentUser.role,
    roleTitle: currentUser.role.replace(/_/g, ' '),
    email: currentUser.email,
    department: currentUser.department,
    avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    assignedProjectCodes: currentUser.assignedProjectCodes || []
  } : null;


  const handleSelectProject = (projectOrIdentifier: Project | string | null) => {
    if (projectOrIdentifier === null) {
      setSelectedProject(null);
      return;
    }
    let target: Project | undefined;
    if (typeof projectOrIdentifier === 'string') {
      target = projects.find(
        (p) =>
          p.id === projectOrIdentifier ||
          p.code.toLowerCase() === projectOrIdentifier.toLowerCase() ||
          p.name.toLowerCase() === projectOrIdentifier.toLowerCase()
      );
    } else {
      target = projectOrIdentifier;
    }
    if (target) {
      setSelectedProject(target);
      setCurrentTab('projects');
    }
  };

  const handleNotifyPMTaskCompleted = async (task: TaskItem, memberName: string) => {
    const updated: TaskItem = {
      ...task,
      status: 'Done',
      progress: 100
    };
    // Persist the completion to the database
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    await updateTaskApi(task.id, updated);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Task Completed: ${task.title}`,
      message: `${memberName} finished task "${task.title}" for ${task.projectCode}. Progress: 100%. PM verification requested.`,
      type: 'success',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [newNotif, ...prev]);

    const act: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'gate',
      title: `Task Completed by ${memberName}`,
      subtitle: `${task.title} (${task.projectCode}) marked finished • Notification sent to PM`,
      timestamp: 'Just now',
      badgeType: 'check'
    };
    setActivities((prev) => [act, ...prev]);
  };

  // Main State
  const [projects, setProjects] = useState<Project[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [resources, setResources] = useState<ResourceLoading[]>([]);
  const [resourceRecords, setResourceRecords] = useState<ResourceRecord[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);

  const accessibleProjects = useMemo(() => {
    return projects;
  }, [projects]);

  // Collections
  const [users, setUsers] = useState<UserItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);

  // Compute tasks accessible to the current user based on role and assigned project codes
  const accessibleTasks = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'EXECUTIVE_MANAGER') return tasks;
    return tasks.filter((t) => currentUser.assignedProjectCodes?.includes(t.projectCode));
  }, [tasks, currentUser]);

  // Compute budgets accessible to the current user based on role and assigned project codes
  const accessibleBudgets = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'EXECUTIVE_MANAGER') return budgets;
    return budgets.filter((b) => currentUser.assignedProjectCodes?.includes(b.projectCode));
  }, [budgets, currentUser]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequestItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);

  const handleAddChangeRequest = async (request: Partial<ChangeRequestItem>) => {
    const created = await createChangeRequestApi(request);
    if (created) {
      setChangeRequests((prev) => [created, ...prev]);
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `New Change Request: ${created.id}`,
        message: `${created.title} (${created.amount}) submitted for ${created.project || 'Project'}.`,
        type: 'info',
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handleUpdateChangeRequest = (updated: ChangeRequestItem) => {
    setChangeRequests((prev) => prev.map((cr) => (cr.id === updated.id ? updated : cr)));
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Change Request ${updated.id} Updated`,
      message: `Status set to ${updated.status} for ${updated.title}.`,
      type: updated.status === 'APPROVED' ? 'success' : updated.status === 'REJECTED' ? 'alert' : 'info',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleDeleteChangeRequest = (id: string) => {
    setChangeRequests((prev) => prev.filter((cr) => cr.id !== id));
  };

  const handleApproveChangeRequest = async (id: string) => {
    try {
      const updated = await approveChangeRequestApi(id);
      handleUpdateChangeRequest(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to approve change request');
    }
  };

  const handleRejectChangeRequest = async (id: string, reason: string) => {
    try {
      const updated = await rejectChangeRequestApi(id, reason);
      handleUpdateChangeRequest(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to reject change request');
    }
  };

  // Modals State
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isExportPDFOpen, setIsExportPDFOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserItem | null>(null);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isAssignMemberModalOpen, setIsAssignMemberModalOpen] = useState(false);
  const [assignMemberModalMode, setAssignMemberModalMode] = useState<'assign' | 'request'>('assign');

  const handleOpenUserProfile = (user?: UserItem) => {
    if (user) {
      setSelectedUserProfile(user);
    } else if (currentUser) {
      setSelectedUserProfile(currentUser);
    }
    setIsUserProfileModalOpen(true);
  };

  // Fetch backend data once authenticated
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const syncWithBackendApi = async () => {

      try {
        const [
          apiUsers, apiProjects, apiRisks, apiTasks, apiBudgets, apiCRs, apiReports, apiTemplates,
          apiDepartmentLoading, apiResources
        ] = await Promise.all([
          fetchUsersFromApi(),
          fetchProjectsFromApi(),
          fetchRisksFromApi(),
          fetchTasksFromApi(),
          fetchBudgetsFromApi(),
          fetchChangeRequestsFromApi(),
          fetchReportsApi(),
          fetchTemplatesApi(),
          fetchDepartmentLoadingApi(),
          fetchResourcesFromApi(),
        ]);

        if (apiUsers) setUsers(apiUsers);
        if (apiProjects) setProjects(apiProjects);
        if (apiRisks) setRisks(apiRisks);
        if (apiTasks) setTasks(apiTasks);
        if (apiBudgets) setBudgets(apiBudgets);
        if (apiCRs) setChangeRequests(apiCRs);
        if (apiReports) setReports(apiReports);
        if (apiTemplates) setTemplates(apiTemplates);
        if (apiDepartmentLoading && apiDepartmentLoading.length > 0) setResources(apiDepartmentLoading);
        if (apiResources) setResourceRecords(apiResources);
      } catch (err) {
        console.error('Failed to sync data with backend API:', err);
      }
    };

    syncWithBackendApi();

    return undefined;
  }, [currentUser?.id]);

  // Handlers
  const handleAddProject = async (newProject: Project) => {
    const createdProject = await createProjectApi(newProject);
    if (!createdProject) {
      alert('The project could not be saved to the database.');
      return;
    }

    setProjects((prev) => [createdProject, ...prev]);
    const act: ActivityItem = {
      id: `a-${Date.now()}`,
      type: 'gate',
      title: `Project Added: ${createdProject.name}`,
      subtitle: `Charter registered by ${currentUser?.name || 'PMO User'} • Just now`,
      timestamp: 'Just now',
      badgeType: 'check'
    };
    setActivities([act, ...activities]);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    updateProjectApi(updated.id, updated);
  };

  const handleAddUser = (newUser: UserItem) => {
    setUsers([newUser, ...users]);
  };

  const handleDeleteUser = (userId: string | number) => {
    setUsers(users.filter((u) => u.id !== userId));
    deleteUserApi(userId).catch(console.error);
  };

  const handleToggleUserStatus = (userId: string | number, newStatus: UserItem['status']) => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    updateUserStatusApi(userId, newStatus).catch(console.error);
  };

  const handleUpdateUser = (updatedUser: UserItem) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    updateUserApi(updatedUser.id, updatedUser).catch(console.error);
  };

  const handleAddTask = async (newTask: TaskItem) => {
    // Optimistically add to UI immediately
    setTasks((prev) => [newTask, ...prev]);
    // Persist to DB and replace the temp record with the real DB record
    const saved = await createTaskApi(newTask);
    if (saved) {
      setTasks((prev) => prev.map((t) => t.id === newTask.id ? saved : t));
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    const saved = await updateTaskApi(taskId, { status: newStatus });
    if (saved) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? saved : t)));
    }
  };

  const handleUpdateTask = async (updatedTask: TaskItem) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    const saved = await updateTaskApi(updatedTask.id, updatedTask);
    if (saved) {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? saved : t)));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleAddRisk = async (newRisk: RiskItem) => {
    setRisks([newRisk, ...risks]);
    await createRiskApi(newRisk);

    const assignee = newRisk.assignedRiskManager || newRisk.owner || 'Risk Manager';
    const notif: NotificationItem = {
      id: `notif-risk-${Date.now()}`,
      title: `Risk Delegated: ${newRisk.ref}`,
      message: `Risk "${newRisk.subject}" linked to ${newRisk.projectRef || 'PMO Project'} delegated to ${assignee}.`,
      type: newRisk.severity === 'CRITICAL' || newRisk.severity === 'HIGH' ? 'alert' : 'warning',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [notif, ...prev]);

    const act: ActivityItem = {
      id: `act-risk-${Date.now()}`,
      type: 'risk',
      title: `Risk Registered & Delegated (${newRisk.ref})`,
      subtitle: `"${newRisk.subject}" assigned to ${assignee} • Flagged by ${newRisk.flaggedBy || 'PMO Team'}`,
      timestamp: 'Just now',
      badgeType: 'warning'
    };
    setActivities((prev) => [act, ...prev]);
  };

  const handleUpdateRisk = (updated: RiskItem) => {
    setRisks(risks.map((r) => (r.id === updated.id ? updated : r)));
    updateRiskApi(updated.id, updated);

    const assignee = updated.assignedRiskManager || updated.owner || 'Risk Manager';
    const notif: NotificationItem = {
      id: `notif-risk-up-${Date.now()}`,
      title: `Risk ${updated.ref} Updated`,
      message: `Risk "${updated.subject}" status set to ${updated.status}. Delegated Manager: ${assignee}.`,
      type: updated.status === 'MITIGATED' ? 'success' : 'info',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleAddMeeting = (newMeeting: MeetingItem) => {
    setMeetings([newMeeting, ...meetings]);
    createMeetingApi(newMeeting);
    const act: ActivityItem = {
      id: `act-mtg-${Date.now()}`,
      type: 'gate',
      title: `Sync Scheduled: ${newMeeting.title}`,
      subtitle: `${newMeeting.date} at ${newMeeting.time} • ${newMeeting.attendees.length} Attendees`,
      timestamp: 'Just now',
      badgeType: 'check'
    };
    setActivities((prev) => [act, ...prev]);
  };

  const handleAddDiscussion = (newDiscussion: DiscussionItem) => {
    setDiscussions([newDiscussion, ...discussions]);
    createDiscussionApi(newDiscussion);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    markNotificationsReadApi();
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    clearNotificationsApi();
  };

  const handleApprovalAction = (id: string, status: 'Approved' | 'Rejected') => {
    setApprovals(
      approvals.map((a) => (a.id === id ? { ...a, status } : a))
    );

    const act: ActivityItem = {
      id: `act-app-${Date.now()}`,
      type: 'gate',
      title: `Governance ${status}`,
      subtitle: `Stage-Gate approval #${id} marked as ${status} • By ${currentUser?.name || 'Director'}`,
      timestamp: 'Just now',
      badgeType: status === 'Approved' ? 'check' : 'warning'
    };
    setActivities((prev) => [act, ...prev]);
  };

  const handleRequestMemberAssignment = (req: Partial<ApprovalRequest>) => {
    const newApp: ApprovalRequest = {
      id: `app-assign-${Date.now()}`,
      project: req.project || 'Project Delta',
      requestType: `Member Assignment: ${req.memberName || 'New Member'} (${req.memberRole || 'Developer'})`,
      requestedBy: req.requestedBy || currentUser?.name || 'PM',
      memberName: req.memberName,
      memberRole: req.memberRole,
      memberDepartment: req.memberDepartment,
      justification: req.justification,
      amount: 'Access & Credential Required',
      date: req.date || new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    setApprovals([newApp, ...approvals]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Member Assignment Request',
      message: `${req.requestedBy || 'PM'} requested member assignment (${req.memberName}) for ${req.project}. Executive credential approval required.`,
      type: 'warning',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications([notif, ...notifications]);
  };

  const handleApproveMemberAssignment = (id: string, loginEmail: string, generatedPassword: string) => {
    let approvedMemberName = '';
    let approvedRole: UserRoleType = 'TEAM_MEMBER';
    let approvedDept = 'Engineering';
    let approvedProject = 'Project Delta';

    setApprovals(
      approvals.map((a) => {
        if (a.id === id) {
          approvedMemberName = a.memberName || 'New Member';
          approvedRole = (a.memberRole as UserRoleType) || 'TEAM_MEMBER';
          approvedDept = a.memberDepartment || 'Engineering';
          approvedProject = a.project || 'Project Delta';

          return {
            ...a,
            status: 'Approved',
            loginEmail,
            generatedPassword,
            credentialsIssued: true
          };
        }
        return a;
      })
    );

    const newUser: UserItem = {
      id: `u-${Date.now()}`,
      name: approvedMemberName,
      email: loginEmail,
      role: approvedRole,
      department: approvedDept,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      projectsAssigned: 1,
      assignedProjectCodes: [approvedProject],
      title: approvedRole,
      location: 'Headquarters',
      clearanceLevel: 'Tier 2 Approved Access',
      budgetCap: '$500,000',
      bio: `Provisioned by PMO Executive Director. Assigned to ${approvedProject}.`
    };

    setUsers((prev) => [newUser, ...prev]);

    const notif: NotificationItem = {
      id: `notif-app-${Date.now()}`,
      title: `Credentials Issued: ${approvedMemberName}`,
      message: `System login provisioned (${loginEmail}) for ${approvedProject}. Access active.`,
      type: 'success',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // KPI Metrics
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'Pending').length;
  const openRisksCount = risks.filter((r) => r.status === 'OPEN' || r.status === 'IN_REVIEW' || r.status === 'REPORTED').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const searchedProjects = searchQuery
    ? accessibleProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.owner.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : accessibleProjects;

  const searchedRisks = searchQuery
    ? risks.filter(
        (r) =>
          r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.owner.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : risks;

  // Authentication gate: CHECKING -> loading, NOT_AUTHENTICATED -> Login,
  // AUTHENTICATED -> protected application. The protected app is never rendered
  // before authentication is resolved.
  if (authStatus === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <span className="text-sm font-medium">Checking authentication…</span>
        </div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased overflow-x-hidden">
      {/* Mandatory Password Change Dialog on First Login */}
      {currentUser.mustChangePassword && (
        <FirstLoginChangePasswordModal
          userName={currentUser.name}
          userEmail={currentUser.email}
          onPasswordChanged={() => {
            setCurrentUser({ ...currentUser, mustChangePassword: false });
          }}
        />
      )}

      {/* Left Collapsible Sidebar Navigation */}
      <SidebarNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        pendingApprovalsCount={pendingApprovalsCount}
        openRisksCount={openRisksCount}
        unreadNotificationsCount={unreadNotificationsCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentPersona={currentPersona}
      />

      {/* Top Header */}
      <TopHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onOpenUserProfile={() => handleOpenUserProfile()}
        onLogout={handleLogout}
        currentPersona={currentPersona}
        projects={accessibleProjects}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
      />

      {/* Main Canvas */}
      <main
        className={`${
          isSidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        } mt-[64px] min-h-[calc(100vh-64px)] p-6 custom-scroll transition-all duration-300`}
      >
        {/* Role-based restriction check on every tab navigation */}
        {!isTabAllowedForRole(currentUser.role, currentTab) ? (
          <RestrictedAccessView
            currentPersona={currentPersona}
            tabName={currentTab}
          />
        ) : (

          <>
            {/* Render Tab Views */}
            {currentTab === 'dashboard' && (
              currentUser.role === 'EXECUTIVE_MANAGER' ? (
                <ExecutiveDashboardView
                  projects={searchedProjects}
                  risks={searchedRisks}
                  activities={activities}
                  resources={resources}
                  approvals={approvals}
                  tasks={accessibleTasks}
                  budgets={accessibleBudgets}
                  meetings={meetings}
                  onNavigate={(tab) => handleSelectTab(tab)}
                  onOpenNewProject={() => setIsNewProjectOpen(true)}
                  onOpenExportPDF={() => setIsExportPDFOpen(true)}
                  onApprovalAction={handleApprovalAction}
                  onUpdateRiskStatus={handleUpdateRisk}
                  onSelectProject={handleSelectProject}
                />
              ) : currentUser.role === 'PROJECT_MANAGER' ? (
                <PMDashboardView
                  projects={searchedProjects}
                  tasks={tasks}
                  users={users}
                  resources={resources}
                  currentPersona={currentPersona}
                  onNavigate={(tab) => handleSelectTab(tab)}
                  onOpenAssignMemberModal={() => setIsAssignMemberModalOpen(true)}
                />
              ) : currentUser.role === 'TEAM_MEMBER' ? (
                <TeamMemberDashboardView
                  projects={searchedProjects}
                  tasks={tasks}
                  risks={risks}
                  currentPersona={currentPersona}
                  onNavigate={(tab) => handleSelectTab(tab)}
                />
              ) : (
                <ProjectsView
                  projects={searchedProjects}
                  risks={searchedRisks}
                  tasks={tasks}
                  users={users}
                  selectedProject={selectedProject}
                  onSelectProject={handleSelectProject}
                  onOpenNewProject={() => setIsNewProjectOpen(true)}
                  onUpdateProject={handleUpdateProject}
                  onAddProject={handleAddProject}
                  onOpenAssignMemberModal={() => setIsAssignMemberModalOpen(true)}
                  currentPersona={currentPersona}
                  onApproveProject={handleApproveProject}
                  onRejectProject={handleRejectProject}
                />
              )
            )}

            {/* Users Views */}
            {(currentTab === 'users' || currentTab === 'users_add') && (
              <UsersView
                users={users}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                onToggleUserStatus={handleToggleUserStatus}
                onUpdateUser={handleUpdateUser}
                onSelectUser={handleOpenUserProfile}
                initialSubTab={currentTab === 'users_add' ? 'add' : 'list'}
                currentPersona={currentPersona}
              />
            )}

            {/* Tasks View */}
            {currentTab === 'tasks' && (
              <TasksView
                tasks={tasks}
                projects={projects}
                users={users}
                risks={risks}
                onAddTask={handleAddTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddRisk={handleAddRisk}
                currentPersona={currentPersona}
                onNotifyPM={handleNotifyPMTaskCompleted}
              />
            )}

            {/* Portfolio View */}
            {currentTab === 'portfolio' && (
              <PortfolioView
              projects={searchedProjects}
              risks={searchedRisks}
              resources={resources}
              onNavigate={handleSelectTab}
              onSelectProject={handleSelectProject}
            />
            )}

            {/* Projects View */}
            {(currentTab === 'projects' || currentTab === 'ai_project') && (
              <ProjectsView
                projects={searchedProjects}
                risks={searchedRisks}
                tasks={tasks}
                users={users}
                selectedProject={selectedProject}
                onSelectProject={handleSelectProject}
                onOpenNewProject={() => setIsNewProjectOpen(true)}
                onUpdateProject={handleUpdateProject}
                onAddProject={handleAddProject}
                onOpenAssignMemberModal={() => setIsAssignMemberModalOpen(true)}
                currentPersona={currentPersona}
                onApproveProject={handleApproveProject}
                onRejectProject={handleRejectProject}
              />
            )}

            {/* Resources View */}
            {currentTab === 'resources' && (
              <ResourcesView
              resources={resources}
              resourceRecords={resourceRecords}
              projects={projects}
              users={users}
              onOpenAssignMemberModal={() => {
                setAssignMemberModalMode('request');
                setIsAssignMemberModalOpen(true);
              }}
              onRefresh={async () => {
                const [loading, records] = await Promise.all([
                  fetchDepartmentLoadingApi(),
                  fetchResourcesFromApi(),
                ]);
                if (loading && loading.length > 0) setResources(loading);
                if (records) setResourceRecords(records);
              }}
            />
            )}

            {/* Change Requests View */}
            {currentTab === 'change_requests' && (
              <ChangeRequestsView
                changeRequests={changeRequests}
                projects={projects}
                onAddChangeRequest={handleAddChangeRequest}
                onUpdateChangeRequest={handleUpdateChangeRequest}
                onDeleteChangeRequest={handleDeleteChangeRequest}
                onApproveChangeRequest={handleApproveChangeRequest}
                onRejectChangeRequest={handleRejectChangeRequest}
                currentPersona={currentPersona}
              />
            )}

            {/* Risks View */}
            {(currentTab === 'risks' || currentTab === 'issues') && (
              <RisksView
                risks={searchedRisks}
                onAddRisk={handleAddRisk}
                onUpdateRisk={handleUpdateRisk}
                currentPersona={currentPersona}
                projects={projects}
              />
            )}

            {/* Budget View */}
            {currentTab === 'budget' && (
              <BudgetView
                budgets={budgets}
                currentPersona={currentPersona}
              />
            )}

            {/* Communication Hub */}
            {(currentTab === 'collaboration' ||
              currentTab === 'communication' ||
              currentTab === 'chat' ||
              currentTab === 'meetings' ||
              currentTab === 'notifications' ||
              currentTab === 'documents') && (
              <CommunicationView
                users={users}
                discussions={discussions}
                onAddDiscussion={handleAddDiscussion}
                meetings={meetings}
                onAddMeeting={handleAddMeeting}
                notifications={notifications}
                onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
                onClearNotifications={handleClearNotifications}
                activeSubTab={
                  currentTab === 'chat'
                    ? 'chat'
                    : currentTab === 'meetings'
                    ? 'calendar'
                    : currentTab === 'notifications'
                    ? 'notifications'
                    : currentTab === 'documents'
                    ? 'files'
                    : 'discussions'
                }
                onSubTabChange={(subTab) => {
                  if (subTab === 'chat') handleSelectTab('chat');
                  else if (subTab === 'calendar') handleSelectTab('meetings');
                  else if (subTab === 'notifications') handleSelectTab('notifications');
                  else if (subTab === 'files') handleSelectTab('documents');
                  else handleSelectTab('collaboration');
                }}
                currentPersona={currentPersona}
              />
            )}

            {/* Admin View */}
            {currentTab === 'admin' && <AdminView />}

            {/* Approvals View */}
            {currentTab === 'approvals' && (
              <ApprovalsView
                approvals={approvals}
                onAction={handleApprovalAction}
                onApproveMemberAssignment={handleApproveMemberAssignment}
                onNavigate={(tab) => handleSelectTab(tab)}
                onOpenAssignModal={() => setIsAssignMemberModalOpen(true)}
                projects={projects}
                onApproveProject={handleApproveProject}
                onRejectProject={handleRejectProject}
              />
            )}


            {/* Action Templates View */}
            {currentTab === 'templates' && (
              <TemplatesView
                projects={searchedProjects}
                onNavigate={(tab) => setCurrentTab(tab)}
                currentPersona={currentPersona}
              />
            )}

            {/* Reports View */}
            {currentTab === 'reports' && (
              <ReportsView
              projects={searchedProjects}
              risks={searchedRisks}
              reports={reports}
              templates={templates}
              onReportsChange={setReports}
              onTemplatesChange={setTemplates}
              currentPersona={currentPersona}
            />
            )}

            {/* Settings View */}
            {currentTab === 'settings' && <SettingsView />}

          </>
        )}
      </main>

      {/* Floating AI Assistant */}
      <AIAssistantModal />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onAddProject={handleAddProject}
      />

      {/* PDF Export Modal */}
      <ExportPDFModal
        isOpen={isExportPDFOpen}
        onClose={() => setIsExportPDFOpen(false)}
        projects={projects}
        risks={risks}
        resources={resources}
      />

      {/* Full User Profile Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        user={selectedUserProfile}
      />

      {/* Assign Member Modal */}
      <AssignMemberModal
        isOpen={isAssignMemberModalOpen}
        onClose={() => {
          setIsAssignMemberModalOpen(false);
          setAssignMemberModalMode('assign');
        }}
        projects={projects}
        selectedProject={selectedProject}
        users={users}
        resourceRecords={resourceRecords}
        onAssign={handleAssignTeamMember}
        mode={assignMemberModalMode}
        requesterName={currentUser?.name || 'Project Manager'}
        onRequest={async (payload) => {
          await createAssignmentRequestApi(payload);
          const [loading, records] = await Promise.all([
            fetchDepartmentLoadingApi(),
            fetchResourcesFromApi(),
          ]);
          if (loading) setResources(loading);
          if (records) setResourceRecords(records);
        }}
      />
    </div>
  );
}
