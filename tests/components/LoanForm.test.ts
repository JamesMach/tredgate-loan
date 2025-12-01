import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanForm from '../../src/components/LoanForm.vue'
import * as loanService from '../../src/services/loanService'

// Mock the loanService
vi.mock('../../src/services/loanService', () => ({
  createLoanApplication: vi.fn()
}))

describe('LoanForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all fields', () => {
    const wrapper = mount(LoanForm)
    
    expect(wrapper.find('h2').text()).toBe('New Loan Application')
    expect(wrapper.find('#applicantName').exists()).toBe(true)
    expect(wrapper.find('#amount').exists()).toBe(true)
    expect(wrapper.find('#termMonths').exists()).toBe(true)
    expect(wrapper.find('#interestRate').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('has correct input labels', () => {
    const wrapper = mount(LoanForm)
    
    const labels = wrapper.findAll('label')
    expect(labels[0]?.text()).toBe('Applicant Name')
    expect(labels[1]?.text()).toBe('Loan Amount ($)')
    expect(labels[2]?.text()).toBe('Term (Months)')
    expect(labels[3]?.text()).toBe('Interest Rate (e.g., 0.08 for 8%)')
  })

  it('binds input fields to component data', async () => {
    const wrapper = mount(LoanForm)
    
    const nameInput = wrapper.find('#applicantName')
    const amountInput = wrapper.find('#amount')
    const termInput = wrapper.find('#termMonths')
    const rateInput = wrapper.find('#interestRate')
    
    await nameInput.setValue('John Doe')
    await amountInput.setValue('50000')
    await termInput.setValue('24')
    await rateInput.setValue('0.08')
    
    expect((nameInput.element as HTMLInputElement).value).toBe('John Doe')
    expect((amountInput.element as HTMLInputElement).value).toBe('50000')
    expect((termInput.element as HTMLInputElement).value).toBe('24')
    expect((rateInput.element as HTMLInputElement).value).toBe('0.08')
  })

  it('creates loan application on valid form submission', async () => {
    const mockLoan = {
      id: 'test-id',
      applicantName: 'John Doe',
      amount: 50000,
      termMonths: 24,
      interestRate: 0.08,
      status: 'pending' as const,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
    
    vi.mocked(loanService.createLoanApplication).mockReturnValue(mockLoan)
    
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue('50000')
    await wrapper.find('#termMonths').setValue('24')
    await wrapper.find('#interestRate').setValue('0.08')
    
    await wrapper.find('form').trigger('submit')
    
    expect(loanService.createLoanApplication).toHaveBeenCalledWith({
      applicantName: 'John Doe',
      amount: 50000,
      termMonths: 24,
      interestRate: 0.08
    })
  })

  it('emits created event after successful submission', async () => {
    const mockLoan = {
      id: 'test-id',
      applicantName: 'Jane Doe',
      amount: 30000,
      termMonths: 12,
      interestRate: 0.05,
      status: 'pending' as const,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
    
    vi.mocked(loanService.createLoanApplication).mockReturnValue(mockLoan)
    
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('Jane Doe')
    await wrapper.find('#amount').setValue('30000')
    await wrapper.find('#termMonths').setValue('12')
    await wrapper.find('#interestRate').setValue('0.05')
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.emitted('created')).toBeTruthy()
    expect(wrapper.emitted('created')?.length).toBe(1)
  })

  it('resets form after successful submission', async () => {
    const mockLoan = {
      id: 'test-id',
      applicantName: 'Test User',
      amount: 10000,
      termMonths: 6,
      interestRate: 0.04,
      status: 'pending' as const,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
    
    vi.mocked(loanService.createLoanApplication).mockReturnValue(mockLoan)
    
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('Test User')
    await wrapper.find('#amount').setValue('10000')
    await wrapper.find('#termMonths').setValue('6')
    await wrapper.find('#interestRate').setValue('0.04')
    
    await wrapper.find('form').trigger('submit')
    
    // Wait for the form to reset
    await wrapper.vm.$nextTick()
    
    expect((wrapper.find('#applicantName').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#amount').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#termMonths').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#interestRate').element as HTMLInputElement).value).toBe('')
  })

  it('shows error for empty applicant name', async () => {
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('')
    await wrapper.find('#amount').setValue('50000')
    await wrapper.find('#termMonths').setValue('24')
    await wrapper.find('#interestRate').setValue('0.08')
    
    await wrapper.find('form').trigger('submit')
    
    const errorMessage = wrapper.find('.error-message')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toBe('Applicant name is required')
    expect(loanService.createLoanApplication).not.toHaveBeenCalled()
  })

  it('shows error for amount <= 0', async () => {
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue('0')
    await wrapper.find('#termMonths').setValue('24')
    await wrapper.find('#interestRate').setValue('0.08')
    
    await wrapper.find('form').trigger('submit')
    
    const errorMessage = wrapper.find('.error-message')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toBe('Amount must be greater than 0')
    expect(loanService.createLoanApplication).not.toHaveBeenCalled()
  })

  it('shows error for termMonths <= 0', async () => {
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue('50000')
    await wrapper.find('#termMonths').setValue('0')
    await wrapper.find('#interestRate').setValue('0.08')
    
    await wrapper.find('form').trigger('submit')
    
    const errorMessage = wrapper.find('.error-message')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toBe('Term months must be greater than 0')
    expect(loanService.createLoanApplication).not.toHaveBeenCalled()
  })

  it('shows error for negative interest rate', async () => {
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue('50000')
    await wrapper.find('#termMonths').setValue('24')
    await wrapper.find('#interestRate').setValue('-0.05')
    
    await wrapper.find('form').trigger('submit')
    
    const errorMessage = wrapper.find('.error-message')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toBe('Interest rate is required and cannot be negative')
    expect(loanService.createLoanApplication).not.toHaveBeenCalled()
  })

  it('trims whitespace from applicant name', async () => {
    const mockLoan = {
      id: 'test-id',
      applicantName: 'John Doe',
      amount: 50000,
      termMonths: 24,
      interestRate: 0.08,
      status: 'pending' as const,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
    
    vi.mocked(loanService.createLoanApplication).mockReturnValue(mockLoan)
    
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('  John Doe  ')
    await wrapper.find('#amount').setValue('50000')
    await wrapper.find('#termMonths').setValue('24')
    await wrapper.find('#interestRate').setValue('0.08')
    
    await wrapper.find('form').trigger('submit')
    
    expect(loanService.createLoanApplication).toHaveBeenCalledWith({
      applicantName: 'John Doe',
      amount: 50000,
      termMonths: 24,
      interestRate: 0.08
    })
  })

  it('handles service error gracefully', async () => {
    vi.mocked(loanService.createLoanApplication).mockImplementation(() => {
      throw new Error('Database connection failed')
    })
    
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue('50000')
    await wrapper.find('#termMonths').setValue('24')
    await wrapper.find('#interestRate').setValue('0.08')
    
    await wrapper.find('form').trigger('submit')
    
    const errorMessage = wrapper.find('.error-message')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toBe('Database connection failed')
  })

  it('handles non-Error exceptions', async () => {
    vi.mocked(loanService.createLoanApplication).mockImplementation(() => {
      throw { code: 500, message: 'Internal error' } // Non-Error object
    })
    
    const wrapper = mount(LoanForm)
    
    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue('50000')
    await wrapper.find('#termMonths').setValue('24')
    await wrapper.find('#interestRate').setValue('0.08')
    
    await wrapper.find('form').trigger('submit')
    
    const errorMessage = wrapper.find('.error-message')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toBe('Failed to create loan application')
  })

  it('does not show error message initially', () => {
    const wrapper = mount(LoanForm)
    
    expect(wrapper.find('.error-message').exists()).toBe(false)
  })

  it('clears error message on successful submission', async () => {
    const mockLoan = {
      id: 'test-id',
      applicantName: 'John Doe',
      amount: 50000,
      termMonths: 24,
      interestRate: 0.08,
      status: 'pending' as const,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
    
    const wrapper = mount(LoanForm)
    
    // First, trigger an error
    await wrapper.find('#applicantName').setValue('')
    await wrapper.find('#amount').setValue('50000')
    await wrapper.find('#termMonths').setValue('24')
    await wrapper.find('#interestRate').setValue('0.08')
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.find('.error-message').exists()).toBe(true)
    
    // Now submit valid data
    vi.mocked(loanService.createLoanApplication).mockReturnValue(mockLoan)
    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('form').trigger('submit')
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.error-message').exists()).toBe(false)
  })
})
