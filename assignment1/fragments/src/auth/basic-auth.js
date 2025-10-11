// src/auth/basic-auth.js
const auth = require('http-auth');
const passport = require('passport');
const authPassport = require('http-auth-passport');
const logger = require('../logger');
const authorize = require('./auth-middleware');

// We expect HTPASSWD_FILE to be defined.
if (!process.env.HTPASSWD_FILE) {
  throw new Error('missing expected env var: HTPASSWD_FILE');
}

// Log that we're using Basic Auth
logger.info('Using HTTP Basic Auth for auth');

// Build the http-auth strategy instance (reads users from .htpasswd)
const basic = auth.basic({
  file: process.env.HTPASSWD_FILE,
});

// Expose a helper that returns the Passport Strategy (named 'http')
module.exports.strategy = () => authPassport(basic);

/**
 * OPTIONAL: call during app bootstrap to register the 'http' strategy with passport
 */
module.exports.init = () => {
  passport.use(module.exports.strategy());
  logger.debug('Registered HTTP Basic strategy with passport');
};

/**
 * DEFAULT: Use the hashed auth middleware for all new API routes.
 * This ensures req.user.id is a SHA256 hash (from src/hash.js) and avoids exposing emails.
 */
module.exports.authenticate = () => authorize('http');
