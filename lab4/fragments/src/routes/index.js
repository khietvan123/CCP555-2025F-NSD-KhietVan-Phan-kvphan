// src/routes/index.js
const express = require('express');
const { version, author } = require('../../package.json');
const { authenticate } = require('../auth');
const router = express.Router();

router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: 'https://github.com/khietvan123/CCP555-2025F-NSD-KhietVan-Phan-kvphan/tree/main/lab3/fragments',
    version,
  });
});

router.use(`/v1`, authenticate(), require('./api'));
 
module.exports = router;