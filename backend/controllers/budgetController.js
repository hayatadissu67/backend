import {
  createBudgetService,
  getAllBudgetsService,
  getBudgetByIdService,
  updateBudgetService,
  deleteBudgetService,
} from "../services/budgetService.js";

export const createBudget = async (req, res) => {
  try {
    const budgetData = {
      ...req.body,
      allocated: Number(req.body.amount || req.body.allocated || 0),
      actualSpent: Number(req.body.actualSpent || 0),
      committed: Number(req.body.committed || 0),
      variance: Number(req.body.variance || 0),
      health: req.body.health || 'On Track',
      projectCode: req.body.projectCode || '',
      projectName: req.body.projectName || '',
    };
    const budget = await createBudgetService(budgetData);
    const plain = budget.get ? budget.get({ plain: true }) : budget;

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: plain,
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
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      return res.status(403).json({ success: false, message: 'Access denied: budgets are restricted' });
    }

    const budgets = await getAllBudgetsService();
    const mapped = budgets.map((b) => {
      const plain = b.get ? b.get({ plain: true }) : b;
      return {
        ...plain,
        allocated: Number(plain.amount || plain.allocated || 0),
        actualSpent: Number(plain.actualSpent || 0),
        committed: Number(plain.committed || 0),
        variance: Number(plain.variance || 0),
        health: plain.health || 'On Track',
        projectCode: plain.projectCode || '',
        projectName: plain.projectName || '',
      };
    });
    res.status(200).json({ success: true, data: mapped });
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
    const budgetData = {
      ...req.body,
      allocated: Number(req.body.amount || req.body.allocated || 0),
      actualSpent: Number(req.body.actualSpent || 0),
      committed: Number(req.body.committed || 0),
      variance: Number(req.body.variance || 0),
      health: req.body.health || 'On Track',
      projectCode: req.body.projectCode || '',
      projectName: req.body.projectName || '',
    };
    const budget = await updateBudgetService(
      req.params.id,
      budgetData
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    const plain = budget.get ? budget.get({ plain: true }) : budget;

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: plain,
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