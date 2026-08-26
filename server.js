// server.js
import dotenv from "dotenv";
import initDB from "./config/db.initials.js";

dotenv.config();
import app from "./app/app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const startServer = async () => {
  try {
    // Connect to database and sync models
    await initDB();

  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();