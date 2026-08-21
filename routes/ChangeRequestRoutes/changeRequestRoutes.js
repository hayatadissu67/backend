import express from "express";

import {
  createChangeRequest,
  getAllChangeRequests,
  getChangeRequestById,
  updateChangeRequest,
  approveChangeRequest,
  rejectChangeRequest,
  deleteChangeRequest,
} from "../../controllers/ChangeRequestController/changeRequestController.js";

import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createChangeRequest);

router.get("/", protect, getAllChangeRequests);

router.get("/:id", protect, getChangeRequestById);

router.put("/:id", protect, updateChangeRequest);

router.patch("/:id/approve", protect, approveChangeRequest);

router.patch("/:id/reject", protect, rejectChangeRequest);

router.delete("/:id", protect, deleteChangeRequest);

export default router;