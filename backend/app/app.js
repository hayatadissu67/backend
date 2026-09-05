import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import initDB from "../config/db.initials.js";
import routes from "../routes/routes.js";

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// ROUTES
// ===============================
// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api", routes);

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PMO Backend API is running...",
  });
});

// ===============================
// INITIALIZE DATABASE
// ===============================
initDB();

// ===============================
// ERROR HANDLER (return JSON for API clients)
// ===============================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : 'Internal Server Error';
  const payload = { success: false, message };
  if (process.env.NODE_ENV === 'development' && err && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
});

export default app;