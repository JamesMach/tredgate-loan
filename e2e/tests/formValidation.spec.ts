import { test } from '@playwright/test'
import { AppPage } from '../pages/AppPage'
import { TEST_DATA } from '../fixtures/textLibrary'

test.describe('Loan Application - Form Validation and Edge Cases', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await test.step('Open application and setup fresh state', async () => {
      await app.open()
      await app.setupFreshState()
    })
  })

  test('should accept zero interest rate (edge case)', async () => {
    await test.step('Submit loan with zero interest rate', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.ZERO_INTEREST)
    })

    await test.step('Verify loan was created', async () => {
      await app.loanList.verifyLoanCount(1)
      await app.loanList.verifyLoanExists(TEST_DATA.ZERO_INTEREST.applicantName)
    })

    await test.step('Verify no error is shown', async () => {
      await app.loanForm.verifyNoError()
    })
  })

  test('should accept maximum valid values', async () => {
    await test.step('Submit loan with maximum values', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.MAX_VALUES)
    })

    await test.step('Verify loan was created', async () => {
      await app.loanList.verifyLoanCount(1)
      await app.loanList.verifyLoanExists(TEST_DATA.MAX_VALUES.applicantName)
    })
  })

  test('should accept valid loan application', async () => {
    await test.step('Submit valid loan', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.VALID_LOAN)
    })

    await test.step('Verify loan was created', async () => {
      await app.loanList.verifyLoanCount(1)
      await app.loanList.verifyLoanExists(TEST_DATA.VALID_LOAN.applicantName)
    })

    await test.step('Verify form was cleared', async () => {
      await app.loanForm.verifyFormCleared()
    })
  })

  test('should accept small loan application', async () => {
    await test.step('Submit small loan', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.SMALL_LOAN)
    })

    await test.step('Verify loan was created', async () => {
      await app.loanList.verifyLoanCount(1)
      await app.loanList.verifyLoanExists(TEST_DATA.SMALL_LOAN.applicantName)
    })
  })

  test('should accept large loan application', async () => {
    await test.step('Submit large loan', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.LARGE_LOAN)
    })

    await test.step('Verify loan was created', async () => {
      await app.loanList.verifyLoanCount(1)
      await app.loanList.verifyLoanExists(TEST_DATA.LARGE_LOAN.applicantName)
    })
  })
})
