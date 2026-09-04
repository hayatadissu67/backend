import Project from "../models/projectModel/projectModel.js";
import User from "../models/authModel/userModel.js";
import ProjectTeam from "../models/projectModel/ProjectTeam.js";
import Notification from "../models/notificationModel.js";
import { Op } from "sequelize";

export const initCron = () => {
  console.log("⏱️  Cron service initialized");
  
  // Run every 10 seconds for testing/demonstration purposes, 
  // normally this would be every hour or day
  setInterval(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Find projects where targetDate is today or earlier and status is not COMPLETED
      const expiredProjects = await Project.findAll({
        where: {
          targetDate: { [Op.lte]: today },
          status: { [Op.ne]: 'COMPLETED' }
        }
      });

      for (const project of expiredProjects) {
        console.log(`[CRON] Closing project ${project.code} - ${project.name}`);
        
        // 1. Update Project Status
        await project.update({ status: 'COMPLETED' });

        // 2. Identify relevant users
        const usersToNotify = new Set();
        
        // Add PM (by email or id?) The project owner field stores the PM's name or email. Let's find them.
        const pm = await User.findOne({ where: { name: project.owner } }) || await User.findOne({ where: { email: project.owner } });
        if (pm) usersToNotify.add(pm.id);

        // Add Team Members
        const teamAssignments = await ProjectTeam.findAll({ where: { projectCode: project.code } });
        teamAssignments.forEach(a => usersToNotify.add(a.userId));

        // Add Executive Managers
        const executives = await User.findAll({ where: { role: 'EXECUTIVE_MANAGER' } });
        executives.forEach(exec => usersToNotify.add(exec.id));

        // 3. Create Notifications
        const message = `The project "${project.name}" has reached its end date and is now closed.\nEnd Date: ${project.targetDate}\nStatus: COMPLETED`;
        
        const notificationsToCreate = Array.from(usersToNotify).map(userId => ({
          userId,
          title: 'Project Closed',
          message: message,
          type: 'alert'
        }));

        await Notification.bulkCreate(notificationsToCreate);
        console.log(`[CRON] Sent ${notificationsToCreate.length} closure announcements for project ${project.code}`);
      }
    } catch (error) {
      console.error("[CRON] Error running project closure check:", error);
    }
  }, 10000); // 10 seconds
};
