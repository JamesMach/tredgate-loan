# Testing Documentation

## Overview

This document describes the testing strategy, setup, and usage for the Tredgate Loan application. The application uses **Vitest** (a modern, fast testing framework) instead of Jest, as it's better suited for Vue 3 and Vite projects.

## Test Framework

- **Framework**: Vitest v4.0+
- **Test Runner**: Vitest with jsdom environment
- **Component Testing**: @vue/test-utils
- **Coverage**: Vitest built-in coverage with v8 provider
- **HTML Reporting**: Vitest HTML reporter

## Getting Started

### Installation

All testing dependencies are already included in `package.json`. To install:

```bash
npm install
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Test Structure

### Directory Layout

```
tests/
├── components/           # Vue component tests
│   ├── App.test.ts
│   ├── LoanForm.test.ts
│   ├── LoanList.test.ts
│   └── LoanSummary.test.ts
└── loanService.test.ts  # Service/business logic tests
```

### Test Coverage

All application features are covered by tests:

#### 1. **Service Layer** (`tests/loanService.test.ts`)
- ✅ Loading loans from localStorage
- ✅ Saving loans to localStorage  
- ✅ Creating new loan applications with validation
- ✅ Updating loan status
- ✅ Calculating monthly payments
- ✅ Auto-decision logic
- ✅ Error handling and edge cases

#### 2. **LoanForm Component** (`tests/components/LoanForm.test.ts`)
- ✅ Form rendering and fields
- ✅ Input validation (applicant name, amount, term, interest rate)
- ✅ Form submission
- ✅ Event emission on successful creation
- ✅ Error handling and display
- ✅ Form reset after submission

#### 3. **LoanList Component** (`tests/components/LoanList.test.ts`)
- ✅ Empty state display
- ✅ Loan data rendering
- ✅ Currency and date formatting
- ✅ Monthly payment calculation display
- ✅ Status badges
- ✅ Action buttons (approve, reject, auto-decide)
- ✅ Event emission for user actions

#### 4. **LoanSummary Component** (`tests/components/LoanSummary.test.ts`)
- ✅ Statistics calculation (total, pending, approved, rejected)
- ✅ Total approved amount calculation
- ✅ Reactive updates when data changes
- ✅ Edge cases (empty data, all pending, etc.)

#### 5. **App Component** (`tests/components/App.test.ts`)
- ✅ Component integration
- ✅ Data flow between components
- ✅ Event handling
- ✅ State management
- ✅ Lifecycle hooks (onMounted)

## Test Reports

### HTML Report

After running tests, an HTML report is generated at `test-results/index.html`.

To view the report:

```bash
# Run tests to generate the report
npm test

# View the report in browser
npx vite preview --outDir test-results
```

The HTML report provides:
- Visual test results with pass/fail status
- Test execution time
- Detailed error messages for failures
- Test file organization

### JSON Report

A machine-readable JSON report is generated at `test-results/results.json` for CI/CD integration.

## Test Best Practices

### 1. Isolation

Each test is isolated using:
- `beforeEach` hooks to reset state
- Mock functions (`vi.fn()`) for external dependencies
- localStorage mock for service tests

### 2. Mocking

**Service Mocking Example:**
```typescript
vi.mock('../../src/services/loanService', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    createLoanApplication: vi.fn()
  }
})
```

**localStorage Mock:**
```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn()
}
```

### 3. Readable Tests

Tests follow the AAA pattern:
- **Arrange**: Set up test data and mocks
- **Act**: Execute the functionality
- **Assert**: Verify the results

### 4. Descriptive Names

Test names clearly describe what is being tested:
```typescript
it('shows error for empty applicant name', async () => {
  // Test implementation
})
```

## Writing New Tests

### Component Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import YourComponent from '../../src/components/YourComponent.vue'

describe('YourComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(YourComponent, {
      props: { /* your props */ }
    })
    
    expect(wrapper.find('.some-element').exists()).toBe(true)
  })
})
```

### Service Test Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { yourFunction } from '../src/services/yourService'

describe('yourService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('performs expected operation', () => {
    const result = yourFunction(input)
    expect(result).toBe(expected)
  })
})
```

## Continuous Integration

Tests are automatically run on all pull requests to the `main` branch via GitHub Actions.

The CI workflow:
1. Installs dependencies
2. Runs linter
3. Executes all tests
4. Generates HTML report
5. Uploads report as artifact
6. Provides test summary in workflow output

See `.github/workflows/ci.yml` for the full workflow configuration.

## Troubleshooting

### Tests Failing Locally

1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear test cache:**
   ```bash
   npm test -- --clearCache
   ```

### Mock Issues

If mocks aren't working as expected:
- Ensure `vi.clearAllMocks()` is called in `beforeEach`
- Use partial mocking with `importOriginal` when you need real implementations
- Check that mock return values match expected types

### Component Tests Failing

- Ensure you `await wrapper.vm.$nextTick()` after state changes
- Use `mount` for full component rendering
- Check that props are correctly passed

## Configuration

### Vitest Configuration

See `vitest.config.ts` for:
- Test environment (jsdom)
- Global test utilities
- HTML and JSON reporters
- Excluded files

### Coverage Configuration

Coverage is configured to:
- Use v8 provider
- Generate text, HTML, and JSON reports
- Exclude test files, config files, and build artifacts

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Summary

| Metric | Value |
|--------|-------|
| Total Test Files | 5 |
| Total Tests | 97 |
| Test Coverage | All features covered |
| Framework | Vitest v4.0+ |
| Reporter | HTML + JSON |

All tests follow best practices for clean code, readability, and maintainability. Tests are isolated, use appropriate mocks, and provide clear, descriptive assertions.
