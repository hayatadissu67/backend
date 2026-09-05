export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'DELAYED' | 'PLANNING';
export type HealthStatus = 'GREEN' | 'YELLOW' | 'RED';

export type LifecycleStage = 'Initiation' | 'Planning' | 'Execution' | 'Monitoring' | 'Closure' | 'Governance';

export interface LifecyclePhaseCriterion {
  id: string;
  label: string;
  completed: boolean;
}

export interface ProjectLifecycleInfo {
  stage: LifecycleStage;
  stageNumber: number; // 1 to 5
  phaseDurationDays: number;
  health: 'Green' | 'Amber' | 'Red';
  approver: string;
  signOffDate?: string;
  criteria: LifecyclePhaseCriterion[];
}

export interface WebRequirement {
  id: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps & Cloud' | 'Security & Auth' | 'UX & Accessibility';
  title: string;
  status: 'Compliant' | 'In Progress' | 'Pending Review' | 'Blocked';
  owner: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  department: string;
  owner: string;
  status: ProjectStatus;
  health: HealthStatus;
  budget: number;
  spent: number;
  progress: number;
  gate: string;
  targetDate: string;
  startDate?: string;
  description?: string;
  techStack?: string[];
  liveUrl?: string;
  repoUrl?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  requirements?: WebRequirement[];
  teamMembers?: string[];
  assignedTeamMembers?: { userId: number; responsibility: string }[];
  lifecycleStage?: LifecycleStage;
  lifecycle?: ProjectLifecycleInfo;
  approvalStatus?: 'PENDING_APPROVAL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED' | 'PENDING_DELETION' | 'PENDING_CLOSURE' | 'CLOSED' | string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}


export interface RiskItem {
  id: string;
  ref: string;
  subject: string;
  description: string;
  severity: Severity;
  owner: string;
  assignedRiskManager?: string;
  assignedProjectManager?: string;
  flaggedBy?: string;
  submittedBy?: string;
  category: 'Risk' | 'Issue';
  projectRef?: string;
  milestoneRef?: string;
  status: 'OPEN' | 'IN_REVIEW' | 'MITIGATED' | 'REPORTED' | 'UNDER_REVIEW' | 'ESCALATED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdDate: string;
  delegationNotes?: string;
  delegatedAt?: string;
  escalationNotes?: string;
  escalatedAt?: string;
  resolutionNotes?: string;
  resolvedBy?: string | number;
  resolvedById?: number;
  resolvedByRole?: string;
  Resolver?: { name: string };
  resolvedAt?: string;
}


export interface ActivityItem {
  id: string;
  type: 'gate' | 'risk' | 'document' | 'resource' | 'comment' | 'approval';
  title: string;
  subtitle: string;
  timestamp: string;
  badgeType: 'check' | 'warning' | 'document' | 'person' | 'chat';
}

export interface Milestone {
  id: string;
  date: string;
  title: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  isToday?: boolean;
  owner?: string;
  description?: string;
}

export interface ResourceLoading {
  department: string;
  percentage: number;
  headcount: number;
  colorClass: string;
}

export interface ApprovalRequest {
  id: string;
  project: string;
  requestType: string;
  requestedBy: string;
  amount?: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  templateId?: string;
  executiveSignature?: string;
  // Member Assignment & Executive Credential Provisioning fields
  memberName?: string;
  memberEmail?: string;
  memberRole?: string;
  memberDepartment?: string;
  justification?: string;
  loginEmail?: string;
  generatedPassword?: string;
  credentialsIssued?: boolean;
}

export interface ChangeRequestItem {
  id: string;
  title: string;
  project: string;
  projectId?: string;
  category: string;
  date: string;
  type: string;
  amount: string;
  priority: 'High' | 'Medium' | 'Critical' | 'Low';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy?: string;
  description?: string;
  impactAnalysis?: string;
}

export interface ExecutiveTemplateField {
  id: string;
  label: string;
  fieldType: 'text' | 'number' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export interface ExecutiveTemplate {
  id: string;
  title: string;
  code: string;
  version?: string;
  category: 'Executive Charter' | 'Financial & Budget' | 'Stage-Gate Governance' | 'Security & Access' | 'Architecture Exception';
  description: string;
  requiredApproverRole: 'Executive Sponsor' | 'CFO / Financial Controller' | 'CTO / Chief Architect' | 'PMO Director' | 'Steering Committee';
  icon: string;
  isExecutiveOnly: boolean;
  fields: ExecutiveTemplateField[];
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  versions?: any[];
  createdAt: string;
}


export interface ExecutiveTemplateRequest {
  id: string;
  templateId: string;
  templateTitle: string;
  category: string;
  projectCode?: string;
  projectName?: string;
  requestedBy: string;
  requestedByRole: string;
  requestedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approverRole: string;
  approverName?: string;
  decisionDate?: string;
  rejectionReason?: string;
  executiveSignature?: string;
  fieldValues: Record<string, string | boolean>;
}

export type NavigationTab = 
  | 'dashboard'
  | 'portfolio'
  | 'projects'
  | 'users'
  | 'users_add'
  | 'tasks'
  | 'resources'
  | 'risks'
  | 'issues'
  | 'change_requests'
  | 'budget'
  | 'collaboration'
  | 'communication'
  | 'chat'
  | 'meetings'
  | 'reports'
  | 'ai_project'
  | 'notifications'
  | 'admin'
  | 'documents'
  | 'approvals'
  | 'templates'
  | 'settings';

export type UserRoleType = 'TEAM_MEMBER' | 'PROJECT_MANAGER' | 'RISK_MANAGER' | 'EXECUTIVE_MANAGER';

export interface LoggedInPersona {
  id: string;
  name: string;
  roleType: UserRoleType;
  roleTitle: string;
  email: string;
  department: string;
  avatar: string;
  assignedProjectCodes: string[];
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  department: string;
  status: 'Active' | 'Inactive' | 'Pending';
  avatar: string;
  responsibility?: string;
  projectsAssigned: number;
  title?: string;
  phone?: string;
  location?: string;
  governanceRole?: string;
  clearanceLevel?: string;
  budgetCap?: string;
  bio?: string;
  joinDate?: string;
  assignedProjectCodes?: string[];
  recentActivity?: { action: string; timestamp: string }[];
  mustChangePassword?: boolean;
  createdBy?: number;
}

export interface TaskItemComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface TaskItem {
  id: string;
  title: string;
  projectCode: string;
  projectName?: string;
  assignee: string;
  assigneeRole?: string;
  status: 'Backlog' | 'In Progress' | 'Review' | 'Done' | 'Blocked';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  startDate?: string;
  progress?: number;
  estimatedHours?: number;
  hoursLogged?: number;
  description?: string;
  comments?: TaskItemComment[];
}

export interface BudgetItem {
  id: string;
  projectCode: string;
  projectName: string;
  allocated: number;
  actualSpent: number;
  committed: number;
  variance: number;
  health: 'On Track' | 'Over Budget' | 'Under Budget';
}

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  location: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  agenda: string;
}

export interface DiscussionItem {
  id: string;
  author: string;
  role: string;
  avatar: string;
  content: string;
  timestamp: string;
  repliesCount: number;
  projectTag: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  timestamp: string;
  isRead: boolean;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  versionNumber: number;
  fileUrl: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  version?: string;
  code?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileData?: string;
  fields?: ExecutiveTemplateField[];
  status?: string;
  updatedBy?: string;
  versions?: TemplateVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportVersion {
  id: string;
  reportId: string;
  versionNumber: number;
  fileUrl: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  preparedBy?: string;
  period?: string;
  type?: string;
  status?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileData?: string;
  templateId?: string;
  template?: ReportTemplate;
  versions?: ReportVersion[];
  createdAt: string;
  updatedAt: string;
}

