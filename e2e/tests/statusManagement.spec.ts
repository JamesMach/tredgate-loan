import { test } from '@playwright/test'
import { AppPage } from '../pages/AppPage'
import { TEST_DATA } from '../fixtures/textLibrary'

test.describe('Loan Application - Status Management', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await test.step('Open application and setup fresh state', async () => {
      await app.open()
      await app.setupFreshState()
    })

    await test.step('Create a test loan', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.VALID_LOAN)
    })
  })

  test('should approve a pending loan', async () => {
    await test.step('Verify pending action buttons are visible', async () => {
      await app.loanList.verifyPendingActionButtons(TEST_DATA.VALID_LOAN.applicantName)
    })

    await test.step('Approve the loan', async () => {
      await app.loanList.approveLoanAndVerify(TEST_DATA.VALID_LOAN.applicantName)
    })

    await test.step('Verify action buttons are hidden after approval', async () => {
      await app.loanList.verifyNoActionButtons(TEST_DATA.VALID_LOAN.applicantName)
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

  test('should reject a pending loan', async () => {
    await test.step('Reject the loan', async () => {
      await app.loanList.rejectLoanAndVerify(TEST_DATA.VALID_LOAN.applicantName)
    })

    await test.step('Verify action buttons are hidden after rejection', async () => {
      await app.loanList.verifyNoActionButtons(TEST_DATA.VALID_LOAN.applicantName)
    })

    await test.step('Verify summary statistics updated', async () => {
      await app.loanSummary.verifyAllStats({
        total: 1,
        pending: 0,
        approved: 0,
        rejected: 1,
        totalApprovedAmount: 0
      })
    })
  })

  test('should delete a loan application', async () => {
    await test.step('Delete the loan', async () => {
      await app.loanList.deleteLoanAndVerify(TEST_DATA.VALID_LOAN.applicantName)
    })

    await test.step('Verify list shows empty state', async () => {
      await app.loanList.verifyEmptyState()
    })

    await test.step('Verify summary statistics reset to zero', async () => {
      await app.loanSummary.verifyInitialState()
    })
  })

  test('should delete an approved loan', async () => {
    await test.step('Approve the loan first', async () => {
      await app.loanList.approveLoanAndVerify(TEST_DATA.VALID_LOAN.applicantName)
    })

    await test.step('Verify approved amount in summary', async () => {
      await app.loanSummary.verifyTotalApprovedAmount(TEST_DATA.VALID_LOAN.amount)
    })

    await test.step('Delete the approved loan', async () => {
      await app.loanList.deleteLoanAndVerify(TEST_DATA.VALID_LOAN.applicantName)
    })

    await test.step('Verify summary updated correctly', async () => {
      await app.loanSummary.verifyInitialState()
    })
  })

  test('should handle multiple loan status changes', async () => {
    await test.step('Create additional loans', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.SMALL_LOAN)
      await app.loanForm.submitLoanApplication(TEST_DATA.LARGE_LOAN)
    })

    await test.step('Verify initial state - 3 pending loans', async () => {
      await app.loanList.verifyLoanCount(3)
      await app.loanSummary.verifyAllStats({
        total: 3,
        pending: 3,
        approved: 0,
        rejected: 0,
        totalApprovedAmount: 0
      })
    })

    await test.step('Approve first loan', async () => {
      await app.loanList.approveLoanAndVerify(TEST_DATA.VALID_LOAN.applicantName)
    })

    await test.step('Verify stats after first approval', async () => {
      await app.loanSummary.verifyAllStats({
        total: 3,
        pending: 2,
        approved: 1,
        rejected: 0,
        totalApprovedAmount: TEST_DATA.VALID_LOAN.amount
      })
    })

    await test.step('Reject second loan', async () => {
      await app.loanList.rejectLoanAndVerify(TEST_DATA.SMALL_LOAN.applicantName)
    })

    await test.step('Verify stats after rejection', async () => {
      await app.loanSummary.verifyAllStats({
        total: 3,
        pending: 1,
        approved: 1,
        rejected: 1,
        totalApprovedAmount: TEST_DATA.VALID_LOAN.amount
      })
    })

    await test.step('Approve third loan', async () => {
      await app.loanList.approveLoanAndVerify(TEST_DATA.LARGE_LOAN.applicantName)
    })

    await test.step('Verify final stats', async () => {
      await app.loanSummary.verifyAllStats({
        total: 3,
        pending: 0,
        approved: 2,
        rejected: 1,
        totalApprovedAmount: TEST_DATA.VALID_LOAN.amount + TEST_DATA.LARGE_LOAN.amount
      })
    })
  })
})
