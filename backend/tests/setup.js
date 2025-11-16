// Jest setup file
// This file runs before all tests

// Suppress console output in tests for cleaner test output
// Suppress handler logs but keep actual test failures visible
const originalError = console.error;
const originalLog = console.log;

// Filter out handler error logs (expected during error testing)
console.error = (...args) => {
  const errorString = args[0]?.toString() || '';
  // Suppress handler error logs, but show actual test failures
  if (errorString.includes('Error in') && errorString.includes('handler:')) {
    return; // Suppress handler error logs
  }
  originalError(...args);
};

// Suppress all console.log (debug/info messages from handlers)
console.log = jest.fn();

// Suppress console.debug, console.info, console.warn
global.console = {
  ...console,
  log: console.log, // Use the mocked log function
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error, // Use the filtered error function above
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.TASKS_TABLE = 'tasks-test';
process.env.PROJECTS_TABLE = 'projects-test';
process.env.AWS_REGION = 'eu-north-1';

