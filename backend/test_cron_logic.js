import "dotenv/config";
import { sequelize } from "./config/db.js";
import Project from "./models/projectModel/projectModel.js";
import Notification from "./models/notificationModel.js";
import { initCron } from "./services/cronService.js";

const runTest = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    // Create an expired project
    const testProject = await Project.create({
      name: "Test Expired Project",
      code: "TEST-EXP",
      department: "IT",
      owner: "john.doe@company.com", // Assuming John Doe exists
      status: "ACTIVE",
      targetDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
      approvalStatus: "APPROVED"
    });
    console.log(`Created test project: ${testProject.code} with targetDate ${testProject.targetDate}`);

    // Init cron
    initCron();

    // Wait 15 seconds
    console.log("Waiting 15 seconds for cron to run...");
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Check project status
    const updatedProject = await Project.findByPk(testProject.id);
    console.log(`Project status after cron: ${updatedProject.status}`);

    // Check notifications
    const notifications = await Notification.findAll();
    console.log(`Found ${notifications.length} notifications in total.`);

    console.log("Test complete. Exiting...");
    process.exit(0);

  } catch (err) {
    console.error("Test failed", err);
    process.exit(1);
  }
};

runTest();
