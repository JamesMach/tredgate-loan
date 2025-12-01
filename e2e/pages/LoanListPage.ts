import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { TEXTS } from '../fixtures/textLibrary'
import { formatCurrency, formatPercent } from '../helpers/testHelpers'

/**
 * Page Object for Loan List Component
 * Handles interactions with the loan applications table
 */
export class LoanListPage extends BasePage {
  // Locators
  private readonly listHeading: Locator
  private readonly emptyState: Locator
  private readonly table: Locator
  private readonly tableRows: Locator

  constructor(page: Page) {
    super(page)
    
    this.listHeading = this.getByRole('heading', { name: TEXTS.LIST_TITLE })
    this.emptyState = this.getByText(TEXTS.EMPTY_STATE)
    this.table = this.page.locator('table')
    this.tableRows = this.table.locator('tbody tr')
  }

  /**
   * Verify list is visible
   */
  async verifyListVisible(): Promise<void> {
    await this.assertVisible(this.listHeading, 'List heading')
  }

  /**
   * Verify empty state is shown
   */
  async verifyEmptyState(): Promise<void> {
    await this.assertVisible(this.emptyState, 'Empty state message')
    await this.assertNotVisible(this.table, 'Table')
  }

  /**
   * Verify table is shown (not empty)
   */
  async verifyTableVisible(): Promise<void> {
    await this.assertVisible(this.table, 'Loan applications table')
    await this.assertNotVisible(this.emptyState, 'Empty state')
  }

  /**
   * Get number of loan rows
   */
  async getLoanCount(): Promise<number> {
    return await this.tableRows.count()
  }

  /**
   * Verify loan count
   */
  async verifyLoanCount(expectedCount: number): Promise<void> {
    await this.assertCount(this.tableRows, expectedCount, 'Loan rows')
  }

  /**
   * Get row for specific applicant
   */
  private getRowByApplicantName(applicantName: string): Locator {
    return this.page.locator(`tr:has-text("${applicantName}")`)
  }

  /**
   * Verify loan exists in the list
   */
  async verifyLoanExists(applicantName: string): Promise<void> {
    const row = this.getRowByApplicantName(applicantName)
    await this.assertVisible(row, `Loan row for ${applicantName}`)
  }

  /**
   * Verify loan details in the table
   */
  async verifyLoanDetails(loanData: {
    applicantName: string
    amount: number
    termMonths: number
    interestRate: number
    monthlyPayment?: number
  }): Promise<void> {
    const row = this.getRowByApplicantName(loanData.applicantName)
    await this.assertVisible(row, `Loan row for ${loanData.applicantName}`)
    
    // Verify amount
    const formattedAmount = formatCurrency(loanData.amount)
    await expect(row, `Amount should be ${formattedAmount}`).toContainText(formattedAmount)
    
    // Verify term
    await expect(row, `Term should be ${loanData.termMonths} mo`).toContainText(`${loanData.termMonths} mo`)
    
    // Verify interest rate
    const formattedRate = formatPercent(loanData.interestRate)
    await expect(row, `Interest rate should be ${formattedRate}`).toContainText(formattedRate)
    
    // Verify monthly payment if provided
    if (loanData.monthlyPayment) {
      const formattedPayment = formatCurrency(loanData.monthlyPayment)
      await expect(row, `Monthly payment should be ${formattedPayment}`).toContainText(formattedPayment)
    }
  }

  /**
   * Verify loan status
   */
  async verifyLoanStatus(applicantName: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    const row = this.getRowByApplicantName(applicantName)
    const statusBadge = row.locator(`.status-badge.status-${status}`)
    await this.assertVisible(statusBadge, `Status badge for ${applicantName}`)
    await this.assertContainsText(statusBadge, status, `Status badge text for ${applicantName}`)
  }

  /**
   * Get approve button for loan
   */
  private getApproveButton(applicantName: string): Locator {
    const row = this.getRowByApplicantName(applicantName)
    return row.locator('button.action-btn.success[title="Approve"]')
  }

  /**
   * Get reject button for loan
   */
  private getRejectButton(applicantName: string): Locator {
    const row = this.getRowByApplicantName(applicantName)
    return row.locator('button.action-btn.danger[title="Reject"]')
  }

  /**
   * Get auto-decide button for loan
   */
  private getAutoDecideButton(applicantName: string): Locator {
    const row = this.getRowByApplicantName(applicantName)
    return row.locator('button.action-btn.secondary[title="Auto-decide"]')
  }

  /**
   * Get delete button for loan
   */
  private getDeleteButton(applicantName: string): Locator {
    const row = this.getRowByApplicantName(applicantName)
    return row.locator('button.action-btn.danger[title="Delete"]').last()
  }

  /**
   * Click approve button for loan
   */
  async clickApprove(applicantName: string): Promise<void> {
    const button = this.getApproveButton(applicantName)
    await button.click()
  }

  /**
   * Click reject button for loan
   */
  async clickReject(applicantName: string): Promise<void> {
    const button = this.getRejectButton(applicantName)
    await button.click()
  }

  /**
   * Click auto-decide button for loan
   */
  async clickAutoDecide(applicantName: string): Promise<void> {
    const button = this.getAutoDecideButton(applicantName)
    await button.click()
  }

  /**
   * Click delete button for loan (handles confirmation dialog)
   */
  async clickDelete(applicantName: string): Promise<void> {
    // Set up dialog handler before clicking
    this.page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure')
      await dialog.accept()
    })
    
    const button = this.getDeleteButton(applicantName)
    await button.click()
    
    // Wait for the loan to be removed
    await this.page.waitForTimeout(500)
  }

  /**
   * Verify action buttons are visible for pending loan
   */
  async verifyPendingActionButtons(applicantName: string): Promise<void> {
    await this.assertVisible(this.getApproveButton(applicantName), `Approve button for ${applicantName}`)
    await this.assertVisible(this.getRejectButton(applicantName), `Reject button for ${applicantName}`)
    await this.assertVisible(this.getAutoDecideButton(applicantName), `Auto-decide button for ${applicantName}`)
    await this.assertVisible(this.getDeleteButton(applicantName), `Delete button for ${applicantName}`)
  }

  /**
   * Verify action buttons are not visible for approved/rejected loan
   */
  async verifyNoActionButtons(applicantName: string): Promise<void> {
    const row = this.getRowByApplicantName(applicantName)
    await this.assertNotVisible(this.getApproveButton(applicantName), `Approve button for ${applicantName}`)
    await this.assertNotVisible(this.getRejectButton(applicantName), `Reject button for ${applicantName}`)
    await this.assertNotVisible(this.getAutoDecideButton(applicantName), `Auto-decide button for ${applicantName}`)
    
    // Delete button should still be visible
    await this.assertVisible(this.getDeleteButton(applicantName), `Delete button for ${applicantName}`)
    
    // Verify "—" is shown
    await expect(row, 'No-actions indicator should be visible').toContainText('—')
  }

  // ============================================
  // Grouped Actions (with test.step)
  // ============================================

  /**
   * Approve loan and verify status change
   */
  async approveLoanAndVerify(applicantName: string): Promise<void> {
    await this.clickApprove(applicantName)
    await this.page.waitForTimeout(300) // Wait for status update
    await this.verifyLoanStatus(applicantName, 'approved')
  }

  /**
   * Reject loan and verify status change
   */
  async rejectLoanAndVerify(applicantName: string): Promise<void> {
    await this.clickReject(applicantName)
    await this.page.waitForTimeout(300) // Wait for status update
    await this.verifyLoanStatus(applicantName, 'rejected')
  }

  /**
   * Auto-decide loan and verify status change
   */
  async autoDecideLoanAndVerify(applicantName: string, expectedStatus: 'approved' | 'rejected'): Promise<void> {
    await this.clickAutoDecide(applicantName)
    await this.page.waitForTimeout(300) // Wait for status update
    await this.verifyLoanStatus(applicantName, expectedStatus)
  }

  /**
   * Delete loan and verify it's removed
   */
  async deleteLoanAndVerify(applicantName: string): Promise<void> {
    const initialCount = await this.getLoanCount()
    
    await this.clickDelete(applicantName)
    await this.page.waitForTimeout(300) // Wait for deletion
    
    const newCount = await this.getLoanCount()
    expect(newCount, 'Loan count should decrease by 1').toBe(initialCount - 1)
    
    // Verify loan is not in the list
    const row = this.getRowByApplicantName(applicantName)
    await this.assertNotVisible(row, `Loan row for ${applicantName}`)
  }
}
