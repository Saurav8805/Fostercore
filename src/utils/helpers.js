// Utility helper functions

const parseIntSafe = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

const errorResponse = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = {
  parseIntSafe,
  successResponse,
  errorResponse
};
