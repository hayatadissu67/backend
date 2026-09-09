import { createMeeting, getAllMeetings } from "../repository/meetingRepository.js";

const createMeetingService = async (data) => {
  return await createMeeting(data);
};

const getAllMeetingsService = async () => {
  return await getAllMeetings();
};

export { createMeetingService, getAllMeetingsService };
