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
    const projects = await getAllProjectsService();
    res.status(200).json({
      success: true,
      data: projects,
    });
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
