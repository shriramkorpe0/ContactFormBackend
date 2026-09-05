// Centralized error handler. Every error in the app (validation errors,
// AppError instances, MongoDB errors, Nodemailer errors, or anything
// unexpected) ends up here. It always returns a clean JSON response and
// NEVER leaks stack traces, passwords, or connection strings to the client.
const errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation errors (e.g. required field missing at the schema level)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Mongoose cast errors (e.g. malformed ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
  }

  // Do not leak internal details for unexpected 500 errors
  if (statusCode === 500) {
    message = 'Something went wrong on the server. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
