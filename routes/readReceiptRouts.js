import express from 'express';
import { postReadReceipt, listReadReceipts } from '../controllers/readReceiptController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:messageId/read_receipts', authenticate, postReadReceipt);
router.post('/read_receipts/batch', authenticate, postReadReceipt);
router.get('/:messageId/read_receipts', authenticate, listReadReceipts);

export default router;
