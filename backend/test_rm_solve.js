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

async function testRmSolve() {
  try {
    // 1. Log in Risk Manager
    const rmLogin = await fetchApi('/auth/login', 'POST', { email: 'marcus@pmo.com', password: 'password123' });
    const rmToken = rmLogin.token;

    // We need an ESCALATED risk first. We have 'R-1234' which is REPORTED. Let's log in as PM and escalate it.
    const pmLogin = await fetchApi('/auth/login', 'POST', { email: 'alex@pmo.com', password: 'password123' });
    const pmToken = pmLogin.token;

    // Get the risks
    const risks = await fetchApi('/risks', 'GET', null, pmToken);
    const risk = risks.data.find(r => r.ref === 'R-1234');

    if (risk) {
      // Escalate
      await fetchApi(`/risks/${risk.id}`, 'PUT', { status: 'ESCALATED', escalationNotes: 'Escalated' }, pmToken);
      console.log("Escalated to RM");

      // RM solves
      const res = await fetchApi(`/risks/${risk.id}`, 'PUT', { status: 'MITIGATED', resolutionNotes: 'Solved by RM' }, rmToken);
      console.log("RM Solved!", res);
    } else {
      console.log("Risk not found");
    }

  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testRmSolve();
