import { createMeetingService, getAllMeetingsService } from "../services/meetingService.js";

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    success: false,
    message: error.message,
  });
};

export const getMeetings = async (req, res) => {
  try {
    const meetings = await getAllMeetingsService();
    const plain = meetings.map((m) => (m.get ? m.get({ plain: true }) : m));
    res.status(200).json({ success: true, data: plain });
  } catch (error) {
    handleError(res, error);
  }
};

export const createMeeting = async (req, res) => {
  try {
    const meeting = await createMeetingService(req.body);
    const plain = meeting.get ? meeting.get({ plain: true }) : meeting;
    res.status(201).json({ success: true, message: "Meeting created", data: plain });
  } catch (error) {
    handleError(res, error);
  }
};
