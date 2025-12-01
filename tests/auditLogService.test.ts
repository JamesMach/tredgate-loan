import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAuditLogs,
  saveAuditLogs,
  createAuditLogEntry,
  getAuditLogsForLoan,
  clearAuditLogs
} from '../src/services/auditLogService'
import type { AuditLogEntry } from '../src/types/auditLog'

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

describe('auditLogService', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('getAuditLogs', () => {
    it('returns empty array when nothing is stored', () => {
      const logs = getAuditLogs()
      expect(logs).toEqual([])
    })

    it('returns stored audit logs', () => {
      const storedLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          action: 'loan_created',
          loanId: 'loan-1',
          newStatus: 'pending'
        }
      ]
      localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(storedLogs))

      const logs = getAuditLogs()
      expect(logs).toEqual(storedLogs)
    })

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorageMock.setItem('tredgate_audit_logs', 'invalid json')
      
      const logs = getAuditLogs()
      expect(logs).toEqual([])
    })
  })

  describe('saveAuditLogs', () => {
    it('saves audit logs to localStorage', () => {
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          action: 'status_changed',
          loanId: 'loan-1',
          previousStatus: 'pending',
          newStatus: 'approved'
        }
      ]

      saveAuditLogs(logs)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'tredgate_audit_logs',
        JSON.stringify(logs)
      )
    })
  })

  describe('createAuditLogEntry', () => {
    it('creates a new audit log entry for loan creation', () => {
      const input = {
        action: 'loan_created' as const,
        loanId: 'loan-123',
        newStatus: 'pending' as const,
        details: 'Loan created for John Doe'
      }

      const entry = createAuditLogEntry(input)

      expect(entry.action).toBe('loan_created')
      expect(entry.loanId).toBe('loan-123')
      expect(entry.newStatus).toBe('pending')
      expect(entry.details).toBe('Loan created for John Doe')
      expect(entry.id).toBeDefined()
      expect(entry.timestamp).toBeDefined()
    })

    it('creates a new audit log entry for status change', () => {
      const input = {
        action: 'status_changed' as const,
        loanId: 'loan-456',
        previousStatus: 'pending' as const,
        newStatus: 'approved' as const,
        details: 'Status changed from pending to approved'
      }

      const entry = createAuditLogEntry(input)

      expect(entry.action).toBe('status_changed')
      expect(entry.loanId).toBe('loan-456')
      expect(entry.previousStatus).toBe('pending')
      expect(entry.newStatus).toBe('approved')
      expect(entry.details).toBe('Status changed from pending to approved')
    })

    it('creates a new audit log entry for auto-decision', () => {
      const input = {
        action: 'auto_decided' as const,
        loanId: 'loan-789',
        previousStatus: 'pending' as const,
        newStatus: 'rejected' as const,
        details: 'Auto-decision: rejected'
      }

      const entry = createAuditLogEntry(input)

      expect(entry.action).toBe('auto_decided')
      expect(entry.loanId).toBe('loan-789')
      expect(entry.previousStatus).toBe('pending')
      expect(entry.newStatus).toBe('rejected')
    })

    it('saves entry to localStorage', () => {
      const input = {
        action: 'loan_created' as const,
        loanId: 'loan-test',
        newStatus: 'pending' as const
      }

      createAuditLogEntry(input)

      expect(localStorageMock.setItem).toHaveBeenCalled()
      const savedData = localStorageMock.setItem.mock.calls[0]?.[1]
      const savedLogs = JSON.parse(savedData as string)
      expect(savedLogs).toHaveLength(1)
      expect(savedLogs[0]?.loanId).toBe('loan-test')
    })

    it('appends new entry to existing logs', () => {
      const existingLog: AuditLogEntry = {
        id: 'existing',
        timestamp: '2024-01-01T00:00:00.000Z',
        action: 'loan_created',
        loanId: 'existing-loan',
        newStatus: 'pending'
      }
      saveAuditLogs([existingLog])

      const input = {
        action: 'status_changed' as const,
        loanId: 'new-loan',
        previousStatus: 'pending' as const,
        newStatus: 'approved' as const
      }

      createAuditLogEntry(input)

      const logs = getAuditLogs()
      expect(logs).toHaveLength(2)
      expect(logs[0]?.loanId).toBe('existing-loan')
      expect(logs[1]?.loanId).toBe('new-loan')
    })
  })

  describe('getAuditLogsForLoan', () => {
    it('returns audit logs for a specific loan', () => {
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          action: 'loan_created',
          loanId: 'loan-1',
          newStatus: 'pending'
        },
        {
          id: '2',
          timestamp: '2024-01-02T00:00:00.000Z',
          action: 'status_changed',
          loanId: 'loan-2',
          previousStatus: 'pending',
          newStatus: 'approved'
        },
        {
          id: '3',
          timestamp: '2024-01-03T00:00:00.000Z',
          action: 'status_changed',
          loanId: 'loan-1',
          previousStatus: 'pending',
          newStatus: 'approved'
        }
      ]
      saveAuditLogs(logs)

      const loan1Logs = getAuditLogsForLoan('loan-1')

      expect(loan1Logs).toHaveLength(2)
      expect(loan1Logs[0]?.loanId).toBe('loan-1')
      expect(loan1Logs[1]?.loanId).toBe('loan-1')
    })

    it('returns empty array when no logs exist for loan', () => {
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          action: 'loan_created',
          loanId: 'loan-1',
          newStatus: 'pending'
        }
      ]
      saveAuditLogs(logs)

      const loan2Logs = getAuditLogsForLoan('loan-2')

      expect(loan2Logs).toEqual([])
    })
  })

  describe('clearAuditLogs', () => {
    it('removes audit logs from localStorage', () => {
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          action: 'loan_created',
          loanId: 'loan-1',
          newStatus: 'pending'
        }
      ]
      saveAuditLogs(logs)

      clearAuditLogs()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tredgate_audit_logs')
    })
  })
})
