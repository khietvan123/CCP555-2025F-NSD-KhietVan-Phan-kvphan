// fragments/src/routes/api/index.js
const express = require('express');
const router = express.Router();

// Mount specific API endpoints here
// GET /v1/fragments -> handled by ./get.js
router.get('/fragments', require('./get'));

module.exports = router;
