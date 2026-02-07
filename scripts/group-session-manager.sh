#!/bin/bash
# Group Session Manager
# Monitors group sessions and outputs ones that need attention
# Run via cron, outputs JSON for the agent to process

SESSIONS_DIR="$HOME/.openclaw/agents/main/sessions"
MEMORY_DIR="$HOME/.openclaw/workspace/memory/channels"
TOKEN_THRESHOLD=${1:-50000}  # Default 50k tokens

mkdir -p "$MEMORY_DIR"

# Get session list as JSON
openclaw sessions --json 2>/dev/null | jq -r --argjson threshold "$TOKEN_THRESHOLD" '
  .sessions[]
  | select(.kind == "group")
  | select(.totalTokens > $threshold)
  | {
      key: .key,
      displayName: .displayName,
      totalTokens: .totalTokens,
      sessionId: .sessionId,
      transcriptPath: .transcriptPath
    }
' 2>/dev/null
