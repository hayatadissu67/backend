import * as repo from "../repository/reportRepository.js";

export const createReportService = async (data) => {
  if (!data.title) throw new Error("Report title is required.");
  validateReportPayload(data, true);
  validateReportDates(data);
  return await repo.createReportRepo({ ...data, format: data.format || "Excel" });
};

export const getReportsService = async () => await repo.getReportsRepo();

export const getReportByIdService = async (id) => await repo.getReportByIdRepo(id);

export const updateReportService = async (id, data) => {
  validateReportPayload(data, false);
  validateReportDates(data);
  return await repo.updateReportRepo(id, { ...data, format: data.format || "Excel" });
};

export const deleteReportService = async (id) => await repo.deleteReportRepo(id);

const validateReportDates = ({ startDate, endDate }) => {
  if ((startDate && !endDate) || (!startDate && endDate)) {
    throw new Error("Both start date and end date are required.");
  }
  if (startDate && endDate && startDate > endDate) {
    throw new Error("End date cannot be before start date.");
  }
};

const validateReportPayload = (data, isCreate) => {
  if (isCreate && !String(data.templateId || '').match(/^\d+$/)) {
    throw new Error('A valid template is required.');
  }
  if (isCreate && !String(data.projectCode || '').trim()) {
    throw new Error('A valid project is required.');
  }
  if (data.projectId && !String(data.projectId).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    delete data.projectId;
  }
  for (const field of ['percentCompleted', 'progress']) {
    if (data[field] !== undefined && data[field] !== '' && (!/^\d+(\.\d+)?$/.test(String(data[field])) || Number(data[field]) < 0 || Number(data[field]) > 100)) {
      throw new Error(`${field} must be between 0 and 100.`);
    }
  }
  for (const field of ['budgetPlanned', 'budgetActual']) {
    if (data[field] !== undefined && data[field] !== '' && (!/^\d+(\.\d+)?$/.test(String(data[field])) || Number(data[field]) < 0)) {
      throw new Error(`${field} must be a valid non-negative number.`);
    }
  }
};