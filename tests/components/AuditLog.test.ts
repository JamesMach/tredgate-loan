import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AuditLog from '../../src/components/AuditLog.vue'
import type { AuditLogEntry } from '../../src/types/auditLog'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('AuditLog', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders empty state when there are no audit logs', () => {
    const wrapper = mount(AuditLog)
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state').text()).toContain('No audit log entries yet')
  })

  it('renders audit log entries in a table', async () => {
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T12:00:00.000Z',
        action: 'loan_created',
        loanId: 'loan-123',
        newStatus: 'pending',
        details: 'Loan created for John Doe'
      },
      {
        id: '2',
        timestamp: '2024-01-02T12:00:00.000Z',
        action: 'status_changed',
        loanId: 'loan-123',
        previousStatus: 'pending',
        newStatus: 'approved',
        details: 'Status changed from pending to approved'
      }
    ]
    localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(logs))
    
    const wrapper = mount(AuditLog)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.empty-state').exists()).toBe(false)
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('displays loan created action correctly', async () => {
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T12:00:00.000Z',
        action: 'loan_created',
        loanId: 'loan-123',
        newStatus: 'pending',
        details: 'Loan created for John Doe'
      }
    ]
    localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(logs))
    
    const wrapper = mount(AuditLog)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Created')
    expect(wrapper.text()).toContain('pending')
    expect(wrapper.text()).toContain('Loan created for John Doe')
  })

  it('displays status changed action correctly', async () => {
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T12:00:00.000Z',
        action: 'status_changed',
        loanId: 'loan-123',
        previousStatus: 'pending',
        newStatus: 'approved',
        details: 'Status changed from pending to approved'
      }
    ]
    localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(logs))
    
    const wrapper = mount(AuditLog)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Status Changed')
    expect(wrapper.text()).toContain('pending')
    expect(wrapper.text()).toContain('approved')
  })

  it('displays auto-decided action correctly', async () => {
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T12:00:00.000Z',
        action: 'auto_decided',
        loanId: 'loan-123',
        previousStatus: 'pending',
        newStatus: 'rejected',
        details: 'Auto-decision: rejected'
      }
    ]
    localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(logs))
    
    const wrapper = mount(AuditLog)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Auto-Decided')
    expect(wrapper.text()).toContain('rejected')
  })

  it('shows most recent logs first (reverse order)', async () => {
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T12:00:00.000Z',
        action: 'loan_created',
        loanId: 'loan-old',
        newStatus: 'pending'
      },
      {
        id: '2',
        timestamp: '2024-01-02T12:00:00.000Z',
        action: 'loan_created',
        loanId: 'loan-new',
        newStatus: 'pending'
      }
    ]
    localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(logs))
    
    const wrapper = mount(AuditLog)
    await wrapper.vm.$nextTick()
    const rows = wrapper.findAll('tbody tr')
    
    // First row should be the most recent (loan-new)
    expect(rows[0]?.text()).toContain('loan-new')
    // Second row should be older (loan-old)
    expect(rows[1]?.text()).toContain('loan-old')
  })

  it('refreshes logs when refreshLogs is called', async () => {
    const wrapper = mount(AuditLog)
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T12:00:00.000Z',
        action: 'loan_created',
        loanId: 'loan-123',
        newStatus: 'pending'
      }
    ]
    localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(logs))
    
    // Call refreshLogs
    wrapper.vm.refreshLogs()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.empty-state').exists()).toBe(false)
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('displays truncated loan IDs', async () => {
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T12:00:00.000Z',
        action: 'loan_created',
        loanId: 'loan-123456789',
        newStatus: 'pending'
      }
    ]
    localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(logs))
    
    const wrapper = mount(AuditLog)
    await wrapper.vm.$nextTick()
    
    // Should show first 8 characters plus ellipsis
    expect(wrapper.text()).toContain('loan-123...')
  })

  it('displays em-dash for missing previous status', async () => {
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T12:00:00.000Z',
        action: 'loan_created',
        loanId: 'loan-123',
        newStatus: 'pending'
      }
    ]
    localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(logs))
    
    const wrapper = mount(AuditLog)
    await wrapper.vm.$nextTick()
    const cells = wrapper.findAll('tbody td')
    
    // Check that the "Previous Status" column has an em-dash
    expect(cells[3]?.text()).toBe('—')
  })

  it('displays em-dash for missing details', async () => {
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T12:00:00.000Z',
        action: 'loan_created',
        loanId: 'loan-123',
        newStatus: 'pending'
      }
    ]
    localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(logs))
    
    const wrapper = mount(AuditLog)
    await wrapper.vm.$nextTick()
    const cells = wrapper.findAll('tbody td')
    
    // Check that the "Details" column has an em-dash
    expect(cells[5]?.text()).toBe('—')
  })
})
