// Jest setup file
// This file runs before all tests

// Suppress console output in tests for cleaner test output
// Suppress handler logs but keep actual test failures visible
const originalError = console.error;
const originalLog = console.log;

// Filter out handler error logs (expected during error testing)
console.error = (...args) => {
  // Safely convert args to string to avoid circular reference issues
  try {
    const errorString = String(args[0] || '');
    // Suppress handler error logs, but show actual test failures
    if (errorString.includes('Error in') && errorString.includes('handler:')) {
      return; // Suppress handler error logs
    }
    // For other errors, safely stringify to avoid circular references
    const safeArgs = args.map(arg => {
      if (arg === null || arg === undefined) {
        return String(arg);
      }
      if (typeof arg === 'object') {
        try {
          // Use a replacer function to handle circular references
          const seen = new WeakSet();
          return JSON.stringify(arg, (key, val) => {
            if (val != null && typeof val === 'object') {
              if (seen.has(val)) {
                return '[Circular]';
              }
              seen.add(val);
            }
            return val;
          }, 2);
        } catch (e) {
          return '[Object - cannot stringify]';
        }
      }
      return String(arg);
    });
    originalError(...safeArgs);
  } catch (e) {
    // If anything fails, just skip logging to avoid breaking tests
    return;
  }
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

