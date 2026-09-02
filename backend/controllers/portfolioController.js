import * as service from "../services/portfolioService.js";

export const getPortfolios = async (req, res) => {
  try {
    const data = await service.getPortfoliosService();
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const createPortfolio = async (req, res) => {
  try {
    const data = await service.createPortfolioService(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

export const updatePortfolio = async (req, res) => {
  try {
    const data = await service.updatePortfolioService(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

export const deletePortfolio = async (req, res) => {
  try {
    await service.deletePortfolioService(req.params.id);
    res.json({ success: true, message: "Portfolio deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};