import {
  createProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
} from "../services/projectService.js";

export const createProject = async (req, res) => {
  try {
    const project = await createProjectService(req.body);
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
    const project = await updateProjectService(req.params.id, req.body);
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
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
