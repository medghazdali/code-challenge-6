const { success, error, badRequest, notFound, createResponse } = require('../../../lib/response');

describe('Response Helper Functions', () => {
  describe('createResponse', () => {
    it('should create a response with default headers', () => {
      const response = createResponse(200, { message: 'Success' });
      
      expect(response.statusCode).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(response.headers['Access-Control-Allow-Headers']).toContain('Content-Type');
      expect(response.headers['Access-Control-Allow-Methods']).toContain('GET');
      expect(JSON.parse(response.body)).toEqual({ message: 'Success' });
    });

    it('should merge custom headers with default headers', () => {
      const customHeaders = { 'X-Custom-Header': 'custom-value' };
      const response = createResponse(200, { data: 'test' }, customHeaders);
      
      expect(response.headers['X-Custom-Header']).toBe('custom-value');
      expect(response.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('success', () => {
    it('should create a success response with default status 200', () => {
      const response = success({ message: 'Success' });
      
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ message: 'Success' });
    });

    it('should create a success response with custom status code', () => {
      const response = success({ id: '123' }, 201);
      
      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual({ id: '123' });
    });

    it('should include CORS headers', () => {
      const response = success({ data: 'test' });
      
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });
  });

  describe('error', () => {
    it('should create an error response with default status 500', () => {
      const response = error('Internal server error');
      
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({ error: 'Internal server error' });
    });

    it('should create an error response with custom status code', () => {
      const response = error('Not found', 404);
      
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({ error: 'Not found' });
    });

    it('should include CORS headers', () => {
      const response = error('Error message');
      
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });
  });

  describe('badRequest', () => {
    it('should create a 400 bad request response', () => {
      const response = badRequest('Invalid input');
      
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({ error: 'Invalid input' });
    });

    it('should use default message if not provided', () => {
      const response = badRequest();
      
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({ error: 'Bad request' });
    });
  });

  describe('notFound', () => {
    it('should create a 404 not found response', () => {
      const response = notFound('Resource not found');
      
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({ error: 'Resource not found' });
    });

    it('should use default message if not provided', () => {
      const response = notFound();
      
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({ error: 'Resource not found' });
    });
  });
});

