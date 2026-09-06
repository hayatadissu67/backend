const baseUrl = "http://localhost:5000/api";

async function request(method, path, token = null, body = null) {
  const headers = {
    Accept: "application/json",
  };

  if (body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    ...(body !== null ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `${method} ${path} returned non-JSON response (${response.status}):\n${text.slice(0, 500)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      `${method} ${path} failed (${response.status}): ${JSON.stringify(data)}`
    );
  }

  return data;
}

try {
  const login = await request("POST", "/auth/login", null, {
    email: "admin@pmo.com",
    password: "admin123",
  });

  if (!login?.token) {
    throw new Error(`Login succeeded but no token was returned: ${JSON.stringify(login)}`);
  }

  const token = login.token;
  console.log("Login successful.");

  const rooms = await request("GET", "/chat/rooms", token);

  console.log("\nGET /api/chat/rooms");
  console.dir(rooms, { depth: null });

  const createdRoom = await request("POST", "/chat/rooms", token, {
    name: "Node.js Test Room",
    type: "public",
  });

  console.log("\nPOST /api/chat/rooms");
  console.dir(createdRoom, { depth: null });

  const roomId = createdRoom?.data?.id;

  if (!roomId) {
    throw new Error(
      `Room was created but no room ID was returned: ${JSON.stringify(createdRoom)}`
    );
  }

  const message = await request(
    "POST",
    `/chat/rooms/${roomId}/messages`,
    token,
    {
      content: "Hello from Node.js",
    }
  );

  console.log(`\nPOST /api/chat/rooms/${roomId}/messages`);
  console.dir(message, { depth: null });
} catch (error) {
  console.error("\nAPI test failed:");
  console.error(error.message);
  process.exitCode = 1;
}