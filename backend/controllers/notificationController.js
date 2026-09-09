import { getAllNotificationsService, markAllReadService, clearAllService } from "../services/notificationService.js";

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    success: false,
    message: error.message,
  });
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await getAllNotificationsService();
    const plain = notifications.map((n) => (n.get ? n.get({ plain: true }) : n));
    res.status(200).json({ success: true, data: plain });
  } catch (error) {
    handleError(res, error);
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    await markAllReadService();
    res.status(200).json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    handleError(res, error);
  }
};

export const clearNotifications = async (req, res) => {
  try {
    await clearAllService();
    res.status(200).json({ success: true, message: "Notifications cleared" });
  } catch (error) {
    handleError(res, error);
  }
};
