import { z } from "zod";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: (error.errors || error.issues || []).map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

const baseProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100, "Project name must be under 100 characters"),
  code: z.string().trim().min(1, "Project code is required"),
  department: z.string().trim().min(1, "Department is required"),
  owner: z.string().trim().min(1, "Project Manager/Owner is required"),
  status: z.enum(["ACTIVE", "COMPLETED", "DELAYED", "PLANNING"]).optional(),
  health: z.enum(["GREEN", "YELLOW", "RED"]).optional(),
  budget: z.number().nonnegative("Budget cannot be negative").optional(),
  spent: z.number().nonnegative().optional(),
  progress: z.number().min(0, "Progress cannot be negative").max(100, "Progress cannot exceed 100").optional(),
  gate: z.string().optional(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid start date").optional(),
  targetDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid target date").optional(),
  description: z.string().max(2000, "Description is too long").optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  lifecycleStage: z.string().optional(),
  approvalStatus: z.string().optional(),
  assignedTeamMembers: z.array(z.object({
    userId: z.union([z.string(), z.number()]),
    responsibility: z.string().min(1, "Responsibility is required for each team member")
  })).optional()
});

const dateRefinement = (data) => {
  if (data.startDate && data.targetDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.targetDate);
    return end >= start;
  }
  return true;
};

export const createProjectSchema = baseProjectSchema.refine(dateRefinement, {
  message: "End date must be after the start date",
  path: ["targetDate"]
});

export const updateProjectSchema = baseProjectSchema.partial().refine(dateRefinement, {
  message: "End date must be after the start date",
  path: ["targetDate"]
});

export const rejectProjectSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});

export const createRiskSchema = z.object({
  ref: z.string().min(1, "Risk reference is required"),
  subject: z.string().min(1, "Risk subject is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional().nullable(),
  category: z.enum(["Risk", "Issue"]).optional().nullable(),
  projectRef: z.string().optional().nullable(),
  status: z.enum(["OPEN", "REPORTED", "ESCALATED", "IN_REVIEW", "MITIGATED", "RESOLVED"]).optional().nullable(),
  owner: z.string().optional().nullable(),
  assignedRiskManager: z.string().optional().nullable(),
  flaggedBy: z.string().optional().nullable(),
  submittedBy: z.string().optional().nullable(),
  milestoneRef: z.string().optional().nullable(),
  delegationNotes: z.string().optional().nullable(),
  escalationNotes: z.string().optional().nullable(),
  resolutionNotes: z.string().optional().nullable(),
  resolvedBy: z.union([z.string(), z.number()]).optional().nullable(),
  resolvedByRole: z.string().optional().nullable(),
  delegatedAt: z.string().optional().nullable(),
  escalatedAt: z.string().optional().nullable(),
  resolvedAt: z.string().optional().nullable(),
});

export const updateRiskSchema = createRiskSchema.partial();
