# Quick Test Reference Card

## Common Commands

### Run Tests
```bash
make test          # Run all tests once
make tw            # Watch mode (auto-rerun)
make tc            # With coverage
make test-ui       # Interactive UI
```

### Debug
```bash
make test-debug    # Debug mode (port 9229)
# Or press F5 in VS Code
```

### Coverage
```bash
make test-cov           # Generate coverage
make coverage-open      # Open in browser
```

### Mutation Testing
```bash
make tm                 # Run mutation tests
make mutation-report    # View results
```

### Single File
```bash
make test-single FILE=tests/auth.test.ts
# or
pnpm exec vitest run tests/auth.test.ts
```

## Test File Structure

```
tests/
├── setup.ts              # Global setup
├── auth.test.ts          # Authentication (127 tests)
├── trpc.test.ts          # tRPC integration (85 tests)
├── api-handler.test.ts   # API endpoints (62 tests)
└── utils.test.ts         # Utilities (95 tests)

Total: 369 tests
```

## Writing Tests Template

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

## Makefile Shortcuts

| Command | Full Command | Description |
|---------|--------------|-------------|
| `make t` | `make test` | Run tests |
| `make tw` | `make test-watch` | Watch mode |
| `make tc` | `make test-cov` | Coverage |
| `make tm` | `make test-mutation` | Mutation |
| `make d` | `make dev` | Dev server |
| `make b` | `make build` | Build |

## Coverage Targets

- Lines: **70%**
- Functions: **70%**
- Branches: **70%**
- Statements: **70%**
- Mutation Score: **80%**

## VS Code Debugging

1. Set breakpoint in test
2. Press **F5**
3. Select "Debug Tests"
4. Step through with F10/F11

## Useful Vitest Patterns

```typescript
// Skip a test
it.skip('not ready', () => { /* ... */ });

// Only run this test
it.only('focus on this', () => { /* ... */ });

// Test async code
it('async test', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Test errors
it('should throw', () => {
  expect(() => badFunction()).toThrow();
});

// Mock functions
import { vi } from 'vitest';
const mock = vi.fn(() => 'mocked');
```

## Environment Variables

Tests use these defaults (from `tests/setup.ts`):
- `NODE_ENV=test`
- `JWT_SECRET=test-secret-key-for-testing-only`
- `DATABASE_URL=postgresql://test:test@localhost:5432/test`

## CI/CD

Tests run automatically on:
- Push to main/develop
- Pull requests
- Manual workflow dispatch

See: `.github/workflows/test.yml`

## Documentation

- **Full Guide**: `docs/TESTING.md`
- **Test README**: `tests/README.md`
- **Setup Summary**: `TEST_SETUP_SUMMARY.md`
- **All Commands**: `make help`

## Quick Troubleshooting

```bash
# Tests failing?
make clean && make install

# Coverage not generating?
pnpm add -D @vitest/coverage-v8

# Mutation tests not working?
pnpm add -D @stryker-mutator/core \
  @stryker-mutator/vitest-runner \
  @stryker-mutator/typescript-checker
```

## Help

```bash
make help          # Show all commands
pnpm exec vitest --help  # Vitest options
```

---

**Start testing**: `make test` 🧪
