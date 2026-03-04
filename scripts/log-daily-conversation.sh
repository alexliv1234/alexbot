#!/bin/bash
# Log daily conversations to memory/YYYY-MM-DD.md

DATE=$(date +%Y-%m-%d)
MEMORY_FILE="$HOME/.openclaw/workspace/memory/$DATE.md"

# Create file if doesn't exist
if [ ! -f "$MEMORY_FILE" ]; then
  cat > "$MEMORY_FILE" << EOF
# $DATE - Daily Memory

## Conversations with Alex

EOF
fi

# Append conversation entry
# Usage: bash scripts/log-daily-conversation.sh "topic" "summary"
if [ $# -ge 2 ]; then
  TOPIC="$1"
  SUMMARY="$2"
  TIMESTAMP=$(date +%H:%M)
  
  cat >> "$MEMORY_FILE" << EOF

### $TIMESTAMP - $TOPIC

$SUMMARY

EOF
fi
