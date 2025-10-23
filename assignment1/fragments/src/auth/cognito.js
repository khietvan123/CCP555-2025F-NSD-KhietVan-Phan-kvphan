// src/auth/cognito.js

// Configure a JWT token strategy for Passport based on
// Identity Token provided by Cognito. The token will be
// parsed from the Authorization header (i.e., Bearer Token).

const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const authorize = require('./auth-middleware');
const logger = require('../logger');

// We expect AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID to be defined.
if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  throw new Error('missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID');
}

// Log that we're using Cognito
logger.info('Using AWS Cognito for auth');

// Create a Cognito JWT Verifier, which will confirm that any JWT we
// get from a user is valid and something we can trust.
const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  // We expect an Identity Token (vs. Access Token)
  tokenUse: 'id',
});

// At startup, download and cache the public keys (JWKS) we need in order to verify our Cognito JWTs.
jwtVerifier
  .hydrate()
  .then(() => {
    logger.info('Cognito JWKS cached');
  })
  .catch((err) => {
    logger.error({ err }, 'Unable to cache Cognito JWKS');
  });

/**
 * Passport strategy for Bearer tokens (Cognito IdToken).
 * NOTE: For backward compatibility, we keep returning a simple identifier to passport (`user.email`).
 * If you will use the hashed flow (authenticateHashed), ensure your auth-middleware can handle
 * string users by falling back to `user` (raw) when building the hashed id.
 */
module.exports.strategy = () =>
  new BearerStrategy(async (token, done) => {
    try {
      // Verify this JWT
      const user = await jwtVerifier.verify(token);
      logger.debug({ sub: user.sub, email: user.email }, 'verified user token');

      // Create a user, but only bother with their email (kept as-is for compatibility)
      // This means `passport` will set `req.user` to a STRING (the email), not an object.
      // The hashed flow must handle this case.
      done(null, user.email);
    } catch (err) {
      logger.error({ err }, 'could not verify token');
      done(null, false);
    }
  });

/**
 * OPTIONAL: call during app bootstrap to register the 'bearer' strategy with passport.
 * Safe to call multiple times.
 */
module.exports.init = () => {
  passport.use(module.exports.strategy());
  logger.debug('Registered Cognito Bearer strategy with passport');
};

/**
 * ORIGINAL behavior (unchanged):
 * Authenticate via Passport using the 'bearer' strategy without hashing.
 */
module.exports.authenticate = () => passport.authenticate('bearer', { session: false });

/**
 * NEW (add-only):
 * Hashed auth middleware that delegates to our custom authorize() wrapper.
 * This sets req.user.id to a privacy-preserving hash of the identifier.
 * Use this in new routes where you want hashed user IDs.
 *
 * IMPORTANT: Ensure your `auth-middleware` can handle string users by including a fallback:
 *   const raw = user.email || user.username || user.name || user.user || user || '';
 */
module.exports.authenticateHashed = () => authorize('bearer');
