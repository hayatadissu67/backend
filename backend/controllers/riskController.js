import {
  createRiskService,
  getAllRisksService,
  getRiskByIdService,
  updateRiskService,
  deleteRiskService,
} from "../services/riskService.js";

export const createRisk = async (req, res) => {
  try {
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
    let risks = await getAllRisksService();

    // Team Members only see risks for their assigned projects
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      const assigned = req.user.assignedProjectCodes || [];
      risks = risks.filter(r => assigned.includes(r.projectRef || r.projectCode || ''));
    }

    res.status(200).json({ success: true, data: risks });
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
    // If Team Member, ensure the risk belongs to one of their assigned projects
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      const assigned = req.user.assignedProjectCodes || [];
      const projectRef = risk.projectRef || risk.projectCode || '';
      if (!projectRef || !assigned.includes(projectRef)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
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
    const risk = await updateRiskService(req.params.id, req.body);
    if (!risk) {
      return res.status(404).json({
        success: false,
        message: "Risk not found",
      });
    }
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
