import Notification from "../models/notificationModel.js";

const getAllNotifications = async () => {
  return await Notification.findAll({ order: [["createdAt", "DESC"]] });
};

const markAllRead = async () => {
  await Notification.update({ isRead: true }, { where: { isRead: false } });
};

const clearAll = async () => {
  await Notification.destroy({ where: {} });
};

export { getAllNotifications, markAllRead, clearAll };
