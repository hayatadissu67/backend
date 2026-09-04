import { sequelize } from "../config/db.js";
import { Resource } from "../models/Resource.js";

const seedResources = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const existing = await Resource.count();
    if (existing > 0) {
      console.log(`⚠️  Resources table already has ${existing} rows; skipping seed.`);
      return;
    }

    const records = [
      // Engineering - heavily allocated
      {
        type: "ALLOCATION",
        employeeName: "Sarah Connor",
        projectTarget: "Executive Control Tower",
        assignedTask: "Frontend Architecture",
        department: "Engineering",
        projectRoleTitle: "Lead Fullstack Dev",
        hoursPerWeek: 40,
        status: "ACTIVE",
      },
      {
        type: "ALLOCATION",
        employeeName: "Marcus Vance",
        projectTarget: "Cloud Data Lake Migration",
        assignedTask: "Database Schema Tuning",
        department: "Engineering",
        projectRoleTitle: "Backend Developer",
        hoursPerWeek: 40,
        status: "ACTIVE",
      },
      {
        type: "ALLOCATION",
        employeeName: "Priya Sharma",
        projectTarget: "Zero-Trust IAM Hub",
        assignedTask: "API Gateway Hardening",
        department: "Engineering",
        projectRoleTitle: "Senior Backend Engineer",
        hoursPerWeek: 35,
        status: "ACTIVE",
      },
      // Design - moderately allocated
      {
        type: "ALLOCATION",
        employeeName: "David Miller",
        projectTarget: "Zero-Trust IAM Hub",
        assignedTask: "IAM Policy UX",
        department: "Design",
        projectRoleTitle: "UI/UX Designer",
        hoursPerWeek: 24,
        status: "ACTIVE",
      },
      {
        type: "ALLOCATION",
        employeeName: "Layla Hassan",
        projectTarget: "Executive Control Tower",
        assignedTask: "Dashboard Visual System",
        department: "Design",
        projectRoleTitle: "Product Designer",
        hoursPerWeek: 28,
        status: "ACTIVE",
      },
      // Infrastructure - lightly allocated
      {
        type: "ALLOCATION",
        employeeName: "Elena Rostova",
        projectTarget: "Cloud Data Lake Migration",
        assignedTask: "Terraform Pipelines",
        department: "Infrastructure",
        projectRoleTitle: "DevOps Engineer",
        hoursPerWeek: 8,
        status: "ACTIVE",
      },
      {
        type: "ALLOCATION",
        employeeName: "James Okafor",
        projectTarget: "Multi-Cloud Resilience",
        assignedTask: "Kubernetes Provisioning",
        department: "Infrastructure",
        projectRoleTitle: "Cloud Architect",
        hoursPerWeek: 12,
        status: "ACTIVE",
      },
      // Security - heavy
      {
        type: "ALLOCATION",
        employeeName: "Alex Petrov",
        projectTarget: "Zero-Trust IAM Hub",
        assignedTask: "Threat Modeling",
        department: "Security",
        projectRoleTitle: "Security Engineer",
        hoursPerWeek: 38,
        status: "ACTIVE",
      },
      // Data Eng - moderate
      {
        type: "ALLOCATION",
        employeeName: "Yuki Tanaka",
        projectTarget: "Cloud Data Lake Migration",
        assignedTask: "ETL Pipeline Build",
        department: "Data Eng",
        projectRoleTitle: "Data Engineer",
        hoursPerWeek: 30,
        status: "ACTIVE",
      },
      // A pending assignment request (PM asking for a new dev)
      {
        type: "ASSIGNMENT_REQUEST",
        employeeName: "Pending - QA Engineer Needed",
        projectTarget: "Executive Control Tower",
        assignedTask: "UAT & Compliance Testing",
        department: "QA & Compliance",
        projectRoleTitle: "QA Lead",
        hoursPerWeek: 40,
        pmRequesterName: "Marcus Vance",
        requestedWorkEmail: "qa.lead@company.io",
        businessJustification:
          "Need dedicated QA lead to validate Gate 4 sign-off before production cutover.",
        status: "PENDING",
      },
    ];

    await Resource.bulkCreate(records);
    console.log(`✅ Seeded ${records.length} resource records.`);
  } catch (err) {
    console.error("❌ Failed to seed resources:", err.message || err);
  } finally {
    await sequelize.close();
  }
};

// Run when invoked directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedResources();
}

export default seedResources;