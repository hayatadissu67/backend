import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import initDB from "../config/db.initials.js";
import authRoute from "../routes/authRoute/authRoute.js"; // ✅ import your user routes
import userRoute from "../routes/authRoute/userRotes.js"; // ✅ import your user routes

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Initialize database
initDB();

// ✅ Mount user routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute); // ✅ Mount your user routes

export default app;
