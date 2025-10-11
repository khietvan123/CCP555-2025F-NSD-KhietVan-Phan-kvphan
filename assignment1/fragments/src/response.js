module.exports.createSuccessResponse = function (data) {
  // If no data provided, return just the status
  if (!data) {
    return { status: 'ok' };
  }
  return {
    status: 'ok',
    ...data,
  };
};
module.exports.createErrorResponse = function (code, message) {
  return {
    status: 'error',
    error: {
      code,
      message,
    },
  };
};
