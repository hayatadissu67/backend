import { ChangeRequest } from "../../models/ChangeRequestModel/changeRequestModel.js";

// ===============================
// CREATE CHANGE REQUEST
// ===============================
export const createChangeRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      reason,
      impactAnalysis,
      projectId,
    } = req.body;

    // Validate required fields
    if (!title || !description || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and projectId are required",
      });
    }

    // User authentication irraa ID fudhanna (Yoo protect hin jirre dummy ID kennuu dandeessa ykn req.body irraa fiduu dandeessa)
    const requestedBy = req.user?.id || 1; // Testing-aaf yoo protect cufame 1 akka ta'u godhameera

    // Create change request
    const changeRequest = await ChangeRequest.create({
      title,
      description,
      reason,
      impactAnalysis,
      projectId,
      requestedBy,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Change request created successfully",
      data: changeRequest,
    });
  } catch (error) {
    console.error("Create Change Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create change request",
      error: error.message,
    });
  }
};

// ===============================
// GET ALL CHANGE REQUESTS
// ===============================
export const getAllChangeRequests = async (req, res) => {
  try {
    const changeRequests = await ChangeRequest.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: changeRequests.length,
      data: changeRequests,
    });
  } catch (error) {
    console.error("Get Change Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch change requests",
      error: error.message,
    });
  }
};

// ===============================
// GET SINGLE CHANGE REQUEST
// ===============================
export const getChangeRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const changeRequest = await ChangeRequest.findByPk(id);

    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: "Change request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: changeRequest,
    });
  } catch (error) {
    console.error("Get Change Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch change request",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE CHANGE REQUEST
// ===============================
export const updateChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const changeRequest = await ChangeRequest.findByPk(id);

    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: "Change request not found",
      });
    }

    if (
      changeRequest.status === "Approved" ||
      changeRequest.status === "Rejected"
    ) {
      return res.status(400).json({
        success: false,
        message: "Approved or rejected change request cannot be updated",
      });
    }

    const {
      title,
      description,
      reason,
      impactAnalysis,
      projectId,
    } = req.body;

    await changeRequest.update({
      title: title ?? changeRequest.title,
      description: description ?? changeRequest.description,
      reason: reason ?? changeRequest.reason,
      impactAnalysis:
        impactAnalysis ?? changeRequest.impactAnalysis,
      projectId: projectId ?? changeRequest.projectId,
    });

    return res.status(200).json({
      success: true,
      message: "Change request updated successfully",
      data: changeRequest,
    });
  } catch (error) {
    console.error("Update Change Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update change request",
      error: error.message,
    });
  }
};

// ===============================
// APPROVE CHANGE REQUEST
// ===============================
export const approveChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const changeRequest = await ChangeRequest.findByPk(id);

    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: "Change request not found",
      });
    }

    if (changeRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Change request is already ${changeRequest.status}`,
      });
    }

    const approvedBy = req.user?.id || 1;

    await changeRequest.update({
      status: "Approved",
      approvedBy,
      approvedAt: new Date(),
      rejectionReason: null,
    });

    return res.status(200).json({
      success: true,
      message: "Change request approved successfully",
      data: changeRequest,
    });
  } catch (error) {
    console.error("Approve Change Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve change request",
      error: error.message,
    });
  }
};

// ===============================
// REJECT CHANGE REQUEST
// ===============================
export const rejectChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const changeRequest = await ChangeRequest.findByPk(id);

    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: "Change request not found",
      });
    }

    if (changeRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Change request is already ${changeRequest.status}`,
      });
    }

    const approvedBy = req.user?.id || 1;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    await changeRequest.update({
      status: "Rejected",
      approvedBy,
      approvedAt: new Date(),
      rejectionReason,
    });

    return res.status(200).json({
      success: true,
      message: "Change request rejected successfully",
      data: changeRequest,
    });
  } catch (error) {
    console.error("Reject Change Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject change request",
      error: error.message,
    });
  }
};

// ===============================
// DELETE CHANGE REQUEST
// ===============================
export const deleteChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const changeRequest = await ChangeRequest.findByPk(id);

    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: "Change request not found",
      });
    }

    await changeRequest.destroy();

    return res.status(200).json({
      success: true,
      message: "Change request deleted successfully",
    });
  } catch (error) {
    console.error("Delete Change Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete change request",
      error: error.message,
    });
  }
};