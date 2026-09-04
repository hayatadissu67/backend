import "dotenv/config";
import Notification from "./models/notificationModel.js";

const forceSync = async () => {
  await Notification.sync({ force: true });
  console.log("Notification table forcefully synced.");
  process.exit(0);
};

forceSync();
