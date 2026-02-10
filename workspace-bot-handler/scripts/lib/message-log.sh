#!/bin/bash
# message-log.sh - Centralized message sending logger
# Logs all outgoing messages with timestamp, content hash, and target
#
# Usage:
#   log_message_send "target" "content" "channel" "status"

MESSAGE_LOG="/home/alexliv/.openclaw/workspace/memory/message-sends.log"

log_message_send() {
    local target="$1"
    local content="$2"
    local channel="${3:-whatsapp}"
    local status="${4:-sent}"
    
    local timestamp=$(date -Iseconds)
    local content_hash=$(echo -n "$content" | sha256sum | cut -d' ' -f1 | cut -c1-12)
    local content_preview=$(echo "$content" | head -c 100 | tr '\n' ' ')
    
    # JSONL format for easy parsing
    echo "{\"timestamp\":\"$timestamp\",\"target\":\"$target\",\"channel\":\"$channel\",\"hash\":\"$content_hash\",\"status\":\"$status\",\"preview\":\"$content_preview\"}" >> "$MESSAGE_LOG"
}

# Check for recent duplicates in log
check_recent_send() {
    local target="$1"
    local content="$2"
    local window_seconds="${3:-300}"
    
    local content_hash=$(echo -n "$content" | sha256sum | cut -d' ' -f1 | cut -c1-12)
    local cutoff=$(date -d "$window_seconds seconds ago" -Iseconds)
    
    # Check last 100 entries for matching hash + target
    tail -100 "$MESSAGE_LOG" 2>/dev/null | \
        jq -r "select(.timestamp > \"$cutoff\" and .target == \"$target\" and .hash == \"$content_hash\") | .timestamp" | \
        head -1
}

# Rotate log if too large (keep last 10k lines)
rotate_log_if_needed() {
    if [ -f "$MESSAGE_LOG" ]; then
        local lines=$(wc -l < "$MESSAGE_LOG")
        if [ "$lines" -gt 15000 ]; then
            tail -10000 "$MESSAGE_LOG" > "$MESSAGE_LOG.tmp"
            mv "$MESSAGE_LOG.tmp" "$MESSAGE_LOG"
            echo "📋 Rotated message log (was $lines lines, now 10k)" >&2
        fi
    fi
}

export -f log_message_send
export -f check_recent_send
export -f rotate_log_if_needed
