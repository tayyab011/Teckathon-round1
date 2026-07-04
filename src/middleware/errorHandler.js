function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  console.error(`[ERROR] ${status} - ${message}`);
  if (status === 500) console.error(err.stack);
  res.status(status).json({ error: message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}

module.exports = { createError, errorHandler, notFoundHandler };
