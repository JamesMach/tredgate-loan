import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { TEXTS } from '../fixtures/textLibrary'

/**
 * Page Object for Loan Form Component
 * Handles interactions with the loan creation form
 */
export class LoanFormPage extends BasePage {
  // Locators - using stable identifiers
  // Note: If unique IDs are not available, these should be added to the component
  private readonly formHeading: Locator
  private readonly applicantNameInput: Locator
  private readonly amountInput: Locator
  private readonly termInput: Locator
  private readonly interestRateInput: Locator
  private readonly submitButton: Locator
  private readonly errorMessage: Locator

  constructor(page: Page) {
    super(page)
    
    // Using label text as identifiers (alternative: add test IDs to component)
    this.formHeading = this.getByRole('heading', { name: TEXTS.FORM_TITLE })
    this.applicantNameInput = this.getByLabel(TEXTS.LABEL_APPLICANT_NAME)
    this.amountInput = this.getByLabel(TEXTS.LABEL_AMOUNT)
    this.termInput = this.getByLabel(TEXTS.LABEL_TERM)
    this.interestRateInput = this.getByLabel(TEXTS.LABEL_INTEREST_RATE)
    this.submitButton = this.getByRole('button', { name: TEXTS.BUTTON_CREATE })
    this.errorMessage = this.page.locator('.error-message')
  }

  /**
   * Verify form is visible
   */
  async verifyFormVisible(): Promise<void> {
    await this.page.waitForTimeout(500) // Small wait for rendering
    await this.assertVisible(this.formHeading, 'Form heading')
    await this.assertVisible(this.applicantNameInput, 'Applicant name input')
    await this.assertVisible(this.amountInput, 'Amount input')
    await this.assertVisible(this.termInput, 'Term input')
    await this.assertVisible(this.interestRateInput, 'Interest rate input')
    await this.assertVisible(this.submitButton, 'Submit button')
  }

  /**
   * Fill applicant name field
   */
  async fillApplicantName(name: string): Promise<void> {
    await this.applicantNameInput.clear()
    if (name) {
      await this.applicantNameInput.fill(name)
      await expect(this.applicantNameInput, 'Applicant name should be filled').toHaveValue(name)
    } else {
      await expect(this.applicantNameInput, 'Applicant name should be empty').toHaveValue('')
    }
  }

  /**
   * Fill amount field
   */
  async fillAmount(amount: number): Promise<void> {
    await this.amountInput.fill(amount.toString())
    await expect(this.amountInput, 'Amount should be filled').toHaveValue(amount.toString())
  }

  /**
   * Fill term field
   */
  async fillTerm(term: number): Promise<void> {
    await this.termInput.fill(term.toString())
    await expect(this.termInput, 'Term should be filled').toHaveValue(term.toString())
  }

  /**
   * Fill interest rate field
   */
  async fillInterestRate(rate: number): Promise<void> {
    await this.interestRateInput.fill(rate.toString())
    await expect(this.interestRateInput, 'Interest rate should be filled').toHaveValue(rate.toString())
  }

  /**
   * Click submit button
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click()
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await this.page.waitForTimeout(500) // Wait for error to appear
    await this.assertVisible(this.errorMessage, 'Error message')
    await this.assertContainsText(this.errorMessage, expectedMessage, 'Error message')
  }

  /**
   * Verify no error message is displayed
   */
  async verifyNoError(): Promise<void> {
    await this.assertNotVisible(this.errorMessage, 'Error message')
  }

  /**
   * Verify form is cleared (reset)
   */
  async verifyFormCleared(): Promise<void> {
    await expect(this.applicantNameInput, 'Applicant name should be empty').toHaveValue('')
    await expect(this.amountInput, 'Amount should be empty').toHaveValue('')
    await expect(this.termInput, 'Term should be empty').toHaveValue('')
    await expect(this.interestRateInput, 'Interest rate should be empty').toHaveValue('')
  }

  // ============================================
  // Grouped Actions (with test.step)
  // ============================================

  /**
   * Fill entire form with loan data
   */
  async fillLoanForm(loanData: {
    applicantName: string
    amount: number
    termMonths: number
    interestRate: number
  }): Promise<void> {
    await this.page.waitForTimeout(300) // Small wait for form to be ready
    
    await this.fillApplicantName(loanData.applicantName)
    await this.fillAmount(loanData.amount)
    await this.fillTerm(loanData.termMonths)
    await this.fillInterestRate(loanData.interestRate)
  }

  /**
   * Submit loan application (complete flow)
   */
  async submitLoanApplication(loanData: {
    applicantName: string
    amount: number
    termMonths: number
    interestRate: number
  }): Promise<void> {
    await this.fillLoanForm(loanData)
    await this.clickSubmit()
  }

  /**
   * Try to submit with invalid data and verify error
   */
  async submitInvalidAndVerifyError(
    loanData: {
      applicantName: string
      amount: number
      termMonths: number
      interestRate: number
    },
    expectedError: string
  ): Promise<void> {
    await this.fillLoanForm(loanData)
    await this.clickSubmit()
    await this.verifyErrorMessage(expectedError)
  }
}
