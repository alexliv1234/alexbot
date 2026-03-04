#!/bin/bash
# Morning briefing that reads current reality from daily files

DATE=$(date +%Y-%m-%d)
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d)

# Check if today's memory file exists, if not create it
TODAY_FILE="$HOME/.openclaw/workspace/memory/$DATE.md"
if [ ! -f "$TODAY_FILE" ]; then
  cat > "$TODAY_FILE" << EOF
# $DATE - Daily Memory

## Conversations with Alex

EOF
fi

# Read yesterday's memory for context
YESTERDAY_CONTEXT=""
YESTERDAY_FILE="$HOME/.openclaw/workspace/memory/$YESTERDAY.md"
if [ -f "$YESTERDAY_FILE" ]; then
  YESTERDAY_CONTEXT=$(cat "$YESTERDAY_FILE")
fi

# Read war context from MEMORY.md
WAR_CONTEXT=$(grep -A 10 "CURRENT REALITY - Israel at War" "$HOME/.openclab/workspace/MEMORY.md" 2>/dev/null || echo "")

echo "Morning briefing preparation complete. Context loaded from daily files."
