<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { AuditLogEntry } from '../types/auditLog'
import { getAuditLogs } from '../services/auditLogService'

const auditLogs = ref<AuditLogEntry[]>([])

function refreshLogs() {
  auditLogs.value = getAuditLogs().reverse() // Show most recent first
}

function formatTimestamp(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getActionLabel(action: string): string {
  switch (action) {
    case 'loan_created':
      return 'Created'
    case 'status_changed':
      return 'Status Changed'
    case 'auto_decided':
      return 'Auto-Decided'
    default:
      return action
  }
}

function getActionClass(action: string): string {
  switch (action) {
    case 'loan_created':
      return 'action-created'
    case 'status_changed':
      return 'action-status-changed'
    case 'auto_decided':
      return 'action-auto-decided'
    default:
      return ''
  }
}

onMounted(() => {
  refreshLogs()
})

defineExpose({
  refreshLogs
})
</script>

<template>
  <div class="audit-log card">
    <h2>Audit Log</h2>
    
    <div v-if="auditLogs.length === 0" class="empty-state">
      <p>No audit log entries yet. Activity will be tracked here.</p>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Loan ID</th>
            <th>Previous Status</th>
            <th>New Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in auditLogs" :key="log.id">
            <td class="timestamp">{{ formatTimestamp(log.timestamp) }}</td>
            <td>
              <span :class="['action-badge', getActionClass(log.action)]">
                {{ getActionLabel(log.action) }}
              </span>
            </td>
            <td class="loan-id">{{ log.loanId.substring(0, 8) }}...</td>
            <td>
              <span v-if="log.previousStatus" :class="['status-badge', `status-${log.previousStatus}`]">
                {{ log.previousStatus }}
              </span>
              <span v-else class="no-data">—</span>
            </td>
            <td>
              <span v-if="log.newStatus" :class="['status-badge', `status-${log.newStatus}`]">
                {{ log.newStatus }}
              </span>
              <span v-else class="no-data">—</span>
            </td>
            <td class="details">{{ log.details || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.audit-log {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.table-container {
  overflow-x: auto;
}

.timestamp {
  white-space: nowrap;
  font-size: 0.875rem;
}

.loan-id {
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.details {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-data {
  color: var(--text-secondary);
}

.action-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-created {
  background-color: #d1ecf1;
  color: #0c5460;
}

.action-status-changed {
  background-color: #e2e3e5;
  color: #383d41;
}

.action-auto-decided {
  background-color: #fff3cd;
  color: #856404;
}
</style>
