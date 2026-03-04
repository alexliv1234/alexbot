#!/bin/bash
# Automatically create daily memory file if it doesn't exist

DATE=$(date +%Y-%m-%d)
DAY_NAME=$(date +%A)
MEMORY_FILE="$HOME/.openclaw/workspace/memory/$DATE.md"

# Create file with template if doesn't exist
if [ ! -f "$MEMORY_FILE" ]; then
  cat > "$MEMORY_FILE" << EOF
# $DATE ($DAY_NAME)

## Conversations with Alex

## War Context
- Israel at war with Iran and Lebanon
- Rockets/missiles ongoing
- People staying home, can't go to work normally

EOF
  echo "Created $MEMORY_FILE"
else
  echo "$MEMORY_FILE already exists"
fi
