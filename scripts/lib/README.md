# Message Utilities Library

Protection utilities for preventing duplicate messages and race conditions.

## Components

### 1. **message-dedup.sh** - De-duplication
Prevents duplicate messages from being sent within a time window.

**Usage:**
```bash
source scripts/lib/message-dedup.sh

# Check if message should be sent
if should_send_message "content" "target" 300; then
    # Send message...
    mark_message_sent "content" "target"
fi
```

**How it works:**
- Generates hash from content + target
- Stores marker file with timestamp
- Blocks sends within time window
- Auto-cleans old markers (>1 hour)

**Window defaults:**
- 300 seconds (5 min) for DMs
- 180 seconds (3 min) for groups

### 2. **mutex.sh** - Lock Management
Prevents parallel execution of scripts.

**Usage:**
```bash
source scripts/lib/mutex.sh

# Acquire lock (with 30s timeout)
acquire_lock "my-script" || exit 1
trap release_lock EXIT

# ... do work ...
# Lock released automatically on exit
```

**Features:**
- File-based atomic locks
- Stale lock detection (breaks locks >5min or from dead processes)
- Configurable timeout
- Auto-cleanup on exit

### 3. **message-log.sh** - Send Logging
Centralized logging for all outgoing messages.

**Usage:**
```bash
source scripts/lib/message-log.sh

# Log a send
log_message_send "target" "content" "whatsapp" "sent"

# Check for recent duplicate
timestamp=$(check_recent_send "target" "content" 300)
if [ -n "$timestamp" ]; then
    echo "Duplicate found, sent at: $timestamp"
fi
```

**Log format:** JSONL at `memory/message-sends.log`
```json
{"timestamp":"2026-02-10T21:00:00+02:00","target":"+972544419002","channel":"whatsapp","hash":"a1b2c3d4e5f6","status":"sent","preview":"message content..."}
```

**Auto-rotation:** Keeps last 10k lines when log exceeds 15k.

## Safe Wrappers

### notify-alex-safe.sh
Protected version of notify-alex.sh with all safeguards:
```bash
./scripts/notify-alex-safe.sh "message" [dedup_window_seconds]
```

### send-to-playing-group-safe.sh
Protected version for playing group sends:
```bash
./scripts/send-to-playing-group-safe.sh "message" [dedup_window_seconds]
```

## Testing

Run the test suite:
```bash
./scripts/test-dedup.sh
```

## Integration Example

```bash
#!/bin/bash
source scripts/lib/mutex.sh
source scripts/lib/message-dedup.sh
source scripts/lib/message-log.sh

# Acquire lock
acquire_lock "my-notification-script" 30 || exit 1
trap release_lock EXIT

# Check for duplicate
TARGET="+972544419002"
MESSAGE="Alert: Something happened"

if should_send_message "$MESSAGE" "$TARGET" 300; then
    # Send via your preferred method
    # ... sending code ...
    
    # Mark as sent
    mark_message_sent "$MESSAGE" "$TARGET"
    log_message_send "$TARGET" "$MESSAGE" "whatsapp" "sent"
else
    echo "Skipping duplicate"
    log_message_send "$TARGET" "$MESSAGE" "whatsapp" "skipped-duplicate"
fi

# Cleanup
cleanup_old_markers
rotate_log_if_needed
```

## Cache Locations

- Dedup markers: `.cache/message-dedup/`
- Locks: `.cache/locks/`
- Send log: `memory/message-sends.log`

All caches auto-clean stale data.
