import express from "express";
import resourceController from "../controllers/resourceController.js";
import { authorizePermission } from "../middleware/permissions.js";

const router = express.Router();

// Aggregated department loading (used by Overview & Directory tabs)
router.get("/loading", authorizePermission("resources.view"), (req, res, next) =>
  resourceController.getDepartmentLoading(req, res, next)
);

// PM creates an assignment request that Executives approve/reject
router.post(
  "/request",
  authorizePermission("resources.request"),
  (req, res, next) => resourceController.createAssignmentRequest(req, res, next)
);

// List all resource records (filterable)
router.get("/", authorizePermission("resources.view"), (req, res, next) =>
  resourceController.getResources(req, res, next)
);

// Create a generic resource record (allocation or request)
router.post("/", authorizePermission("resources.update"), (req, res, next) =>
  resourceController.createResource(req, res, next)
);

router.get("/:id", authorizePermission("resources.view"), (req, res, next) =>
  resourceController.getResourceById(req, res, next)
);

router.put("/:id", authorizePermission("resources.update"), (req, res, next) =>
  resourceController.updateResource(req, res, next)
);

router.patch(
  "/:id/status",
  authorizePermission("resources.approve"),
  (req, res, next) => resourceController.updateResourceStatus(req, res, next)
);

router.delete(
  "/:id",
  authorizePermission("resources.update"),
  (req, res, next) => resourceController.deleteResource(req, res, next)
);

export default router;