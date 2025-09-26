// src/index.js
require('dotenv').config();
 
// We want to log any crash cases so we can debug later from logs.
const logger = require('./logger');
 
// If we're going to crash because of an uncaught exception, log it first.
// [URL]
// eslint-disable-next-line no-undef
process.on('uncaughtException', (err, origin) => {
  logger.fatal({ err, origin }, 'uncaughtException');
  throw err;
});
 
// If we're going to crash because of an unhandled promise rejection, log it first.
// [URL]
// eslint-disable-next-line no-undef
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'unhandledRejection');
  throw reason;
});
 
// Start our server
require('./server');