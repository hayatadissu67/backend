import {
  createProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
} from "../services/projectService.js";

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const createProject = async (req, res) => {
  try {
    const payload = { ...req.body };
    const requiredFields = ['name', 'code', 'department', 'owner'];
    const missingField = requiredFields.find((field) => !String(payload[field] || '').trim());
    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField} is required`,
      });
    }

    payload.name = String(payload.name).trim();
    payload.code = String(payload.code).trim().toUpperCase();
    payload.department = String(payload.department).trim();
    payload.owner = String(payload.owner).trim();
    const project = await createProjectService(payload);
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
    let projects = await getAllProjectsService();

    // If Team Member, filter projects to those assigned to the user (by code)
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      const assigned = req.user.assignedProjectCodes || [];
      projects = projects.filter(p => assigned.includes(p.code));
    }

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
