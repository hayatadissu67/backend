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

async function testWorkflow() {
  const sequelize = new Sequelize('project_db', 'root', 'YOUR_NEW_PASSWORD', { host: '127.0.0.1', dialect: 'mysql', logging: false });
  try {
    // 1. Log in Team Member
    const tmLogin = await fetchApi('/auth/login', 'POST', { email: 'elena@pmo.com', password: 'password123' });
    const tmToken = tmLogin.token;

    console.log("=== STEP 1: TEAM MEMBER REPORTS RISK ===");
    // Purposely NOT sending owner, submittedBy, flaggedBy, etc.
    const riskPayload = {
      ref: 'R-NATIVE-1',
      subject: 'Native PM Routing Test',
      description: 'Testing backend dynamic PM resolution',
      projectRef: 'PRJ-101',
      severity: 'HIGH',
      category: 'Risk'
    };
    const created = await fetchApi('/risks', 'POST', riskPayload, tmToken);
    console.log("Created Risk:", created.data);
    const riskId = created.data.id;
    
    // Validate DB State
    let dbState = await sequelize.query(`SELECT owner, submittedBy, status FROM risks WHERE id='${riskId}'`);
    console.log("DB State (After Create):", dbState[0][0]);

    // 2. Log in Project Manager
    console.log("\n=== STEP 2: PROJECT MANAGER RESOLVES ===");
    const pmLogin = await fetchApi('/auth/login', 'POST', { email: 'alex@pmo.com', password: 'password123' });
    const pmToken = pmLogin.token;
    
    // PM resolves the risk
    const solvePayload = { status: 'RESOLVED', resolutionNotes: 'Solved by the actual PM' };
    const solved = await fetchApi(`/risks/${riskId}`, 'PUT', solvePayload, pmToken);
    
    dbState = await sequelize.query(`SELECT status, resolvedBy, resolvedByRole, resolutionNotes FROM risks WHERE id='${riskId}'`);
    console.log("DB State (After PM Resolve):", dbState[0][0]);

    // 3. Test PM Authorization Security
    console.log("\n=== STEP 3: UNAUTHORIZED PM ACCESS ===");
    // Create another PM
    await fetchApi('/auth/login', 'POST', { email: 'fake_pm@pmo.com', password: 'password123' }).catch(async () => {
       await sequelize.query(`INSERT IGNORE INTO users (name, email, password, role, status, createdAt, updatedAt) VALUES ('Fake PM', 'fake_pm@pmo.com', 'pwd', 'PROJECT_MANAGER', 'Active', NOW(), NOW())`);
    });
    const fakePm = await fetchApi('/auth/login', 'POST', { email: 'fake_pm@pmo.com', password: 'password123' }).catch(() => null);
    if (fakePm) {
      try {
         await fetchApi(`/risks/${riskId}`, 'PUT', { status: 'ESCALATED' }, fakePm.token);
         console.log("ERROR: Fake PM was able to escalate!");
      } catch (err) {
         console.log("SUCCESS: Fake PM blocked from escalating ->", err.message);
      }
    } else {
         console.log("Skipped auth test");
    }

  } catch (error) {
    console.error("Test failed:", error.message);
  }
  process.exit(0);
}

testWorkflow();
