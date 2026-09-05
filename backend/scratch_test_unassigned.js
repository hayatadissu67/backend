import 'dotenv/config';

const BASE_URL = 'http://localhost:5000/api';

async function testUnassignedTeamMember() {
  try {
    console.log("1. Registering new unassigned Team Member...");
    const email = `unassigned_${Date.now()}@pmo.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unassigned Member', email, password: 'password123', role: 'TEAM_MEMBER', department: 'Engineering' })
    });
    
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    console.log("2. Fetching projects list as unassigned Team Member (GET /api/projects)...");
    const projRes = await fetch(`${BASE_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const projData = await projRes.json();
    console.log("Projects Count returned for unassigned Team Member:", projData.data?.length);

    if (projData.data?.length === 0) {
      console.log("✅ SUCCESS! Unassigned Team Member sees 0 unassigned projects.");
    } else {
      console.log(`❌ FAILED! Unassigned Team Member unexpectedly received ${projData.data?.length} projects.`);
    }
  } catch (err) {
    console.error("Test error:", err.message);
  }
}

testUnassignedTeamMember();
