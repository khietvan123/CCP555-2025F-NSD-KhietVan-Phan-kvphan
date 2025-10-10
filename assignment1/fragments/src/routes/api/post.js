// src/routes/api/post.js
const contentType = require('content-type');
const Fragment = require('../../model/fragments');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    if (!Buffer.isBuffer(req.body)) {
      return res.status(415).json(createErrorResponse(415, 'Unsupported Content-Type'));
    }
    let type;
    try {
      ({ type } = contentType.parse(req));
    } catch {
      return res.status(415).json(createErrorResponse(415, 'Unsupported Content-Type'));
    }
    if (!Fragment.isSupportedType(type)) {
      return res.status(415).json(createErrorResponse(415, 'Unsupported Content-Type'));
    }
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
    }
    const fragment = new Fragment({ ownerId, type });
    await fragment.setData(req.body);

    const base = process.env.API_URL || `http://${req.headers.host}`;
    const url = new URL(`/v1/fragments/${fragment.id}`, base);
    res.setHeader('Location', url.toString());

    return res.status(201).json(createSuccessResponse({ fragment: fragment.toJSON() }));
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return res.status(500).json(createErrorResponse(500, 'Server error'));
  }
};
