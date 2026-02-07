#!/bin/bash
# Check for error messages in "playing with alex bot" group and give Broke points
# Runs via cron every minute

GROUP_ID="120363405143589138@g.us"
SCORES_FILE="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-scores.json"
BROKE_TRACKER="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-broke-tracker.json"
DAILY_LOG="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-daily/$(date +%Y-%m-%d).jsonl"

# Initialize tracker if doesn't exist
if [ ! -f "$BROKE_TRACKER" ]; then
    echo '{"scored_error_timestamps": []}' > "$BROKE_TRACKER"
fi

# Get recent messages from wacli (last 20)
MESSAGES=$(~/go/bin/wacli messages list --chat "$GROUP_ID" --limit 20 2>/dev/null)

if [ -z "$MESSAGES" ]; then
    exit 0
fi

# Look for error patterns in bot messages
# Error patterns: "Context overflow", "An unknown error occurred", "error occurred"
echo "$MESSAGES" | while read -r line; do
    # Check if this is a bot error message (from "me")
    if echo "$line" | grep -q "me.*\(Context overflow\|unknown error\|error occurred\)"; then
        # Extract timestamp
        TIMESTAMP=$(echo "$line" | awk '{print $1" "$2}')
        
        # Check if we already scored this error
        if jq -e ".scored_error_timestamps | index(\"$TIMESTAMP\")" "$BROKE_TRACKER" > /dev/null 2>&1; then
            continue  # Already scored
        fi
        
        # Output error found (will be picked up by cron job caller)
        echo "ERROR_FOUND|$TIMESTAMP"
    fi
done
