import 'dotenv/config';
import Project from './models/projectModel/projectModel.js';

async function testCreatePayload() {
  try {
    const payload = {
      name: "Campus E-Library System",
      code: "PRJ-CAMP",
      department: "Engineering",
      owner: "Alex Rivers",
      status: "PLANNING",
      health: "GREEN",
      budget: 120000,
      spent: 0,
      progress: 0,
      gate: "Gate 1",
      lifecycleStage: "Initiation",
      approvalStatus: "PENDING",
      lifecycle: {
        stage: "Initiation",
        stageNumber: 1,
        phaseDurationDays: 14,
        health: "Green",
        approver: "Alex Rivers",
        signOffDate: "2026-09-05",
        criteria: [
          { id: "c1", label: "Project Charter", completed: true }
        ]
      },
      startDate: "2026-09-05",
      targetDate: "2026-12-31",
      description: "Digital library platform",
      assignedTeamMembers: []
    };

    delete payload.id;
    const created = await Project.create(payload);
    console.log("SUCCESS:", created.toJSON());
  } catch (err) {
    console.error("ERROR NAME:", err.name);
    console.error("ERROR MESSAGE:", err.message);
    if (err.errors) {
      console.error("ERRORS:", err.errors.map(e => ({ message: e.message, path: e.path, type: e.type, value: e.value })));
    }
  }
}

testCreatePayload();
