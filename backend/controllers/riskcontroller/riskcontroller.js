import {
  createRiskService,
  getAllRisksService,
  getRiskByIdService,
  updateRiskService,
  deleteRiskService,
} from "../../services/riskServices/riskService.js";

import Project from "../../models/projectModel/projectModel.js";
import ProjectTeam from "../../models/projectModel/ProjectTeam.js";

export const createRisk = async (req, res) => {
  try {
    if (req.user) {
      if (req.user.role === 'TEAM_MEMBER') {
        req.body.status = 'REPORTED';
        req.body.submittedBy = req.user.email;
        if (req.body.projectRef) {
          const project = await Project.findOne({ where: { code: req.body.projectRef } });
          if (project) {
            let pmEmail = project.owner;
            // If the project owner is stored as a name instead of an email, look it up
            if (pmEmail && !pmEmail.includes('@')) {
              const User = (await import('../../models/authModel/userModel.js')).default;
              const pmUser = await User.findOne({ where: { name: pmEmail } });
              if (pmUser) {
                pmEmail = pmUser.email;
              }
            }
            req.body.owner = pmEmail;
          }
        }
        if (!req.body.owner) {
          req.body.owner = req.user.email;
        }

        if (req.body.projectRef) {
          const assignment = await ProjectTeam.findOne({
            where: { userId: req.user.id, projectCode: req.body.projectRef }
          });
          if (!assignment) {
            return res.status(403).json({ success: false, message: "You are not assigned to this project." });
          }
        }
      } else {
        req.body.submittedBy = req.user.email;
        if (!req.body.owner) {
          req.body.owner = req.user.email;
        }
      }
    }
    const risk = await createRiskService(req.body);
    res.status(201).json({
      success: true,
      message: "Risk created successfully",
      data: risk,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllRisks = async (req, res) => {
  try {
    const risks = await getAllRisksService(req.user);
    res.status(200).json({
      success: true,
      data: risks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRiskById = async (req, res) => {
  try {
    const risk = await getRiskByIdService(req.params.id);
    if (!risk) {
      return res.status(404).json({
        success: false,
        message: "Risk not found",
      });
    }
    res.status(200).json({
      success: true,
      data: risk,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateRisk = async (req, res) => {
  try {
    const existingRisk = await getRiskByIdService(req.params.id);
    if (!existingRisk) {
      return res.status(404).json({
        success: false,
        message: "Risk not found",
      });
    }

    if (req.user) {
      if (req.user.role === 'TEAM_MEMBER') {
        return res.status(403).json({ success: false, message: "Team Members cannot edit risks." });
      } else if (req.user.role === 'PROJECT_MANAGER') {
        let isAuthorized = false;
        if (existingRisk.owner === req.user.email || existingRisk.submittedBy === req.user.email) {
          isAuthorized = true;
        } else if (existingRisk.projectRef) {
          const project = await Project.findOne({ where: { code: existingRisk.projectRef } });
          if (project && project.owner === req.user.email) {
            isAuthorized = true;
          }
        }
        if (!isAuthorized) {
          return res.status(403).json({ success: false, message: "Not authorized to update this risk." });
        }

        // PM Workflow overrides
        if (req.body.status === 'RESOLVED' || req.body.status === 'MITIGATED') {
          req.body.resolvedBy = parseInt(req.user.id);
          req.body.resolvedByRole = req.user.role;
          req.body.resolvedAt = new Date().toISOString();
        } else if (req.body.status === 'ESCALATED') {
          req.body.resolvedBy = null;
          req.body.resolvedByRole = null;
          req.body.escalatedAt = new Date().toISOString();
          
          const User = (await import('../../models/authModel/userModel.js')).default;
          const rm = await User.findOne({ where: { role: 'RISK_MANAGER' } });
          if (rm) {
            req.body.assignedRiskManager = rm.email;
          }
        }

      } else if (req.user.role === 'RISK_MANAGER' || req.user.role === 'EXECUTIVE_MANAGER') {
        // RM/Executive Workflow overrides
        if (req.body.status === 'RESOLVED' || req.body.status === 'MITIGATED') {
          req.body.resolvedBy = parseInt(req.user.id);
          req.body.resolvedByRole = req.user.role;
          req.body.resolvedAt = new Date().toISOString();
        }
      }
    }

    const risk = await updateRiskService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Risk updated successfully",
      data: risk,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteRisk = async (req, res) => {
  try {
    const risk = await deleteRiskService(req.params.id);
    if (!risk) {
      return res.status(404).json({
        success: false,
        message: "Risk not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Risk deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
