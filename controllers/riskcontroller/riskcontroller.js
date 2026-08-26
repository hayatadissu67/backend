import {
  createRiskService,
  getAllRisksService,
  getRiskByIdService,
  updateRiskService,
  deleteRiskService,
} from "../../services/riskServices/riskService.js";

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
    const risks = await getAllRisksService();
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
