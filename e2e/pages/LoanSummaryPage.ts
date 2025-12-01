import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { TEXTS } from '../fixtures/textLibrary'
import { formatCurrencyNoCents } from '../helpers/testHelpers'

/**
 * Page Object for Loan Summary Component
 * Handles interactions with the statistics summary cards
 */
export class LoanSummaryPage extends BasePage {
  // Locators - using stat labels to find cards
  private readonly totalCard: Locator
  private readonly pendingCard: Locator
  private readonly approvedCard: Locator
  private readonly rejectedCard: Locator
  private readonly totalApprovedAmountCard: Locator

  constructor(page: Page) {
    super(page)
    
    // Find stat cards by their label text - must be exact match to avoid ambiguity
    this.totalCard = this.page.locator('.stat-card').filter({ has: this.page.locator('.stat-label:has-text("Total Applications")') })
    this.pendingCard = this.page.locator('.stat-card').filter({ has: this.page.locator('.stat-label:has-text("Pending")') })
    this.approvedCard = this.page.locator('.stat-card.approved')
    this.rejectedCard = this.page.locator('.stat-card.rejected')
    this.totalApprovedAmountCard = this.page.locator('.stat-card.amount')
  }

  /**
   * Get stat value from a card
   */
  private async getStatValue(card: Locator): Promise<string> {
    const valueElement = card.locator('.stat-value')
    return await valueElement.textContent() || ''
  }

  /**
   * Verify summary cards are visible
   */
  async verifySummaryVisible(): Promise<void> {
    await this.assertVisible(this.totalCard, 'Total Applications card')
    await this.assertVisible(this.pendingCard, 'Pending card')
    await this.assertVisible(this.approvedCard, 'Approved card')
    await this.assertVisible(this.rejectedCard, 'Rejected card')
    await this.assertVisible(this.totalApprovedAmountCard, 'Total Approved Amount card')
  }

  /**
   * Verify total applications count
   */
  async verifyTotalCount(expectedCount: number): Promise<void> {
    const value = await this.getStatValue(this.totalCard)
    expect(value, `Total applications should be ${expectedCount}`).toBe(expectedCount.toString())
  }

  /**
   * Verify pending count
   */
  async verifyPendingCount(expectedCount: number): Promise<void> {
    const value = await this.getStatValue(this.pendingCard)
    expect(value, `Pending count should be ${expectedCount}`).toBe(expectedCount.toString())
  }

  /**
   * Verify approved count
   */
  async verifyApprovedCount(expectedCount: number): Promise<void> {
    const value = await this.getStatValue(this.approvedCard)
    expect(value, `Approved count should be ${expectedCount}`).toBe(expectedCount.toString())
  }

  /**
   * Verify rejected count
   */
  async verifyRejectedCount(expectedCount: number): Promise<void> {
    const value = await this.getStatValue(this.rejectedCard)
    expect(value, `Rejected count should be ${expectedCount}`).toBe(expectedCount.toString())
  }

  /**
   * Verify total approved amount
   */
  async verifyTotalApprovedAmount(expectedAmount: number): Promise<void> {
    const value = await this.getStatValue(this.totalApprovedAmountCard)
    const formattedAmount = formatCurrencyNoCents(expectedAmount)
    expect(value, `Total approved amount should be ${formattedAmount}`).toBe(formattedAmount)
  }

  /**
   * Verify all statistics match expected values
   */
  async verifyAllStats(stats: {
    total: number
    pending: number
    approved: number
    rejected: number
    totalApprovedAmount: number
  }): Promise<void> {
    await this.verifyTotalCount(stats.total)
    await this.verifyPendingCount(stats.pending)
    await this.verifyApprovedCount(stats.approved)
    await this.verifyRejectedCount(stats.rejected)
    await this.verifyTotalApprovedAmount(stats.totalApprovedAmount)
  }

  /**
   * Verify initial state (all zeros)
   */
  async verifyInitialState(): Promise<void> {
    await this.verifyAllStats({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalApprovedAmount: 0
    })
  }

  // ============================================
  // Grouped Actions (with test.step)
  // ============================================

  /**
   * Wait for statistics to update after action
   */
  async waitForStatsUpdate(): Promise<void> {
    await this.page.waitForTimeout(300)
  }
}
