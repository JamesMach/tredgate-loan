# Playwright E2E Testing Documentation

## Overview

This document describes the End-to-End (E2E) testing strategy, setup, and usage for the Tredgate Loan application using **Playwright**. The implementation follows industry best practices including the **Page Object Model (POM)** pattern, test isolation, deterministic tests, and clear, readable test code.

## Test Framework

- **Framework**: Playwright v1.57+
- **Test Runner**: Playwright Test
- **Browser**: Chromium (can be extended to Firefox and WebKit)
- **Pattern**: Page Object Model (POM)
- **Reporting**: HTML, JSON, and console list reporter

## Getting Started

### Installation

All testing dependencies are already included in `package.json`. To install:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install chromium
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# View HTML test report
npm run test:e2e:report
```

## Project Structure

```
e2e/
├── fixtures/           # Test data and constants
│   └── textLibrary.ts      # Centralized text constants and test data
├── helpers/            # Helper utilities
│   └── testHelpers.ts      # Utility functions for testing
├── pages/              # Page Object Model implementation
│   ├── BasePage.ts         # Base page object with common functionality
│   ├── AppPage.ts          # Main app page object (composition)
│   ├── LoanFormPage.ts     # Loan form component page object
│   ├── LoanListPage.ts     # Loan list component page object
│   └── LoanSummaryPage.ts  # Loan summary component page object
└── tests/              # Test specifications
    ├── basicFunctionality.spec.ts   # Basic CRUD operations
    ├── formValidation.spec.ts       # Form validation and edge cases
    ├── statusManagement.spec.ts     # Loan status workflows
    └── autoDecisionLogic.spec.ts    # Auto-decision business rules
```

## Architecture

### Page Object Model (POM)

The tests use the Page Object Model pattern to:
- **Separate test logic from page structure**: Tests describe what to do, page objects describe how
- **Improve maintainability**: UI changes require updates in one place
- **Increase readability**: Tests read like user stories
- **Enable reusability**: Page methods can be composed

#### BasePage

The `BasePage` class provides common functionality used by all page objects:
- Navigation methods
- Element interaction utilities
- Custom assertions with descriptive error messages
- Wait helpers

#### Component Page Objects

Each Vue component has a corresponding page object:

**LoanFormPage**
- Atomic methods: `fillApplicantName()`, `fillAmount()`, `clickSubmit()`
- Grouped actions: `submitLoanApplication()`, `fillLoanForm()`
- Verification methods: `verifyErrorMessage()`, `verifyFormCleared()`

**LoanListPage**
- Atomic methods: `clickApprove()`, `clickReject()`, `clickAutoDecide()`
- Grouped actions: `approveLoanAndVerify()`, `deleteLoanAndVerify()`
- Verification methods: `verifyLoanStatus()`, `verifyLoanDetails()`

**LoanSummaryPage**
- Verification methods: `verifyTotalCount()`, `verifyApprovedCount()`, `verifyAllStats()`

**AppPage**
- Composition of all component page objects
- App-level navigation and setup
- Fresh state initialization

### Test.Step Usage

As per best practices, `test.step()` is used ONLY in:
- **Grouped action methods** in page objects (e.g., `submitLoanApplication`)
- **Test scenarios** for high-level test flow description

Atomic methods in page objects do NOT use `test.step()` to avoid excessive nesting.

### Text Library

All text constants and test data are centralized in `fixtures/textLibrary.ts`:
- **No hardcoded strings** in tests or page objects
- Easy to update when UI text changes
- Supports internationalization
- Contains comprehensive test data sets

## Test Coverage

### Test Suites

#### 1. Basic Functionality (4 tests)
- ✅ Display application with all components
- ✅ Create single loan application
- ✅ Create multiple loan applications
- ✅ Persist data in localStorage

#### 2. Form Validation and Edge Cases (5 tests)
- ✅ Accept zero interest rate
- ✅ Accept maximum valid values
- ✅ Accept valid loan applications
- ✅ Accept small loan applications
- ✅ Accept large loan applications

#### 3. Status Management (5 tests)
- ✅ Approve pending loan
- ✅ Reject pending loan
- ✅ Delete loan application
- ✅ Delete approved loan
- ✅ Handle multiple loan status changes

#### 4. Auto-Decision Logic (6 tests)
- ✅ Auto-approve qualifying loans (≤ $100k AND ≤ 60 months)
- ✅ Auto-reject non-qualifying loans
- ✅ Boundary testing at $100,000 / 60 months
- ✅ Boundary testing just over limit
- ✅ Multiple auto-decisions
- ✅ Persist auto-decision results

**Total: 20 E2E tests**

## Test Best Practices

### 1. Isolation

Each test is fully isolated:
- `beforeEach` hook clears localStorage and resets state
- Tests don't depend on each other
- Can run in any order or in parallel

### 2. Deterministic

Tests produce consistent results:
- No random data in tests (predefined test data sets)
- Proper waits for async operations
- No flaky timeouts

### 3. Readable

Tests are easy to understand:
```typescript
test('should approve a pending loan', async () => {
  await test.step('Create a test loan', async () => {
    await app.loanForm.submitLoanApplication(TEST_DATA.VALID_LOAN)
  })
  
  await test.step('Approve the loan', async () => {
    await app.loanList.approveLoanAndVerify(TEST_DATA.VALID_LOAN.applicantName)
  })
  
  await test.step('Verify summary statistics updated', async () => {
    await app.loanSummary.verifyAllStats({
      total: 1,
      pending: 0,
      approved: 1,
      rejected: 0,
      totalApprovedAmount: TEST_DATA.VALID_LOAN.amount
    })
  })
})
```

### 4. Custom Error Messages

All assertions include custom messages for easy debugging:
```typescript
await expect(locator, `Loan row for ${applicantName} should be visible`).toBeVisible()
```

### 5. Locator Strategy

Locators prioritize stability:
1. **Preferred**: Semantic HTML roles and labels
   - `page.getByRole('button', { name: 'Create Application' })`
   - `page.getByLabel('Applicant Name')`
2. **Alternative**: CSS classes (when unique)
   - `.stat-card.approved`
3. **Fallback**: Text content (when no better option)
   - `page.getByText('Total Applications')`

**Note**: The component currently lacks test IDs. For production, consider adding `data-testid` attributes.

### 6. No Logic in Tests

Business logic is in helper functions, not tests:
```typescript
// Good: Helper function calculates expected result
const monthlyPayment = calculateMonthlyPayment(amount, term, rate)

// Bad: Calculation in test
const monthlyPayment = amount * ((rate / 12) * Math.pow(1 + rate / 12, term)) / (Math.pow(1 + rate / 12, term) - 1)
```

## Configuration

### Playwright Config (`playwright.config.ts`)

Key settings:
- **Test directory**: `./e2e`
- **Base URL**: `http://localhost:5173`
- **Retries**: 2 (on CI only)
- **Parallel**: Yes (1 worker on CI)
- **Reporters**: HTML, JSON, List
- **Web server**: Auto-starts dev server

### CI Integration

The configuration is CI-ready:
- Automatically starts the dev server
- Retries failed tests
- Generates HTML and JSON reports
- Captures screenshots and videos on failure
- Traces on first retry

## Continuous Integration

To add Playwright tests to CI:

```yaml
# .github/workflows/ci.yml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run Playwright tests
  run: npm run test:e2e

- name: Upload Playwright report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Tests

### Visual Debugging

```bash
# Run tests in UI mode
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug -- basicFunctionality.spec.ts
```

### Analyze Failures

When a test fails, Playwright automatically captures:
- **Screenshot** at the point of failure
- **Video** of the entire test
- **Trace** (on retry) for detailed inspection

View the trace:
```bash
npx playwright show-trace test-results/.../trace.zip
```

### Common Issues

**Issue**: Tests timeout waiting for element  
**Solution**: Check if element selector is correct, verify element exists in DOM

**Issue**: Flaky tests  
**Solution**: Add proper waits, ensure state is reset in `beforeEach`

**Issue**: Form validation tests fail  
**Solution**: HTML5 validation may prevent submission; tests are designed to work with browser validation

## Writing New Tests

### Test Template

```typescript
import { test } from '@playwright/test'
import { AppPage } from '../pages/AppPage'
import { TEST_DATA } from '../fixtures/textLibrary'

test.describe('Feature Name', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await test.step('Open application and setup fresh state', async () => {
      await app.open()
      await app.setupFreshState()
    })
  })

  test('should perform specific action', async () => {
    await test.step('Step 1: Do something', async () => {
      // Test code
    })
    
    await test.step('Step 2: Verify result', async () => {
      // Verification code
    })
  })
})
```

### Adding New Page Objects

1. Extend `BasePage`
2. Define locators in constructor
3. Create atomic methods for basic actions
4. Create grouped methods for common workflows
5. Add verification methods with custom assertions
6. Use text library for all text constants

## Performance

Test execution times:
- **Single test**: ~2-3 seconds
- **Full suite (20 tests)**: ~60 seconds
- **Parallel execution**: Can be faster on multi-core machines

## Summary

| Metric | Value |
|--------|-------|
| Total Test Files | 4 |
| Total Tests | 20 |
| Test Coverage | All main user workflows |
| Framework | Playwright v1.57+ |
| Pattern | Page Object Model |
| Browser | Chromium |
| Reporters | HTML + JSON + List |

All tests follow best practices for:
- ✅ Isolation and independence
- ✅ Readability and maintainability
- ✅ Deterministic execution
- ✅ Clear error messages
- ✅ Proper locator strategies
- ✅ No logic in tests
- ✅ Comprehensive coverage

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Debugging Tests](https://playwright.dev/docs/debug)
