import { Op } from "sequelize";
import Room from "../models/roomModel.js";
import Message from "../models/messageModel.js";
import Reaction from "../models/reactionModel.js";
import User from "../models/userModel.js";

const userAttributes = ["id", "name", "email", "avatar"];

const getRoomOrThrow = async (roomId) => {
  const room = await Room.findByPk(roomId);

  if (!room) {
    const error = new Error("Room not found");
    error.status = 404;
    throw error;
  }

  return room;
};

const getMessageOrThrow = async (messageId) => {
  const message = await Message.findByPk(messageId);

  if (!message) {
    const error = new Error("Message not found");
    error.status = 404;
    throw error;
  }

  return message;
};

export const getRoomsService = async () => {
  return Room.findAll({
    include: [
      {
        model: User,
        as: "creator",
        attributes: userAttributes,
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const createRoomService = async (data, userId) => {
  const { name, type = "public", projectId } = data;

  if (!name?.trim()) {
    const error = new Error("Room name is required");
    error.status = 400;
    throw error;
  }

  if (!["public", "private"].includes(type)) {
    const error = new Error("Room type must be public or private");
    error.status = 400;
    throw error;
  }

  return Room.create({
    name: name.trim(),
    type,
    projectId: projectId || null,
    createdBy: userId,
  });
};

export const getMessagesService = async (roomId) => {
  await getRoomOrThrow(roomId);

  return Message.findAll({
    where: { roomId },
    include: [
      {
        model: User,
        as: "sender",
        attributes: userAttributes,
      },
      {
        model: Message,
        as: "reply",
        include: [
          {
            model: User,
            as: "sender",
            attributes: userAttributes,
          },
        ],
      },
      {
        model: Message,
        as: "forwardedMessage",
      },
      {
        model: Reaction,
        as: "reactions",
        include: [
          {
            model: User,
            as: "user",
            attributes: userAttributes,
          },
        ],
      },
    ],
    order: [["createdAt", "ASC"]],
  });
};

export const sendMessageService = async (roomId, data, userId) => {
  await getRoomOrThrow(roomId);

  const { content, replyTo = null, forwardedFrom = null } = data;

  if (!content?.trim()) {
    const error = new Error("Message content is required");
    error.status = 400;
    throw error;
  }

  if (replyTo) {
    const replyMessage = await getMessageOrThrow(replyTo);

    if (String(replyMessage.roomId) !== String(roomId)) {
      const error = new Error("Reply message must belong to the same room");
      error.status = 400;
      throw error;
    }
  }

  if (forwardedFrom) {
    await getMessageOrThrow(forwardedFrom);
  }

  return Message.create({
    roomId,
    senderId: userId,
    content: content.trim(),
    replyTo,
    forwardedFrom,
  });
};

export const toggleReactionService = async (
  messageId,
  emoji,
  userId
) => {
  await getMessageOrThrow(messageId);

  if (!emoji?.trim()) {
    const error = new Error("Emoji is required");
    error.status = 400;
    throw error;
  }

  const existingReaction = await Reaction.findOne({
    where: {
      messageId,
      userId,
      emoji: emoji.trim(),
    },
  });

  if (existingReaction) {
    await existingReaction.destroy();

    return {
      active: false,
      reaction: null,
    };
  }

  const reaction = await Reaction.create({
    messageId,
    userId,
    emoji: emoji.trim(),
  });

  return {
    active: true,
    reaction,
  };
};

export const getReactionsService = async (messageId) => {
  await getMessageOrThrow(messageId);

  return Reaction.findAll({
    where: { messageId },
    include: [
      {
        model: User,
        as: "user",
        attributes: userAttributes,
      },
    ],
    order: [["createdAt", "ASC"]],
  });
};