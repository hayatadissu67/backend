import { toggleReaction, getReactionsForMessage } from '../services/reactionService.js';

async function toggleReaction(req, res) {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const result = await toggleReaction(messageId, req.user.id, emoji);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getReactions(req, res) {
  try {
    const { messageId } = req.params;
    const reactions = await getReactionsForMessage(messageId);
    res.json(reactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export {
  toggleReaction,
  getReactions,
};
