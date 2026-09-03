const express = require('express');
const readReceiptController = require('../controllers/readReceiptController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:messageId/read_receipts', authenticate, readReceiptController.postReadReceipt);
router.post('/read_receipts/batch', authenticate, readReceiptController.postReadReceipt);
router.get('/:messageId/read_receipts', authenticate, readReceiptController.listReadReceipts);

module.exports = router;
