import { Resource } from "../models/Resource.js";
import { sequelize } from "../config/db.js";
import { ResourceRepository } from "../repository/resourceRepository.js";

const resourceRepository = new ResourceRepository();

class ResourceController {
  async createResource(req, res, next) {
    try {
      const resource = await resourceRepository.createResource(req.body);
      res.status(201).json({
        success: true,
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  }

  async getResources(req, res, next) {
    try {
      const { type, status, department } = req.query;
      const where = {};
      if (type) where.type = type;
      if (status) where.status = status;
      if (department) where.department = department;

      const resources = await Resource.findAll({
        where,
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json({
        success: true,
        data: resources,
      });
    } catch (error) {
      next(error);
    }
  }

  async getResourceById(req, res, next) {
    try {
      const resource = await Resource.findByPk(req.params.id);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }
      res.status(200).json({ success: true, data: resource });
    } catch (error) {
      next(error);
    }
  }

  async updateResourceStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const resource = await resourceRepository.updateResourceStatus(id, status);
      res.status(200).json({
        success: true,
        data: resource,
      });
    } catch (error) {
      const status = error.message?.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async deleteResource(req, res, next) {
    try {
      const resource = await Resource.findByPk(req.params.id);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }
      await resource.destroy();
      res.status(200).json({
        success: true,
        message: "Resource deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/resources/loading
   * Aggregates ALLOCATION records by department and returns capacity loading.
   * Used by the Resources overview & directory tabs.
   */
  async getDepartmentLoading(req, res, next) {
    try {
      const [rows] = await sequelize.query(
        `SELECT
            department,
            COUNT(DISTINCT employeeName) AS headcount,
            COALESCE(SUM(hoursPerWeek), 0) AS totalHours,
            COALESCE(ROUND(AVG(hoursPerWeek)), 0) AS avgHoursPerEmployee
          FROM resources
          WHERE type = 'ALLOCATION' AND status = 'ACTIVE'
          GROUP BY department
          ORDER BY department ASC;`
      );

      // Capacity is computed as avgHoursPerEmployee / 40h * 100
      const loading = rows.map((r) => {
        const pct = Math.min(
          120,
          Math.round((Number(r.avgHoursPerEmployee) / 40) * 100)
        );
        return {
          department: r.department,
          percentage: pct,
          headcount: Number(r.headcount),
          colorClass: pct >= 90 ? "bg-red-600" : "bg-blue-900",
        };
      });

      res.status(200).json({ success: true, data: loading });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/resources/request
   * Convenience route for creating an ASSIGNMENT_REQUEST (PM -> Executive approval flow).
   */
  async createAssignmentRequest(req, res, next) {
    try {
      const payload = {
        ...req.body,
        type: "ASSIGNMENT_REQUEST",
        status: "PENDING",
      };
      const created = await resourceRepository.createResource(payload);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
}

export default new ResourceController();