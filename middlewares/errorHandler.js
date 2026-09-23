const logger = require("../utils/logger");

// Only two kinds of error are safe to describe to a caller: our own AppErrors,
// and client errors Express's body parser marks `expose` (malformed JSON, body
// too large). Anything else - a MongoDB or Stripe SDK error, a runtime bug -
// can carry internal detail in its message or code, so the caller gets a
// generic 500 and the real error goes to the server log.
const isSafeToExpose = (err) =>
  err.isOperational === true || (err.expose === true && err.statusCode < 500);

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (!isSafeToExpose(err)) {
    // The caller gets a generic 500, so this line is the only record of what
    // actually failed. It carries the route, to make that line findable.
    logger.error("request.failed", { method: req.method, path: req.originalUrl }, err);

    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
      details: null,
    });
  }

  return res.status(err.statusCode).json({
    success: false,
    code: err.isOperational ? err.code : "INVALID_REQUEST",
    message: err.message,
    details: err.details || null,
  });
};

module.exports = errorHandler;
