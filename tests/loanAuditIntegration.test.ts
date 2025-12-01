import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createLoanApplication,
  updateLoanStatus,
  autoDecideLoan
} from '../src/services/loanService'
import { getAuditLogs, clearAuditLogs } from '../src/services/auditLogService'

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

describe('Audit Log Integration with Loan Service', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('createLoanApplication', () => {
    it('creates an audit log entry when a loan is created', () => {
      const input = {
        applicantName: 'Alice Smith',
        amount: 25000,
        termMonths: 12,
        interestRate: 0.05
      }

      const loan = createLoanApplication(input)
      const auditLogs = getAuditLogs()

      expect(auditLogs).toHaveLength(1)
      expect(auditLogs[0]?.action).toBe('loan_created')
      expect(auditLogs[0]?.loanId).toBe(loan.id)
      expect(auditLogs[0]?.newStatus).toBe('pending')
      expect(auditLogs[0]?.details).toContain('Alice Smith')
    })

    it('creates multiple audit log entries for multiple loans', () => {
      const input1 = {
        applicantName: 'User 1',
        amount: 10000,
        termMonths: 12,
        interestRate: 0.05
      }
      const input2 = {
        applicantName: 'User 2',
        amount: 20000,
        termMonths: 24,
        interestRate: 0.06
      }

      const loan1 = createLoanApplication(input1)
      const loan2 = createLoanApplication(input2)
      const auditLogs = getAuditLogs()

      expect(auditLogs).toHaveLength(2)
      expect(auditLogs[0]?.loanId).toBe(loan1.id)
      expect(auditLogs[1]?.loanId).toBe(loan2.id)
    })
  })

  describe('updateLoanStatus', () => {
    it('creates an audit log entry when loan status is updated', () => {
      const input = {
        applicantName: 'Bob',
        amount: 50000,
        termMonths: 24,
        interestRate: 0.08
      }

      const loan = createLoanApplication(input)
      clearAuditLogs() // Clear the creation log to isolate the test

      updateLoanStatus(loan.id, 'approved')
      const auditLogs = getAuditLogs()

      expect(auditLogs).toHaveLength(1)
      expect(auditLogs[0]?.action).toBe('status_changed')
      expect(auditLogs[0]?.loanId).toBe(loan.id)
      expect(auditLogs[0]?.previousStatus).toBe('pending')
      expect(auditLogs[0]?.newStatus).toBe('approved')
      expect(auditLogs[0]?.details).toContain('pending')
      expect(auditLogs[0]?.details).toContain('approved')
    })

    it('tracks multiple status changes', () => {
      const input = {
        applicantName: 'Charlie',
        amount: 30000,
        termMonths: 18,
        interestRate: 0.07
      }

      const loan = createLoanApplication(input)
      clearAuditLogs()

      updateLoanStatus(loan.id, 'approved')
      updateLoanStatus(loan.id, 'rejected')
      const auditLogs = getAuditLogs()

      expect(auditLogs).toHaveLength(2)
      expect(auditLogs[0]?.previousStatus).toBe('pending')
      expect(auditLogs[0]?.newStatus).toBe('approved')
      expect(auditLogs[1]?.previousStatus).toBe('approved')
      expect(auditLogs[1]?.newStatus).toBe('rejected')
    })
  })

  describe('autoDecideLoan', () => {
    it('creates an audit log entry when auto-decision approves a loan', () => {
      const input = {
        applicantName: 'Dave',
        amount: 50000,
        termMonths: 36,
        interestRate: 0.06
      }

      const loan = createLoanApplication(input)
      clearAuditLogs()

      autoDecideLoan(loan.id)
      const auditLogs = getAuditLogs()

      expect(auditLogs).toHaveLength(1)
      expect(auditLogs[0]?.action).toBe('auto_decided')
      expect(auditLogs[0]?.loanId).toBe(loan.id)
      expect(auditLogs[0]?.previousStatus).toBe('pending')
      expect(auditLogs[0]?.newStatus).toBe('approved')
      expect(auditLogs[0]?.details).toContain('approved')
    })

    it('creates an audit log entry when auto-decision rejects a loan', () => {
      const input = {
        applicantName: 'Eve',
        amount: 150000,
        termMonths: 72,
        interestRate: 0.08
      }

      const loan = createLoanApplication(input)
      clearAuditLogs()

      autoDecideLoan(loan.id)
      const auditLogs = getAuditLogs()

      expect(auditLogs).toHaveLength(1)
      expect(auditLogs[0]?.action).toBe('auto_decided')
      expect(auditLogs[0]?.loanId).toBe(loan.id)
      expect(auditLogs[0]?.previousStatus).toBe('pending')
      expect(auditLogs[0]?.newStatus).toBe('rejected')
      expect(auditLogs[0]?.details).toContain('rejected')
    })
  })

  describe('Complete loan lifecycle audit trail', () => {
    it('creates a complete audit trail for a loan lifecycle', () => {
      // Create loan
      const input = {
        applicantName: 'Full Lifecycle User',
        amount: 75000,
        termMonths: 48,
        interestRate: 0.07
      }

      const loan = createLoanApplication(input)
      
      // Update status manually
      updateLoanStatus(loan.id, 'approved')
      
      // Get all audit logs
      const auditLogs = getAuditLogs()

      expect(auditLogs).toHaveLength(2)
      expect(auditLogs[0]?.action).toBe('loan_created')
      expect(auditLogs[0]?.loanId).toBe(loan.id)
      expect(auditLogs[1]?.action).toBe('status_changed')
      expect(auditLogs[1]?.loanId).toBe(loan.id)
    })

    it('maintains audit trail across multiple loan operations', () => {
      // Create first loan
      const loan1 = createLoanApplication({
        applicantName: 'User 1',
        amount: 50000,
        termMonths: 24,
        interestRate: 0.06
      })

      // Create second loan
      const loan2 = createLoanApplication({
        applicantName: 'User 2',
        amount: 100000,
        termMonths: 60,
        interestRate: 0.08
      })

      // Auto-decide first loan
      autoDecideLoan(loan1.id)

      // Manually update second loan
      updateLoanStatus(loan2.id, 'rejected')

      const auditLogs = getAuditLogs()

      expect(auditLogs).toHaveLength(4)
      expect(auditLogs.filter(log => log.loanId === loan1.id)).toHaveLength(2)
      expect(auditLogs.filter(log => log.loanId === loan2.id)).toHaveLength(2)
    })
  })
})
