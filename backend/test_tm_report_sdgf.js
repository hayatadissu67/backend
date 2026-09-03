import { Sequelize } from 'sequelize';

const BASE_URL = 'http://localhost:5000/api';

async function fetchApi(url, method, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data;
}

async function testTeamMemberReporting() {
  const sequelize = new Sequelize('project_db', 'root', 'YOUR_NEW_PASSWORD', { host: '127.0.0.1', dialect: 'mysql', logging: false });
  try {
    // 1. Log in Team Member
    const tmLogin = await fetchApi('/auth/login', 'POST', { email: 'elena@pmo.com', password: 'password123' });
    const tmToken = tmLogin.token;

    const riskPayload = {
      ref: 'R-' + Math.floor(1000 + Math.random() * 9000),
      subject: 'Test Risk Name Normalization',
      description: 'Checking if Name is translated to Email',
      severity: 'HIGH',
      projectRef: 'PRJ-SDGF', // Owner in DB is 'Alex Rivers' (not email)
      category: 'Risk',
      status: 'REPORTED'
    };
    
    console.log("Sending payload:", riskPayload);
    const created = await fetchApi('/risks', 'POST', riskPayload, tmToken);
    console.log("Success! Risk created. Owner resolved by backend:", created.data.owner);
    
    const dbState = await sequelize.query(`SELECT owner FROM risks WHERE id='${created.data.id}'`);
    console.log("Database state:", dbState[0][0]);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
  process.exit(0);
}

testTeamMemberReporting();
