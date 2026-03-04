#!/bin/bash
# Morning routine for playing group - reset scores and announce new day
# ✨ NOW WITH COORDINATOR INTEGRATION

WORKSPACE="/home/alexliv/.openclaw/workspace"
cd "$WORKSPACE"

# ═══════════════════════════════════════════════════════════════
# COORDINATOR CHECK - Step 1: Should we proceed?
# ═══════════════════════════════════════════════════════════════

CHECK=$(node scripts/coordinator.js --check-before-action "playing-morning" "Playing group morning wakeup")
DECISION=$(echo "$CHECK" | jq -r '.decision')

if [ "$DECISION" != "PROCEED" ]; then
  REASON=$(echo "$CHECK" | jq -r '.reason')
  echo "⏸️ HOLD: $REASON"
  RETRY=$(echo "$CHECK" | jq -r '.retryAfterMs')
  echo "⏰ Retry in: $((RETRY / 60000)) minutes"
  exit 0
fi

echo "✅ Coordinator approved - proceeding"

# ═══════════════════════════════════════════════════════════════
# COORDINATOR REGISTER - Step 2: Register action
# ═══════════════════════════════════════════════════════════════

ACTION_ID=$(node scripts/coordinator.js --register-action "playing-morning" "Morning wakeup" | jq -r '.actionId')
echo "📝 Registered action: $ACTION_ID"

# ═══════════════════════════════════════════════════════════════
# ACTUAL WORK - Step 3: Do the job
# ═══════════════════════════════════════════════════════════════

DATE=$(date +%Y-%m-%d)
BACKUP_FILE="memory/channels/playing-with-alexbot-scores-backup-${DATE}.json"
SCORES_FILE="memory/channels/playing-with-alexbot-scores.json"

echo "🌅 Morning reset for $DATE"

# 1. Backup yesterday's scores
if [ -f "$SCORES_FILE" ]; then
  cp "$SCORES_FILE" "$BACKUP_FILE"
  echo "✅ Backup created: $BACKUP_FILE"
fi

# 2. Reset scores to empty
echo '{"scores":{}}' > "$SCORES_FILE"
echo "✅ Scores reset to 0"

# ═══════════════════════════════════════════════════════════════
# COORDINATOR COMPLETE - Step 4: Mark as complete
# ═══════════════════════════════════════════════════════════════

node scripts/coordinator.js --complete-action "$ACTION_ID"
echo "🎯 Ready for new day! (Action completed)"
