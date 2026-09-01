import { markReadBatch, markRead, getReadReceipts } from '../services/readReceiptService.js';
import { getSocket } from '../config/socket.js';

async function postReadReceipt(req, res) {
  try {
    const userId = req.user.id;
    const { messageIds } = req.body || {};
    if (Array.isArray(messageIds) && messageIds.length > 0) {
      const result = await markReadBatch(messageIds, userId);
      try { getSocket().emit('read_receipts_updated', { messageIds, userId }); } catch (e) {}
      return res.json({ batch: true, result });
    }
    const { messageId } = req.params;
    const result = await markRead(messageId, userId);
    try { getSocket().emit('read_receipts_updated', { messageIds: [messageId], userId }); } catch (e) {}
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listReadReceipts(req, res) {
  try {
    const { messageId } = req.params;
    const receipts = await getReadReceipts(messageId);
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export {
  postReadReceipt,
  listReadReceipts,
};
