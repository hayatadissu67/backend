import { Resource } from "../models/Resource.js";
import { sequelize } from "../config/db.js";
import { ResourceRepository } from "../repository/resourceRepository.js";
import { ResourceService } from "../services/resourceService.js";

const TOTAL_ORGANIZATIONAL_CAPACITY_FTE = 200;

const resourceRepository = new ResourceRepository();
const resourceService = new ResourceService();

class ResourceController {
  async createResource(req, res, next) {
    try {
      const resource = await resourceService.createResource(req.body);
      res.status(201).json({
        success: true,
        data: resource,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
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
        include: [
          { association: "project" },
          { association: "user", attributes: { exclude: ["password"] } },
        ],
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
      const resource = await Resource.findByPk(req.params.id, {
        include: [
          { association: "project" },
          { association: "user", attributes: { exclude: ["password"] } },
        ],
      });
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
      const { status, comment } = req.body;
      const resource = await resourceService.updateResourceStatus(id, status, comment);
      res.status(200).json({
        success: true,
        data: resource,
      });
    } catch (error) {
      const status = error.message?.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async updateResource(req, res, next) {
    try {
      const allowedFields = [
        "type",
        "projectId",
        "userId",
        "assignedTask",
        "hoursPerWeek",
        "pmRequesterName",
        "requestedWorkEmail",
        "department",
        "projectRoleTitle",
        "businessJustification",
        "status",
      ];
      const updates = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
      );
      const resource = await resourceService.updateResource(
        req.params.id,
        updates
      );
      res.status(200).json({ success: true, data: resource });
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
            COUNT(*) AS headcount,
            COALESCE(SUM(allocatedFte), 0) AS totalFte
          FROM (
            SELECT
              department,
              COALESCE(CAST(userId AS CHAR), employeeName) AS employeeKey,
              LEAST(SUM(hoursPerWeek) / 40, 1) AS allocatedFte
            FROM resources
            WHERE (type = 'ALLOCATION' AND status = 'ACTIVE')
              OR (type = 'ASSIGNMENT_REQUEST' AND status = 'APPROVED')
            GROUP BY department, employeeKey
          ) AS employeeAllocations
          GROUP BY department
          ORDER BY department ASC;`
      );

      // Compare every department against the same organization-wide FTE baseline.
      const loading = rows.map((r) => {
        const headcount = Number(r.headcount);
        const totalFte = Number(r.totalFte);
        const pct = Math.min(
          100,
          Number(((totalFte / TOTAL_ORGANIZATIONAL_CAPACITY_FTE) * 100).toFixed(1))
        );
        return {
          department: r.department,
          percentage: pct,
          headcount,
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
      const created = await resourceService.createResource(payload);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
}

export default new ResourceController();