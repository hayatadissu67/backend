import * as service from "../services/reportService.js";

export const getReports = async (req, res) => {
  try {
    let data = await service.getReportsService();

    // Team Member should only see reports related to their assigned projects or prepared by them
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      const assigned = req.user.assignedProjectCodes || [];
      data = data.filter(r => {
        const projectCode = r.projectCode || r.relatedProject || '';
        if (projectCode && assigned.includes(projectCode)) return true;
        if (r.preparedBy && (r.preparedBy === req.user.name || r.preparedBy === req.user.email)) return true;
        return false;
      });
    }

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