import 'dotenv/config';
import Project from './models/projectModel/projectModel.js';
import ProjectTeam from './models/projectModel/ProjectTeam.js';
import User from './models/authModel/userModel.js';

async function checkDbProjects() {
  try {
    const projects = await Project.findAll();
    console.log(`Total projects in DB: ${projects.length}`);
    projects.forEach(p => {
      console.log(`- [${p.code}] ${p.name} | Dept: ${p.department} | Owner: ${p.owner} | Approval: ${p.approvalStatus} | Status: ${p.status}`);
    });

    console.log("\nUsers:");
    const users = await User.findAll();
    users.forEach(u => {
      console.log(`- User ID: ${u.id} | ${u.name} | ${u.email} | Role: ${u.role} | Dept: ${u.department}`);
    });

    console.log("\nProjectTeam assignments:");
    const team = await ProjectTeam.findAll();
    team.forEach(t => {
      console.log(`- UserID: ${t.userId} assigned to ProjectCode: ${t.projectCode} (Responsibility: ${t.responsibility})`);
    });

  } catch (err) {
    console.error("DB error:", err);
  }
}

checkDbProjects();
