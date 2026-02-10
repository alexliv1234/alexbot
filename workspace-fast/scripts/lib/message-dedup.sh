#!/bin/bash
# message-dedup.sh - Message de-duplication utility
# Prevents duplicate messages from being sent within a time window
#
# Usage:
#   if should_send_message "content" "target" 300; then
#       send_message...
#       mark_message_sent "content" "target"
#   fi

DEDUP_DIR="/home/alexliv/.openclaw/workspace/.cache/message-dedup"
mkdir -p "$DEDUP_DIR"

# Generate hash for message content + target
message_hash() {
    local content="$1"
    local target="$2"
    echo -n "${content}|${target}" | sha256sum | cut -d' ' -f1
}

# Check if message should be sent (returns 0 if YES, 1 if NO)
should_send_message() {
    local content="$1"
    local target="$2"
    local window_seconds="${3:-300}"  # Default 5 minutes
    
    local hash=$(message_hash "$content" "$target")
    local marker_file="$DEDUP_DIR/$hash"
    
    # If marker doesn't exist, message should be sent
    if [ ! -f "$marker_file" ]; then
        return 0
    fi
    
    # Check if marker is older than window
    local marker_age=$(($(date +%s) - $(stat -c %Y "$marker_file" 2>/dev/null || echo 0)))
    
    if [ "$marker_age" -gt "$window_seconds" ]; then
        # Old marker, can send
        return 0
    else
        # Recent marker, skip
        echo "⚠️  Duplicate detected: message sent $marker_age seconds ago (window: $window_seconds)" >&2
        return 1
    fi
}

# Mark message as sent
mark_message_sent() {
    local content="$1"
    local target="$2"
    
    local hash=$(message_hash "$content" "$target")
    local marker_file="$DEDUP_DIR/$hash"
    
    echo "$(date -Iseconds)|$target|$content" > "$marker_file"
}

# Clean old markers (older than 1 hour)
cleanup_old_markers() {
    find "$DEDUP_DIR" -type f -mmin +60 -delete 2>/dev/null
}

# Export functions for use in other scripts
export -f message_hash
export -f should_send_message
export -f mark_message_sent
export -f cleanup_old_markers
