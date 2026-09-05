import 'dotenv/config';
import Project from './models/projectModel/projectModel.js';

async function updatePrjProjStatus() {
  try {
    const prj = await Project.findOne({ where: { code: 'PRJ-PROJ' } });
    if (prj) {
      await prj.update({ approvalStatus: 'APPROVED' });
      console.log(`✅ Updated PRJ-PROJ approvalStatus to APPROVED. Current approvalStatus: ${prj.approvalStatus}`);
    } else {
      console.log("PRJ-PROJ not found in DB.");
    }
  } catch (e) {
    console.error("Error updating PRJ-PROJ:", e);
  }
}

updatePrjProjStatus();
