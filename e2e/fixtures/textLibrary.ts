/**
 * Text Library - Centralized text constants for E2E tests
 * This file contains all text strings used in the application for testing
 * to avoid hardcoding strings in tests and page objects.
 */

export const TEXTS = {
  // Header
  APP_TITLE: 'Tredgate Loan',
  APP_TAGLINE: 'Simple loan application management',
  
  // Form labels and placeholders
  FORM_TITLE: 'New Loan Application',
  LABEL_APPLICANT_NAME: 'Applicant Name',
  LABEL_AMOUNT: 'Loan Amount ($)',
  LABEL_TERM: 'Term (Months)',
  LABEL_INTEREST_RATE: 'Interest Rate (e.g., 0.08 for 8%)',
  
  PLACEHOLDER_APPLICANT_NAME: 'Enter applicant name',
  PLACEHOLDER_AMOUNT: 'Enter loan amount',
  PLACEHOLDER_TERM: 'Enter term in months',
  PLACEHOLDER_INTEREST_RATE: 'Enter interest rate',
  
  BUTTON_CREATE: 'Create Application',
  
  // Validation messages
  ERROR_NAME_REQUIRED: 'Applicant name is required',
  ERROR_AMOUNT_POSITIVE: 'Amount must be greater than 0',
  ERROR_TERM_POSITIVE: 'Term months must be greater than 0',
  ERROR_INTEREST_REQUIRED: 'Interest rate is required and cannot be negative',
  
  // Loan list
  LIST_TITLE: 'Loan Applications',
  EMPTY_STATE: 'No loan applications yet. Create one using the form.',
  
  TABLE_HEADER_APPLICANT: 'Applicant',
  TABLE_HEADER_AMOUNT: 'Amount',
  TABLE_HEADER_TERM: 'Term',
  TABLE_HEADER_RATE: 'Rate',
  TABLE_HEADER_MONTHLY_PAYMENT: 'Monthly Payment',
  TABLE_HEADER_STATUS: 'Status',
  TABLE_HEADER_CREATED: 'Created',
  TABLE_HEADER_ACTIONS: 'Actions',
  
  // Status badges
  STATUS_PENDING: 'pending',
  STATUS_APPROVED: 'approved',
  STATUS_REJECTED: 'rejected',
  
  // Action button titles
  BUTTON_APPROVE_TITLE: 'Approve',
  BUTTON_REJECT_TITLE: 'Reject',
  BUTTON_AUTO_DECIDE_TITLE: 'Auto-decide',
  BUTTON_DELETE_TITLE: 'Delete',
  
  // Summary stats
  STAT_TOTAL: 'Total Applications',
  STAT_PENDING: 'Pending',
  STAT_APPROVED: 'Approved',
  STAT_REJECTED: 'Rejected',
  STAT_TOTAL_APPROVED: 'Total Approved',
  
  // Dialogs
  CONFIRM_DELETE: 'Are you sure you want to delete this loan application?',
}

export const TEST_DATA = {
  // Valid test data
  VALID_LOAN: {
    applicantName: 'John Doe',
    amount: 50000,
    termMonths: 36,
    interestRate: 0.08,
  },
  
  // Small loan (should auto-approve)
  SMALL_LOAN: {
    applicantName: 'Jane Smith',
    amount: 50000,
    termMonths: 48,
    interestRate: 0.05,
  },
  
  // Large loan (should auto-reject)
  LARGE_LOAN: {
    applicantName: 'Bob Johnson',
    amount: 150000,
    termMonths: 84,
    interestRate: 0.10,
  },
  
  // Edge case: exact boundary (should approve)
  BOUNDARY_APPROVE: {
    applicantName: 'Alice Brown',
    amount: 100000,
    termMonths: 60,
    interestRate: 0.07,
  },
  
  // Edge case: just over boundary (should reject)
  BOUNDARY_REJECT: {
    applicantName: 'Charlie Wilson',
    amount: 100001,
    termMonths: 61,
    interestRate: 0.06,
  },
  
  // Zero interest rate
  ZERO_INTEREST: {
    applicantName: 'David Lee',
    amount: 30000,
    termMonths: 24,
    interestRate: 0,
  },
  
  // Maximum valid values
  MAX_VALUES: {
    applicantName: 'Emma Martinez',
    amount: 999999,
    termMonths: 360,
    interestRate: 1,
  },
  
  // Invalid test data
  INVALID: {
    EMPTY_NAME: {
      applicantName: '',
      amount: 50000,
      termMonths: 36,
      interestRate: 0.08,
    },
    ZERO_AMOUNT: {
      applicantName: 'Test User',
      amount: 0,
      termMonths: 36,
      interestRate: 0.08,
    },
    NEGATIVE_AMOUNT: {
      applicantName: 'Test User',
      amount: -1000,
      termMonths: 36,
      interestRate: 0.08,
    },
    ZERO_TERM: {
      applicantName: 'Test User',
      amount: 50000,
      termMonths: 0,
      interestRate: 0.08,
    },
    NEGATIVE_INTEREST: {
      applicantName: 'Test User',
      amount: 50000,
      termMonths: 36,
      interestRate: -0.05,
    },
  }
}
