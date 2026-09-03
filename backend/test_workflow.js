import axios from 'axios';
import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';

const BASE_URL = 'http://localhost:5000/api';

async function setupDb() {
  const connection = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '' });
  await connection.query('CREATE DATABASE IF NOT EXISTS project_db;');
  await connection.end();

  const sequelize = new Sequelize('project_db', 'root', '', {
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false
  });

  // We only need to insert ProjectTeam
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
    await axios.post(`${BASE_URL}/auth/register`, { name, email, password, role, department: 'IT' });
  } catch (e) {
    // ignore if already exists
  }
}

async function testWorkflow() {
  try {
    console.log("0. Registering users...");
    await register("Elena Team", "elena@pmo.com", "password123", "TEAM_MEMBER");
    await register("Alex PM", "alex@pmo.com", "password123", "PROJECT_MANAGER");
    await register("Marcus RM", "marcus@pmo.com", "password123", "RISK_MANAGER");

    await setupDb();

    console.log("1. Logging in users...");
    const tmLogin = await axios.post(`${BASE_URL}/auth/login`, { email: 'elena@pmo.com', password: 'password123' });
    const pmLogin = await axios.post(`${BASE_URL}/auth/login`, { email: 'alex@pmo.com', password: 'password123' });
    const rmLogin = await axios.post(`${BASE_URL}/auth/login`, { email: 'marcus@pmo.com', password: 'password123' });

    const tmToken = tmLogin.data.token;
    const pmToken = pmLogin.data.token;
    const rmToken = rmLogin.data.token;

    console.log("\n--- TEST C: Team Member attempts to solve risk directly (Should fail) ---");
    try {
      await axios.post(`${BASE_URL}/risks`, {
        ref: 'RSK-999',
        subject: 'Test Solve Block',
        description: 'Testing if TM can solve',
        status: 'RESOLVED',
        projectRef: 'PRJ-101'
      }, { headers: { Authorization: `Bearer ${tmToken}` } });
    } catch (err) { }
    // Fetch it to see what status it really got
    const tmRisksC = await axios.get(`${BASE_URL}/risks`, { headers: { Authorization: `Bearer ${tmToken}` } });
    const blockedC = tmRisksC.data.data.find(r => r.ref === 'RSK-999');
    if (blockedC && blockedC.status !== 'RESOLVED') {
      console.log(`✅ PASSED: TM create risk status was overridden to ${blockedC.status}`);
    } else {
      console.log("❌ FAILED: TM was able to create a resolved risk or it wasn't saved.");
    }

    console.log("\n--- TEST D: Team Member attempts to send risk directly to RM (Should fail) ---");
    try {
      await axios.post(`${BASE_URL}/risks`, {
        ref: 'RSK-998',
        subject: 'Test Escalate Block',
        description: 'Testing if TM can escalate',
        status: 'ESCALATED',
        projectRef: 'PRJ-101'
      }, { headers: { Authorization: `Bearer ${tmToken}` } });
    } catch (err) {}
    const tmRisksD = await axios.get(`${BASE_URL}/risks`, { headers: { Authorization: `Bearer ${tmToken}` } });
    const blockedD = tmRisksD.data.data.find(r => r.ref === 'RSK-998');
    if (blockedD && blockedD.status !== 'ESCALATED') {
      console.log(`✅ PASSED: TM escalate status was overridden to ${blockedD.status}`);
    } else {
      console.log("❌ FAILED: TM was able to create an escalated risk.");
    }

    console.log("\n--- TEST A: TM reports -> PM Solves ---");
    const resA = await axios.post(`${BASE_URL}/risks`, {
      ref: 'RSK-TEST-A',
      subject: 'Test A Risk',
      description: 'Testing PM solve',
      status: 'REPORTED',
      projectRef: 'PRJ-101'
    }, { headers: { Authorization: `Bearer ${tmToken}` } });
    const riskAId = resA.data.data.id;
    console.log("TM created risk:", riskAId);

    // PM solves
    await axios.put(`${BASE_URL}/risks/${riskAId}`, {
      status: 'RESOLVED',
      resolutionNotes: 'PM fixed it'
    }, { headers: { Authorization: `Bearer ${pmToken}` } });
    
    // Check
    const getResA = await axios.get(`${BASE_URL}/risks/${riskAId}`, { headers: { Authorization: `Bearer ${tmToken}` } });
    const riskA = getResA.data.data;
    if (riskA.status === 'RESOLVED' && riskA.resolvedByRole === 'PROJECT_MANAGER' && riskA.resolvedBy) {
      console.log(`✅ PASSED: Risk A Solved by PM. Resolved By ID: ${riskA.resolvedBy}, Role: ${riskA.resolvedByRole}`);
    } else {
      console.log("❌ FAILED Test A", riskA);
    }

    console.log("\n--- TEST B: TM reports -> PM Escalates -> RM Solves ---");
    const resB = await axios.post(`${BASE_URL}/risks`, {
      ref: 'RSK-TEST-B',
      subject: 'Test B Risk',
      description: 'Testing RM solve',
      status: 'REPORTED',
      projectRef: 'PRJ-101'
    }, { headers: { Authorization: `Bearer ${tmToken}` } });
    const riskBId = resB.data.data.id;
    
    // PM Escalate
    await axios.put(`${BASE_URL}/risks/${riskBId}`, {
      status: 'ESCALATED',
      escalationNotes: 'Need RM help'
    }, { headers: { Authorization: `Bearer ${pmToken}` } });

    // RM Solves
    await axios.put(`${BASE_URL}/risks/${riskBId}`, {
      status: 'MITIGATED',
      resolutionNotes: 'RM mitigated it'
    }, { headers: { Authorization: `Bearer ${rmToken}` } });

    // Check
    const getResB = await axios.get(`${BASE_URL}/risks/${riskBId}`, { headers: { Authorization: `Bearer ${tmToken}` } });
    const riskB = getResB.data.data;
    if ((riskB.status === 'RESOLVED' || riskB.status === 'MITIGATED') && riskB.resolvedByRole === 'RISK_MANAGER' && riskB.resolvedBy) {
      console.log(`✅ PASSED: Risk B Solved by RM. Resolved By ID: ${riskB.resolvedBy}, Role: ${riskB.resolvedByRole}`);
    } else {
      console.log("❌ FAILED Test B", riskB);
    }

  } catch (error) {
    console.error("Test failed:", error?.response?.data || error.message);
  }
}

testWorkflow();
