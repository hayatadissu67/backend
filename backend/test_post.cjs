const http = require('http');

const data = JSON.stringify({
  name: "Alice Test",
  email: "alicexyz@example.com",
  role: "TEAM_MEMBER",
  assignedProjectCodes: ["PRJ-001"]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(`Status: ${res.statusCode}\nBody: ${body}`));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
