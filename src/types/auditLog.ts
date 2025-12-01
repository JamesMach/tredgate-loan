import type { LoanStatus } from './loan'

/**
 * Union type for audit log action types
 */
export type AuditAction = 'loan_created' | 'status_changed' | 'auto_decided'

/**
 * Represents an audit log entry for loan operations
 */
export interface AuditLogEntry {
  id: string
  timestamp: string        // ISO timestamp
  action: AuditAction
  loanId: string
  previousStatus?: LoanStatus
  newStatus?: LoanStatus
  details?: string         // optional additional information
}

/**
 * Input for creating a new audit log entry
 */
export interface CreateAuditLogInput {
  action: AuditAction
  loanId: string
  previousStatus?: LoanStatus
  newStatus?: LoanStatus
  details?: string
}
