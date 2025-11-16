# Testing Setup and Troubleshooting Guide

## Installation Required

Before running tests, you need to install the testing dependencies:

### Backend
```bash
cd backend
npm install
```

This will install:
- `aws-sdk-client-mock` - For mocking AWS SDK clients
- `supertest` - For API testing
- `artillery` - For load testing

### Frontend
```bash
cd frontend
npm install
```

This will install:
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interaction simulation
- `jest` and `jest-environment-jsdom` - Test runner and environment

## Running Tests

### Backend Tests

**Unit Tests Only:**
```bash
cd backend
npm run test:unit
```

**All Tests (Unit + Integration):**
```bash
cd backend
npm test
```

**With Coverage:**
```bash
cd backend
npm run test:coverage
```

**Integration Tests (requires running server):**
```bash
cd backend
TEST_API_URL=http://localhost:3000 npm run test:integration
```

**Load Tests (requires running server):**
```bash
cd backend
npm run test:load
```

### Frontend Tests

**Run all tests:**
```bash
cd frontend
npm test
```

**Watch mode:**
```bash
cd frontend
npm run test:watch
```

**With coverage:**
```bash
cd frontend
npm run test:coverage
```

## Test Structure

### Backend
- `tests/unit/lib/` - Unit tests for library functions
- `tests/unit/handlers/` - Unit tests for Lambda handlers
- `tests/integration/api/` - Integration tests (skipped by default, require running server)
- `tests/load/` - Load testing scenarios

### Frontend
- `__tests__/lib/` - Utility function tests
- `__tests__/hooks/` - React hook tests
- `__tests__/components/` - Component tests

## Common Issues and Fixes

### Issue 1: "Cannot find module 'aws-sdk-client-mock'"
**Solution:** Run `npm install` in the backend directory

### Issue 2: Integration tests failing
**Solution:** Integration tests are skipped by default. To run them:
1. Start the backend server: `cd backend && npm run dev`
2. Run: `TEST_API_URL=http://localhost:3000 npm run test:integration`

### Issue 3: Frontend tests failing with axios mock errors
**Solution:** The axios mock has been fixed. Make sure you've run `npm install` in the frontend directory.

### Issue 4: "Maximum call stack size exceeded" in frontend tests
**Solution:** This was caused by a circular dependency in the axios mock. It has been fixed by removing the separate mock file and mocking axios directly in test files.

## Test Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** Cover all critical user flows
- **Component Tests:** Test user interactions and state changes

## Notes

- Integration tests are marked as `describe.skip()` by default since they require a running server
- Load tests require Artillery to be installed and a running server
- All unit tests should pass without any external dependencies

