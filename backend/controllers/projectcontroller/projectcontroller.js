import {
  createProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
} from "../../services/projectServices/projectService.js";

export const createProject = async (req, res) => {
  try {
    if (req.user && req.user.email) {
      req.body.owner = req.user.email;
    }
    req.body.approvalStatus = 'PENDING';
    const project = await createProjectService(req.body);

    if (req.body.assignedTeamMembers && Array.isArray(req.body.assignedTeamMembers) && req.body.assignedTeamMembers.length > 0) {
      const ProjectTeam = (await import('../../models/projectModel/ProjectTeam.js')).default;
      const assignments = req.body.assignedTeamMembers.map(userId => ({
        userId,
        projectCode: project.code
      }));
      await ProjectTeam.bulkCreate(assignments);
    }

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
    const projects = await getAllProjectsService(req.user);
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
    const existingProject = await getProjectByIdService(req.params.id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (req.user && req.user.role !== 'EXECUTIVE_MANAGER' && existingProject.owner !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this project",
      });
    }

    const project = await updateProjectService(req.params.id, req.body);
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

export const approveProject = async (req, res) => {
  try {
    const project = await getProjectByIdService(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const updatedProject = await updateProjectService(req.params.id, {
      approvalStatus: 'APPROVED',
      status: 'ACTIVE',
      approvedBy: req.user ? req.user.name : "System"
    });

    res.status(200).json({ success: true, message: "Project approved successfully", data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectProject = async (req, res) => {
  try {
    const project = await getProjectByIdService(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const updatedProject = await updateProjectService(req.params.id, {
      approvalStatus: 'REJECTED',
      status: 'DELAYED',
      rejectionReason: req.body.rejectionReason
    });

    res.status(200).json({ success: true, message: "Project rejected successfully", data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignProjectTeam = async (req, res) => {
  try {
    const project = await getProjectByIdService(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ success: false, message: "userIds must be an array" });
    }

    const ProjectTeam = (await import('../../models/projectModel/ProjectTeam.js')).default;
    
    // Create new assignments
    const assignments = userIds.map(uid => ({
      userId: uid,
      projectCode: project.code
    }));

    // First delete any existing assignments for this project to handle full replacement, or just bulkCreate (ignore duplicates if handled by DB). 
    // Usually assigning team members replaces or appends. Let's append by using bulkCreate and catching duplicate constraint errors if any, 
    // or better, destroy existing and recreate to match the frontend array exactly:
    await ProjectTeam.destroy({ where: { projectCode: project.code } });
    await ProjectTeam.bulkCreate(assignments);

    res.status(200).json({ success: true, message: "Team members assigned successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
