---
name: Copilot Fix Request
about: Auto-generated issue for Copilot agent to fix test failures
title: '[Self-Healing] Test failure detected'
labels: 'self-healing'
assignees: ''
---

## Context

A test failure was automatically detected by the self-healing workflow.

- **Workflow Run**: [View Logs](WORKFLOW_URL)
- **Commit**: `COMMIT_SHA`
- **Detected At**: TIMESTAMP

## Problem

The test `tests/failing_heal.spec.ts` is failing.

### Test Output

```
PASTE_TEST_OUTPUT_HERE
```

## Proposed Solution

Please review the test file `tests/failing_heal.spec.ts` and fix the failing assertion. Follow the instructions in `.github/agents/copilot-healing-agent.md` for guidance.

## Additional Information

- **File to fix**: `tests/failing_heal.spec.ts`
- **Agent instructions**: `.github/agents/copilot-healing-agent.md`
- **Repository conventions**: `.github/copilot-instructions.md`

### Acceptance Criteria

1. The test in `tests/failing_heal.spec.ts` passes
2. No other tests are broken
3. Changes follow existing code style
