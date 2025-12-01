# Testing Workflow - Quick Agent Reference

> **Read this at the start of every session**

## Critical Rules for AI Agents

### 1. ALWAYS Check for Tests Before Modifying Code

```bash
# If you're modifying: src/actions/payment.ts
# First read: src/actions/payment.test.ts
```

### 2. ALWAYS Update Tests When Changing Behavior

```typescript
// If you change a function signature or behavior:
// - Update existing tests
// - Add new tests for new functionality
// - Run tests before completing: npm test -- path/to/file.test.ts
```

### 3. ALWAYS Add Tests for New Code

```typescript
// New function = New test file
// New feature = New test cases
// No exceptions!
```

### 4. Test Patterns You Must Follow

#### Mock Hoisting (Critical!)

```typescript
// ✅ CORRECT - Use vi.hoisted() for all mocks
const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

// ❌ WRONG - Will cause initialization errors
const mockAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth,
}));
```

#### Database Mocking

```typescript
import { mockDb, mockReset } from '@/test/mocks/db';

beforeEach(() => {
  mockReset(); // REQUIRED - Reset all mocks
  vi.clearAllMocks();
});

// Mock successful response
mockDb.product.findUnique.mockResolvedValue({ id: 'prod_123' });

// Mock error
mockDb.product.findUnique.mockRejectedValue(new Error('DB error'));
```

#### Test Structure

```typescript
describe('functionName', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress errors
  });

  it('succeeds with valid input', async () => { /* ... */ });
  it('returns error when not authenticated', async () => { /* ... */ });
  it('validates required fields', async () => { /* ... */ });
  it('handles database errors', async () => { /* ... */ });
});
```

## When Tests Fail - Decision Tree

```
Test fails after your changes
    ↓
Did you intentionally change behavior?
    ↓
YES → Update test to match new behavior
NO  → Fix your code, the test found a bug!
```

## Test Commands

```bash
# Run specific test
npm test -- src/actions/payment.test.ts

# Run all tests
npm test

# Watch mode (auto-rerun)
npm test -- --watch

# E2E tests
npm run test:e2e
```

## Automated Test Runs

- **Pre-commit**: Tests for changed files only (automatic)
- **Pre-push**: All unit tests (automatic, ~3 sec)
- **GitHub CI**: All tests on PRs (automatic, ~8 min)

## Your Checklist Before Completing Work

- [ ] All modified files have tests
- [ ] All new functions have tests
- [ ] `npm test` passes locally
- [ ] Tests use `vi.hoisted()` for mocks
- [ ] Tests call `mockReset()` in `beforeEach()`
- [ ] Console errors are suppressed
- [ ] Test descriptions are clear

## Current Test Stats

- **Total**: 517 tests (493 unit + 24 E2E)
- **Unit Test Speed**: ~3 seconds
- **Coverage**: Server actions, components, utilities
- **Config**: `vitest.config.ts`, `playwright.config.ts`

## Full Documentation

See [TESTING.md](../../TESTING.md) for complete guide.

---

**Remember**: Tests are not optional. They protect production and save debugging time.
