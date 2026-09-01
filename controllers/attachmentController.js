import { createAttachment, getAttachmentsForMessage } from '../services/attachmentService.js';
import { getSocket } from '../config/socket.js';

async function postAttachment(req, res) {
  try {
    const { messageId } = req.params;
    const { filename, url } = req.body || {};

    if (!messageId || Number(messageId) <= 0) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    if (!filename || !url) {
      return res.status(400).json({ error: 'filename and url are required' });
    }

    const uploadedBy = req.user?.id || null;
    const attachment = await createAttachment({ messageId, filename: String(filename).slice(0, 100), url: String(url).slice(0, 500), uploadedBy });
    try { getSocket().emit('attachment_created', { messageId, attachment }); } catch (e) {}
    return res.status(201).json(attachment);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function uploadAttachment(req, res) {
  try {
    const { messageId } = req.params;
    if (!messageId || Number(messageId) <= 0) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filename = String(req.file.originalname || 'upload').slice(0, 100);
    const url = `/files/${req.file.filename}`;
    const uploadedBy = req.user?.id || null;
    const attachment = await createAttachment({ messageId, filename, url, uploadedBy });

    try { getSocket().emit('attachment_created', { messageId, attachment }); } catch (e) {}
    return res.status(201).json(attachment);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function listAttachments(req, res) {
  try {
    const { messageId } = req.params;
    if (!messageId || Number(messageId) <= 0) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const attachments = await getAttachmentsForMessage(messageId);
    return res.json(attachments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export {
  postAttachment,
  uploadAttachment,
  listAttachments,
};
