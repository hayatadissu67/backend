import express from "express";

import {
  createChangeRequest,
  getAllChangeRequests,
  getChangeRequestById,
  updateChangeRequest,
  approveChangeRequest,
  rejectChangeRequest,
  deleteChangeRequest,
} from "../controllers/changeRequestController.js";

// Yoo protect fayyadamuu baatte yeroof route keessaa haqi:
const router = express.Router();

router.post("/", createChangeRequest);
router.get("/", getAllChangeRequests);
router.get("/:id", getChangeRequestById);
router.put("/:id", updateChangeRequest);
router.patch("/:id/approve", approveChangeRequest);
router.patch("/:id/reject", rejectChangeRequest);
router.delete("/:id", deleteChangeRequest);

export default router;