const reactionService = require('../services/reactionService');

async function toggleReaction(req, res) {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const result = await reactionService.toggleReaction(messageId, req.user.id, emoji);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getReactions(req, res) {
  try {
    const { messageId } = req.params;
    const reactions = await reactionService.getReactionsForMessage(messageId);
    res.json(reactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  toggleReaction,
  getReactions,
};
