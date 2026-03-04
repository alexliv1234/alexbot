#!/bin/bash
# Morning routine for playing group - reset scores and announce new day
# ✨ WITH COORDINATOR + GROUP MANAGER INTEGRATION

WORKSPACE="/home/alexliv/.openclaw/workspace"
cd "$WORKSPACE"

GROUP_ID="120363405143589138@g.us"

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
# ACTUAL WORK - Step 3: Do the job (NOW USING GROUP MANAGER!)
# ═══════════════════════════════════════════════════════════════

echo "🌅 Morning reset via Group Manager"

# Reset scores using group manager (auto-backs up!)
node scripts/group-manager.js --reset-scores "$GROUP_ID"

# Get dynamic morning message template
MESSAGE=$(node scripts/group-manager.js --get-template "$GROUP_ID" "morning")

echo "✅ Scores reset to 0"
echo ""
echo "📢 Morning message generated:"
echo "$MESSAGE"

# ═══════════════════════════════════════════════════════════════
# COORDINATOR COMPLETE - Step 4: Mark as complete
# ═══════════════════════════════════════════════════════════════

node scripts/coordinator.js --complete-action "$ACTION_ID"
echo ""
echo "🎯 Ready for new day! (Action completed)"
