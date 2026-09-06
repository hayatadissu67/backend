import {
  getRoomsService,
  createRoomService,
  getMessagesService,
  sendMessageService,
  toggleReactionService,
  getReactionsService,
} from "../services/chatService.js";

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    success: false,
    message: error.message,
  });
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await getRoomsService();

    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const createRoom = async (req, res) => {
  try {
    const room = await createRoomService(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await getMessagesService(req.params.roomId);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const message = await sendMessageService(
      req.params.roomId,
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const toggleReaction = async (req, res) => {
  try {
    const result = await toggleReactionService(
      req.params.messageId,
      req.body.emoji,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getReactions = async (req, res) => {
  try {
    const reactions = await getReactionsService(req.params.messageId);

    res.status(200).json({
      success: true,
      data: reactions,
    });
  } catch (error) {
    handleError(res, error);
  }
};