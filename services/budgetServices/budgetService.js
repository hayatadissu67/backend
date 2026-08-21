import {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} from "../../repository/budgetRepository/budgetRepository.js";

const createBudgetService = async (budgetData) => {
  return await createBudget(budgetData);
};

const getAllBudgetsService = async () => {
  return await getAllBudgets();
};

const getBudgetByIdService = async (id) => {
  return await getBudgetById(id);
};

const updateBudgetService = async (id, budgetData) => {
  return await updateBudget(id, budgetData);
};

const deleteBudgetService = async (id) => {
  return await deleteBudget(id);
};

export {
  createBudgetService,
  getAllBudgetsService,
  getBudgetByIdService,
  updateBudgetService,
  deleteBudgetService,
};