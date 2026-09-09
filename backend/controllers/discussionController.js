import { createDiscussionService, getAllDiscussionsService } from "../services/discussionService.js";

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    success: false,
    message: error.message,
  });
};

export const getDiscussions = async (req, res) => {
  try {
    const discussions = await getAllDiscussionsService();
    const plain = discussions.map((d) => (d.get ? d.get({ plain: true }) : d));
    res.status(200).json({ success: true, data: plain });
  } catch (error) {
    handleError(res, error);
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const discussion = await createDiscussionService(req.body);
    const plain = discussion.get ? discussion.get({ plain: true }) : discussion;
    res.status(201).json({ success: true, message: "Discussion created", data: plain });
  } catch (error) {
    handleError(res, error);
  }
};
