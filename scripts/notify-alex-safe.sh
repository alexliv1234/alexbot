#!/bin/bash
# notify-alex-safe.sh - Safe wrapper with de-duplication and logging
# Usage: ./notify-alex-safe.sh "message text" [dedup_window_seconds]
#
# This version includes:
# - De-duplication (prevents duplicate sends within time window)
# - Message logging (tracks all sends)
# - Mutex lock (prevents parallel execution)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/message-dedup.sh"
source "$SCRIPT_DIR/lib/message-log.sh"
source "$SCRIPT_DIR/lib/mutex.sh"

ALEX_NUMBER="+972544419002"
GATEWAY_URL="http://localhost:18789"
GATEWAY_TOKEN="4022c25618486afc44a7f3034a10bc1e48597f6e21375706"

if [ -z "$1" ]; then
    echo "Usage: $0 \"message\" [dedup_window_seconds]"
    exit 1
fi

MESSAGE="$1"
DEDUP_WINDOW="${2:-300}"  # Default 5 minutes

# Add robot emoji prefix if not present
if [[ ! "$MESSAGE" =~ ^🤖 ]]; then
    MESSAGE="🤖 $MESSAGE"
fi

# Acquire lock to prevent parallel sends
acquire_lock "notify-alex" 10 || {
    echo "❌ Another notify-alex is running, skipping"
    exit 1
}
trap release_lock EXIT

# Check for duplicate
if ! should_send_message "$MESSAGE" "$ALEX_NUMBER" "$DEDUP_WINDOW"; then
    echo "⚠️  Skipping duplicate message to Alex"
    log_message_send "$ALEX_NUMBER" "$MESSAGE" "whatsapp" "skipped-duplicate"
    exit 0
fi

# Send message
echo "📤 Sending to Alex ($ALEX_NUMBER)..."
echo "Message: $MESSAGE"
echo ""

RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/message/send" \
    -H "Authorization: Bearer $GATEWAY_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"channel\": \"whatsapp\",
        \"to\": \"$ALEX_NUMBER\",
        \"message\": \"$MESSAGE\"
    }")

# Check if successful
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Sent to Alex"
    mark_message_sent "$MESSAGE" "$ALEX_NUMBER"
    log_message_send "$ALEX_NUMBER" "$MESSAGE" "whatsapp" "sent"
else
    echo "❌ Send failed"
    echo "$RESPONSE" | jq .
    log_message_send "$ALEX_NUMBER" "$MESSAGE" "whatsapp" "failed"
    exit 1
fi

# Cleanup old markers and rotate log
cleanup_old_markers
rotate_log_if_needed
