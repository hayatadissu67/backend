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

async function testBug() {
  try {
    // 1. Log in Team Member
    const tmLogin = await fetchApi('/auth/login', 'POST', { email: 'elena@pmo.com', password: 'password123' });
    const tmToken = tmLogin.token;

    // 2. Report Risk
    const resA = await fetchApi('/risks', 'POST', {
      ref: 'R-1234',
      subject: 'Bug Test Risk',
      description: 'Testing why it fails',
      projectRef: 'PRJ-101'
    }, tmToken);
    
    console.log("Risk created!", resA);

  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testBug();
