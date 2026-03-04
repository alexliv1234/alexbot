#!/bin/bash
# Review Recent Teachings
# Analyzes scoring data and extracts teaching quality insights

set -euo pipefail

WORKSPACE="/home/alexliv/.openclaw/workspace/workspace-fast"
SCORES_FILE="$WORKSPACE/memory/channels/playing-with-alexbot-scores.json"
INSIGHTS_DIR="$WORKSPACE/memory/channels/playing-with-alexbot-insights"
INTL_SCORES="$WORKSPACE/memory/channels/international-playing-scores.json"
LESSONS_DIR="$WORKSPACE/memory/international-groups/learning/teaching-lessons"

# Parse arguments
TODAY_ONLY=false
if [[ "${1:-}" == "--today" ]]; then
  TODAY_ONLY=true
fi

DATE=$(date +%Y-%m-%d)
REVIEW_FILE="$LESSONS_DIR/$DATE-review.md"

# Ensure directories exist
mkdir -p "$LESSONS_DIR"
mkdir -p "$INSIGHTS_DIR"

echo "🔍 Reviewing teaching quality..."
echo ""

# Function to calculate average score for a category
calc_avg() {
  local category=$1
  local total=0
  local count=0
  
  while IFS= read -r score; do
    total=$((total + score))
    count=$((count + 1))
  done < <(jq -r ".scores | to_entries[] | .value.breakdown.$category" "$SCORES_FILE" 2>/dev/null)
  
  if [[ $count -gt 0 ]]; then
    echo "scale=1; $total / $count" | bc
  else
    echo "0"
  fi
}

# Analyze Hebrew playing group
if [[ -f "$SCORES_FILE" ]]; then
  echo "📊 Hebrew Playing Group Analysis:"
  
  TOTAL_PARTICIPANTS=$(jq -r '.leaderboard | length' "$SCORES_FILE")
  TOTAL_MESSAGES=$(jq -r '[.scores | to_entries[] | .value.messages_scored] | add' "$SCORES_FILE")
  
  echo "  Participants: $TOTAL_PARTICIPANTS"
  echo "  Messages: $TOTAL_MESSAGES"
  
  # Category averages
  echo ""
  echo "  Average Scores by Category:"
  for cat in creativity challenge humor cleverness engagement broke hacked; do
    avg=$(calc_avg "$cat")
    printf "    %-12s: %.1f/10\n" "$cat" "$avg"
  done
  
  # Find today's insight
  TODAY_INSIGHT="$INSIGHTS_DIR/$DATE.json"
  if [[ -f "$TODAY_INSIGHT" ]]; then
    echo ""
    echo "  Today's Theme: $(jq -r '.theme' "$TODAY_INSIGHT")"
    echo "  Top Performer: $(jq -r '.top_performer.name' "$TODAY_INSIGHT") ($(jq -r '.top_performer.total' "$TODAY_INSIGHT") pts)"
  fi
fi

echo ""

# Analyze International playing group
if [[ -f "$INTL_SCORES" ]]; then
  echo "🌍 International Playing Group Analysis:"
  
  INTL_PARTICIPANTS=$(jq -r '.totalParticipants' "$INTL_SCORES")
  INTL_MESSAGES=$(jq -r '.totalMessages' "$INTL_SCORES")
  
  echo "  Participants: $INTL_PARTICIPANTS"
  echo "  Messages: $INTL_MESSAGES"
  
  if [[ "$INTL_MESSAGES" -gt 0 ]]; then
    # Would calculate averages here if there were messages
    echo "  (Scoring data available when activity starts)"
  else
    LAST_CHALLENGE=$(jq -r '.hourlyChallenge.lastSent' "$INTL_SCORES")
    echo "  Last Challenge: $LAST_CHALLENGE"
    echo "  Status: No activity yet"
  fi
fi

echo ""
echo "📝 Teaching Patterns:"

# Check if TEACHING-QUICK-REF.md exists and needs updating
if [[ -f "$WORKSPACE/TEACHING-QUICK-REF.md" ]]; then
  echo "  ✅ Quick reference guide exists"
else
  echo "  ⚠️  TEACHING-QUICK-REF.md not found - should be created"
fi

# Check review file
if [[ -f "$REVIEW_FILE" ]]; then
  echo "  ✅ Today's review already created: $REVIEW_FILE"
else
  echo "  ⚠️  Today's review not yet created"
  echo "     Agent should analyze and create: $REVIEW_FILE"
fi

echo ""
echo "🎯 Action Items:"

# Identify low-scoring categories
HUMOR_AVG=$(calc_avg "humor")
if (( $(echo "$HUMOR_AVG < 5" | bc -l) )); then
  echo "  - Humor scores low ($HUMOR_AVG/10) - be more playful!"
fi

HACKED_AVG=$(calc_avg "hacked")
if (( $(echo "$HACKED_AVG > 3" | bc -l) )); then
  echo "  - Hacked scores high ($HACKED_AVG/10) - review security boundaries"
fi

# Check for infrastructure issues
LEARNING_CONTEXT="$WORKSPACE/memory/international-groups/learning/context.md"
if [[ -f "$LEARNING_CONTEXT" ]]; then
  FAILED_TIPS=$(grep -c "FAILED" "$LEARNING_CONTEXT" || true)
  if [[ $FAILED_TIPS -gt 0 ]]; then
    echo "  - Learning group delivery BLOCKED - $FAILED_TIPS failed tips"
    echo "    → Fix WhatsApp connectivity and tool policies"
  fi
fi

echo ""
echo "✅ Review complete!"
echo ""
echo "📁 Files:"
echo "  - Review: $REVIEW_FILE"
echo "  - Quick Ref: $WORKSPACE/TEACHING-QUICK-REF.md"
echo "  - Lessons Dir: $LESSONS_DIR"
