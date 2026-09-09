import Meeting from "../models/meetingModel.js";

const createMeeting = async (data) => {
  return await Meeting.create(data);
};

const getAllMeetings = async () => {
  return await Meeting.findAll({ order: [["createdAt", "DESC"]] });
};

export { createMeeting, getAllMeetings };
