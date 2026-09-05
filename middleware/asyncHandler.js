// Express does not automatically catch errors thrown inside async functions.
// Wrapping a controller with asyncHandler means any rejected promise or thrown
// error is passed to next(), which sends it to our centralized errorHandler
// instead of crashing the server or hanging the request.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
