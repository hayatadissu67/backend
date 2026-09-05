// Central RBAC permissions mapping
// Permission keys map to an array of allowed role codes
export const permissions = {
  // Projects
  'projects.view': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER', 'RISK_MANAGER', 'TEAM_MEMBER'],
  'projects.create': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER'],
  'projects.update': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER'],
  'projects.approve': ['EXECUTIVE_MANAGER'],

  // Users
  'users.view': ['EXECUTIVE_MANAGER'],
  'users.create': ['EXECUTIVE_MANAGER'],
  'users.update': ['EXECUTIVE_MANAGER'],

  // Tasks
  'tasks.view': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER', 'RISK_MANAGER', 'TEAM_MEMBER'],
  'tasks.create': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER', 'TEAM_MEMBER'],
  'tasks.update': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER', 'TEAM_MEMBER'],

  // Change Requests
  'change_requests.view': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER', 'RISK_MANAGER'],
  'change_requests.create': ['PROJECT_MANAGER', 'TEAM_MEMBER'],
  'change_requests.update': ['PROJECT_MANAGER'],
  'change_requests.approve': ['EXECUTIVE_MANAGER'],

  // Templates
  'templates.view': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER', 'RISK_MANAGER', 'TEAM_MEMBER'],
  'templates.create': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER'],
  'templates.update': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER'],
  'templates.delete': ['EXECUTIVE_MANAGER'],

  // Reports
  'reports.view': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER', 'RISK_MANAGER', 'TEAM_MEMBER'],
  'reports.create': ['PROJECT_MANAGER', 'TEAM_MEMBER'],
  'reports.update': ['PROJECT_MANAGER'],
  'reports.delete': ['EXECUTIVE_MANAGER'],

  // Budgets
  'budgets.view': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER', 'RISK_MANAGER'],
  'budgets.create': ['PROJECT_MANAGER'],
  'budgets.update': ['PROJECT_MANAGER'],
  'budgets.delete': ['EXECUTIVE_MANAGER'],

  // Risks
  'risks.view': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER', 'RISK_MANAGER', 'TEAM_MEMBER'],
  'risks.create': ['PROJECT_MANAGER', 'TEAM_MEMBER'],
  'risks.update': ['PROJECT_MANAGER', 'RISK_MANAGER'],
  'risks.delete': ['EXECUTIVE_MANAGER'],

  // Resources & Portfolios
  'resources.view': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER', 'RISK_MANAGER'],
  'resources.update': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER'],
  'resources.request': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER'],
  'resources.approve': ['EXECUTIVE_MANAGER'],
  'portfolios.view': ['EXECUTIVE_MANAGER', 'PROJECT_MANAGER'],
  'portfolios.create': ['EXECUTIVE_MANAGER'],
  'portfolios.update': ['EXECUTIVE_MANAGER'],
  'portfolios.delete': ['EXECUTIVE_MANAGER'],
};

export const roles = [
  { code: 'EXECUTIVE_MANAGER', name: 'Executive Manager' },
  { code: 'PROJECT_MANAGER', name: 'Project Manager' },
  { code: 'RISK_MANAGER', name: 'Risk Manager' },
  { code: 'TEAM_MEMBER', name: 'Team Member' },
];

export default { permissions, roles };
