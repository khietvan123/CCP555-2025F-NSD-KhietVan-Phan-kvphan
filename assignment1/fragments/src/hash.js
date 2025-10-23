// src/hash.js
const crypto = require('crypto');

const algorithm = 'sha256';
const secret = process.env.HASH_SECRET || 'default-secret';

/**
 * Hash an email address using HMAC-SHA256 (privacy-preserving, secret-based)
 * - Normalizes the email (trim + lowercase) before hashing
 * @param {string} email
 * @returns {string} 64-char hex string
 */
function hash(email) {
  if (email === null || email === undefined || typeof email !== 'string') {
    throw new Error('Email must be a string');
  }

  const normalized = email.trim().toLowerCase();
  // Keep your current behavior: allow empty string (hash of empty)
  return crypto.createHmac(algorithm, secret).update(normalized).digest('hex');
}

module.exports = { hash };
