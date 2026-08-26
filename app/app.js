import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import intiDB from "../config/db.initials.js";
import routes from "../routes/routes.js";

<<<<<<< HEAD
import  express from"express";
import  cors  from "cors";
import  dotenv from "dotenv";
// import intiDB from "../config/db.initials.js";
// import authRoute  from "../routes/authRoute/authRoute.js"
// import taskRoute from "../routes/taskRoute/taskRoute.js"

// Common / Database setup
import initDB from "../config/db.initials.js";

// Routes kee (Member 6: Report, Template, Portfolio)
import reportRoute from "../routes/reportRoutes/reportRoute.js";
import templateRoute from "../routes/templateRoutes/templateRoute.js";
import portfolioRoute from "../routes/portfolioRoutes/portfolioRoutes.js";

=======
>>>>>>> ad6e8334b72d0cccc5d08b78a939db8c3c668301
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
// app.use("/api/users", userRoutes);
// app.use("/api/tasks", taskRoutes);

// Endpoints kee (Member 6)
app.use("/api/reports", reportRoute);
app.use("/api/templates", templateRoute);
app.use("/api/portfolios", portfolioRoute);


// Health check
=======
// ===============================
// HEALTH CHECK
// ===============================
>>>>>>> ad6e8334b72d0cccc5d08b78a939db8c3c668301
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