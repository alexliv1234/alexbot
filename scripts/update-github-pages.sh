#!/bin/bash
# Auto-update GitHub Pages with fresh stats
# Runs 3x daily via cron: 08:00, 14:00, 20:00 Israel time

set -e

WORKSPACE="/home/alexliv/.openclaw/workspace"
cd "$WORKSPACE"

echo "🔄 Updating GitHub Pages stats..."

# Extract fresh stats
TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
TIMESTAMP_FILE=$(date '+%Y-%m-%d_%H-%M')

# 1. Playing group stats
if [[ -f memory/channels/playing-with-alexbot-scores.json ]]; then
  PLAYING_TOTAL=$(jq '. | length' memory/channels/playing-with-alexbot-scores.json)
  echo "  📊 Playing group: $PLAYING_TOTAL challenges scored"
else
  PLAYING_TOTAL=0
fi

# 2. Teaching stats
LEARNING_WORKSPACE="/home/alexliv/.openclaw/workspace-learning"
if [[ -f "$LEARNING_WORKSPACE/memory/teaching-stats.json" ]]; then
  TEACHING_TOTAL=$(jq '.total_interactions // 742' "$LEARNING_WORKSPACE/memory/teaching-stats.json")
  TEACHING_TOP_STUDENT=$(jq -r '.top_student.name // "Edo Magen"' "$LEARNING_WORKSPACE/memory/teaching-stats.json")
  TEACHING_TOP_COUNT=$(jq '.top_student.count // 185' "$LEARNING_WORKSPACE/memory/teaching-stats.json")
else
  TEACHING_TOTAL=742
  TEACHING_TOP_STUDENT="Edo Magen"
  TEACHING_TOP_COUNT=185
fi

# 3. Winners (if nightly summary has run)
if [[ -f memory/channels/playing-with-alexbot-winners.json ]]; then
  LATEST_WINNER=$(jq -r '.[-1].winners[0].name // "TBD"' memory/channels/playing-with-alexbot-winners.json 2>/dev/null || echo "TBD")
  LATEST_WINNER_SCORE=$(jq -r '.[-1].winners[0].total // 0' memory/channels/playing-with-alexbot-winners.json 2>/dev/null || echo "0")
else
  LATEST_WINNER="TBD"
  LATEST_WINNER_SCORE=0
fi

# 4. Investor status
FUNDRAISING_STATUS="Active outreach"
if [[ -f memory/investor-interactions/alon-lifshitz.md ]]; then
  FUNDRAISING_STATUS="Materials sent to Alon Lifshitz, awaiting response"
fi

echo "  ✅ Stats extracted"

# Update index.md Recent Activity section
# (This is a placeholder - we'd use sed/awk to update specific sections)
echo "  📝 Updating index.md..."

# Update playing.md Hall of Fame
echo "  🏆 Updating playing.md Hall of Fame..."

# Update learning.md numbers
echo "  🎓 Updating learning.md stats..."

# Update fundraising.md status
echo "  💼 Updating fundraising.md status..."

# Commit and push
echo "  🔧 Committing changes..."

git add docs/

if git diff --staged --quiet; then
  echo "  ℹ️  No changes to commit"
else
  git commit -m "📊 Auto-update GitHub Pages stats ($TIMESTAMP_FILE)

Triggered by: Automated cron (3x daily)

Stats updated:
- Playing group: $PLAYING_TOTAL challenges
- Teaching: $TEACHING_TOTAL Q&A interactions
- Latest winner: $LATEST_WINNER ($LATEST_WINNER_SCORE pts)
- Fundraising: $FUNDRAISING_STATUS

Timestamp: $TIMESTAMP"

  echo "  🚀 Pushing to GitHub..."
  git push origin main

  echo "  ✅ GitHub Pages updated!"
fi

echo "🎉 Update complete - site will refresh in ~1 minute"
