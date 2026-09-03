const readReceiptService = require('../services/readReceiptService');
const { getSocket } = require('../config/socket');

async function postReadReceipt(req, res) {
  try {
    const userId = req.user.id;
    // support batch: body.messageIds OR single param
    const { messageIds } = req.body || {};
    if (Array.isArray(messageIds) && messageIds.length > 0) {
      const result = await readReceiptService.markReadBatch(messageIds, userId);
      try { getSocket().emit('read_receipts_updated', { messageIds, userId }); } catch (e) {}
      return res.json({ batch: true, result });
    }
    const { messageId } = req.params;
    const result = await readReceiptService.markRead(messageId, userId);
    try { getSocket().emit('read_receipts_updated', { messageIds: [messageId], userId }); } catch (e) {}
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listReadReceipts(req, res) {
  try {
    const { messageId } = req.params;
    const receipts = await readReceiptService.getReadReceipts(messageId);
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  postReadReceipt,
  listReadReceipts,
};
