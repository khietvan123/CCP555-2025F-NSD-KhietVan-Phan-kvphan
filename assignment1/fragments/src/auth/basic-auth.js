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
 * (Safe to call multiple times; passport will ignore duplicates.)
 */
module.exports.init = () => {
  passport.use(module.exports.strategy());
  logger.debug('Registered HTTP Basic strategy with passport');
};

/**
 * ORIGINAL behavior (unchanged):
 * Authenticate via Passport using the 'http' strategy, WITHOUT hashing the user id.
 * Keep this so existing routes/tests continue to work exactly as before.
 */
module.exports.authenticate = () => passport.authenticate('http', { session: false });

/**
 * NEW (add-only):
 * Hashed auth middleware that delegates to our custom authorize() wrapper.
 * This sets req.user.id to a privacy-preserving hash of the username/email.
 * Use this in new routes where you want hashed user IDs (e.g., fragments APIs).
 */
module.exports.authenticateHashed = () => authorize('http');
