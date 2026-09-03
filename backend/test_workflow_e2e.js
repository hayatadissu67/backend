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
    throw new Error(`${res.status} ${res.statusText} - ${JSON.stringify(data)}`);
  }
  return data;
}

async function runE2E() {
  const sequelize = new Sequelize('project_db', 'root', 'YOUR_NEW_PASSWORD', { host: '127.0.0.1', dialect: 'mysql', logging: false });
  try {
    const hash = await import('bcryptjs').then(m => m.hash('password123', 10));
    await sequelize.query(`INSERT IGNORE INTO users (name, email, password, role, department, status, createdAt, updatedAt) VALUES ('Exec Manager', 'exec@pmo.com', '${hash}', 'EXECUTIVE_MANAGER', 'IT', 'Active', NOW(), NOW())`);
    
    console.log("1. Logging in users...");
    const execLogin = await fetchApi('/auth/login', 'POST', { email: 'exec@pmo.com', password: 'password123' });
    const pmLogin = await fetchApi('/auth/login', 'POST', { email: 'alex@pmo.com', password: 'password123' });
    const tmLogin = await fetchApi('/auth/login', 'POST', { email: 'elena@pmo.com', password: 'password123' });
    const rmLogin = await fetchApi('/auth/login', 'POST', { email: 'marcus@pmo.com', password: 'password123' });

    console.log("2. Get Elena's ID for assignment...");
    const [tm] = await sequelize.query(`SELECT id FROM users WHERE email='elena@pmo.com'`);
    const elenaId = tm[0].id;

    console.log("3. PM Creates Project and Assigns Elena concurrently...");
    const projectCode = 'PRJ-E2E-' + Date.now();
    const newProject = await fetchApi('/projects', 'POST', {
      name: 'E2E Test Project',
      code: projectCode,
      department: 'IT',
      description: 'End to end testing project',
      assignedTeamMembers: [elenaId]
    }, pmLogin.token);
    
    console.log("Project created:", newProject);
    const projectId = newProject.data.id;
    
    console.log("4. Exec Approves Project...");
    await fetchApi(`/projects/${projectId}/approve`, 'PATCH', {}, execLogin.token);

    console.log("5. TM Fetches Projects...");
    const tmProjects = await fetchApi('/projects', 'GET', null, tmLogin.token);
    const isAssigned = tmProjects.data.some(p => p.code === projectCode);
    console.log("TM assigned successfully:", isAssigned);

    console.log("6. TM Reports Risk...");
    const newRisk = await fetchApi('/risks', 'POST', {
      ref: 'RSK-' + Date.now(),
      subject: 'E2E Security Flaw',
      description: 'Found a vulnerability.',
      projectRef: projectCode,
      severity: 'HIGH'
    }, tmLogin.token);
    const riskId = newRisk.data.id;

    console.log("7. PM Fetches Risks...");
    const pmRisks = await fetchApi('/risks', 'GET', null, pmLogin.token);
    const riskVisible = pmRisks.data.some(r => r.id === riskId);
    console.log("PM sees the risk:", riskVisible, "(PM Owner:", newRisk.data.owner, ")");

    console.log("8. PM Escalates Risk...");
    await fetchApi(`/risks/${riskId}`, 'PUT', { status: 'ESCALATED' }, pmLogin.token);

    console.log("9. RM Solves Risk...");
    await fetchApi(`/risks/${riskId}`, 'PUT', { status: 'RESOLVED', resolutionNotes: 'Fixed code.' }, rmLogin.token);

    console.log("10. Verify DB...");
    const dbRisk = await sequelize.query(`SELECT status, resolvedBy, resolvedByRole, resolutionNotes FROM risks WHERE id='${riskId}'`);
    console.log("Final Risk state in DB:", dbRisk[0][0]);
    console.log("E2E WORKFLOW SUCCESS!");

  } catch (error) {
    console.error("Test failed:", error.message);
  }
  process.exit(0);
}

runE2E();
