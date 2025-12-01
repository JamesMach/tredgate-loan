import { test, expect } from '@playwright/test'
import { AppPage } from '../pages/AppPage'
import { TEST_DATA } from '../fixtures/textLibrary'

test.describe('Loan Application - Basic Functionality', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await test.step('Open application and setup fresh state', async () => {
      await app.open()
      await app.setupFreshState()
    })
  })

  test('should display the application with all components', async () => {
    await test.step('Verify all main components are visible', async () => {
      await app.verifyAllComponentsVisible()
    })

    await test.step('Verify empty state', async () => {
      await app.loanList.verifyEmptyState()
      await app.loanSummary.verifyInitialState()
    })
  })

  test('should create a new loan application successfully', async ({ page }) => {
    await test.step('Fill and submit loan form', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.VALID_LOAN)
    })

    await test.step('Verify form is cleared after submission', async () => {
      await app.loanForm.verifyFormCleared()
    })

    await test.step('Verify loan appears in the list', async () => {
      await app.loanList.verifyTableVisible()
      await app.loanList.verifyLoanCount(1)
      await app.loanList.verifyLoanExists(TEST_DATA.VALID_LOAN.applicantName)
    })

    await test.step('Verify loan details are correct', async () => {
      await app.loanList.verifyLoanDetails(TEST_DATA.VALID_LOAN)
    })

    await test.step('Verify loan status is pending', async () => {
      await app.loanList.verifyLoanStatus(TEST_DATA.VALID_LOAN.applicantName, 'pending')
    })

    await test.step('Verify summary statistics updated', async () => {
      await app.loanSummary.verifyAllStats({
        total: 1,
        pending: 1,
        approved: 0,
        rejected: 0,
        totalApprovedAmount: 0
      })
    })
  })

  test('should create multiple loan applications', async ({ page }) => {
    const loans = [TEST_DATA.VALID_LOAN, TEST_DATA.SMALL_LOAN, TEST_DATA.LARGE_LOAN]

    for (let i = 0; i < loans.length; i++) {
      await test.step(`Create loan application ${i + 1}`, async () => {
        await app.loanForm.submitLoanApplication(loans[i])
      })
    }

    await test.step('Verify all loans appear in the list', async () => {
      await app.loanList.verifyLoanCount(3)
      
      for (const loan of loans) {
        await app.loanList.verifyLoanExists(loan.applicantName)
      }
    })

    await test.step('Verify summary statistics', async () => {
      await app.loanSummary.verifyAllStats({
        total: 3,
        pending: 3,
        approved: 0,
        rejected: 0,
        totalApprovedAmount: 0
      })
    })
  })

  test('should persist data in localStorage', async ({ page }) => {
    await test.step('Create a loan application', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.VALID_LOAN)
    })

    await test.step('Reload page', async () => {
      await page.reload()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    })

    await test.step('Verify loan still exists after reload', async () => {
      await app.loanList.verifyLoanCount(1)
      await app.loanList.verifyLoanExists(TEST_DATA.VALID_LOAN.applicantName)
      await app.loanSummary.verifyTotalCount(1)
    })
  })
})
