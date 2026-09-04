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
      const assignments = req.body.assignedTeamMembers.map(member => ({
        userId: member.userId,
        projectCode: project.code,
        responsibility: member.responsibility || 'General Member'
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

    if (req.user.role === 'PROJECT_MANAGER' && project.owner !== req.user.email) {
      return res.status(403).json({ success: false, message: "Unauthorized access to project" });
    }

    if (req.user.role === 'TEAM_MEMBER') {
      const ProjectTeam = (await import('../../models/projectModel/ProjectTeam.js')).default;
      const assignment = await ProjectTeam.findOne({ where: { userId: req.user.id, projectCode: project.code } });
      if (!assignment) {
        return res.status(403).json({ success: false, message: "Unauthorized access to project" });
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

    let updateData = { ...req.body };
    if (req.user && req.user.role !== 'EXECUTIVE_MANAGER') {
      if (existingProject.approvalStatus === 'APPROVED' || existingProject.status === 'ACTIVE' || existingProject.status === 'COMPLETED') {
        const allowedFields = ['name', 'description', 'targetDate', 'department', 'priority'];
        updateData = {};
        allowedFields.forEach(field => {
          if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
          }
        });
      } else {
        // Even for drafts, PMs cannot change owner or approval status directly via edit
        delete updateData.owner;
        delete updateData.approvalStatus;
        delete updateData.approvedBy;
      }
    }

    const project = await updateProjectService(req.params.id, updateData);
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
        message: "Not authorized to delete this project",
      });
    }

    const isDraft = existingProject.status === 'PLANNING' || existingProject.approvalStatus === 'PENDING_APPROVAL';

    if (isDraft) {
      await deleteProjectService(req.params.id);
      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    } else {
      await updateProjectService(req.params.id, {
        status: 'COMPLETED',
        approvalStatus: 'ARCHIVED'
      });
      res.status(200).json({
        success: true,
        message: "Project archived successfully to preserve history",
      });
    }
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
    const { assignments } = req.body;
    if (!Array.isArray(assignments)) {
      return res.status(400).json({ success: false, message: "assignments must be an array" });
    }

    const ProjectTeam = (await import('../../models/projectModel/ProjectTeam.js')).default;
    
    // Create new assignments
    const dbAssignments = assignments.map(a => ({
      userId: a.userId,
      projectCode: project.code,
      responsibility: a.responsibility || null
    }));

    await ProjectTeam.destroy({ where: { projectCode: project.code } });
    await ProjectTeam.bulkCreate(dbAssignments);

    res.status(200).json({ success: true, message: "Team members assigned successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectTeam = async (req, res) => {
  try {
    const project = await getProjectByIdService(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const ProjectTeam = (await import('../../models/projectModel/ProjectTeam.js')).default;
    const User = (await import('../../models/authModel/userModel.js')).default;

    const teamAssignments = await ProjectTeam.findAll({
      where: { projectCode: project.code }
    });

    if (!teamAssignments || teamAssignments.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const userIds = teamAssignments.map(a => a.userId);
    const users = await User.findAll({ where: { id: userIds } });

    // Map responsibility to the user objects
    const teamData = users.map(user => {
      const assignment = teamAssignments.find(a => a.userId === user.id);
      
      let responsibility = assignment ? assignment.responsibility : null;
      if (req.user.role === 'TEAM_MEMBER' && req.user.id !== user.id) {
        responsibility = null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        status: user.status,
        responsibility
      };
    });

    res.status(200).json({ success: true, data: teamData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
