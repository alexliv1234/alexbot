# Coordinator Integration Guide

## Overview

The Central Coordinator (`scripts/coordinator.js`) manages system-wide context and prevents conflicts.

**Every cron job should check with the coordinator before acting.**

## How to Integrate

### Step 1: Check Before Action

```bash
#!/bin/bash

# Check if we should proceed
CHECK=$(node scripts/coordinator.js --check-before-action "playing-hourly" "Playing group leaderboard")

DECISION=$(echo "$CHECK" | jq -r '.decision')

if [ "$DECISION" != "PROCEED" ]; then
  REASON=$(echo "$CHECK" | jq -r '.reason')
  echo "⏸️ Holding: $REASON"
  exit 0
fi
```

### Step 2: Register Action

```bash
# Register that we're starting
ACTION_ID=$(node scripts/coordinator.js --register-action "playing-hourly" "Playing group leaderboard" | jq -r '.actionId')
```

### Step 3: Do Your Work

```bash
# Your actual job logic here
echo "🎯 Doing the work..."
```

### Step 4: Complete Action

```bash
# Mark as complete
node scripts/coordinator.js --complete-action "$ACTION_ID"
```

## Full Example

```bash
#!/bin/bash
# Example: Playing group hourly leaderboard with coordinator

# Step 1: Check
CHECK=$(node scripts/coordinator.js --check-before-action "playing-hourly" "Leaderboard update")
DECISION=$(echo "$CHECK" | jq -r '.decision')

if [ "$DECISION" != "PROCEED" ]; then
  echo "⏸️ $(echo "$CHECK" | jq -r '.reason')"
  exit 0
fi

# Step 2: Register
ACTION_ID=$(node scripts/coordinator.js --register-action "playing-hourly" "Leaderboard" | jq -r '.actionId')

# Step 3: Work
echo "📊 Updating leaderboard..."
# ... your logic ...

# Step 4: Complete
node scripts/coordinator.js --complete-action "$ACTION_ID"
echo "✅ Done"
```

## Action Types

Use these standardized type names:

| Type | Priority | Use For |
|------|----------|---------|
| `investor-message` | 100 | Sending messages to investors |
| `investor-check` | 100 | Checking investor pipeline |
| `playing-morning` | 60 | Morning wakeup in playing groups |
| `playing-hourly` | 60 | Hourly leaderboards |
| `playing-nightly` | 60 | Nightly summaries |
| `learning-tip` | 50 | Learning group tips |
| `learning-review` | 50 | Teaching review |
| `personal-briefing` | 40 | Morning briefing for Alex |
| `personal-reminder` | 40 | Personal reminders |
| `maintenance` | 20 | System cleanup, git commits |
| `monitoring` | 10 | Session health, media checks |

## Benefits

✅ **No more time collisions** - Coordinator distributes jobs
✅ **Priority-aware** - Investors never blocked by group messages
✅ **Context-aware** - Checks Alex's calendar and availability
✅ **Rate limiting** - Prevents spam (max 3x same type in 15min)
✅ **Visibility** - See what's running with `--status`

## Gradual Rollout

**Week 1:** Integrate coordinator into all cron jobs
**Week 2:** Add group manager
**Week 3:** Merge teaching workspace
**Week 4:** Smart message routing
**Week 5:** Unified dashboard

Start with one job, test, then roll out to others.
