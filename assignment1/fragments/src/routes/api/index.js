// fragments/src/routes/api/index.js
const express = require('express');
const router = express.Router();
const contentType = require('content-type');
const Fragment = require('../../model/fragments');
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });
router.post('/fragments', rawBody(), require('./post'));  
router.get('/fragments', require('./get'));

module.exports = router;
