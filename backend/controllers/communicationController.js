import { randomUUID } from "node:crypto";
import { Op, DataTypes } from "sequelize";
import Notification from "../models/notificationModel.js";
import { sequelize } from "../config/db.js";
import User from "../models/userModel.js";

const ChatChannel = sequelize.models.ChatChannel || sequelize.define("ChatChannel", {
  id: { type: DataTypes.STRING(100), primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  type: { type: DataTypes.ENUM("channel", "dm"), defaultValue: "channel" },
  description: DataTypes.STRING(500),
  projectCode: DataTypes.STRING(50),
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "communication_channels", timestamps: true });

const ChatMessage = sequelize.models.ChatMessage || sequelize.define("ChatMessage", {
  id: { type: DataTypes.STRING(100), primaryKey: true },
  channelId: { type: DataTypes.STRING(100), allowNull: false },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  sender: { type: DataTypes.STRING(150), allowNull: false },
  senderRole: DataTypes.STRING(150),
  avatar: DataTypes.STRING(500),
  content: { type: DataTypes.TEXT, allowNull: false },
  timestamp: DataTypes.STRING(50),
  isCodeSnippet: { type: DataTypes.BOOLEAN, defaultValue: false },
  isVoiceNote: { type: DataTypes.BOOLEAN, defaultValue: false },
  voiceDuration: DataTypes.STRING(20),
  status: { type: DataTypes.STRING(20), defaultValue: "sent" },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  replyTo: DataTypes.JSON,
  reactions: DataTypes.JSON,
}, { tableName: "communication_messages", timestamps: true });

const Discussion = sequelize.models.CommunicationDiscussion || sequelize.define("CommunicationDiscussion", {
  id: { type: DataTypes.STRING(100), primaryKey: true },
  author: { type: DataTypes.STRING(150), allowNull: false },
  role: DataTypes.STRING(150),
  avatar: DataTypes.STRING(500),
  content: { type: DataTypes.TEXT, allowNull: false },
  timestamp: DataTypes.STRING(50),
  repliesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  projectTag: DataTypes.STRING(50),
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "communication_discussions", timestamps: true });

const Meeting = sequelize.models.CommunicationMeeting || sequelize.define("CommunicationMeeting", {
  id: { type: DataTypes.STRING(100), primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  date: { type: DataTypes.STRING(20), allowNull: false },
  time: DataTypes.STRING(100),
  attendees: DataTypes.JSON,
  location: DataTypes.STRING(300),
  status: { type: DataTypes.ENUM("Scheduled", "Completed", "Cancelled"), defaultValue: "Scheduled" },
  agenda: DataTypes.TEXT,
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "communication_meetings", timestamps: true });

const Document = sequelize.models.CommunicationDocument || sequelize.define("CommunicationDocument", {
  id: { type: DataTypes.STRING(100), primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  type: DataTypes.STRING(100),
  size: DataTypes.STRING(50),
  date: DataTypes.STRING(20),
  author: DataTypes.STRING(150),
  projectCode: DataTypes.STRING(50),
  fileName: DataTypes.STRING(255),
  mimeType: DataTypes.STRING(150),
  fileData: DataTypes.BLOB("long"),
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "communication_documents", timestamps: true });

const memoryStore = {
  channels: [], messages: [], discussions: [], meetings: [], documents: [], notifications: [],
};

const useMemoryStore = () => process.env.NODE_ENV !== "production";

const isDatabaseError = (error) => Boolean(error && (error.name?.includes("Sequelize") || error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR"));

const fallbackUser = (req) => ({
  id: req.user.id,
  name: req.user.name || "User",
  role: req.user.role || "TEAM_MEMBER",
  avatar: req.user.avatar || null,
});

const DEFAULT_CHANNELS = [
  { id: "general", name: "general", description: "Company-wide collaboration", type: "channel" },
  { id: "announcements", name: "announcements", description: "Important project and governance updates", type: "channel" },
];

const cleanText = (value, maxLength) => typeof value === "string"
  ? value.trim().replace(/[<>]/g, "").slice(0, maxLength)
  : "";

const parseLimit = (value, fallback = 100) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 200) : fallback;
};

const parseOffset = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
};

const canAccessChannel = async (channelId, userId) => {
  const channel = await ChatChannel.findByPk(channelId);
  if (!channel) return null;
  if (channel.type === "channel" || channel.createdBy === userId) return channel;
  return null;
};

const serializeChannel = (channel) => ({
  ...channel.toJSON(),
  unreadCount: 0,
});

export const getChannels = async (req, res) => {
  try {
    if (useMemoryStore() && memoryStore.channels.length === 0) {
      memoryStore.channels.push(...DEFAULT_CHANNELS.map((channel) => ({ ...channel, createdBy: req.user.id, createdAt: new Date().toISOString(), unreadCount: 0 })));
    }
    for (const defaults of DEFAULT_CHANNELS) {
      await ChatChannel.findOrCreate({
        where: { id: defaults.id },
        defaults: { ...defaults, createdBy: req.user.id },
      });
    }

    const channels = await ChatChannel.findAll({
      where: { [Op.or]: [{ type: "channel" }, { createdBy: req.user.id }] },
      order: [["createdAt", "ASC"]],
    });
    return res.status(200).json({ success: true, data: channels.map(serializeChannel) });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      return res.status(200).json({ success: true, data: memoryStore.channels.filter((channel) => channel.type === "channel" || channel.createdBy === req.user.id) });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createChannel = async (req, res) => {
  try {
    const name = cleanText(req.body.name, 100);
    if (name.length < 2) {
      return res.status(400).json({ success: false, message: "Channel name must be at least 2 characters" });
    }

    const channelData = {
      id: cleanText(req.body.id, 100) || randomUUID(),
      name,
      type: req.body.type === "dm" ? "dm" : "channel",
      description: cleanText(req.body.description, 500) || null,
      projectCode: cleanText(req.body.projectCode, 50) || null,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      unreadCount: 0,
    };
    const channel = await ChatChannel.create(channelData);
    return res.status(201).json({ success: true, data: serializeChannel(channel) });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      const channel = { id: cleanText(req.body.id, 100) || randomUUID(), name: cleanText(req.body.name, 100), type: req.body.type === "dm" ? "dm" : "channel", description: cleanText(req.body.description, 500), projectCode: cleanText(req.body.projectCode, 50), createdBy: req.user.id, createdAt: new Date().toISOString(), unreadCount: 0 };
      memoryStore.channels.push(channel);
      return res.status(201).json({ success: true, data: channel });
    }
    const status = error.name === "SequelizeUniqueConstraintError" ? 409 : 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const channelId = cleanText(req.query.channelId, 100);
    let where = channelId ? { channelId } : {};
    if (channelId && !(await canAccessChannel(channelId, req.user.id))) {
      return res.status(403).json({ success: false, message: "Access denied to this channel" });
    }

    if (!channelId) {
      const accessibleChannels = await ChatChannel.findAll({
        attributes: ["id"],
        where: { [Op.or]: [{ type: "channel" }, { createdBy: req.user.id }] },
      });
      where = { channelId: { [Op.in]: accessibleChannels.map((channel) => channel.id) } };
    }

    const messages = await ChatMessage.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseLimit(req.query.limit),
      offset: parseOffset(req.query.offset),
    });
    return res.status(200).json({ success: true, data: messages.reverse() });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      const channelId = cleanText(req.query.channelId, 100);
      const messages = memoryStore.messages.filter((message) => !channelId || message.channelId === channelId).slice(-parseLimit(req.query.limit));
      return res.status(200).json({ success: true, data: messages });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const channelId = cleanText(req.body.channelId, 100);
    const content = cleanText(req.body.content, 5000);
    if (!channelId || !content) {
      return res.status(400).json({ success: false, message: "channelId and content are required" });
    }
    if (!(await canAccessChannel(channelId, req.user.id))) {
      return res.status(403).json({ success: false, message: "Access denied to this channel" });
    }

    const user = await User.findByPk(req.user.id, { attributes: ["name", "avatar"] });
    const messageData = {
      id: cleanText(req.body.id, 100) || randomUUID(),
      channelId,
      senderId: req.user.id,
      sender: user?.name || req.user.name || "User",
      senderRole: cleanText(req.user.role, 150) || null,
      avatar: user?.avatar || null,
      content,
      timestamp: new Date().toISOString(),
      isCodeSnippet: Boolean(req.body.isCodeSnippet),
      isVoiceNote: Boolean(req.body.isVoiceNote),
      voiceDuration: cleanText(req.body.voiceDuration, 20) || null,
      status: "sent",
      replyTo: req.body.replyTo || null,
      createdAt: new Date().toISOString(),
    };
    const message = await ChatMessage.create(messageData);
    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      const user = fallbackUser(req);
      const message = { id: cleanText(req.body.id, 100) || randomUUID(), channelId: cleanText(req.body.channelId, 100), senderId: req.user.id, sender: user.name, senderRole: user.role, avatar: user.avatar, content: cleanText(req.body.content, 5000), timestamp: new Date().toISOString(), isCodeSnippet: Boolean(req.body.isCodeSnippet), isVoiceNote: Boolean(req.body.isVoiceNote), voiceDuration: cleanText(req.body.voiceDuration, 20) || null, status: "sent", isPinned: false, replyTo: req.body.replyTo || null, reactions: [], createdAt: new Date().toISOString() };
      memoryStore.messages.push(message);
      return res.status(201).json({ success: true, data: message });
    }
    const status = error.name === "SequelizeUniqueConstraintError" ? 409 : 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const message = await ChatMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    if (message.senderId !== req.user.id) return res.status(403).json({ success: false, message: "Only the sender can update this message" });

    const updates = {};
    if (req.body.content !== undefined) {
      updates.content = cleanText(req.body.content, 5000);
      if (!updates.content) return res.status(400).json({ success: false, message: "Message content cannot be empty" });
    }
    if (req.body.reactions !== undefined) updates.reactions = req.body.reactions;
    if (req.body.isPinned !== undefined) updates.isPinned = Boolean(req.body.isPinned);
    await message.update(updates);
    return res.status(200).json({ success: true, data: message });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      const message = memoryStore.messages.find((item) => item.id === req.params.id);
      if (!message) return res.status(404).json({ success: false, message: "Message not found" });
      if (message.senderId !== req.user.id) return res.status(403).json({ success: false, message: "Only the sender can update this message" });
      if (req.body.content !== undefined) message.content = cleanText(req.body.content, 5000);
      if (req.body.reactions !== undefined) message.reactions = req.body.reactions;
      if (req.body.isPinned !== undefined) message.isPinned = Boolean(req.body.isPinned);
      return res.status(200).json({ success: true, data: message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const normalizeDiscussion = (data, req) => ({
  id: cleanText(data.id, 100) || randomUUID(),
  author: cleanText(data.author, 150) || fallbackUser(req).name,
  role: cleanText(data.role, 150) || fallbackUser(req).role,
  avatar: cleanText(data.avatar, 500) || fallbackUser(req).avatar,
  content: cleanText(data.content, 10000),
  timestamp: data.timestamp || new Date().toISOString(),
  repliesCount: Number.isInteger(data.repliesCount) ? data.repliesCount : 0,
  projectTag: cleanText(data.projectTag, 50) || "GENERAL",
  createdBy: req.user.id,
});

export const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.findAll({ order: [["createdAt", "DESC"]] });
    return res.json({ success: true, data: discussions });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) return res.json({ success: true, data: memoryStore.discussions });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDiscussion = async (req, res) => {
  const discussion = normalizeDiscussion(req.body, req);
  if (!discussion.content) return res.status(400).json({ success: false, message: "Discussion content is required" });
  try {
    const created = await Discussion.create(discussion);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      memoryStore.discussions.unshift(discussion);
      return res.status(201).json({ success: true, data: discussion });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.findAll({ order: [["date", "ASC"], ["time", "ASC"]] });
    return res.json({ success: true, data: meetings });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) return res.json({ success: true, data: memoryStore.meetings });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createMeeting = async (req, res) => {
  const meeting = { id: cleanText(req.body.id, 100) || randomUUID(), title: cleanText(req.body.title, 200), date: cleanText(req.body.date, 20), time: cleanText(req.body.time, 100), attendees: Array.isArray(req.body.attendees) ? req.body.attendees.map((item) => cleanText(item, 150)).slice(0, 100) : [], location: cleanText(req.body.location, 300), status: ["Scheduled", "Completed", "Cancelled"].includes(req.body.status) ? req.body.status : "Scheduled", agenda: cleanText(req.body.agenda, 10000), createdBy: req.user.id };
  if (!meeting.title || !meeting.date) return res.status(400).json({ success: false, message: "Meeting title and date are required" });
  try {
    const created = await Meeting.create(meeting);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      memoryStore.meetings.push(meeting);
      return res.status(201).json({ success: true, data: meeting });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({ attributes: { exclude: ["fileData"] }, order: [["createdAt", "DESC"]] });
    return res.json({ success: true, data: documents });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) return res.json({ success: true, data: memoryStore.documents.map(({ fileData, ...document }) => document) });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "A file is required" });
  const document = { id: randomUUID(), title: cleanText(req.body.title, 255) || req.file.originalname, type: cleanText(req.body.type, 100) || "Document", size: cleanText(req.body.size, 50) || `${(req.file.size / 1048576).toFixed(1)} MB`, date: cleanText(req.body.date, 20) || new Date().toISOString().slice(0, 10), author: fallbackUser(req).name, projectCode: cleanText(req.body.projectCode, 50) || "GENERAL", fileName: req.file.originalname, mimeType: req.file.mimetype, fileData: req.file.buffer, createdBy: req.user.id };
  try {
    const created = await Document.create(document);
    const result = created.toJSON(); delete result.fileData;
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      memoryStore.documents.unshift(document);
      const { fileData, ...result } = document;
      return res.status(201).json({ success: true, data: result });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: "Document not found" });
    res.setHeader("Content-Type", document.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${document.fileName || document.title}"`);
    return res.send(document.fileData);
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      const document = memoryStore.documents.find((item) => item.id === req.params.id);
      if (!document) return res.status(404).json({ success: false, message: "Document not found" });
      res.setHeader("Content-Type", document.mimeType || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${document.fileName || document.title}"`);
      return res.send(document.fileData);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: "Document not found" });
    if (document.createdBy !== req.user.id && req.user.role !== "EXECUTIVE_MANAGER") return res.status(403).json({ success: false, message: "Permission denied" });
    await document.destroy();
    return res.json({ success: true });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      const index = memoryStore.documents.findIndex((item) => item.id === req.params.id);
      if (index < 0) return res.status(404).json({ success: false, message: "Document not found" });
      const document = memoryStore.documents[index];
      if (document.createdBy !== req.user.id && req.user.role !== "EXECUTIVE_MANAGER") return res.status(403).json({ success: false, message: "Permission denied" });
      memoryStore.documents.splice(index, 1);
      return res.json({ success: true });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      return res.status(200).json({ success: true, data: memoryStore.notifications.filter((notification) => String(notification.userId) === String(req.user.id)) });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    await notification.update({ isRead: true });
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      const notification = memoryStore.notifications.find((item) => item.id === req.params.id && String(item.userId) === String(req.user.id));
      if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
      notification.isRead = true;
      return res.status(200).json({ success: true, data: notification });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id } });
    return res.json({ success: true });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      memoryStore.notifications.filter((item) => String(item.userId) === String(req.user.id)).forEach((item) => { item.isRead = true; });
      return res.json({ success: true });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    await Notification.destroy({ where: { userId: req.user.id } });
    return res.json({ success: true });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      memoryStore.notifications = memoryStore.notifications.filter((item) => String(item.userId) !== String(req.user.id));
      return res.json({ success: true });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const data = req.body;
    // Basic validation
    if (!data.title || !data.message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const notification = await Notification.create({ ...data, userId: data.userId || req.user.id });
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    if (useMemoryStore() && isDatabaseError(error)) {
      const notification = { id: randomUUID(), ...req.body, userId: req.body.userId || req.user.id, isRead: false, createdAt: new Date().toISOString() };
      memoryStore.notifications.unshift(notification);
      return res.status(201).json({ success: true, data: notification });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
