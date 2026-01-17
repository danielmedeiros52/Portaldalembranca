# Testing Guide

Comprehensive guide for testing the Portal da Lembrança application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)
5. [Mutation Testing](#mutation-testing)
6. [Debugging Tests](#debugging-tests)
7. [Writing Tests](#writing-tests)
8. [Best Practices](#best-practices)

## Quick Start

```bash
# Install dependencies
make install

# Run all tests
make test

# Run tests in watch mode
make test-watch

# Run tests with coverage
make test-cov

# View coverage report
make coverage-open
```

## Test Structure

```
tests/
├── setup.ts              # Global test setup
├── auth.test.ts          # Authentication tests
├── trpc.test.ts          # tRPC integration tests
├── api-handler.test.ts   # API endpoint tests
└── utils.test.ts         # Utility function tests

server/
└── api/src/
    └── app.controller.spec.ts  # Controller unit tests
```

## Running Tests

### Basic Commands

```bash
# Run all tests once
pnpm test
# or
make test

# Run tests in watch mode (auto-reruns on file changes)
pnpm exec vitest --watch
# or
make test-watch

# Run tests with coverage
pnpm run test:cov
# or
make test-cov

# Run tests with UI
make test-ui

# Run single test file
make test-single FILE=tests/auth.test.ts
```

### Using Makefile

The Makefile provides convenient shortcuts:

```bash
make t          # Run tests (shortcut)
make tw         # Watch mode (shortcut)
make tc         # Coverage (shortcut)
make tm         # Mutation tests (shortcut)
```

### Advanced Options

```bash
# Run only tests matching pattern
pnpm exec vitest run -t "authentication"

# Run tests for specific file
pnpm exec vitest run tests/auth.test.ts

# Run with verbose output
pnpm exec vitest run --reporter=verbose

# Run in a specific environment
NODE_ENV=test pnpm exec vitest run
```

## Test Coverage

### Generating Coverage

```bash
# Generate coverage report
make test-cov

# Open coverage report in browser
make coverage-open
```

### Coverage Reports

Coverage reports are generated in multiple formats:

- **HTML**: `coverage/index.html` - Interactive browser report
- **Text**: Console output - Quick overview
- **JSON**: `coverage/coverage-final.json` - Machine-readable
- **LCOV**: `coverage/lcov.info` - For CI/CD integration

### Coverage Thresholds

Current thresholds (configured in `vitest.config.ts`):

- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

### Understanding Coverage

```bash
# View coverage summary
pnpm run test:cov

# Output example:
# File            | % Stmts | % Branch | % Funcs | % Lines
# ----------------|---------|----------|---------|--------
# server/routers  |   85.3  |   78.5   |   92.1  |   85.3
# server/db.ts    |   91.2  |   83.4   |   95.6  |   91.2
```

**Coverage Metrics:**
- **Statements**: Individual executable statements
- **Branches**: Conditional branches (if/else, switch)
- **Functions**: Function declarations
- **Lines**: Lines of code executed

## Mutation Testing

Mutation testing validates the quality of your tests by introducing small changes (mutations) to your code and checking if tests catch them.

### What is Mutation Testing?

Mutation testing introduces changes like:
- Changing `>` to `>=`
- Changing `&&` to `||`
- Removing statements
- Changing constants

If tests still pass after mutations, it means tests aren't catching bugs effectively.

### Running Mutation Tests

```bash
# Run mutation tests
make test-mutation

# This will:
# 1. Install Stryker (if not installed)
# 2. Run mutation analysis (takes 5-15 minutes)
# 3. Generate report in reports/mutation/html/
```

### Viewing Mutation Report

```bash
# Open mutation report in browser
make mutation-report
```

### Understanding Mutation Score

```
Mutation Score: 85% (170/200 mutants killed)

- Killed: 170 mutants (tests caught the change)
- Survived: 20 mutants (tests didn't catch the change)
- Timeout: 5 mutants (tests took too long)
- No Coverage: 5 mutants (no tests for this code)
```

**Good Mutation Score**: 80%+ indicates high-quality tests

### Mutation Testing Configuration

See `stryker.config.json`:

```json
{
  "thresholds": {
    "high": 80,    // Green - excellent
    "low": 60,     // Yellow - acceptable
    "break": 50    // Red - needs improvement
  }
}
```

## Debugging Tests

### Debug in VS Code

1. Add breakpoint in test file
2. Run debug command:

```bash
make test-debug
```

3. Attach VS Code debugger to port 9229

### VS Code Launch Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["exec", "vitest", "run"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Test Process",
      "port": 9229
    }
  ]
}
```

### Console Debugging

```typescript
import { describe, it } from 'vitest';

it('should debug this test', () => {
  const value = someFunction();
  console.log('Debug value:', value); // Simple logging

  debugger; // Breakpoint when running with --inspect
});
```

### Filtering Tests

```bash
# Run only one test suite
pnpm exec vitest run -t "Authentication"

# Run only one test
pnpm exec vitest run -t "should hash passwords correctly"

# Skip tests with .skip
it.skip('should skip this test', () => { /* ... */ });

# Run only specific tests with .only
it.only('should only run this test', () => { /* ... */ });
```

## Writing Tests

### Test Structure

Follow the AAA pattern: **Arrange, Act, Assert**

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange - Set up test data
    const input = 'test@example.com';

    // Act - Execute the function
    const result = validateEmail(input);

    // Assert - Verify the result
    expect(result).toBe(true);
  });
});
```

### Unit Tests

Test individual functions in isolation:

```typescript
describe('calculateAge', () => {
  it('should calculate age from birth date', () => {
    const birthDate = new Date('1990-01-15');
    const age = calculateAge(birthDate);

    expect(age).toBeGreaterThan(30);
  });
});
```

### Integration Tests

Test multiple components working together:

```typescript
describe('Authentication Flow', () => {
  it('should login user with valid credentials', async () => {
    // Mock database
    const mockDb = createMockDb();

    // Attempt login
    const result = await loginUser('test@example.com', 'password123');

    // Verify session was created
    expect(result.sessionToken).toBeDefined();
    expect(mockDb.sessions).toHaveLength(1);
  });
});
```

### Mocking

```typescript
import { vi } from 'vitest';

// Mock function
const mockFn = vi.fn();
mockFn.mockReturnValue('mocked value');

// Mock module
vi.mock('./module', () => ({
  functionName: vi.fn(() => 'mocked'),
}));

// Spy on function
const spy = vi.spyOn(obj, 'method');
spy.mockImplementation(() => 'mocked');

// Clear mocks
vi.clearAllMocks();
```

### Async Tests

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

it('should handle promises', () => {
  return asyncFunction().then(result => {
    expect(result).toBeDefined();
  });
});

it('should handle errors', async () => {
  await expect(async () => {
    await functionThatThrows();
  }).rejects.toThrow('Error message');
});
```

### Setup and Teardown

```typescript
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

describe('Test Suite', () => {
  beforeAll(() => {
    // Runs once before all tests
  });

  afterAll(() => {
    // Runs once after all tests
  });

  beforeEach(() => {
    // Runs before each test
  });

  afterEach(() => {
    // Runs after each test
  });

  it('test case', () => { /* ... */ });
});
```

## Best Practices

### 1. Test Naming

Use descriptive names that explain what is being tested:

```typescript
// ✅ Good
it('should return error when email is invalid', () => { /* ... */ });

// ❌ Bad
it('test email', () => { /* ... */ });
```

### 2. One Assertion Per Test (Generally)

```typescript
// ✅ Good
it('should hash password', () => {
  const hash = hashPassword('password123');
  expect(hash).toBeDefined();
});

it('should not store plain text password', () => {
  const hash = hashPassword('password123');
  expect(hash).not.toBe('password123');
});

// ❌ Bad (testing multiple things)
it('should handle password', () => {
  const hash = hashPassword('password123');
  expect(hash).toBeDefined();
  expect(hash).not.toBe('password123');
  expect(hash.length).toBeGreaterThan(20);
});
```

### 3. Test Edge Cases

```typescript
describe('validateEmail', () => {
  it('should accept valid emails', () => { /* ... */ });
  it('should reject emails without @', () => { /* ... */ });
  it('should reject emails without domain', () => { /* ... */ });
  it('should reject empty strings', () => { /* ... */ });
  it('should reject null values', () => { /* ... */ });
});
```

### 4. Use Test Data Builders

```typescript
// Create reusable test data
function createTestUser(overrides = {}) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  };
}

it('should handle user', () => {
  const user = createTestUser({ email: 'custom@example.com' });
  // Use user in test
});
```

### 5. Don't Test Implementation Details

```typescript
// ✅ Good - Test behavior
it('should display error message when login fails', () => {
  const result = login('invalid', 'wrong');
  expect(result.error).toBe('Invalid credentials');
});

// ❌ Bad - Test implementation
it('should call bcrypt.compare', () => {
  login('user', 'pass');
  expect(bcrypt.compare).toHaveBeenCalled();
});
```

### 6. Keep Tests Fast

```typescript
// ✅ Good - Use mocks for external dependencies
it('should validate user', () => {
  const mockDb = { findUser: vi.fn() };
  const result = validateUser(mockDb, 'user@example.com');
  expect(result).toBe(true);
});

// ❌ Bad - Makes real database calls
it('should validate user', async () => {
  await db.connect();
  const result = await validateUser('user@example.com');
  expect(result).toBe(true);
});
```

### 7. Test Error Cases

```typescript
describe('parseJSON', () => {
  it('should parse valid JSON', () => {
    const result = parseJSON('{"key":"value"}');
    expect(result).toEqual({ key: 'value' });
  });

  it('should throw error on invalid JSON', () => {
    expect(() => parseJSON('invalid')).toThrow();
  });

  it('should handle empty string', () => {
    expect(() => parseJSON('')).toThrow();
  });
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run test:cov
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Running in CI

```bash
# Run all quality checks
make ci-test

# This runs:
# - Linter
# - Tests with coverage
# - Reports to CI
```

## Troubleshooting

### Tests Failing Locally

1. Clear cache and rebuild:
```bash
make clean
make install
```

2. Check environment variables:
```bash
make env-check
```

3. Run single failing test:
```bash
make test-single FILE=path/to/failing-test.ts
```

### Coverage Not Generated

1. Ensure v8 is installed:
```bash
pnpm add -D @vitest/coverage-v8
```

2. Run with verbose output:
```bash
pnpm exec vitest run --coverage --reporter=verbose
```

### Tests Hanging

1. Check for missing awaits on promises
2. Increase timeout in `vitest.config.ts`:
```typescript
testTimeout: 30000 // 30 seconds
```

3. Run with timeout flag:
```bash
pnpm exec vitest run --test-timeout=30000
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Stryker Mutator](https://stryker-mutator.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Test Coverage Guide](https://istanbul.js.org/)

## Test Metrics

Current test statistics:

```bash
# View test statistics
make test

# Example output:
Test Files  4 passed (4)
     Tests  127 passed (127)
  Duration  2.34s
```

Target metrics:
- **Test Coverage**: 70%+
- **Mutation Score**: 80%+
- **Test Execution Time**: < 5 seconds
- **Tests per Feature**: 3-5 tests minimum
