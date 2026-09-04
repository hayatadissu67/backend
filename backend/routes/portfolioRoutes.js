import express from "express";
import { authorizePermission } from "../middleware/permissions.js";
import {
  getPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "../controllers/portfolioController.js";

const router = express.Router();

router.get("/", authorizePermission('portfolios.view'), getPortfolios);
router.post("/", authorizePermission('portfolios.create'), createPortfolio);
router.put("/:id", authorizePermission('portfolios.update'), updatePortfolio);
router.delete("/:id", authorizePermission('portfolios.delete'), deletePortfolio);

export default router;