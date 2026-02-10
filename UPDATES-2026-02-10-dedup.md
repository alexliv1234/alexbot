# Message De-duplication System - Updates Log
**Date:** 2026-02-10  
**Triggered by:** Alex's request after duplicate message incident (19:38-19:40)

## 🎯 Problem
Duplicate messages being sent, likely due to:
1. Parallel cron job execution
2. No de-duplication checks
3. Race conditions in message sending
4. Lack of centralized logging

## ✅ Solution Implemented

### 1. Core Libraries (`scripts/lib/`)

**message-dedup.sh** - De-duplication utility
- Hash-based duplicate detection (content + target)
- Configurable time windows (default: 5min DMs, 3min groups)
- Auto-cleanup of old markers (>1 hour)
- Functions: `should_send_message()`, `mark_message_sent()`, `cleanup_old_markers()`

**mutex.sh** - Lock management
- Atomic file-based locks
- Stale lock detection and breaking (>5min or dead process)
- Configurable timeouts
- Auto-release on exit
- Functions: `acquire_lock()`, `release_lock()`, `cleanup_stale_locks()`

**message-log.sh** - Centralized logging
- JSONL format at `memory/message-sends.log`
- Logs: timestamp, target, channel, content hash, status
- Auto-rotation (keeps last 10k lines)
- Duplicate detection via log history
- Functions: `log_message_send()`, `check_recent_send()`, `rotate_log_if_needed()`

**Documentation:** `scripts/lib/README.md` with full examples

### 2. Protected Wrappers

**notify-alex-safe.sh** - Protected Alex notifications
- ✅ De-duplication (5min window)
- ✅ Mutex lock (10s timeout)
- ✅ Message logging
- ✅ Auto-cleanup
- Replaces old notify-alex.sh (now redirects here)

**send-to-playing-group-safe.sh** - Protected group sends
- ✅ De-duplication (3min window)
- ✅ Mutex lock (10s timeout)
- ✅ Message logging
- ✅ Auto-cleanup

**notify-alex.sh** - Updated to wrapper
- Now redirects all calls to notify-alex-safe.sh
- Ensures all legacy scripts get protections automatically

### 3. Cron Script Updates

**workspace-fast/scripts/playing-group-morning.sh**
- ✅ Replaced manual mutex with `lib/mutex.sh`
- ✅ Cleaner lock management
- ✅ Better stale lock handling

**workspace-fast/scripts/playing-group-nightly.sh**
- ✅ Replaced manual mutex with `lib/mutex.sh`
- ✅ Cleaner lock management
- ✅ Better stale lock handling

### 4. Cross-Workspace Distribution

**Copied libraries to:**
- ✅ `workspace-fast/scripts/lib/` (playing group scripts)
- ✅ `workspace-bot-handler/scripts/lib/` (bot handler)

All workspaces now have access to the same protection utilities.

## 📊 Cache & Log Locations

```
.cache/
├── message-dedup/          # De-duplication markers (hash-based)
└── locks/                  # Mutex lock files

memory/
└── message-sends.log       # Centralized send log (JSONL, auto-rotates)
```

## 🧪 Testing

**Test script:** `scripts/test-dedup.sh`
```bash
./scripts/test-dedup.sh
```

Tests:
1. First send (succeeds)
2. Immediate duplicate (blocked)
3. Different message (succeeds)
4. Log verification

## 📝 Integration Examples

### For new scripts that send messages:

```bash
#!/bin/bash
source scripts/lib/mutex.sh
source scripts/lib/message-dedup.sh
source scripts/lib/message-log.sh

# Acquire lock
acquire_lock "my-script" 30 || exit 1
trap release_lock EXIT

# Check for duplicate
TARGET="+972544419002"
MESSAGE="Your message"

if should_send_message "$MESSAGE" "$TARGET" 300; then
    # Send via your method...
    
    # Mark as sent
    mark_message_sent "$MESSAGE" "$TARGET"
    log_message_send "$TARGET" "$MESSAGE" "whatsapp" "sent"
else
    log_message_send "$TARGET" "$MESSAGE" "whatsapp" "skipped-duplicate"
fi

# Cleanup
cleanup_old_markers
rotate_log_if_needed
```

### For existing scripts:

Just replace direct sends with the safe wrappers:

**OLD:**
```bash
bash scripts/notify-alex.sh "message"
```

**NEW:**
```bash
bash scripts/notify-alex-safe.sh "message" [dedup_window]
# OR just use notify-alex.sh - it auto-redirects now!
```

## 🚀 Next Steps

1. **Monitor logs:** Check `memory/message-sends.log` for duplicate patterns
2. **Adjust windows:** If legitimate re-sends are blocked, tune dedup windows
3. **Add to more scripts:** Integrate into any script that sends messages
4. **Weekly cleanup:** `cleanup_stale_locks` can run via cron if needed

## 📈 Expected Benefits

- ❌ No more duplicate messages
- ✅ Parallel-safe script execution
- ✅ Full audit trail of all sends
- ✅ Automatic stale lock cleanup
- ✅ Easy debugging via centralized logs
- ✅ Consistent protection across all workspaces

## 🔧 Maintenance

**Weekly:**
- Check `memory/message-sends.log` size (auto-rotates at 15k lines)
- Review blocked duplicates: `grep "skipped-duplicate" memory/message-sends.log`

**Monthly:**
- Review lock timeouts if scripts are timing out
- Adjust dedup windows if false positives occur

---

**Status:** ✅ Deployed and active  
**Git commit:** See commit history for full implementation
