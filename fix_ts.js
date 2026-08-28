const fs = require('fs');

const pathApp = 'frontend/src/App.tsx';
let app = fs.readFileSync(pathApp, 'utf-8');
app = app.replace(/role: 'PMO Executive Director',/g, "role: 'EXECUTIVE_MANAGER',");
app = app.replace(/approvedRole = 'Project Team Member';/g, "approvedRole: UserRoleType = 'TEAM_MEMBER';");
app = app.replace(/approvedRole = /g, "approvedRole: UserRoleType = ");
app = app.replace(/let approvedRole = 'Project Team Member';/g, "let approvedRole: UserRoleType = 'TEAM_MEMBER';");
fs.writeFileSync(pathApp, app);

const pathSidebar = 'frontend/src/components/SidebarNav.tsx';
let sidebar = fs.readFileSync(pathSidebar, 'utf-8');
sidebar = sidebar.replace(/currentPersona\.roleType === 'pm'/g, "(currentPersona.roleType === 'PROJECT_MANAGER' || currentPersona.roleType === 'EXECUTIVE_MANAGER')");
sidebar = sidebar.replace(/currentPersona\.roleType === 'intern'/g, "currentPersona.roleType === 'TEAM_MEMBER'");
fs.writeFileSync(pathSidebar, sidebar);

const pathRisks = 'frontend/src/components/views/RisksView.tsx';
let risks = fs.readFileSync(pathRisks, 'utf-8');
risks = risks.replace(/<"OPEN" \| "IN_REVIEW" \| "MITIGATED">/g, ""); // Remove the explicit state typing to let it infer or broaden it
risks = risks.replace(/useState<'OPEN' \| 'IN_REVIEW' \| 'MITIGATED'>/g, "useState<RiskItem['status']>");
fs.writeFileSync(pathRisks, risks);

const pathTasks = 'frontend/src/components/views/TasksView.tsx';
let tasks = fs.readFileSync(pathTasks, 'utf-8');
tasks = tasks.replace(/currentPersona\.roleType === 'pm'/g, "(currentPersona.roleType === 'PROJECT_MANAGER' || currentPersona.roleType === 'EXECUTIVE_MANAGER')");
fs.writeFileSync(pathTasks, tasks);

const pathUsers = 'frontend/src/components/views/UsersView.tsx';
let users = fs.readFileSync(pathUsers, 'utf-8');
users = users.replace(/role: 'System Admin',/g, "role: 'EXECUTIVE_MANAGER',");
users = users.replace(/role === 'System Admin'/g, "role === 'EXECUTIVE_MANAGER'");
users = users.replace(/role: 'Risk Manager',/g, "role: 'RISK_MANAGER',");
users = users.replace(/role: 'Intern',/g, "role: 'TEAM_MEMBER',");
users = users.replace(/role: 'Project Manager',/g, "role: 'PROJECT_MANAGER',");
users = users.replace(/role: 'Executive',/g, "role: 'EXECUTIVE_MANAGER',");
fs.writeFileSync(pathUsers, users);

console.log("TS fixes applied");
