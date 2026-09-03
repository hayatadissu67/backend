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

async function testFullWorkflow() {
  const sequelize = new Sequelize('project_db', 'root', 'YOUR_NEW_PASSWORD', { host: '127.0.0.1', dialect: 'mysql', logging: false });
  try {
    // 1. Log in Team Member
    const tmLogin = await fetchApi('/auth/login', 'POST', { email: 'elena@pmo.com', password: 'password123' });
    const tmToken = tmLogin.token;

    // 1b. Team Member Reports Risk
    console.log("=== STEP 1: TEAM MEMBER REPORTS RISK ===");
    const riskPayload = {
      ref: 'R-FLOW-1',
      subject: 'Workflow Test Risk',
      description: 'Testing the entire E2E flow',
      projectRef: 'PRJ-101',
      owner: 'alex@pmo.com',
      severity: 'HIGH',
      status: 'REPORTED',
      category: 'Risk',
      submittedBy: 'elena@pmo.com'
    };
    console.log("Request:", riskPayload);
    const created = await fetchApi('/risks', 'POST', riskPayload, tmToken);
    console.log("Response:", created);
    const riskId = created.data.id;
    let dbState = await sequelize.query(`SELECT status, resolvedBy FROM risks WHERE id='${riskId}'`);
    console.log("MySQL Database State:", dbState[0][0]);

    // 2. PM Escalates
    console.log("\n=== STEP 2: PROJECT MANAGER ESCALATES ===");
    const pmLogin = await fetchApi('/auth/login', 'POST', { email: 'alex@pmo.com', password: 'password123' });
    const pmToken = pmLogin.token;
    
    const escalatePayload = { status: 'ESCALATED', escalationNotes: 'Requires RM review' };
    console.log("Request:", escalatePayload);
    const escalated = await fetchApi(`/risks/${riskId}`, 'PUT', escalatePayload, pmToken);
    console.log("Response:", escalated);
    dbState = await sequelize.query(`SELECT status, resolvedBy FROM risks WHERE id='${riskId}'`);
    console.log("MySQL Database State:", dbState[0][0]);

    // 3. RM Solves
    console.log("\n=== STEP 3: RISK MANAGER SOLVES ===");
    const rmLogin = await fetchApi('/auth/login', 'POST', { email: 'marcus@pmo.com', password: 'password123' });
    const rmToken = rmLogin.token;

    // RM frontend sends the full object during update
    const solvePayload = { ...escalated.data, status: 'MITIGATED', resolutionNotes: 'Solved securely' };
    console.log("Request:", { status: solvePayload.status, resolutionNotes: solvePayload.resolutionNotes, resolvedBy: solvePayload.resolvedBy });
    const solved = await fetchApi(`/risks/${riskId}`, 'PUT', solvePayload, rmToken);
    console.log("Response:", solved);
    dbState = await sequelize.query(`SELECT status, resolvedBy, resolvedByRole, resolutionNotes FROM risks WHERE id='${riskId}'`);
    console.log("MySQL Database State:", dbState[0][0]);

  } catch (error) {
    console.error("Test failed:", error.message);
  }
  process.exit(0);
}

testFullWorkflow();
