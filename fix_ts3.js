const fs = require('fs');

const pathApp = 'frontend/src/App.tsx';
let app = fs.readFileSync(pathApp, 'utf-8');

// Fix the bad import from ./services/api
app = app.replace("  UserRoleType,\n", "");

// If it's not already imported from ./types, import it
if (!app.includes("UserRoleType,")) {
    app = app.replace("  Project,\n", "  UserRoleType,\n  Project,\n");
}

// Fix the bad assignment on line 469
app = app.replace("approvedRole: UserRoleType = a.memberRole || 'Project Team Member';", "approvedRole = (a.memberRole as UserRoleType) || 'TEAM_MEMBER';");

fs.writeFileSync(pathApp, app);

console.log("App.tsx syntax fixes applied");
