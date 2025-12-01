# Testing Guide for Evercraft

> **For AI Agents**: This document explains how testing works in this project. Read this at the start of your session to understand your testing responsibilities.

## 📋 Table of Contents

- [Quick Reference](#quick-reference)
- [Testing Infrastructure](#testing-infrastructure)
- [When Tests Run](#when-tests-run)
- [Writing Tests](#writing-tests)
- [Maintaining Tests](#maintaining-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [For AI Agents](#for-ai-agents)

---

## 🚀 Quick Reference

```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- src/actions/payment.test.ts

# Run tests in watch mode (auto-rerun on changes)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode (debug)
npm run test:e2e:ui
```

---

## 🏗️ Testing Infrastructure

### Test Suites

1. **Unit Tests** (Vitest)
   - Location: `src/**/*.test.ts(x)`
   - Count: 493 tests across 19 files
   - Speed: ~3 seconds
   - Coverage: Server actions, utilities, components

2. **E2E Tests** (Playwright)
   - Location: `tests/e2e/**/*.spec.ts`
   - Count: 24 tests across 3 files
   - Speed: ~90 seconds
   - Coverage: Critical user flows

### Test Configuration

- **Vitest Config**: `vitest.config.ts`
- **Playwright Config**: `playwright.config.ts`
- **Mock Database**: `src/test/mocks/db.ts`

---

## ⏰ When Tests Run

### 1. During Development (Manual)

Run tests manually while coding:

```bash
# Watch mode - tests auto-run when files change
npm test -- --watch src/actions/payment.test.ts
```

### 2. Pre-Commit Hook (Automatic)

**Trigger**: When you run `git commit`

**What Happens**:
- ✅ Runs ESLint on staged files
- ✅ Runs Prettier on staged files
- ✅ Runs tests for changed files only (fast!)

**Example**:
```bash
git add src/actions/payment.ts
git commit -m "feat: add gift wrapping"

# Automatically runs:
# 1. eslint src/actions/payment.ts
# 2. prettier src/actions/payment.ts
# 3. vitest run src/actions/payment.test.ts
```

**Speed**: < 5 seconds typically

### 3. Pre-Push Hook (Automatic)

**Trigger**: When you run `git push`

**What Happens**:
- ✅ Runs ALL unit tests (493 tests)
- ❌ Blocks push if any test fails

**Why**: Ensures all tests pass before code reaches remote

**Speed**: ~3 seconds for all unit tests

### 4. GitHub Actions CI/CD (Automatic)

**Trigger**: Pull requests and pushes to `main`

**What Happens**:
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ All unit tests (493 tests)
- ✅ All E2E tests (24 tests)
- ✅ Build check

**Result**: PR can't be merged if CI fails

---

## ✍️ Writing Tests

### File Naming Convention

```
src/actions/payment.ts          → Implementation
src/actions/payment.test.ts     → Unit tests
tests/e2e/checkout.spec.ts      → E2E tests
```

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import { myFunction } from './my-module';

// Mock external dependencies - use vi.hoisted() for proper hoisting
const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

describe('myFunction', () => {
  beforeEach(() => {
    mockReset(); // Reset all mocks
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress errors
  });

  it('succeeds with valid input', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' });
    mockDb.user.findUnique.mockResolvedValue({ id: 'user_123' });

    const result = await myFunction('input');

    expect(result.success).toBe(true);
    expect(mockDb.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user_123' }
    });
  });

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const result = await myFunction('input');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('handles database errors', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' });
    mockDb.user.findUnique.mockRejectedValue(new Error('DB error'));

    const result = await myFunction('input');

    expect(result.success).toBe(false);
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('user can complete action', async ({ page }) => {
    await page.goto('/page');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('header')).toBeVisible();

    await page.click('button[data-testid="action-button"]');
    await expect(page).toHaveURL(/success/);
  });
});
```

### Key Testing Patterns

#### 1. Mock Hoisting (Critical!)

```typescript
// ❌ WRONG - Will cause "Cannot access before initialization" error
const mockFunction = vi.fn();
vi.mock('./module', () => ({
  myFunction: mockFunction,
}));

// ✅ CORRECT - Use vi.hoisted()
const mockFunction = vi.hoisted(() => vi.fn());
vi.mock('./module', () => ({
  myFunction: mockFunction,
}));
```

#### 2. Database Mocking

```typescript
// Mock successful database call
mockDb.product.create.mockResolvedValue({ id: 'prod_123', title: 'Test' });

// Mock database error
mockDb.product.create.mockRejectedValue(new Error('Database error'));

// Mock transaction
mockDb.$transaction.mockImplementation(async (callback) => {
  const mockTx = {
    product: { create: vi.fn().mockResolvedValue({ id: 'prod_123' }) },
    order: { create: vi.fn().mockResolvedValue({ id: 'order_123' }) },
  };
  return callback(mockTx);
});
```

#### 3. Test Coverage Goals

- ✅ **Happy path** - Function succeeds with valid input
- ✅ **Authentication** - Handles unauthenticated users
- ✅ **Validation** - Rejects invalid input
- ✅ **Authorization** - Verifies user permissions
- ✅ **Error handling** - Handles database/network failures
- ✅ **Edge cases** - Empty arrays, null values, boundaries

---

## 🔧 Maintaining Tests

### When Code Changes Break Tests

Follow this decision tree:

#### Scenario A: You Changed Implementation (Feature Update)

**Example**: Added new required field to function

```typescript
// OLD
createProduct({ title, price })

// NEW
createProduct({ title, price, weight }) // Added weight
```

**What to do**:
1. ✅ Update tests to include new parameter
2. ✅ Add new tests for the new field
3. ✅ This is EXPECTED behavior

#### Scenario B: Test Caught a Real Bug

**Example**: Refactored payment calculation, test fails

```
❌ Expected total: $35.98, Got: $30.00
```

**What to do**:
1. ❌ DON'T change the test!
2. ✅ Fix your code - the test found a bug
3. ✅ Test saved you from shipping broken code

#### Scenario C: Business Requirements Changed

**Example**: Donation percentage changed from 5% to 10%

**What to do**:
1. ✅ Update test expectations to match new requirements
2. ✅ Update mock data
3. ✅ Document the requirement change

### Adding Tests for New Features

```bash
# 1. Implement feature
# 2. Write tests (before or after implementation)
# 3. Verify tests pass
npm test -- src/actions/my-feature.test.ts

# 4. Run all tests to ensure no regressions
npm test

# 5. Commit (tests run automatically)
git add .
git commit -m "feat: add new feature"

# 6. Push (all tests run automatically)
git push
```

---

## 🤖 CI/CD Pipeline

### GitHub Actions Workflow

Location: `.github/workflows/ci.yml`

#### Jobs

1. **Lint & Type Check** (~2 min)
   - ESLint
   - TypeScript type checking

2. **Unit Tests** (~1 min)
   - All 493 unit tests
   - Coverage report

3. **E2E Tests** (~3 min)
   - All 24 Playwright tests
   - Screenshot on failure

4. **Build Check** (~2 min)
   - Verifies production build succeeds

#### Viewing Results

1. Go to PR on GitHub
2. Scroll to bottom - see "All checks have passed" or "Some checks failed"
3. Click "Details" to see which job failed
4. View logs and fix issues

#### Skipping CI (Emergency Only)

```bash
git commit -m "docs: fix typo [skip ci]"
```

**Warning**: Only use for documentation changes!

---

## 🤖 For AI Agents

### Your Testing Responsibilities

When working on this project, you MUST:

#### 1. **Read Existing Tests First**

Before modifying any file, check if tests exist:

```bash
# If modifying src/actions/payment.ts, read:
src/actions/payment.test.ts
```

This shows you:
- Expected function behavior
- Edge cases to preserve
- Mock patterns to follow

#### 2. **Update Tests When Changing Code**

If you modify a function:
1. Update existing tests to match new behavior
2. Add new tests for new functionality
3. Ensure all tests pass before completing

```bash
# After making changes, always run:
npm test -- src/actions/payment.test.ts
```

#### 3. **Add Tests for New Code**

When creating new functions:
1. Create corresponding `.test.ts` file
2. Follow existing patterns in similar test files
3. Cover success, failure, and edge cases

#### 4. **Fix Failing Tests**

If tests fail:
1. **Understand WHY** - Don't blindly fix
2. **Determine** - Is it a bug or intentional change?
3. **Fix appropriately** - Code bug or test update

#### 5. **Document Test Changes**

In your summary, explain:
- What tests you updated and why
- What new tests you added
- Any test failures you encountered and resolved

### Testing Checklist for Agents

Before marking your work complete:

- [ ] All modified files have corresponding tests
- [ ] All new functions have tests
- [ ] All tests pass locally (`npm test`)
- [ ] Tests cover success, errors, validation, and edge cases
- [ ] Mock patterns follow existing conventions (vi.hoisted)
- [ ] Console errors are suppressed in tests
- [ ] Test descriptions are clear and descriptive

### Common Agent Mistakes to Avoid

❌ **Don't**: Change test expectations without understanding why they're failing
✅ **Do**: Investigate the failure, determine if it's a bug or intentional change

❌ **Don't**: Skip testing because "it's just a small change"
✅ **Do**: Test everything - small changes often have big impacts

❌ **Don't**: Copy-paste tests without understanding them
✅ **Do**: Read and understand the test patterns, then adapt them

❌ **Don't**: Leave console.log() statements in tests
✅ **Do**: Remove debug logs or mock console methods

❌ **Don't**: Forget to use vi.hoisted() for mock functions
✅ **Do**: Always use vi.hoisted() to avoid initialization errors

### Example Agent Workflow

```typescript
// 1. User asks you to add gift wrapping feature
// 2. You read existing payment.test.ts to understand patterns
// 3. You implement feature in payment.ts
// 4. You update payment.test.ts:

// Add new tests
it('adds gift wrapping fee when selected', async () => {
  const result = await createPaymentIntent({
    items: [mockCartItem],
    giftWrapping: true,
  });

  expect(result.total).toBe(35.99); // $30 product + $5.99 wrapping
});

// Update existing tests with new optional parameter
it('calculates total without gift wrapping', async () => {
  const result = await createPaymentIntent({
    items: [mockCartItem],
    giftWrapping: false, // ← Added to existing test
  });

  expect(result.total).toBe(30.00);
});

// 5. Run tests to verify
// 6. Commit (pre-commit hook runs tests automatically)
// 7. Report to user: "Added gift wrapping feature with 3 new tests,
//    updated 5 existing tests. All 496 tests passing."
```

---

## 📊 Current Test Stats

- **Unit Tests**: 493 tests across 19 files
- **E2E Tests**: 24 tests across 3 files
- **Total Coverage**: Core business logic, UI components, utilities
- **Test Speed**: ~3 seconds for all unit tests
- **CI Pipeline**: ~8 minutes total

---

## 🆘 Troubleshooting

### Tests Fail Locally But Not in CI

- Check Node.js version matches (20.x)
- Verify all dependencies installed (`npm ci`)
- Clear caches (`rm -rf node_modules/.vite`)

### Tests Timeout in E2E

- Increase timeout in `playwright.config.ts`
- Use `domcontentloaded` instead of `networkidle`
- Check for real performance issues

### Mock Hoisting Errors

```
Error: Cannot access 'mockFunction' before initialization
```

**Solution**: Use `vi.hoisted()`

```typescript
const mockFunction = vi.hoisted(() => vi.fn());
```

### Database Mock Not Working

**Solution**: Always call `mockReset()` in `beforeEach()`

```typescript
beforeEach(() => {
  mockReset(); // Resets all database mocks
  vi.clearAllMocks(); // Clears all other mocks
});
```

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Mock Patterns Guide](./docs/testing-patterns.md) ← Create this for advanced patterns

---

**Last Updated**: Session 36 - Testing Infrastructure Complete
**Total Tests**: 517 (493 unit + 24 E2E)
