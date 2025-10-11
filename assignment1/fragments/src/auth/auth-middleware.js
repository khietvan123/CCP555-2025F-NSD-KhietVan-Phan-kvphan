// src/auth/auth-middleware.js
const passport = require('passport');
const { hash } = require('../hash');
const logger = require('../logger');

module.exports = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (err, user) => {
    if (err) {
      logger.error({ err, strategy }, 'auth error');
      return res
        .status(500)
        .json({ status: 'error', error: { code: 500, message: 'auth error' } });
    }

    if (!user) {
      logger.warn({ strategy }, 'unauthorized');
      return res
        .status(401)
        .json({ status: 'error', error: { code: 401, message: 'unauthorized' } });
    }

    try {
      // http-auth-passport often provides the username at `user.user`
      const raw =
        user.email ||
        user.username ||
        user.name ||
        user.user || 
        user ||'';

      const normalized = String(raw).trim().toLowerCase();
      const id = hash(normalized); // privacy-preserving, stable hashed id

      req.user = { ...user, id };
      logger.debug({ id, strategy }, 'authorized user (hashed)');
      return next();
    } catch (e) {
      logger.error({ e, strategy }, 'failed to compute hashed id');
      return res
        .status(500)
        .json({ status: 'error', error: { code: 500, message: 'auth id error' } });
    }
  })(req, res, next);
};
