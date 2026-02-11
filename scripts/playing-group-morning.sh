#!/bin/bash
# Morning routine for playing group - reset scores and announce new day

WORKSPACE="/home/alexliv/.openclaw/workspace"
cd "$WORKSPACE"

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

# 3. Done
echo "🎯 Ready for new day!"
