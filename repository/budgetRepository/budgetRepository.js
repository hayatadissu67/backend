import Budget from "../../models/budgetModel/budgetModel.js";

const createBudget = async (budgetData) => {
  return await Budget.create(budgetData);
};

const getAllBudgets = async () => {
  return await Budget.findAll();
};

const getBudgetById = async (id) => {
  return await Budget.findByPk(id);
};

const updateBudget = async (id, budgetData) => {
  const budget = await Budget.findByPk(id);

  if (!budget) {
    return null;
  }

  await budget.update(budgetData);

  return budget;
};

const deleteBudget = async (id) => {
  const budget = await Budget.findByPk(id);

  if (!budget) {
    return null;
  }

  await budget.destroy();

  return budget;
};

export {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};