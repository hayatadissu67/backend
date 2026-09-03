import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import intiDB from "../config/db.initials.js";
import routes from "../routes/routes.js";
import { errorHandler } from "../middleware/errorHandler.js";

dotenv.config();

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
app.use("/api", routes);

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running...",
  });
});

// ===============================
// INITIALIZE DATABASE
// ===============================
intiDB();

// ===============================
// ERROR HANDLING
// ===============================
app.use(errorHandler);

export default app;