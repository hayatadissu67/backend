import { getAllNotifications, markAllRead, clearAll } from "../repository/notificationRepository.js";

const getAllNotificationsService = async () => {
  return await getAllNotifications();
};

const markAllReadService = async () => {
  await markAllRead();
};

const clearAllService = async () => {
  await clearAll();
};

export { getAllNotificationsService, markAllReadService, clearAllService };
