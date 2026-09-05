import {
  createBudgetService,
  getAllBudgetsService,
  getBudgetByIdService,
  updateBudgetService,
  deleteBudgetService,
} from "../services/budgetService.js";

export const createBudget = async (req, res) => {
  try {
    const budget = await createBudgetService(req.body);

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllBudgets = async (req, res) => {
  try {
    // Budgets are not accessible to Team Members
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      return res.status(403).json({ success: false, message: 'Access denied: budgets are restricted' });
    }

    const budgets = await getAllBudgetsService();
    res.status(200).json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBudgetById = async (req, res) => {
  try {
    const budget = await getBudgetByIdService(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budget = await updateBudgetService(
      req.params.id,
      req.body
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budget = await deleteBudgetService(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};