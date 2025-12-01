/**
 * Helper utilities for E2E tests
 */

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

/**
 * Format a number as currency without cents
 */
export function formatCurrencyNoCents(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * Format a decimal as percentage
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

/**
 * Calculate monthly payment for a loan
 * Formula: M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
 * where:
 *   M = Monthly payment
 *   P = Principal (loan amount)
 *   r = Monthly interest rate (annual rate / 12)
 *   n = Number of payments (term in months)
 */
export function calculateMonthlyPayment(
  amount: number,
  termMonths: number,
  interestRate: number
): number {
  if (interestRate === 0) {
    return amount / termMonths
  }

  const monthlyRate = interestRate / 12
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths)
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1
  
  return amount * (numerator / denominator)
}

/**
 * Determine if a loan should be auto-approved based on business rules
 * Auto-approved if: amount <= $100,000 AND term <= 60 months
 */
export function shouldAutoApprove(amount: number, termMonths: number): boolean {
  return amount <= 100000 && termMonths <= 60
}

/**
 * Wait for a specific duration
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a unique applicant name for testing
 */
export function generateApplicantName(prefix = 'Test User'): string {
  const timestamp = Date.now()
  return `${prefix} ${timestamp}`
}

/**
 * Clear localStorage in the browser context
 */
export async function clearLocalStorage(page: any): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear()
  })
}

/**
 * Get localStorage data from browser context
 */
export async function getLocalStorage(page: any, key: string): Promise<any> {
  return await page.evaluate((storageKey: string) => {
    const data = localStorage.getItem(storageKey)
    return data ? JSON.parse(data) : null
  }, key)
}
