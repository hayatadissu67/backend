// Input validation and sanitization utilities

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  return password && password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

function sanitizeString(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, maxLength).replace(/[<>]/g, '');
}

function validateRoomName(name) {
  const sanitized = sanitizeString(name, 100);
  return sanitized.length >= 2 && sanitized.length <= 100;
}

function validateMessageContent(content) {
  const sanitized = sanitizeString(content, 5000);
  return sanitized.length > 0 && sanitized.length <= 5000;
}

function validateUserId(id) {
  return Number.isInteger(id) && id > 0;
}

function validateRoomId(id) {
  return Number.isInteger(id) && id > 0;
}

function validateMessageId(id) {
  return Number.isInteger(id) && id > 0;
}

function validateEmoji(emoji) {
  // Simple emoji validation - just check it's a single character
  return typeof emoji === 'string' && emoji.length > 0 && emoji.length <= 2;
}

export {
  validateEmail,
  validatePassword,
  sanitizeString,
  validateRoomName,
  validateMessageContent,
  validateUserId,
  validateRoomId,
  validateMessageId,
  validateEmoji,
};
