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

async function testRouting() {
  const sequelize = new Sequelize('project_db', 'root', 'YOUR_NEW_PASSWORD', { host: '127.0.0.1', dialect: 'mysql', logging: false });
  try {
    // 1. Log in Team Member
    const tmLogin = await fetchApi('/auth/login', 'POST', { email: 'elena@pmo.com', password: 'password123' });
    const tmToken = tmLogin.token;

    // 1b. Team Member Reports Risk WITHOUT owner field
    console.log("=== STEP 1: TEAM MEMBER REPORTS RISK ===");
    const riskPayload = {
      ref: 'R-FLOW-ROUTING',
      subject: 'Routing Test Risk',
      description: 'Testing if it auto-routes to PM',
      projectRef: 'PRJ-101',
      severity: 'HIGH',
      category: 'Risk'
    };
    console.log("Request:", riskPayload);
    const created = await fetchApi('/risks', 'POST', riskPayload, tmToken);
    console.log("Response:", created);
    
    // Check Database State
    const riskId = created.data.id;
    let dbState = await sequelize.query(`SELECT owner, status FROM risks WHERE id='${riskId}'`);
    console.log("MySQL Database State:", dbState[0][0]);

  } catch (error) {
    console.error("Test failed:", error.message);
  }
  process.exit(0);
}

testRouting();
