# Tests

This directory contains comprehensive test suites for the Portal da Lembrança backend.

## Test Files

### `setup.ts`
Global test setup and configuration. Initializes test environment variables and mocks.

### `auth.test.ts`
Authentication and security tests:
- Password hashing (bcrypt)
- Session management
- OpenID generation and parsing
- Email validation
- Password strength validation
- Token generation and expiry
- Invitation tokens

### `trpc.test.ts`
tRPC framework integration tests:
- Error handling (UNAUTHORIZED, FORBIDDEN, BAD_REQUEST)
- Context creation with/without authentication
- Middleware behavior (public, protected, admin procedures)
- SuperJSON serialization (Date, Map, Set, undefined)
- Input validation with Zod
- Cookie handling

### `api-handler.test.ts`
Vercel serverless API handler tests:
- CORS configuration
- Request/response conversion
- Error handling and logging
- Header management
- Preflight OPTIONS requests

### `utils.test.ts`
Utility function tests:
- Slug generation
- Date formatting and calculations
- String utilities (capitalize, truncate, sanitize)
- Array utilities (chunk, unique, groupBy)
- Object utilities (clone, pick, omit)
- Validation utilities
- Number utilities (currency, clamp, random)

## Running Tests

```bash
# Quick commands
make test          # Run all tests
make test-watch    # Watch mode
make test-cov      # With coverage
make test-mutation # Mutation testing

# Detailed commands
pnpm test                      # Run once
pnpm test:watch                # Watch mode
pnpm test:ui                   # UI interface
pnpm test:cov                  # With coverage
pnpm test:mutation             # Mutation tests

# Run specific test file
pnpm exec vitest run tests/auth.test.ts

# Run tests matching pattern
pnpm exec vitest run -t "authentication"
```

## Writing New Tests

1. Create new test file: `tests/your-feature.test.ts`

2. Follow the AAA pattern:
```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange - Setup
    const input = 'test';

    // Act - Execute
    const result = yourFunction(input);

    // Assert - Verify
    expect(result).toBe('expected');
  });
});
```

3. Use descriptive test names that explain behavior
4. Test edge cases and error conditions
5. Keep tests focused and fast
6. Mock external dependencies

## Test Coverage

Current coverage targets:
- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

View coverage report:
```bash
make test-cov
make coverage-open  # Opens HTML report
```

## Mutation Testing

Mutation testing validates test quality by introducing code mutations:

```bash
make test-mutation
```

Target mutation score: **80%+**

## Debugging Tests

```bash
# Debug with Node inspector
make test-debug

# Run single test in debug mode
node --inspect-brk ./node_modules/.bin/vitest run tests/auth.test.ts
```

## Best Practices

1. **Descriptive Names**: Use clear, behavior-focused test names
2. **Isolation**: Each test should be independent
3. **One Thing**: Test one behavior per test
4. **Fast**: Keep tests fast by mocking external services
5. **Coverage**: Aim for edge cases and error paths
6. **Maintenance**: Update tests when behavior changes

## Test Statistics

```bash
# View test count and duration
pnpm test

# Example output:
# Test Files  4 passed (4)
#      Tests  127 passed (127)
#   Duration  2.34s
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Push to main branch
- Pre-deployment checks

```bash
# Run CI test suite locally
make ci-test
```

## Additional Resources

- Full testing guide: [../docs/TESTING.md](../docs/TESTING.md)
- Vitest docs: https://vitest.dev/
- Stryker mutator: https://stryker-mutator.io/
