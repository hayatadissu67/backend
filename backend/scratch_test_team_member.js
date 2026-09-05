import 'dotenv/config';
import { Sequelize } from 'sequelize';

const BASE_URL = 'http://localhost:5000/api';

async function testTeamMemberAssignments() {
  try {
    console.log("1. Logging in as PM (alex@pmo.com)...");
    const pmLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@pmo.com', password: 'password123' })
    });
    const pmData = await pmLoginRes.json();
    const pmToken = pmData.token;

    console.log("\n2. Logging in as Team Member (elena@pmo.com / david@pmo.com)...");
    let tmLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'elena@pmo.com', password: 'password123' })
    });
    let tmData = await tmLoginRes.json();
    if (!tmLoginRes.ok) {
      // Register David Kim as TEAM_MEMBER
      await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'David Kim', email: 'david@pmo.com', password: 'password123', role: 'TEAM_MEMBER', department: 'Engineering' })
      });
      tmLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'david@pmo.com', password: 'password123' })
      });
      tmData = await tmLoginRes.json();
    }

    const tmUser = tmData.user;
    const tmToken = tmData.token;
    console.log(`TM Logged in: ${tmUser.name} (ID: ${tmUser.id}, Email: ${tmUser.email})`);

    console.log("\n3. PM creating new project and assigning Team Member...");
    const projectCode = `PRJ-ASSIGN-${Math.floor(100 + Math.random() * 900)}`;
    const createPrjRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pmToken}`
      },
      body: JSON.stringify({
        name: `Assignment Test Project ${Date.now()}`,
        code: projectCode,
        department: 'Engineering',
        owner: 'Alex Rivers',
        status: 'PLANNING',
        health: 'GREEN',
        budget: 200000,
        assignedTeamMembers: [
          { userId: tmUser.id, responsibility: 'Lead Developer' }
        ]
      })
    });
    const createPrjData = await createPrjRes.json();
    console.log("Project Created Status:", createPrjRes.status, createPrjData.message);

    console.log("\n4. Fetching project list as Team Member (GET /api/projects)...");
    const tmProjectsRes = await fetch(`${BASE_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${tmToken}` }
    });
    const tmProjectsData = await tmProjectsRes.json();
    console.log("TM Projects List Response Status:", tmProjectsRes.status);
    console.log("TM Projects List Count:", tmProjectsData.data?.length);
    console.log("TM Projects:", tmProjectsData.data?.map(p => ({ id: p.id, name: p.name, code: p.code })));

    const isAssignedProjectIncluded = tmProjectsData.data?.some(p => p.code === projectCode);

    if (isAssignedProjectIncluded) {
      console.log(`\n✅ SUCCESS! Project ${projectCode} is visible to assigned Team Member ${tmUser.name}.`);
    } else {
      console.log(`\n❌ FAILED! Project ${projectCode} is NOT visible to Team Member ${tmUser.name}.`);
    }

  } catch (err) {
    console.error("Test Error:", err.message);
  }
}

testTeamMemberAssignments();
