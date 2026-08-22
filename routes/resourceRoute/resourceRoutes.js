import express from "express";
import resourceController from "../../controllers/resourceController/resourceController.js";

 const router = express.Router();

router.post("/", (req, res, next) =>
  resourceController.createResource(req, res, next)
);

router.get("/", (req, res, next) =>
  resourceController.getResources(req, res, next)
);

router.patch("/:id/status", (req, res, next) =>
  resourceController.updateResourceStatus(req, res, next)
);

export default router