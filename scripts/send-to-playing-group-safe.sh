#!/bin/bash
# send-to-playing-group-safe.sh - Safe wrapper for sending to playing group
# Usage: ./send-to-playing-group-safe.sh "message text" [dedup_window_seconds]
#
# Includes de-duplication, logging, and mutex lock

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/message-dedup.sh"
source "$SCRIPT_DIR/lib/message-log.sh"
source "$SCRIPT_DIR/lib/mutex.sh"

PLAYING_GROUP="120363405143589138@g.us"

if [ -z "$1" ]; then
    echo "Usage: $0 \"message\" [dedup_window_seconds]"
    exit 1
fi

MESSAGE="$1"
DEDUP_WINDOW="${2:-180}"  # Default 3 minutes (shorter for group)

# Acquire lock to prevent parallel sends to group
acquire_lock "send-playing-group" 10 || {
    echo "❌ Another send-playing-group is running, skipping"
    exit 1
}
trap release_lock EXIT

# Check for duplicate
if ! should_send_message "$MESSAGE" "$PLAYING_GROUP" "$DEDUP_WINDOW"; then
    echo "⚠️  Skipping duplicate message to playing group"
    log_message_send "$PLAYING_GROUP" "$MESSAGE" "whatsapp" "skipped-duplicate"
    exit 0
fi

# Send message using OpenClaw CLI
echo "📤 Sending to playing group..."
echo "Message: $MESSAGE"
echo ""

# Use OpenClaw CLI to send message (proper method)
if openclaw message send --channel whatsapp --target "$PLAYING_GROUP" --message "$MESSAGE" --json > /tmp/send-result.json 2>&1; then
    echo "✅ Sent to playing group"
    mark_message_sent "$MESSAGE" "$PLAYING_GROUP"
    log_message_send "$PLAYING_GROUP" "$MESSAGE" "whatsapp" "sent"
    cat /tmp/send-result.json
else
    echo "❌ Send failed"
    cat /tmp/send-result.json
    log_message_send "$PLAYING_GROUP" "$MESSAGE" "whatsapp" "failed"
    exit 1
fi

# Cleanup old markers and rotate log
cleanup_old_markers
rotate_log_if_needed
