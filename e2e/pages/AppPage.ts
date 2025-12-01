import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'
import { LoanFormPage } from './LoanFormPage'
import { LoanListPage } from './LoanListPage'
import { LoanSummaryPage } from './LoanSummaryPage'
import { TEXTS } from '../fixtures/textLibrary'

/**
 * Main App Page Object
 * Provides access to all page components and app-level functionality
 */
export class AppPage extends BasePage {
  // Component page objects
  readonly loanForm: LoanFormPage
  readonly loanList: LoanListPage
  readonly loanSummary: LoanSummaryPage

  // App-level locators
  private readonly logo: Locator
  private readonly appTitle: Locator
  private readonly tagline: Locator

  constructor(page: Page) {
    super(page)
    
    // Initialize component page objects
    this.loanForm = new LoanFormPage(page)
    this.loanList = new LoanListPage(page)
    this.loanSummary = new LoanSummaryPage(page)
    
    // App-level locators
    this.logo = this.page.locator('img.logo')
    this.appTitle = this.getByRole('heading', { name: TEXTS.APP_TITLE })
    this.tagline = this.getByText(TEXTS.APP_TAGLINE)
  }

  /**
   * Navigate to the application and wait for it to load
   */
  async open(): Promise<void> {
    await this.goto()
    await this.waitForPageLoad()
    await this.page.waitForTimeout(500) // Small wait for Vue to initialize
  }

  /**
   * Verify app header is visible
   */
  async verifyHeader(): Promise<void> {
    await this.assertVisible(this.logo, 'App logo')
    await this.assertVisible(this.appTitle, 'App title')
    await this.assertVisible(this.tagline, 'App tagline')
  }

  /**
   * Verify all main components are visible
   */
  async verifyAllComponentsVisible(): Promise<void> {
    await this.verifyHeader()
    await this.loanForm.verifyFormVisible()
    await this.loanList.verifyListVisible()
    await this.loanSummary.verifySummaryVisible()
  }

  /**
   * Setup fresh state - clear localStorage and reload
   */
  async setupFreshState(): Promise<void> {
    await this.clearLocalStorage()
    await this.reload()
  }
}
