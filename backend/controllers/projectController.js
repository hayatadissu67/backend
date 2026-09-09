import {
  createProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
} from "../services/projectServices/projectService.js";

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const createProject = async (req, res) => {
  try {
    const data = {
      ...req.body,
      owner: req.user?.name || req.user?.email || req.body.owner || 'PMO',
    };
    const project = await createProjectService(data);
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    const isDuplicateCode = error.name === 'SequelizeUniqueConstraintError' || error.original?.code === 'ER_DUP_ENTRY';
    res.status(isDuplicateCode ? 409 : 500).json({
      success: false,
      message: isDuplicateCode ? 'Project code already exists' : error.message,
    });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await getAllProjectsService(req.user || null);
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    if (!isUuid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }
    const project = await getProjectByIdService(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Team members can only view projects they are assigned to.
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      const assigned = req.user.assignedProjectCodes || [];
      if (!assigned.includes(project.code)) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this project",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    if (!isUuid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }
    const payload = { ...req.body };
    for (const field of ['name', 'code', 'department', 'owner']) {
      if (field in payload) {
        if (!String(payload[field] || '').trim()) {
          return res.status(400).json({ success: false, message: `${field} is required` });
        }
        payload[field] = String(payload[field]).trim();
      }
    }
    if (payload.code) payload.code = payload.code.toUpperCase();
    const project = await updateProjectService(req.params.id, payload);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    const isDuplicateCode = error.name === 'SequelizeUniqueConstraintError' || error.original?.code === 'ER_DUP_ENTRY';
    res.status(isDuplicateCode ? 409 : 500).json({
      success: false,
      message: isDuplicateCode ? 'Project code already exists' : error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    if (!isUuid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }
    const project = await deleteProjectService(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignTeam = async (req, res) => {
  try {
    const { userIds } = req.body;
    const project = await getProjectByIdService(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const updated = await updateProjectService(req.params.id, { team: userIds || [] });
    res.status(200).json({ success: true, message: "Team assigned successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveProject = async (req, res) => {
  try {
    const project = await getProjectByIdService(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const updated = await updateProjectService(req.params.id, { 
      approvalStatus: 'APPROVED', 
      status: 'ACTIVE',
      approvedBy: req.user?.name || 'System'
    });
    res.status(200).json({ success: true, message: "Project approved successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectProject = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const project = await getProjectByIdService(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const updated = await updateProjectService(req.params.id, { 
      approvalStatus: 'REJECTED', 
      status: 'DELAYED',
      rejectionReason: rejectionReason || ''
    });
    res.status(200).json({ success: true, message: "Project rejected successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
