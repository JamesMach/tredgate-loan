import type { AuditLogEntry, CreateAuditLogInput } from '../types/auditLog'

const STORAGE_KEY = 'tredgate_audit_logs'

/**
 * Generate a simple unique ID for audit log entries
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

/**
 * Load audit logs from localStorage
 * If there is nothing stored yet, returns an empty array
 */
export function getAuditLogs(): AuditLogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }
    return JSON.parse(stored) as AuditLogEntry[]
  } catch {
    return []
  }
}

/**
 * Persist the array of audit logs into localStorage
 */
export function saveAuditLogs(logs: AuditLogEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
}

/**
 * Create a new audit log entry
 */
export function createAuditLogEntry(input: CreateAuditLogInput): AuditLogEntry {
  const newEntry: AuditLogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    action: input.action,
    loanId: input.loanId,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    details: input.details
  }

  const logs = getAuditLogs()
  logs.push(newEntry)
  saveAuditLogs(logs)

  return newEntry
}

/**
 * Get audit logs for a specific loan
 */
export function getAuditLogsForLoan(loanId: string): AuditLogEntry[] {
  const logs = getAuditLogs()
  return logs.filter(log => log.loanId === loanId)
}

/**
 * Clear all audit logs (useful for testing)
 */
export function clearAuditLogs(): void {
  localStorage.removeItem(STORAGE_KEY)
}
