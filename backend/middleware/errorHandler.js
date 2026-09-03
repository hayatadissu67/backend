export const errorHandler = (err, req, res, next) => {
  console.error("Error: ", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Hide database internals from the client
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "An unexpected error occurred" : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
