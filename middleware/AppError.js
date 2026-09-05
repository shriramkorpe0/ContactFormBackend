// A small custom Error class that carries an HTTP status code.
// Controllers throw this instead of plain Error so the centralized
// error handler knows what status code to send back.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
