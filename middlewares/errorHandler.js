const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Something went wrong";

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    success: false,
    code,
    message,
    details: err.details || null,
  });
};

module.exports = errorHandler;