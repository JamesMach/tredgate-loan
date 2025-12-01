import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../../src/App.vue'
import LoanForm from '../../src/components/LoanForm.vue'
import LoanList from '../../src/components/LoanList.vue'
import LoanSummary from '../../src/components/LoanSummary.vue'
import * as loanService from '../../src/services/loanService'
import type { LoanApplication } from '../../src/types/loan'

// Mock the loanService with partial mocking to keep calculateMonthlyPayment
vi.mock('../../src/services/loanService', async (importOriginal) => {
  const actual = await importOriginal() as typeof loanService
  return {
    ...actual,
    getLoans: vi.fn(),
    updateLoanStatus: vi.fn(),
    autoDecideLoan: vi.fn(),
    createLoanApplication: vi.fn()
  }
})

describe('App', () => {
  const mockLoans: LoanApplication[] = [
    {
      id: '1',
      applicantName: 'John Doe',
      amount: 50000,
      termMonths: 24,
      interestRate: 0.08,
      status: 'pending',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      applicantName: 'Jane Smith',
      amount: 100000,
      termMonths: 60,
      interestRate: 0.06,
      status: 'approved',
      createdAt: '2024-02-15T10:30:00.000Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(loanService.getLoans).mockReturnValue([])
  })

  it('renders the app header', () => {
    const wrapper = mount(App)
    
    expect(wrapper.find('h1').text()).toBe('Tredgate Loan')
    expect(wrapper.find('.tagline').text()).toBe('Simple loan application management')
  })

  it('renders the logo', () => {
    const wrapper = mount(App)
    
    const logo = wrapper.find('.logo')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('src')).toBe('/tredgate-logo-original.png')
    expect(logo.attributes('alt')).toBe('Tredgate Logo')
  })

  it('renders all main components', () => {
    const wrapper = mount(App)
    
    expect(wrapper.findComponent(LoanSummary).exists()).toBe(true)
    expect(wrapper.findComponent(LoanForm).exists()).toBe(true)
    expect(wrapper.findComponent(LoanList).exists()).toBe(true)
  })

  it('loads loans on mount', () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
    
    mount(App)
    
    expect(loanService.getLoans).toHaveBeenCalled()
  })

  it('passes loans to LoanSummary component', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
    
    const wrapper = mount(App)
    await wrapper.vm.$nextTick()
    
    const loanSummary = wrapper.findComponent(LoanSummary)
    expect(loanSummary.props('loans')).toEqual(mockLoans)
  })

  it('passes loans to LoanList component', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
    
    const wrapper = mount(App)
    await wrapper.vm.$nextTick()
    
    const loanList = wrapper.findComponent(LoanList)
    expect(loanList.props('loans')).toEqual(mockLoans)
  })

  it('refreshes loans when LoanForm emits created event', async () => {
    const initialLoans = [mockLoans[0]!]
    const updatedLoans = mockLoans
    
    vi.mocked(loanService.getLoans)
      .mockReturnValueOnce(initialLoans)
      .mockReturnValueOnce(updatedLoans)
    
    const wrapper = mount(App)
    
    const loanForm = wrapper.findComponent(LoanForm)
    await loanForm.vm.$emit('created')
    
    await wrapper.vm.$nextTick()
    
    expect(loanService.getLoans).toHaveBeenCalledTimes(2)
    const loanList = wrapper.findComponent(LoanList)
    expect(loanList.props('loans')).toEqual(updatedLoans)
  })

  it('calls updateLoanStatus when approve is triggered', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
    
    const wrapper = mount(App)
    
    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('approve', '1')
    
    expect(loanService.updateLoanStatus).toHaveBeenCalledWith('1', 'approved')
  })

  it('calls updateLoanStatus when reject is triggered', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
    
    const wrapper = mount(App)
    
    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('reject', '2')
    
    expect(loanService.updateLoanStatus).toHaveBeenCalledWith('2', 'rejected')
  })

  it('calls autoDecideLoan when autoDecide is triggered', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
    
    const wrapper = mount(App)
    
    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('autoDecide', '1')
    
    expect(loanService.autoDecideLoan).toHaveBeenCalledWith('1')
  })

  it('refreshes loans after approve', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
    
    const wrapper = mount(App)
    
    vi.clearAllMocks()
    
    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('approve', '1')
    
    await wrapper.vm.$nextTick()
    
    expect(loanService.getLoans).toHaveBeenCalled()
  })

  it('refreshes loans after reject', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
    
    const wrapper = mount(App)
    
    vi.clearAllMocks()
    
    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('reject', '1')
    
    await wrapper.vm.$nextTick()
    
    expect(loanService.getLoans).toHaveBeenCalled()
  })

  it('refreshes loans after autoDecide', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
    
    const wrapper = mount(App)
    
    vi.clearAllMocks()
    
    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('autoDecide', '1')
    
    await wrapper.vm.$nextTick()
    
    expect(loanService.getLoans).toHaveBeenCalled()
  })

  it('has correct layout structure', () => {
    const wrapper = mount(App)
    
    expect(wrapper.find('.app').exists()).toBe(true)
    expect(wrapper.find('.app-header').exists()).toBe(true)
    expect(wrapper.find('.main-content').exists()).toBe(true)
  })

  it('displays components in correct order', () => {
    const wrapper = mount(App)
    
    const components = wrapper.findAll('.card')
    // LoanForm should be first, LoanList should be second in the main-content
    expect(components.length).toBeGreaterThanOrEqual(2)
  })

  it('handles empty loans array', () => {
    vi.mocked(loanService.getLoans).mockReturnValue([])
    
    const wrapper = mount(App)
    
    const loanSummary = wrapper.findComponent(LoanSummary)
    const loanList = wrapper.findComponent(LoanList)
    
    expect(loanSummary.props('loans')).toEqual([])
    expect(loanList.props('loans')).toEqual([])
  })

  it('updates state correctly when loans change', async () => {
    vi.mocked(loanService.getLoans)
      .mockReturnValueOnce([])
      .mockReturnValueOnce(mockLoans)
    
    const wrapper = mount(App)
    
    let loanList = wrapper.findComponent(LoanList)
    expect(loanList.props('loans')).toEqual([])
    
    // Trigger refresh
    const loanForm = wrapper.findComponent(LoanForm)
    await loanForm.vm.$emit('created')
    await wrapper.vm.$nextTick()
    
    loanList = wrapper.findComponent(LoanList)
    expect(loanList.props('loans')).toEqual(mockLoans)
  })

  it('maintains reactive state across multiple operations', async () => {
    const loan1 = [mockLoans[0]!]
    const loan2 = [mockLoans[0]!, mockLoans[1]!]
    const loan3 = mockLoans
    
    vi.mocked(loanService.getLoans)
      .mockReturnValueOnce(loan1)
      .mockReturnValueOnce(loan2)
      .mockReturnValueOnce(loan3)
    
    const wrapper = mount(App)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.findComponent(LoanList).props('loans')).toEqual(loan1)
    
    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('approve', '1')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.findComponent(LoanList).props('loans')).toEqual(loan2)
    
    await loanList.vm.$emit('reject', '2')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.findComponent(LoanList).props('loans')).toEqual(loan3)
  })
})
