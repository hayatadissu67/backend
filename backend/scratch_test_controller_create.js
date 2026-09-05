import 'dotenv/config';
import { createProject } from './controllers/projectcontroller/projectcontroller.js';

async function testControllerCreate() {
  const req = {
    user: { id: 1, email: 'alex@pmo.com', name: 'Alex Rivers', role: 'PROJECT_MANAGER' },
    body: {
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
      startDate: "2026-09-05",
      targetDate: "2026-12-31",
      description: "Testing controller auto-suffix duplicate resolution"
    }
  };

  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      console.log(`HTTP ${this.statusCode}:`, data);
      return this;
    }
  };

  await createProject(req, res);
}

testControllerCreate();
