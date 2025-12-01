#!/bin/bash
# create-copilot-issue.sh
# Creates a GitHub issue assigned to the Copilot agent when tests fail.
# 
# Usage: ./create-copilot-issue.sh "<test_log>" "<run_id>" "<commit_sha>"

set -e

TEST_LOG="${1:-No test output available}"
RUN_ID="${2:-unknown}"
COMMIT_SHA="${3:-unknown}"
WORKFLOW_URL="https://github.com/${GITHUB_REPOSITORY}/actions/runs/${RUN_ID}"

# Create issue title with timestamp
ISSUE_TITLE="[Self-Healing] Test failure detected - $(date -u +%Y-%m-%d)"

# Create issue body using the template structure
ISSUE_BODY=$(cat <<EOF
## Context

A test failure was automatically detected by the self-healing workflow.

- **Workflow Run**: [View Logs](${WORKFLOW_URL})
- **Commit**: \`${COMMIT_SHA}\`
- **Detected At**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Problem

The test \`tests/failing_heal.spec.ts\` is failing. This is a self-healing demo test designed to be fixed by the Copilot agent.

### Test Output

\`\`\`
${TEST_LOG}
\`\`\`

## Proposed Solution

Please review the test file \`tests/failing_heal.spec.ts\` and fix the failing assertion. Follow the instructions in \`.github/agents/copilot-healing-agent.md\` for guidance.

## Additional Information

- **File to fix**: \`tests/failing_heal.spec.ts\`
- **Agent instructions**: \`.github/agents/copilot-healing-agent.md\`
- **Repository conventions**: \`.github/copilot-instructions.md\`

### Acceptance Criteria

1. The test in \`tests/failing_heal.spec.ts\` passes
2. No other tests are broken
3. Changes follow existing code style
EOF
)

# Check if there's already an open issue for self-healing
EXISTING_ISSUE=$(gh issue list --label "self-healing" --state open --json number --jq '.[0].number' 2>/dev/null || echo "")

if [ -n "$EXISTING_ISSUE" ]; then
  echo "Updating existing self-healing issue #${EXISTING_ISSUE}"
  gh issue comment "${EXISTING_ISSUE}" --body "## New Failure Detected

A new test failure was detected at $(date -u +"%Y-%m-%d %H:%M:%S UTC").

**Workflow Run**: [View Logs](${WORKFLOW_URL})
**Commit**: \`${COMMIT_SHA}\`

### Test Output
\`\`\`
${TEST_LOG}
\`\`\`"
else
  echo "Creating new self-healing issue..."
  
  # Create label if it doesn't exist
  gh label create "self-healing" --description "Issues created by the self-healing workflow" --color "FFA500" 2>/dev/null || true
  
  # Create the issue
  gh issue create \
    --title "${ISSUE_TITLE}" \
    --body "${ISSUE_BODY}" \
    --label "self-healing" \
    --assignee "@copilot"
  
  echo "Self-healing issue created successfully!"
fi
