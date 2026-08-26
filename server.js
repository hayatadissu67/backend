<<<<<<< HEAD
import app from "./app/app.js";
import initDB from "./config/db.initials.js";
=======
// server.js
>>>>>>> ad6e8334b72d0cccc5d08b78a939db8c3c668301
import dotenv from "dotenv";

dotenv.config();
import app from "./app/app.js";

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});