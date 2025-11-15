module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/integration/'],
  collectCoverageFrom: [
    'handlers/**/*.js',
    'lib/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 30000, // 30 seconds for integration tests (they make real API calls)
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  maxWorkers: process.env.RUN_INTEGRATION_TESTS ? 1 : '50%', // Run integration tests sequentially
};

