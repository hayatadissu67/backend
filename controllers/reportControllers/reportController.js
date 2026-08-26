import * as service from "../../services/reportService/reportService.js";

export const getReports = async (req, res) => {
  try {
    const data = await service.getReportsService();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const data = await service.createReportService(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    const msg = err.errors ? err.errors.map(e => e.message) : err.message;
    res.status(400).json({ success: false, message: msg });
  }
};

export const updateReport = async (req, res) => {
  try {
    const data = await service.updateReportService(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    await service.deleteReportService(req.params.id);
    res.json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};