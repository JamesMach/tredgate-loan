import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanList from '../../src/components/LoanList.vue'
import type { LoanApplication } from '../../src/types/loan'

describe('LoanList', () => {
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
      amount: 150000,
      termMonths: 72,
      interestRate: 0.09,
      status: 'rejected',
      createdAt: '2024-03-20T14:45:00.000Z'
    }
  ]

  it('renders loan list heading', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [] }
    })
    
    expect(wrapper.find('h2').text()).toBe('Loan Applications')
  })

  it('shows empty state when no loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [] }
    })
    
    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.text()).toContain('No loan applications yet')
  })

  it('does not show empty state when loans exist', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('renders table with correct headers', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(8)
    expect(headers[0]?.text()).toBe('Applicant')
    expect(headers[1]?.text()).toBe('Amount')
    expect(headers[2]?.text()).toBe('Term')
    expect(headers[3]?.text()).toBe('Rate')
    expect(headers[4]?.text()).toBe('Monthly Payment')
    expect(headers[5]?.text()).toBe('Status')
    expect(headers[6]?.text()).toBe('Created')
    expect(headers[7]?.text()).toBe('Actions')
  })

  it('renders all loan applications', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(3)
  })

  it('displays loan applicant name', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('John Doe')
    expect(rows[1]?.text()).toContain('Jane Smith')
    expect(rows[2]?.text()).toContain('Bob Johnson')
  })

  it('formats currency correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('$50,000.00')
    expect(rows[1]?.text()).toContain('$100,000.00')
    expect(rows[2]?.text()).toContain('$150,000.00')
  })

  it('displays term in months', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('24 mo')
    expect(rows[1]?.text()).toContain('60 mo')
    expect(rows[2]?.text()).toContain('72 mo')
  })

  it('formats interest rate as percentage', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('8.0%')
    expect(rows[1]?.text()).toContain('6.0%')
    expect(rows[2]?.text()).toContain('9.0%')
  })

  it('calculates and displays monthly payment', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const rows = wrapper.findAll('tbody tr')
    // Loan 1: 50000 * 1.08 / 24 = 2250
    expect(rows[0]?.text()).toContain('$2,250.00')
    // Loan 2: 100000 * 1.06 / 60 = 1766.67
    expect(rows[1]?.text()).toContain('$1,766.67')
    // Loan 3: 150000 * 1.09 / 72 = 2270.83
    expect(rows[2]?.text()).toContain('$2,270.83')
  })

  it('displays loan status with correct badge', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const statusBadges = wrapper.findAll('.status-badge')
    expect(statusBadges).toHaveLength(3)
    expect(statusBadges[0]?.text()).toBe('pending')
    expect(statusBadges[0]?.classes()).toContain('status-pending')
    expect(statusBadges[1]?.text()).toBe('approved')
    expect(statusBadges[1]?.classes()).toContain('status-approved')
    expect(statusBadges[2]?.text()).toBe('rejected')
    expect(statusBadges[2]?.classes()).toContain('status-rejected')
  })

  it('formats date correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('Jan 1, 2024')
    expect(rows[1]?.text()).toContain('Feb 15, 2024')
    expect(rows[2]?.text()).toContain('Mar 20, 2024')
  })

  it('shows action buttons for pending loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    const actionButtons = wrapper.findAll('.action-btn')
    expect(actionButtons).toHaveLength(3)
    expect(actionButtons[0]?.classes()).toContain('success')
    expect(actionButtons[1]?.classes()).toContain('danger')
    expect(actionButtons[2]?.classes()).toContain('secondary')
  })

  it('does not show action buttons for approved loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[1]!] }
    })
    
    expect(wrapper.findAll('.action-btn')).toHaveLength(0)
    expect(wrapper.find('.no-actions').exists()).toBe(true)
  })

  it('does not show action buttons for rejected loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[2]!] }
    })
    
    expect(wrapper.findAll('.action-btn')).toHaveLength(0)
    expect(wrapper.find('.no-actions').exists()).toBe(true)
  })

  it('emits approve event when approve button is clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    const approveButton = wrapper.findAll('.action-btn')[0]
    await approveButton?.trigger('click')
    
    expect(wrapper.emitted('approve')).toBeTruthy()
    expect(wrapper.emitted('approve')?.[0]).toEqual(['1'])
  })

  it('emits reject event when reject button is clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    const rejectButton = wrapper.findAll('.action-btn')[1]
    await rejectButton?.trigger('click')
    
    expect(wrapper.emitted('reject')).toBeTruthy()
    expect(wrapper.emitted('reject')?.[0]).toEqual(['1'])
  })

  it('emits autoDecide event when auto-decide button is clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    const autoDecideButton = wrapper.findAll('.action-btn')[2]
    await autoDecideButton?.trigger('click')
    
    expect(wrapper.emitted('autoDecide')).toBeTruthy()
    expect(wrapper.emitted('autoDecide')?.[0]).toEqual(['1'])
  })

  it('has correct button titles for accessibility', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })
    
    const actionButtons = wrapper.findAll('.action-btn')
    expect(actionButtons[0]?.attributes('title')).toBe('Approve')
    expect(actionButtons[1]?.attributes('title')).toBe('Reject')
    expect(actionButtons[2]?.attributes('title')).toBe('Auto-decide')
  })

  it('renders multiple pending loans with separate actions', async () => {
    const pendingLoans = [
      { ...mockLoans[0]!, id: 'loan-1' },
      { ...mockLoans[0]!, id: 'loan-2', applicantName: 'Alice Wonder' }
    ]
    
    const wrapper = mount(LoanList, {
      props: { loans: pendingLoans }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    
    // Click approve on first loan
    const firstRowButtons = rows[0]?.findAll('.action-btn')
    await firstRowButtons?.[0]?.trigger('click')
    
    expect(wrapper.emitted('approve')?.[0]).toEqual(['loan-1'])
  })

  it('handles empty loan list gracefully', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [] }
    })
    
    expect(wrapper.findAll('tbody tr')).toHaveLength(0)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })

  it('renders loan with zero interest rate', () => {
    const loanWithZeroRate: LoanApplication = {
      id: '4',
      applicantName: 'Zero Rate',
      amount: 10000,
      termMonths: 12,
      interestRate: 0,
      status: 'pending',
      createdAt: '2024-04-01T00:00:00.000Z'
    }
    
    const wrapper = mount(LoanList, {
      props: { loans: [loanWithZeroRate] }
    })
    
    expect(wrapper.text()).toContain('0.0%')
    expect(wrapper.text()).toContain('$833.33') // 10000 * 1.0 / 12
  })
})
