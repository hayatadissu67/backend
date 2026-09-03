import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';

const BASE_URL = 'http://localhost:5000/api';

async function fetchApi(url, method, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || res.statusText);
  }
  return res.json();
}

async function setupDb() {
  const sequelize = new Sequelize('project_db', 'root', 'YOUR_NEW_PASSWORD', {
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false
  });

  try {
    const [tm] = await sequelize.query(`SELECT id FROM users WHERE email='elena@pmo.com'`);
    if (tm.length > 0) {
      await sequelize.query(`INSERT IGNORE INTO project_team (userId, projectCode, createdAt, updatedAt) VALUES (${tm[0].id}, 'PRJ-101', NOW(), NOW())`);
      console.log("Seeded ProjectTeam for Elena -> PRJ-101");
    }
  } catch (e) {
    console.log("DB Setup error", e.message);
  }
}

async function register(name, email, password, role) {
  try {
    await fetchApi('/auth/register', 'POST', { name, email, password, role, department: 'IT' });
  } catch (e) {
    // ignore
  }
}

async function testWorkflow() {
  try {
    console.log("1. Logging in users...");
    const tmLogin = await fetchApi('/auth/login', 'POST', { email: 'elena@pmo.com', password: 'password123' });
    const pmLogin = await fetchApi('/auth/login', 'POST', { email: 'alex@pmo.com', password: 'password123' });
    const rmLogin = await fetchApi('/auth/login', 'POST', { email: 'marcus@pmo.com', password: 'password123' });

    const tmToken = tmLogin.token;
    const pmToken = pmLogin.token;
    const rmToken = rmLogin.token;

    console.log("\n--- TEST C: Team Member attempts to solve risk directly (Should fail) ---");
    try {
      await fetchApi('/risks', 'POST', {
        ref: 'RSK-999',
        subject: 'Test Solve Block',
        description: 'Testing if TM can solve',
        status: 'RESOLVED',
        projectRef: 'PRJ-101'
      }, tmToken);
    } catch (err) { }
    const tmRisksC = await fetchApi('/risks', 'GET', null, tmToken);
    const blockedC = tmRisksC.data.find(r => r.ref === 'RSK-999');
    if (blockedC && blockedC.status !== 'RESOLVED') {
      console.log(`✅ PASSED: TM create risk status was overridden to ${blockedC.status}`);
    } else {
      console.log("❌ FAILED: TM was able to create a resolved risk or it wasn't saved.");
    }

    console.log("\n--- TEST D: Team Member attempts to send risk directly to RM (Should fail) ---");
    try {
      await fetchApi('/risks', 'POST', {
        ref: 'RSK-998',
        subject: 'Test Escalate Block',
        description: 'Testing if TM can escalate',
        status: 'ESCALATED',
        projectRef: 'PRJ-101'
      }, tmToken);
    } catch (err) {}
    const tmRisksD = await fetchApi('/risks', 'GET', null, tmToken);
    const blockedD = tmRisksD.data.find(r => r.ref === 'RSK-998');
    if (blockedD && blockedD.status !== 'ESCALATED') {
      console.log(`✅ PASSED: TM escalate status was overridden to ${blockedD.status}`);
    } else {
      console.log("❌ FAILED: TM was able to create an escalated risk.");
    }

    console.log("\n--- TEST A: TM reports -> PM Solves ---");
    const resA = await fetchApi('/risks', 'POST', {
      ref: 'RSK-TEST-A',
      subject: 'Test A Risk',
      description: 'Testing PM solve',
      status: 'REPORTED',
      projectRef: 'PRJ-101'
    }, tmToken);
    const riskAId = resA.data.id;
    console.log("TM created risk:", riskAId);

    await fetchApi(`/risks/${riskAId}`, 'PUT', { status: 'RESOLVED', resolutionNotes: 'PM fixed it' }, pmToken);
    
    const getResA = await fetchApi(`/risks/${riskAId}`, 'GET', null, tmToken);
    const riskA = getResA.data;
    if (riskA.status === 'RESOLVED' && riskA.resolvedByRole === 'PROJECT_MANAGER' && riskA.resolvedBy) {
      console.log(`✅ PASSED: Risk A Solved by PM. Resolved By ID: ${riskA.resolvedBy}, Role: ${riskA.resolvedByRole}`);
    } else {
      console.log("❌ FAILED Test A", riskA);
    }

    console.log("\n--- TEST B: TM reports -> PM Escalates -> RM Solves ---");
    const resB = await fetchApi('/risks', 'POST', {
      ref: 'RSK-TEST-B',
      subject: 'Test B Risk',
      description: 'Testing RM solve',
      status: 'REPORTED',
      projectRef: 'PRJ-101'
    }, tmToken);
    const riskBId = resB.data.id;
    
    await fetchApi(`/risks/${riskBId}`, 'PUT', { status: 'ESCALATED', escalationNotes: 'Need RM help' }, pmToken);
    await fetchApi(`/risks/${riskBId}`, 'PUT', { status: 'MITIGATED', resolutionNotes: 'RM mitigated it' }, rmToken);

    const getResB = await fetchApi(`/risks/${riskBId}`, 'GET', null, tmToken);
    const riskB = getResB.data;
    if ((riskB.status === 'RESOLVED' || riskB.status === 'MITIGATED') && riskB.resolvedByRole === 'RISK_MANAGER' && riskB.resolvedBy) {
      console.log(`✅ PASSED: Risk B Solved by RM. Resolved By ID: ${riskB.resolvedBy}, Role: ${riskB.resolvedByRole}`);
    } else {
      console.log("❌ FAILED Test B", riskB);
    }

  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testWorkflow();
