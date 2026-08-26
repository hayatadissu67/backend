import * as repo from "../../repository/reportRepository/reportRepository.js";

export const createReportService = async (data) => {
  if (!data.title) throw new Error("Report title is required.");
  return await repo.createReportRepo(data);
};

export const getReportsService = async () => await repo.getReportsRepo();

export const updateReportService = async (id, data) => await repo.updateReportRepo(id, data);

export const deleteReportService = async (id) => await repo.deleteReportRepo(id);