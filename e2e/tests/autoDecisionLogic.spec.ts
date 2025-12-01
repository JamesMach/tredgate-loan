import { test } from '@playwright/test'
import { AppPage } from '../pages/AppPage'
import { TEST_DATA } from '../fixtures/textLibrary'
import { shouldAutoApprove } from '../helpers/testHelpers'

test.describe('Loan Application - Auto-Decision Logic', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await test.step('Open application and setup fresh state', async () => {
      await app.open()
      await app.setupFreshState()
    })
  })

  test('should auto-approve loan that meets criteria (amount ≤ $100,000 AND term ≤ 60 months)', async () => {
    await test.step('Create a small loan that should be auto-approved', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.SMALL_LOAN)
    })

    await test.step('Click auto-decide button', async () => {
      await app.loanList.autoDecideLoanAndVerify(TEST_DATA.SMALL_LOAN.applicantName, 'approved')
    })

    await test.step('Verify summary statistics updated', async () => {
      await app.loanSummary.verifyAllStats({
        total: 1,
        pending: 0,
        approved: 1,
        rejected: 0,
        totalApprovedAmount: TEST_DATA.SMALL_LOAN.amount
      })
    })
  })

  test('should auto-reject loan that exceeds criteria', async () => {
    await test.step('Create a large loan that should be auto-rejected', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.LARGE_LOAN)
    })

    await test.step('Click auto-decide button', async () => {
      await app.loanList.autoDecideLoanAndVerify(TEST_DATA.LARGE_LOAN.applicantName, 'rejected')
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

  test('should auto-approve loan at exact boundary (amount = $100,000 AND term = 60 months)', async () => {
    await test.step('Create a loan at the approval boundary', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.BOUNDARY_APPROVE)
    })

    await test.step('Verify the loan should be auto-approved by business rules', async () => {
      const shouldApprove = shouldAutoApprove(
        TEST_DATA.BOUNDARY_APPROVE.amount,
        TEST_DATA.BOUNDARY_APPROVE.termMonths
      )
      test.expect(shouldApprove).toBe(true)
    })

    await test.step('Click auto-decide button', async () => {
      await app.loanList.autoDecideLoanAndVerify(TEST_DATA.BOUNDARY_APPROVE.applicantName, 'approved')
    })

    await test.step('Verify summary statistics', async () => {
      await app.loanSummary.verifyAllStats({
        total: 1,
        pending: 0,
        approved: 1,
        rejected: 0,
        totalApprovedAmount: TEST_DATA.BOUNDARY_APPROVE.amount
      })
    })
  })

  test('should auto-reject loan just over boundary (amount = $100,001 OR term = 61 months)', async () => {
    await test.step('Create a loan just over the boundary', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.BOUNDARY_REJECT)
    })

    await test.step('Verify the loan should be auto-rejected by business rules', async () => {
      const shouldApprove = shouldAutoApprove(
        TEST_DATA.BOUNDARY_REJECT.amount,
        TEST_DATA.BOUNDARY_REJECT.termMonths
      )
      test.expect(shouldApprove).toBe(false)
    })

    await test.step('Click auto-decide button', async () => {
      await app.loanList.autoDecideLoanAndVerify(TEST_DATA.BOUNDARY_REJECT.applicantName, 'rejected')
    })

    await test.step('Verify summary statistics', async () => {
      await app.loanSummary.verifyAllStats({
        total: 1,
        pending: 0,
        approved: 0,
        rejected: 1,
        totalApprovedAmount: 0
      })
    })
  })

  test('should handle auto-decision for multiple loans', async () => {
    const loansToCreate = [
      TEST_DATA.SMALL_LOAN,
      TEST_DATA.LARGE_LOAN,
      TEST_DATA.BOUNDARY_APPROVE,
      TEST_DATA.BOUNDARY_REJECT
    ]

    await test.step('Create multiple loans', async () => {
      for (const loan of loansToCreate) {
        await app.loanForm.submitLoanApplication(loan)
      }
    })

    await test.step('Verify all loans are pending', async () => {
      await app.loanList.verifyLoanCount(4)
      await app.loanSummary.verifyAllStats({
        total: 4,
        pending: 4,
        approved: 0,
        rejected: 0,
        totalApprovedAmount: 0
      })
    })

    // Auto-decide each loan and verify
    await test.step('Auto-decide SMALL_LOAN (should approve)', async () => {
      await app.loanList.autoDecideLoanAndVerify(TEST_DATA.SMALL_LOAN.applicantName, 'approved')
    })

    await test.step('Auto-decide LARGE_LOAN (should reject)', async () => {
      await app.loanList.autoDecideLoanAndVerify(TEST_DATA.LARGE_LOAN.applicantName, 'rejected')
    })

    await test.step('Auto-decide BOUNDARY_APPROVE (should approve)', async () => {
      await app.loanList.autoDecideLoanAndVerify(TEST_DATA.BOUNDARY_APPROVE.applicantName, 'approved')
    })

    await test.step('Auto-decide BOUNDARY_REJECT (should reject)', async () => {
      await app.loanList.autoDecideLoanAndVerify(TEST_DATA.BOUNDARY_REJECT.applicantName, 'rejected')
    })

    await test.step('Verify final statistics', async () => {
      const totalApproved = TEST_DATA.SMALL_LOAN.amount + TEST_DATA.BOUNDARY_APPROVE.amount
      
      await app.loanSummary.verifyAllStats({
        total: 4,
        pending: 0,
        approved: 2,
        rejected: 2,
        totalApprovedAmount: totalApproved
      })
    })
  })

  test('should persist auto-decision results after reload', async ({ page }) => {
    await test.step('Create and auto-decide a loan', async () => {
      await app.loanForm.submitLoanApplication(TEST_DATA.SMALL_LOAN)
      await app.loanList.autoDecideLoanAndVerify(TEST_DATA.SMALL_LOAN.applicantName, 'approved')
    })

    await test.step('Reload the page', async () => {
      await page.reload()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    })

    await test.step('Verify loan status persisted', async () => {
      await app.loanList.verifyLoanStatus(TEST_DATA.SMALL_LOAN.applicantName, 'approved')
      await app.loanSummary.verifyAllStats({
        total: 1,
        pending: 0,
        approved: 1,
        rejected: 0,
        totalApprovedAmount: TEST_DATA.SMALL_LOAN.amount
      })
    })
  })
})
