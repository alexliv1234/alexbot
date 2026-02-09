# Cron Jobs Fixed - 2026-02-09 08:37

## ✅ Changes Applied

### 1. Removed Duplicate Session Monitor
- **Deleted:** `Session Cleanup Monitor` (43f225cc)
- **Kept:** `session-monitor` (ba821677) - runs in isolated session
- **Impact:** No more duplicate session cleanup runs

### 2. Fixed Main Session Routing Bugs
Converted 3 jobs from `sessionTarget: "main"` → `sessionTarget: "isolated"` to prevent routing bugs:

| Job | Old | New | Impact |
|-----|-----|-----|--------|
| media-ready-check | main (systemEvent) | isolated (agentTurn) | Notifications go to Alex, not random people |
| moltbook-update | main (systemEvent) | isolated (agentTurn) | Updates go to Alex, not random people |
| morning-briefing | main (systemEvent) | isolated (agentTurn) | Morning briefing goes to Alex, not random people |

All now have explicit routing: `message` tool with `to: +972544419002`

### 3. Added Mutex/Lock Protection
Added lock files to prevent duplicate runs:

**playing-group-morning.sh:**
- Lock file: `/tmp/playing-group-morning.lock`
- Timeout: 5 minutes
- Prevents duplicate morning wakeup messages

**playing-group-nightly.sh:**
- Lock file: `/tmp/playing-group-nightly.lock`
- Timeout: 10 minutes
- Prevents duplicate nightly summaries

## 🔍 How Locks Work

1. Script checks if lock file exists
2. If exists and fresh (<timeout) and PID still running → exit silently
3. If stale or process dead → remove lock and continue
4. Create new lock with current PID
5. Trap EXIT to always clean up lock

## 📊 Current State

**All cron jobs now:**
- ✅ Run in isolated sessions (no main session routing bugs)
- ✅ Use explicit `message` tool routing when notifying Alex
- ✅ Have mutex protection where needed (morning/nightly)
- ✅ No duplicates

## 🎯 Expected Behavior

- **Morning briefing (6:30am):** Will arrive to Alex's WhatsApp, not to random people
- **Media checks:** Notifications go to Alex only
- **Playing group (8:00am):** Only ONE morning wakeup message, no duplicates
- **Playing group (23:00):** Only ONE nightly summary
- **Session monitors:** Run once every 3 minutes as intended

## 🐛 What Was Wrong

Before:
- Main session jobs sent their output to whoever last triggered the main session
- If Hadas sent a message at 6:29am, the 6:30am morning briefing would go to her
- Playing group jobs could run multiple times if cron triggered overlapping instances
- Session monitor ran twice every 3 minutes

After:
- All isolated → no "last person" routing bug
- Explicit `to: +972544419002` in all notifications
- Locks prevent overlapping runs
- Only one session monitor

## 📝 Audit File

Full audit saved to: `cron-audit-2026-02-09.md`
