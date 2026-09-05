import Report from "../models/reportModel.js";

export const createReportRepo = async (data) => await Report.create(data);

export const getReportsRepo = async () => await Report.findAll();

export const getReportByIdRepo = async (id) => await Report.findByPk(id);

export const updateReportRepo = async (id, data) => {
  const report = await Report.findByPk(id);
  if (!report) throw new Error("Report not found");
  return await report.update(data);
};

export const deleteReportRepo = async (id) => {
  const report = await Report.findByPk(id);
  if (!report) throw new Error("Report not found");
  return await report.destroy();
};