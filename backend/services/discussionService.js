import { createDiscussion, getAllDiscussions } from "../repository/discussionRepository.js";

const createDiscussionService = async (data) => {
  return await createDiscussion(data);
};

const getAllDiscussionsService = async () => {
  return await getAllDiscussions();
};

export { createDiscussionService, getAllDiscussionsService };
