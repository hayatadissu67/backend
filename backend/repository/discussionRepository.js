import Discussion from "../models/discussionModel.js";

const createDiscussion = async (data) => {
  return await Discussion.create(data);
};

const getAllDiscussions = async () => {
  return await Discussion.findAll({ order: [["createdAt", "DESC"]] });
};

export { createDiscussion, getAllDiscussions };
