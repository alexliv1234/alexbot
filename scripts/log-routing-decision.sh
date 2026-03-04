#!/bin/bash
# log-routing-decision.sh - Log all message routing decisions for monitoring
# Part of Week 4: Smart Message Routing

set -euo pipefail

SESSION_TYPE="${1:-unknown}"
SESSION_TARGET="${2:-unknown}"
INTENDED_TARGET="${3:-unknown}"
METHOD="${4:-unknown}"  # reply | message_tool
VALIDATION_RESULT="${5:-unknown}"  # pass | fail
ACTION="${6:-unknown}"  # sent | blocked

LOG_FILE="/home/alexliv/.openclaw/workspace/memory/routing-log.jsonl"

# Create log file if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

# Create JSON entry
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

jq -n \
  --arg timestamp "$TIMESTAMP" \
  --arg session_type "$SESSION_TYPE" \
  --arg session_target "$SESSION_TARGET" \
  --arg intended_target "$INTENDED_TARGET" \
  --arg method "$METHOD" \
  --arg validation "$VALIDATION_RESULT" \
  --arg action "$ACTION" \
  '{
    timestamp: $timestamp,
    session_type: $session_type,
    session_target: $session_target,
    intended_target: $intended_target,
    method: $method,
    validation_result: $validation,
    action: $action
  }' >> "$LOG_FILE"

echo "✓ Routing decision logged"
