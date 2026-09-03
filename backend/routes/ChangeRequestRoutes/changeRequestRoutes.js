import express from "express";

import {
  createChangeRequest,
  getAllChangeRequests,
  getChangeRequestById,
  updateChangeRequest,
  approveChangeRequest,
  rejectChangeRequest,
  deleteChangeRequest,
} from "../../controllers/changeRequestController/changeRequestController.js";

// Yoo protect fayyadamuu baatte yeroof route keessaa haqi:
const router = express.Router();

router.post("/", createChangeRequest);
router.get("/", getAllChangeRequests);
router.get("/:id", getChangeRequestById);
router.put("/:id", updateChangeRequest);
import { authorize } from "../../middleware/authMiddleware.js";

router.patch("/:id/approve", authorize("EXECUTIVE_MANAGER", "PROJECT_MANAGER"), approveChangeRequest);
router.patch("/:id/reject", authorize("EXECUTIVE_MANAGER", "PROJECT_MANAGER"), rejectChangeRequest);
router.delete("/:id", deleteChangeRequest);

export default router;