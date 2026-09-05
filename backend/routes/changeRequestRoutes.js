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
import { authorizePermission } from "../middleware/permissions.js";

const router = express.Router();

router.post("/", authorizePermission('change_requests.create'), createChangeRequest);
router.get("/", authorizePermission('change_requests.view'), getAllChangeRequests);
router.get("/:id", authorizePermission('change_requests.view'), getChangeRequestById);
router.put("/:id", authorizePermission('change_requests.update'), updateChangeRequest);
router.patch("/:id/approve", authorizePermission('change_requests.approve'), approveChangeRequest);
router.patch("/:id/reject", authorizePermission('change_requests.approve'), rejectChangeRequest);
router.delete("/:id", authorizePermission('change_requests.update'), deleteChangeRequest);

export default router;