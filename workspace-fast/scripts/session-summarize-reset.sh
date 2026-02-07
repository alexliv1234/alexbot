#!/bin/bash
# session-summarize-reset.sh - Summarize session, save to memory, then reset
# Usage: ./session-summarize-reset.sh <session_key> [memory_file]

set -e

SESSION_KEY="${1:?Usage: $0 <session_key> [memory_file]}"
MEMORY_FILE="${2:-memory/channels/session-summary-$(date +%Y%m%d-%H%M%S).md}"

# Create memory dir if needed
mkdir -p "$(dirname "$MEMORY_FILE")"

echo "📋 Fetching session history for: $SESSION_KEY"

# This script is meant to be called from the agent context
# The agent will use sessions_history to get the content and pass it here
# For now, this is a placeholder that the agent orchestrates

echo "💾 Summary will be saved to: $MEMORY_FILE"
echo "🔄 Session will be reset after summary"
