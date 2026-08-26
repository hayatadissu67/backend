import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import intiDB from "../config/db.initials.js";
import routes from "../routes/routes.js";

<<<<<<< HEAD
=======
import  express from"express";
import  cors  from "cors";
import  dotenv from "dotenv";
// import intiDB from "../config/db.initials.js";
// import authRoute  from "../routes/authRoute/authRoute.js"
import taskRoutes from "../routes/taskRoute/taskRoute.js"
import resourceRoutes from "../routes/resourceRoute/resourceRoutes.js"
>>>>>>> daisy
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

<<<<<<< HEAD
// ===============================
// HEALTH CHECK
// ===============================
=======
// app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/resources", resourceRoutes);

// Health check
>>>>>>> daisy
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

export default app;