import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanSummary from '../../src/components/LoanSummary.vue'
import type { LoanApplication } from '../../src/types/loan'

describe('LoanSummary', () => {
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
    },
    {
      id: '3',
      applicantName: 'Bob Johnson',
      amount: 75000,
      termMonths: 48,
      interestRate: 0.07,
      status: 'approved',
      createdAt: '2024-03-01T00:00:00.000Z'
    },
    {
      id: '4',
      applicantName: 'Alice Wonder',
      amount: 25000,
      termMonths: 12,
      interestRate: 0.05,
      status: 'rejected',
      createdAt: '2024-03-15T00:00:00.000Z'
    }
  ]

  it('renders all stat cards', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards).toHaveLength(5)
  })

  it('displays total applications count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    const totalCard = statCards[0]
    
    expect(totalCard?.find('.stat-value').text()).toBe('4')
    expect(totalCard?.find('.stat-label').text()).toBe('Total Applications')
  })

  it('displays pending count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    const pendingCard = statCards[1]
    
    expect(pendingCard?.find('.stat-value').text()).toBe('1')
    expect(pendingCard?.find('.stat-label').text()).toBe('Pending')
    expect(pendingCard?.classes()).toContain('pending')
  })

  it('displays approved count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    const approvedCard = statCards[2]
    
    expect(approvedCard?.find('.stat-value').text()).toBe('2')
    expect(approvedCard?.find('.stat-label').text()).toBe('Approved')
    expect(approvedCard?.classes()).toContain('approved')
  })

  it('displays rejected count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    const rejectedCard = statCards[3]
    
    expect(rejectedCard?.find('.stat-value').text()).toBe('1')
    expect(rejectedCard?.find('.stat-label').text()).toBe('Rejected')
    expect(rejectedCard?.classes()).toContain('rejected')
  })

  it('displays total approved amount', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    const amountCard = statCards[4]
    
    // Total approved: 100000 + 75000 = 175000
    expect(amountCard?.find('.stat-value').text()).toBe('$175,000')
    expect(amountCard?.find('.stat-label').text()).toBe('Total Approved')
    expect(amountCard?.classes()).toContain('amount')
  })

  it('shows zero values when no loans exist', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: [] }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    
    expect(statCards[0]?.find('.stat-value').text()).toBe('0')
    expect(statCards[1]?.find('.stat-value').text()).toBe('0')
    expect(statCards[2]?.find('.stat-value').text()).toBe('0')
    expect(statCards[3]?.find('.stat-value').text()).toBe('0')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$0')
  })

  it('handles all pending loans', () => {
    const pendingLoans: LoanApplication[] = [
      { ...mockLoans[0]!, id: '1', status: 'pending' },
      { ...mockLoans[1]!, id: '2', status: 'pending' },
      { ...mockLoans[2]!, id: '3', status: 'pending' }
    ]
    
    const wrapper = mount(LoanSummary, {
      props: { loans: pendingLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    
    expect(statCards[0]?.find('.stat-value').text()).toBe('3')
    expect(statCards[1]?.find('.stat-value').text()).toBe('3')
    expect(statCards[2]?.find('.stat-value').text()).toBe('0')
    expect(statCards[3]?.find('.stat-value').text()).toBe('0')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$0')
  })

  it('handles all approved loans', () => {
    const approvedLoans: LoanApplication[] = [
      { ...mockLoans[0]!, id: '1', status: 'approved', amount: 10000 },
      { ...mockLoans[1]!, id: '2', status: 'approved', amount: 20000 },
      { ...mockLoans[2]!, id: '3', status: 'approved', amount: 30000 }
    ]
    
    const wrapper = mount(LoanSummary, {
      props: { loans: approvedLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    
    expect(statCards[0]?.find('.stat-value').text()).toBe('3')
    expect(statCards[1]?.find('.stat-value').text()).toBe('0')
    expect(statCards[2]?.find('.stat-value').text()).toBe('3')
    expect(statCards[3]?.find('.stat-value').text()).toBe('0')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$60,000')
  })

  it('handles all rejected loans', () => {
    const rejectedLoans: LoanApplication[] = [
      { ...mockLoans[0]!, id: '1', status: 'rejected' },
      { ...mockLoans[1]!, id: '2', status: 'rejected' }
    ]
    
    const wrapper = mount(LoanSummary, {
      props: { loans: rejectedLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    
    expect(statCards[0]?.find('.stat-value').text()).toBe('2')
    expect(statCards[1]?.find('.stat-value').text()).toBe('0')
    expect(statCards[2]?.find('.stat-value').text()).toBe('0')
    expect(statCards[3]?.find('.stat-value').text()).toBe('2')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$0')
  })

  it('calculates total approved amount correctly with large numbers', () => {
    const largeLoans: LoanApplication[] = [
      { ...mockLoans[0]!, id: '1', status: 'approved', amount: 1000000 },
      { ...mockLoans[1]!, id: '2', status: 'approved', amount: 2500000 }
    ]
    
    const wrapper = mount(LoanSummary, {
      props: { loans: largeLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$3,500,000')
  })

  it('formats currency without decimals', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const amountCard = wrapper.findAll('.stat-card')[4]
    const amountText = amountCard?.find('.stat-value').text()
    
    // Should not have decimal places
    expect(amountText).not.toContain('.')
    expect(amountText).toBe('$175,000')
  })

  it('has correct CSS classes for stat cards', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    const statCards = wrapper.findAll('.stat-card')
    
    expect(statCards[1]?.classes()).toContain('pending')
    expect(statCards[2]?.classes()).toContain('approved')
    expect(statCards[3]?.classes()).toContain('rejected')
    expect(statCards[4]?.classes()).toContain('amount')
  })

  it('updates stats when loans prop changes', async () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: [] }
    })
    
    let statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('0')
    
    await wrapper.setProps({ loans: mockLoans })
    
    statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('4')
    expect(statCards[1]?.find('.stat-value').text()).toBe('1')
    expect(statCards[2]?.find('.stat-value').text()).toBe('2')
    expect(statCards[3]?.find('.stat-value').text()).toBe('1')
  })

  it('computes stats reactively', async () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: [mockLoans[0]!] }
    })
    
    let statCards = wrapper.findAll('.stat-card')
    expect(statCards[1]?.find('.stat-value').text()).toBe('1') // 1 pending
    
    const updatedLoan = { ...mockLoans[0]!, status: 'approved' as const }
    await wrapper.setProps({ loans: [updatedLoan] })
    
    statCards = wrapper.findAll('.stat-card')
    expect(statCards[1]?.find('.stat-value').text()).toBe('0') // 0 pending
    expect(statCards[2]?.find('.stat-value').text()).toBe('1') // 1 approved
  })

  it('has semantic HTML structure', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })
    
    expect(wrapper.find('.loan-summary').exists()).toBe(true)
    expect(wrapper.findAll('.stat-card')).toHaveLength(5)
    expect(wrapper.findAll('.stat-value')).toHaveLength(5)
    expect(wrapper.findAll('.stat-label')).toHaveLength(5)
  })
})
