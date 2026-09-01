import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { postAttachment, uploadAttachment, listAttachments } from '../controllers/attachmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { UPLOAD_DIR, MAX_UPLOAD_SIZE_MB } from '../env.js';

const router = express.Router();

const uploadsDir = path.resolve(UPLOAD_DIR || path.join(__dirname, '..', 'uploads'));
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const maxFileSize = Math.max(1, Number(MAX_UPLOAD_SIZE_MB || 10)) * 1024 * 1024;
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const baseName = path.basename(file.originalname || 'upload').replace(/\s+/g, '-');
    const safeBase = baseName.replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${Date.now()}-${safeBase || 'upload'}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const mimeAllowed = allowedMimeTypes.has(file.mimetype);
    const extAllowed = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx'].includes(extension);

    if (mimeAllowed || extAllowed) return cb(null, true);
    cb(new Error('Unsupported file type'));
  },
});

router.post('/:messageId/attachments', authenticate, postAttachment);
router.post('/:messageId/attachments/upload', authenticate, upload.single('file'), uploadAttachment);
router.get('/:messageId/attachments', authenticate, listAttachments);

export default router;
