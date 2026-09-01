const fs = require('fs');

const pathApp = 'frontend/src/App.tsx';
let app = fs.readFileSync(pathApp, 'utf-8');
if (!app.includes('UserRoleType,')) {
    app = app.replace(/import {/, "import {\n  UserRoleType,");
}
fs.writeFileSync(pathApp, app);

const pathSidebar = 'frontend/src/components/SidebarNav.tsx';
let sidebar = fs.readFileSync(pathSidebar, 'utf-8');
sidebar = sidebar.replace(/roleType === 'pm'/g, "roleType === 'PROJECT_MANAGER'");
sidebar = sidebar.replace(/roleType === 'intern'/g, "roleType === 'TEAM_MEMBER'");
fs.writeFileSync(pathSidebar, sidebar);

const pathTasks = 'frontend/src/components/views/TasksView.tsx';
let tasks = fs.readFileSync(pathTasks, 'utf-8');
tasks = tasks.replace(/roleType === 'pm'/g, "roleType === 'PROJECT_MANAGER'");
fs.writeFileSync(pathTasks, tasks);

const pathUsers = 'frontend/src/components/views/UsersView.tsx';
let users = fs.readFileSync(pathUsers, 'utf-8');
users = users.replace(/role: 'Team Member'/g, "role: 'TEAM_MEMBER'");
users = users.replace(/role: 'Executive Director'/g, "role: 'EXECUTIVE_MANAGER'");
fs.writeFileSync(pathUsers, users);

console.log("Final TS fixes applied");
