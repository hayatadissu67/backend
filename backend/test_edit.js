import "dotenv/config";

const API = "http://localhost:5000/api";

async function testEdit() {
  // Test 1: Login as EXECUTIVE_MANAGER
  console.log("\n=== TEST 1: EXECUTIVE_MANAGER - Create then Edit ===");
  const execLogin = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "executive@pmo.com", password: "Executive@123" }),
  });
  const execLoginData = await execLogin.json();
  const execToken = execLoginData.token;
  console.log(`Logged in as: ${execLoginData.user?.name}, role: ${execLoginData.user?.role}`);

  if (!execToken) {
    console.log("Login failed for EXECUTIVE_MANAGER");
    await runAllTests();
    return;
  }

  // Create a report as EXECUTIVE_MANAGER using FormData
  const execForm = new FormData();
  execForm.append("title", "Test Report - Exec");
  execForm.append("description", "Test description");
  execForm.append("category", "Executive");
  execForm.append("preparedBy", "Test User");
  execForm.append("startDate", "2025-01-01");
  execForm.append("endDate", "2025-03-31");
  execForm.append("type", "Executive Summary");
  execForm.append("format", "Excel");
  execForm.append("templateId", "1");
  execForm.append("projectCode", "PROJ-001");
  execForm.append("projectName", "Test Project");
  execForm.append("projectId", "123e4567-e89b-12d3-a456-426614174000");
  execForm.append("status", "Published");
  execForm.append("ownerName", "Test Owner");
  execForm.append("programStatus", "On Track");
  execForm.append("percentCompleted", "50");
  execForm.append("progress", "50");
  execForm.append("projectStatus", "On Track");
  execForm.append("overallProjectStatus", "On Track");
  execForm.append("budgetPlanned", "100000");
  execForm.append("budgetActual", "50000");
  execForm.append("budgetVariance", "50000");
  execForm.append("milestones", "Milestone 1");
  execForm.append("criticalRisks", "Risk 1");
  execForm.append("summary", "Test summary");
  execForm.append("additionalNotes", "Test notes");

  try {
    const createRes = await fetch(`${API}/reports`, {
      method: "POST",
      headers: { Authorization: `Bearer ${execToken}` },
      body: execForm,
    });
    const createData = await createRes.json();
    console.log(`Create result: success=${createData.success}, id=${createData.data?.id}`);

    const reportId = createData.data?.id;
    if (!reportId) {
      console.log("No report ID returned, cannot test edit");
      return;
    }

    // Verify the report exists
    const getRes = await fetch(`${API}/reports/${reportId}`, {
      headers: { Authorization: `Bearer ${execToken}` },
    });
    const getData = await getRes.json();
    console.log(`GET before edit: title="${getData.data?.title}", desc="${getData.data?.description}"`);

    // Now try to EDIT the report as EXECUTIVE_MANAGER
    const editForm = new FormData();
    editForm.append("title", "Updated Title - Exec");
    editForm.append("description", "Updated description");
    editForm.append("category", "Executive");
    editForm.append("preparedBy", "Updated User");
    editForm.append("startDate", "2025-01-01");
    editForm.append("endDate", "2025-03-31");
    editForm.append("type", "Executive Summary");
    editForm.append("format", "Excel");
    editForm.append("status", "Published");
    editForm.append("ownerName", "Updated Owner");
    editForm.append("programStatus", "On Track");
    editForm.append("percentCompleted", "50");
    editForm.append("progress", "50");
    editForm.append("projectStatus", "On Track");
    editForm.append("overallProjectStatus", "On Track");
    editForm.append("budgetPlanned", "100000");
    editForm.append("budgetActual", "50000");
    editForm.append("budgetVariance", "50000");
    editForm.append("milestones", "Updated Milestone");
    editForm.append("criticalRisks", "Updated Risk");
    editForm.append("summary", "Updated summary");
    editForm.append("additionalNotes", "Updated notes");

    try {
      const editRes = await fetch(`${API}/reports/${reportId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${execToken}` },
        body: editForm,
      });
      const editData = await editRes.json();
      console.log(`Edit result: status=${editRes.status}, success=${editData?.success}`);
      if (editData?.data) {
        console.log(`Updated title: ${editData.data.title}`);
        console.log(`Updated description: ${editData.data.description}`);
      } else {
        console.log(`Error message: ${editData?.message}`);
      }

      // Verify the GET still shows updated values
      const getAfterRes = await fetch(`${API}/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${execToken}` },
      });
      const getAfterData = await getAfterRes.json();
      console.log(`GET after edit: title="${getAfterData.data?.title}", desc="${getAfterData.data?.description}"`);
    } catch (editErr) {
      console.log(`Edit FAILED: ${editErr.message}`);
    }
  } catch (createErr) {
    console.log(`Create failed: ${createErr.message}`);
  }

  // Test 2: Login as PROJECT_MANAGER
  console.log("\n=== TEST 2: PROJECT_MANAGER - Create then Edit ===");
  const pmLogin = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "pm@pmo.com", password: "Project@123" }),
  });
  const pmLoginData = await pmLogin.json();
  const pmToken = pmLoginData.token;
  console.log(`Logged in as: ${pmLoginData.user?.name}, role: ${pmLoginData.user?.role}`);

  if (pmToken) {
    const pmCreateForm = new FormData();
    pmCreateForm.append("title", "Test Report - PM");
    pmCreateForm.append("description", "Test description");
    pmCreateForm.append("category", "Executive");
    pmCreateForm.append("preparedBy", "Test PM");
    pmCreateForm.append("startDate", "2025-01-01");
    pmCreateForm.append("endDate", "2025-03-31");
    pmCreateForm.append("type", "Executive Summary");
    pmCreateForm.append("format", "Excel");
    pmCreateForm.append("templateId", "1");
    pmCreateForm.append("projectCode", "PROJ-002");
    pmCreateForm.append("projectName", "Test Project 2");
    pmCreateForm.append("projectId", "123e4567-e89b-12d3-a456-426614174000");
    pmCreateForm.append("status", "Published");
    pmCreateForm.append("ownerName", "Test Owner 2");
    pmCreateForm.append("programStatus", "On Track");
    pmCreateForm.append("percentCompleted", "75");
    pmCreateForm.append("progress", "75");
    pmCreateForm.append("projectStatus", "On Track");
    pmCreateForm.append("overallProjectStatus", "On Track");
    pmCreateForm.append("budgetPlanned", "200000");
    pmCreateForm.append("budgetActual", "100000");
    pmCreateForm.append("budgetVariance", "100000");
    pmCreateForm.append("milestones", "Milestone 1");
    pmCreateForm.append("criticalRisks", "Risk 1");
    pmCreateForm.append("summary", "Test summary 2");
    pmCreateForm.append("additionalNotes", "Test notes 2");

    const pmCreateRes = await fetch(`${API}/reports`, {
      method: "POST",
      headers: { Authorization: `Bearer ${pmToken}` },
      body: pmCreateForm,
    });
    const pmCreateData = await pmCreateRes.json();
    console.log(`PM Create result: success=${pmCreateData.success}, id=${pmCreateData.data?.id}`);

    const pmReportId = pmCreateData.data?.id;

    // Edit as PROJECT_MANAGER
    const pmEditForm = new FormData();
    pmEditForm.append("title", "Updated Title - PM");
    pmEditForm.append("description", "Updated description");
    pmEditForm.append("category", "Executive");
    pmEditForm.append("preparedBy", "Updated PM");
    pmEditForm.append("startDate", "2025-01-01");
    pmEditForm.append("endDate", "2025-03-31");
    pmEditForm.append("type", "Executive Summary");
    pmEditForm.append("format", "Excel");
    pmEditForm.append("status", "Published");

    const pmEditRes = await fetch(`${API}/reports/${pmReportId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${pmToken}` },
      body: pmEditForm,
    });
    const pmEditData = await pmEditRes.json();
    console.log(`PM Edit result: status=${pmEditRes.status}, success=${pmEditData?.success}`);
    if (pmEditData?.data) {
      console.log(`Updated title: ${pmEditData.data.title}`);
    } else {
      console.log(`Error: ${pmEditData?.message}`);
    }
  }

  // Test 3: Login as TEAM_MEMBER
  console.log("\n=== TEST 3: TEAM_MEMBER - Create then Edit ===");
  const teamLogin = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "team@pmo.com", password: "Team@123" }),
  });
  const teamLoginData = await teamLogin.json();
  const teamToken = teamLoginData.token;
  console.log(`Logged in as: ${teamLoginData.user?.name}, role: ${teamLoginData.user?.role}`);

  if (teamToken) {
    const teamCreateForm = new FormData();
    teamCreateForm.append("title", "Test Report - Team");
    teamCreateForm.append("description", "Test description");
    teamCreateForm.append("category", "Executive");
    teamCreateForm.append("preparedBy", "Test Team Member");
    teamCreateForm.append("startDate", "2025-01-01");
    teamCreateForm.append("endDate", "2025-03-31");
    teamCreateForm.append("type", "Executive Summary");
    teamCreateForm.append("format", "Excel");
    teamCreateForm.append("templateId", "1");
    teamCreateForm.append("projectCode", "PROJ-003");
    teamCreateForm.append("projectName", "Test Project 3");
    teamCreateForm.append("projectId", "123e4567-e89b-12d3-a456-426614174000");
    teamCreateForm.append("status", "Published");
    teamCreateForm.append("ownerName", "Test Owner 3");
    teamCreateForm.append("programStatus", "On Track");
    teamCreateForm.append("percentCompleted", "30");
    teamCreateForm.append("progress", "30");
    teamCreateForm.append("projectStatus", "On Track");
    teamCreateForm.append("overallProjectStatus", "On Track");
    teamCreateForm.append("budgetPlanned", "50000");
    teamCreateForm.append("budgetActual", "25000");
    teamCreateForm.append("budgetVariance", "25000");
    teamCreateForm.append("milestones", "Milestone 1");
    teamCreateForm.append("criticalRisks", "Risk 1");
    teamCreateForm.append("summary", "Test summary 3");
    teamCreateForm.append("additionalNotes", "Test notes 3");

    const teamCreateRes = await fetch(`${API}/reports`, {
      method: "POST",
      headers: { Authorization: `Bearer ${teamToken}` },
      body: teamCreateForm,
    });
    const teamCreateData = await teamCreateRes.json();
    console.log(`Team Create result: success=${teamCreateData.success}, id=${teamCreateData.data?.id}`);

    const teamReportId = teamCreateData.data?.id;

    // Edit as TEAM_MEMBER
    const teamEditForm = new FormData();
    teamEditForm.append("title", "Updated Title - Team");
    teamEditForm.append("description", "Updated description");
    teamEditForm.append("category", "Executive");
    teamEditForm.append("preparedBy", "Updated Team");
    teamEditForm.append("startDate", "2025-01-01");
    teamEditForm.append("endDate", "2025-03-31");
    teamEditForm.append("type", "Executive Summary");
    teamEditForm.append("format", "Excel");
    teamEditForm.append("status", "Published");

    const teamEditRes = await fetch(`${API}/reports/${teamReportId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${teamToken}` },
      body: teamEditForm,
    });
    const teamEditData = await teamEditRes.json();
    console.log(`Team Edit result: status=${teamEditRes.status}, success=${teamEditData?.success}`);
    if (teamEditData?.data) {
      console.log(`Updated title: ${teamEditData.data.title}`);
    } else {
      console.log(`Error: ${teamEditData?.message}`);
    }
  }

  process.exit(0);
}

testEdit().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
