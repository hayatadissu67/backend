import app from "./app/app.js";
import initDB from "./config/db.initials.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});