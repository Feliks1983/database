const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `${req.method} ${req.originalUrl} does not exist`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
module.exports = { errorHandler, notFoundHandler };
