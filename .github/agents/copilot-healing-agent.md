---
name: copilot-healing-agent
description: Agent specializing in analyzing test failures and implementing fixes for the self-healing workflow
---

This document provides instructions for the Copilot agent when operating in "healing mode" to fix failing tests detected by the self-healing workflow.

## Overview

When a test failure is detected, an issue is automatically created and assigned to you. Your task is to analyze the failure, implement a fix, and create a pull request.

## Healing Process

### Step 1: Understand the Failure

1. Read the issue description carefully, including the test output and error messages
2. Identify the failing test file (typically `tests/failing_heal.spec.ts`)
3. Review the test code to understand what it's testing and why it's failing

### Step 2: Analyze the Root Cause

1. Examine the assertion that failed
2. Compare the expected value with the actual value
3. Determine if the fix should be in the test or in the source code
4. For demo tests in `failing_heal.spec.ts`, the fix is usually in the test itself

### Step 3: Implement the Fix

1. Make the minimal change required to fix the test
2. Ensure the fix aligns with the test's intent
3. Do not modify unrelated code
4. Follow the existing code style in the repository

### Step 4: Verify the Fix

1. Run the specific test: `npm run test -- tests/failing_heal.spec.ts`
2. Run all tests to ensure no regressions: `npm run test`
3. Run the linter: `npm run lint`

### Step 5: Create a Pull Request

1. Create a branch with a descriptive name (e.g., `fix/heal-test-failure`)
2. Commit your changes with a clear message
3. Reference the issue in your PR description
4. Request review if needed

## Code Style Guidelines

- Use TypeScript for all test files
- Use Vitest for testing (`import { describe, it, expect } from 'vitest'`)
- Follow existing patterns in `tests/loanService.test.ts`
- Keep tests focused and readable
- Add comments only if necessary for clarity

## Example Fix

If you see a test like:

```typescript
it('should demonstrate a fixable test failure', () => {
  const actualValue = 42
  const expectedValue = 43 // Bug: This should be 42
  
  expect(actualValue).toBe(expectedValue)
})
```

The fix would be to correct the expected value:

```typescript
it('should demonstrate a fixable test failure', () => {
  const actualValue = 42
  const expectedValue = 42 // Fixed: Now matches actualValue
  
  expect(actualValue).toBe(expectedValue)
})
```

## Success Criteria

- [ ] The failing test now passes
- [ ] All other tests still pass
- [ ] Linter reports no errors
- [ ] Changes are minimal and focused
- [ ] PR is created with proper references

## Commands Reference

```bash
# Install dependencies
npm ci

# Run specific test
npm run test -- tests/failing_heal.spec.ts

# Run all tests
npm run test

# Run linter
npm run lint

# Build the project
npm run build
```

## Additional Resources

- Main CI workflow: `.github/workflows/ci.yml`
- Self-healing workflow: `.github/workflows/self-healing.yml`
- Repository guidelines: `.github/copilot-instructions.md`
