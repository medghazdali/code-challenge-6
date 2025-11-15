// Standardized API response helper functions

const createResponse = (statusCode, body, headers = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };

  return {
    statusCode,
    headers: { ...defaultHeaders, ...headers },
    body: JSON.stringify(body),
  };
};

const success = (data, statusCode = 200) => {
  return createResponse(statusCode, data);
};

const error = (message, statusCode = 500) => {
  return createResponse(statusCode, { error: message });
};

const notFound = (message = 'Resource not found') => {
  return error(message, 404);
};

const badRequest = (message = 'Bad request') => {
  return error(message, 400);
};

module.exports = {
  createResponse,
  success,
  error,
  notFound,
  badRequest,
};

