
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

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// app.use("/api/users", userRoutes);
// app.use("/api/tasks", taskRoutes);

// Endpoints kee (Member 6)
app.use("/api/reports", reportRoute);
app.use("/api/templates", templateRoute);
app.use("/api/portfolios", portfolioRoute);


// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Initialize database
// intiDB();

export default app;
