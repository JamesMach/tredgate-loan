import { Page, Locator, expect } from '@playwright/test'

/**
 * Base Page Object with common functionality
 * All page objects should extend this class
 */
export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Navigate to the application
   */
  async goto(): Promise<void> {
    await this.page.goto('/')
  }

  /**
   * Wait for page to be loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get element by test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId)
  }

  /**
   * Get element by role
   */
  getByRole(role: any, options?: any): Locator {
    return this.page.getByRole(role, options)
  }

  /**
   * Get element by text
   */
  getByText(text: string | RegExp, options?: any): Locator {
    return this.page.getByText(text, options)
  }

  /**
   * Get element by label
   */
  getByLabel(label: string | RegExp, options?: any): Locator {
    return this.page.getByLabel(label, options)
  }

  /**
   * Get element by placeholder
   */
  getByPlaceholder(placeholder: string | RegExp, options?: any): Locator {
    return this.page.getByPlaceholder(placeholder, options)
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' })
  }

  /**
   * Assert element is visible with custom message
   */
  async assertVisible(locator: Locator, elementName: string): Promise<void> {
    await expect(locator, `${elementName} should be visible`).toBeVisible()
  }

  /**
   * Assert element is not visible with custom message
   */
  async assertNotVisible(locator: Locator, elementName: string): Promise<void> {
    await expect(locator, `${elementName} should not be visible`).not.toBeVisible()
  }

  /**
   * Assert element has text with custom message
   */
  async assertHasText(locator: Locator, text: string | RegExp, elementName: string): Promise<void> {
    await expect(locator, `${elementName} should have text: ${text}`).toHaveText(text)
  }

  /**
   * Assert element contains text with custom message
   */
  async assertContainsText(locator: Locator, text: string | RegExp, elementName: string): Promise<void> {
    await expect(locator, `${elementName} should contain text: ${text}`).toContainText(text)
  }

  /**
   * Assert element count with custom message
   */
  async assertCount(locator: Locator, count: number, elementName: string): Promise<void> {
    await expect(locator, `${elementName} count should be ${count}`).toHaveCount(count)
  }

  /**
   * Assert element has value with custom message
   */
  async assertValue(locator: Locator, value: string | RegExp, elementName: string): Promise<void> {
    await expect(locator, `${elementName} should have value: ${value}`).toHaveValue(value)
  }

  /**
   * Clear localStorage
   */
  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear()
    })
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    await this.page.reload()
    await this.waitForPageLoad()
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `playwright-report/screenshots/${name}.png`, fullPage: true })
  }
}
