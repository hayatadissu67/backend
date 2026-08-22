
import  express from"express";
import  cors  from "cors";
import  dotenv from "dotenv";
// import intiDB from "../config/db.initials.js";
// import authRoute  from "../routes/authRoute/authRoute.js"
import taskRoutes from "../routes/taskRoute/taskRoute.js"
import resourceRoutes from "../routes/resourceRoute/resourceRoutes.js"
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/resources", resourceRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Initialize database
// intiDB();

export default app;
