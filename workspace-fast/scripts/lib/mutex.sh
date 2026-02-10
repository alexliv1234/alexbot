#!/bin/bash
# mutex.sh - Simple file-based mutex for preventing parallel script execution
#
# Usage:
#   source scripts/lib/mutex.sh
#   acquire_lock "my-script-name" || exit 1
#   trap release_lock EXIT
#   # ... do work ...

LOCK_DIR="/home/alexliv/.openclaw/workspace/.cache/locks"
mkdir -p "$LOCK_DIR"

LOCK_FILE=""
LOCK_PID=$$

# Acquire lock (returns 0 on success, 1 on failure)
acquire_lock() {
    local lock_name="$1"
    local timeout="${2:-30}"  # Default 30 seconds
    local wait_interval=1
    local waited=0
    
    LOCK_FILE="$LOCK_DIR/$lock_name.lock"
    
    while [ $waited -lt $timeout ]; do
        # Try to create lock file atomically
        if mkdir "$LOCK_FILE" 2>/dev/null; then
            # Lock acquired
            echo $LOCK_PID > "$LOCK_FILE/pid"
            echo "$(date -Iseconds)" > "$LOCK_FILE/timestamp"
            echo "✅ Lock acquired: $lock_name (PID $LOCK_PID)" >&2
            return 0
        fi
        
        # Lock exists, check if it's stale
        if [ -f "$LOCK_FILE/pid" ]; then
            local lock_pid=$(cat "$LOCK_FILE/pid")
            local lock_age=$(($(date +%s) - $(stat -c %Y "$LOCK_FILE/timestamp" 2>/dev/null || echo 0)))
            
            # If lock is older than 5 minutes or process doesn't exist, break it
            if [ "$lock_age" -gt 300 ] || ! kill -0 "$lock_pid" 2>/dev/null; then
                echo "⚠️  Breaking stale lock (PID $lock_pid, age ${lock_age}s)" >&2
                rm -rf "$LOCK_FILE"
                continue
            fi
        fi
        
        # Lock is held by another process, wait
        sleep $wait_interval
        waited=$((waited + wait_interval))
    done
    
    echo "❌ Failed to acquire lock: $lock_name (timeout after ${timeout}s)" >&2
    return 1
}

# Release lock
release_lock() {
    if [ -n "$LOCK_FILE" ] && [ -d "$LOCK_FILE" ]; then
        rm -rf "$LOCK_FILE"
        echo "🔓 Lock released: $(basename $LOCK_FILE .lock)" >&2
    fi
}

# Clean stale locks (older than 10 minutes)
cleanup_stale_locks() {
    find "$LOCK_DIR" -type d -name "*.lock" -mmin +10 -exec rm -rf {} \; 2>/dev/null
}

# Export functions
export -f acquire_lock
export -f release_lock
export -f cleanup_stale_locks
