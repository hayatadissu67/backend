import {
  createProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
} from "../../services/projectServices/projectService.js";

export const createProject = async (req, res) => {
  try {
    if (req.body.id && typeof req.body.id === 'string') {
      delete req.body.id;
    }
    if (req.user && req.user.email) {
      if (!req.body.owner) {
        req.body.owner = req.user.name || req.user.email;
      }
    }
    req.body.approvalStatus = 'PENDING';

    if (req.body.code) {
      const Project = (await import('../../models/projectModel/projectModel.js')).default;
      const existingWithCode = await Project.findOne({ where: { code: req.body.code } });
      if (existingWithCode) {
        req.body.code = `${req.body.code}-${Math.floor(100 + Math.random() * 900)}`;
      }
    }

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
    console.error("Create project error:", error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: "A project with this project code already exists. Please choose a unique project name."
      });
    }
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

    if (req.user.role === 'PROJECT_MANAGER' && project.owner !== req.user.email && project.owner !== req.user.name) {
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

    if (existingProject.approvalStatus === 'CLOSED' || existingProject.status === 'COMPLETED') {
      if (req.user && req.user.role !== 'EXECUTIVE_MANAGER') {
        return res.status(403).json({
          success: false,
          message: "Closed projects are read-only and cannot be modified",
        });
      }
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
        if (req.body.approvalStatus === 'PENDING_CLOSURE') {
          updateData.approvalStatus = 'PENDING_CLOSURE';
        }
      } else {
        // Even for drafts, PMs cannot change owner or approval status directly via edit unless submitting for closure
        delete updateData.owner;
        if (req.body.approvalStatus !== 'PENDING_CLOSURE') {
          delete updateData.approvalStatus;
        }
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

    await updateProjectService(req.params.id, {
      approvalStatus: 'PENDING_DELETION'
    });
    res.status(200).json({
      success: true,
      message: "Project archived successfully to preserve history",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProjectPermanent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'EXECUTIVE_MANAGER') {
      return res.status(403).json({ success: false, message: "Only Executive Managers can permanently delete projects" });
    }

    const existingProject = await getProjectByIdService(req.params.id);
    if (!existingProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Safely delete related records to preserve DB integrity (ProjectTeam)
    const ProjectTeam = (await import('../../models/projectModel/ProjectTeam.js')).default;
    await ProjectTeam.destroy({ where: { projectCode: existingProject.code } });

    // Actually delete the project record
    await deleteProjectService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Project permanently deleted",
    });
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
      userId: Number(a.userId),
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

export const submitClosure = async (req, res) => {
  try {
    const project = await getProjectByIdService(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    if (req.user.role !== 'EXECUTIVE_MANAGER' && project.owner !== req.user.email && project.owner !== req.user.name) {
      return res.status(403).json({ success: false, message: "Not authorized to request closure for this project" });
    }
    const updatedProject = await updateProjectService(req.params.id, {
      approvalStatus: 'PENDING_CLOSURE'
    });
    res.status(200).json({ success: true, message: "Project submitted for closure", data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const closeProject = async (req, res) => {
  try {
    const project = await getProjectByIdService(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const updatedProject = await updateProjectService(req.params.id, {
      approvalStatus: 'CLOSED',
      status: 'COMPLETED',
      approvedBy: req.user ? req.user.name : "Executive Manager"
    });
    res.status(200).json({ success: true, message: "Project closed successfully", data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectClosure = async (req, res) => {
  try {
    const project = await getProjectByIdService(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const updatedProject = await updateProjectService(req.params.id, {
      approvalStatus: 'CLOSURE_REJECTED',
      status: 'ACTIVE',
      rejectionReason: req.body.rejectionReason || "Closure request rejected by Executive Manager"
    });
    res.status(200).json({ success: true, message: "Project closure request rejected", data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
