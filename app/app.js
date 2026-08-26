import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// Database setup
import initDB from "../config/db.initials.js";

// Route imports
import routes from "../routes/routes.js";
import taskRoutes from "../routes/taskRoute/taskRoute.js";
import resourceRoutes from "../routes/resourceRoute/resourceRoutes.js";
import reportRoute from "../routes/reportRoutes/reportRoute.js";
import templateRoute from "../routes/templateRoutes/templateRoute.js";
import portfolioRoute from "../routes/portfolioRoutes/portfolioRoutes.js";
import authRoute from "../routes/authRoute/authRoute.js";
import userRoute from "../routes/authRoute/userRotes.js";

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
app.use("/api/tasks", taskRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/reports", reportRoute);
app.use("/api/templates", templateRoute);
app.use("/api/portfolios", portfolioRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

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
initDB();

export default app;