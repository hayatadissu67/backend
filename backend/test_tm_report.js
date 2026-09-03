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
  try {
    // 1. Log in Team Member
    const tmLogin = await fetchApi('/auth/login', 'POST', { email: 'elena@pmo.com', password: 'password123' });
    const tmToken = tmLogin.token;

    // What does the frontend actually send? (See handleCreateRisk in RisksView.tsx)
    // subject, description, severity, projectRef, milestoneRef, category, status, createdDate, delegationNotes, delegatedAt
    const riskPayload = {
      ref: 'R-' + Math.floor(1000 + Math.random() * 9000),
      subject: 'Test Risk from Frontend',
      description: 'Checking if submission still fails',
      severity: 'HIGH',
      projectRef: 'PRJ-101',
      milestoneRef: '',
      category: 'Risk',
      status: 'REPORTED',
      createdDate: new Date().toISOString().split('T')[0],
      delegationNotes: '',
      delegatedAt: new Date().toLocaleString()
    };
    
    console.log("Sending payload:", riskPayload);
    const created = await fetchApi('/risks', 'POST', riskPayload, tmToken);
    console.log("Success! Risk created:", created.data);
    
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testTeamMemberReporting();
