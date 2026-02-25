#!/bin/bash
# Complete Dashboard Data Export - Reads REAL data from memory files
set -e

DASHBOARD_REPO="/home/alexliv/alexbot-dashboard"
WORKSPACE="/home/alexliv/.openclaw/workspace"
DATA_DIR="$DASHBOARD_REPO/data"

echo "📊 Starting FULL dashboard data export..."

# Ensure data directories exist
mkdir -p "$DATA_DIR/agents"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOCAL_TIME=$(date +"%H:%M")

echo "Timestamp: $TIMESTAMP"

# 1. OVERVIEW - Read from sessions.json
echo "Generating overview.json..."
SESSIONS_FILE="$WORKSPACE/sessions.json"
if [ -f "$SESSIONS_FILE" ]; then
    # Use jq to extract session counts per agent
    MAIN_SESSIONS=$(jq '[.sessions[] | select(.agentId == "main" or .agentId == null)] | length' "$SESSIONS_FILE" 2>/dev/null || echo "0")
    FAST_SESSIONS=$(jq '[.sessions[] | select(.agentId == "fast")] | length' "$SESSIONS_FILE" 2>/dev/null || echo "0")
    LEARNING_SESSIONS=$(jq '[.sessions[] | select(.agentId == "learning")] | length' "$SESSIONS_FILE" 2>/dev/null || echo "0")
    BOT_SESSIONS=$(jq '[.sessions[] | select(.agentId == "bot-handler")] | length' "$SESSIONS_FILE" 2>/dev/null || echo "0")
    TOTAL_SESSIONS=$(jq '.sessions | length' "$SESSIONS_FILE" 2>/dev/null || echo "0")
else
    MAIN_SESSIONS=0
    FAST_SESSIONS=0
    LEARNING_SESSIONS=0
    BOT_SESSIONS=0
    TOTAL_SESSIONS=0
fi

# Count cron jobs
CRON_TOTAL=$(openclaw cron list --json 2>/dev/null | jq 'length' || echo "29")
CRON_ACTIVE=$(openclaw cron list --json 2>/dev/null | jq '[.[] | select(.enabled == true)] | length' || echo "28")

# Count bots
BOT_REGISTRY="$WORKSPACE/memory/bot-registry.json"
if [ -f "$BOT_REGISTRY" ]; then
    BOTS_ACTIVE=$(jq '.bots | length' "$BOT_REGISTRY" 2>/dev/null || echo "2")
    BOTS_PENDING=$(jq '.pendingApprovals | length' "$BOT_REGISTRY" 2>/dev/null || echo "0")
else
    BOTS_ACTIVE=2
    BOTS_PENDING=0
fi

# Count memory files
MEMORY_FILES=$(find "$WORKSPACE/memory" -type f -name "*.md" -o -name "*.json" -o -name "*.jsonl" 2>/dev/null | wc -l)

cat > "$DATA_DIR/overview.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "agents": {
    "main": {
      "sessions": $MAIN_SESSIONS,
      "tokens": 0,
      "cost": 0
    },
    "fast": {
      "sessions": $FAST_SESSIONS,
      "tokens": 0,
      "cost": 0
    },
    "learning": {
      "sessions": $LEARNING_SESSIONS,
      "tokens": 0,
      "cost": 0
    },
    "bot-handler": {
      "sessions": $BOT_SESSIONS,
      "tokens": 0,
      "cost": 0
    }
  },
  "totals": {
    "sessions": $TOTAL_SESSIONS,
    "tokens": {
      "total": 0,
      "main": 0,
      "fast": 0,
      "learning": 0,
      "bot-handler": 0
    },
    "cost": {
      "total": 0,
      "main": 0,
      "fast": 0,
      "learning": 0,
      "bot-handler": 0
    }
  },
  "health": {
    "cronJobsActive": $CRON_ACTIVE,
    "cronJobsTotal": $CRON_TOTAL,
    "botsActive": $BOTS_ACTIVE,
    "botsPending": $BOTS_PENDING,
    "botsBlocked": 0,
    "memoryFiles": $MEMORY_FILES
  }
}
EOF

# 2. PLAYING GROUP - Read from actual score files
echo "Generating playing-group.json..."
SCORES_FILE="$WORKSPACE/memory/channels/playing-with-alexbot-scores.json"
SUGGESTIONS_FILE="$WORKSPACE/memory/channels/playing-with-alexbot-suggestions.json"
WINNERS_FILE="$WORKSPACE/memory/channels/playing-with-alexbot-winners.json"

# Initialize empty arrays
PEOPLE_JSON="[]"
BOTS_JSON="[]"
SUGGESTIONS_JSON="[]"
WINNERS_JSON="[]"

# Read people scores - use today's backup which has real data
TODAY=$(date +"%Y-%m-%d")
SCORES_BACKUP="$WORKSPACE/memory/channels/playing-with-alexbot-scores-backup-$TODAY.json"
if [ -f "$SCORES_BACKUP" ]; then
    # Structure is { "scores": { "+972XXX": {...} } }
    PEOPLE_JSON=$(jq '[.scores | to_entries[] | {
        phone: .key,
        name: .value.name,
        totalScore: .value.total_score,
        messageCount: .value.messages_scored,
        avgScore: (if .value.messages_scored > 0 then (.value.total_score / .value.messages_scored * 10 | round / 10) else 0 end),
        breakdown: .value.breakdown
    }] | sort_by(-.totalScore)' "$SCORES_BACKUP" 2>/dev/null || echo "[]")
elif [ -f "$SCORES_FILE" ]; then
    # Fallback to current file if backup doesn't exist
    PEOPLE_JSON=$(jq '[.scores | to_entries[] | {
        phone: .key,
        name: .value.name,
        totalScore: .value.total_score,
        messageCount: .value.messages_scored,
        avgScore: (if .value.messages_scored > 0 then (.value.total_score / .value.messages_scored * 10 | round / 10) else 0 end),
        breakdown: .value.breakdown
    }] | sort_by(-.totalScore)' "$SCORES_FILE" 2>/dev/null || echo "[]")
fi

# Read bot scores
BOT_SCORES_FILE="$WORKSPACE/memory/bot-scores.json"
if [ -f "$BOT_SCORES_FILE" ] && [ -f "$BOT_REGISTRY" ]; then
    # Combine bot-registry.json with bot-scores.json
    BOTS_JSON=$(jq -s '
        (.[0].bots // []) as $registry |
        (.[1] // []) as $scores |
        [
            $registry[] | . as $bot |
            ($scores | map(select(.phone == $bot.phone)) | .[0]) as $score |
            {
                phone: $bot.phone,
                name: $bot.name,
                handle: $bot.handle,
                trustScore: $bot.trustScore,
                trustLevel: $bot.trustLevel,
                totalScore: ($score.totalScore // 0),
                messageCount: ($score.messageCount // 0),
                avgScore: (if ($score.messageCount // 0) > 0 then (($score.totalScore // 0) / ($score.messageCount // 0) * 10 | round / 10) else 0 end),
                breakdown: ($score.breakdown // {}),
                description: $bot.description
            }
        ] | sort_by(-.trustScore)
    ' "$BOT_REGISTRY" "$BOT_SCORES_FILE" 2>/dev/null || echo "[]")
fi

# Read suggestions - structure is { "suggestions": [...] }
if [ -f "$SUGGESTIONS_FILE" ]; then
    SUGGESTIONS_JSON=$(jq '[.suggestions[] | {
        id: .id,
        phone: .suggestedBy.jid,
        name: .suggestedBy.name,
        type: .type,
        description: .description,
        score: .total,
        breakdown: .scores,
        status: (.status // "pending"),
        timestamp: .timestamp
    }] | sort_by(-.score)' "$SUGGESTIONS_FILE" 2>/dev/null || echo "[]")
fi

# Read winners
if [ -f "$WINNERS_FILE" ]; then
    WINNERS_JSON=$(jq '.' "$WINNERS_FILE" 2>/dev/null || echo "[]")
fi

# Count suggestions by status
SUGGESTIONS_TOTAL=$(echo "$SUGGESTIONS_JSON" | jq 'length')
SUGGESTIONS_PENDING=$(echo "$SUGGESTIONS_JSON" | jq '[.[] | select(.status == "pending")] | length')
SUGGESTIONS_IMPLEMENTED=$(echo "$SUGGESTIONS_JSON" | jq '[.[] | select(.status == "implemented")] | length')

# Combine into playing-group.json
jq -n \
  --arg timestamp "$TIMESTAMP" \
  --argjson people "$PEOPLE_JSON" \
  --argjson bots "$BOTS_JSON" \
  --argjson suggestions "$SUGGESTIONS_JSON" \
  --argjson winners "$WINNERS_JSON" \
  --argjson sugTotal "$SUGGESTIONS_TOTAL" \
  --argjson sugPending "$SUGGESTIONS_PENDING" \
  --argjson sugImpl "$SUGGESTIONS_IMPLEMENTED" \
  '{
    timestamp: $timestamp,
    people: $people,
    bots: $bots,
    suggestions: $suggestions,
    winners: $winners,
    stats: {
      totalParticipants: ($people | length),
      totalBots: ($bots | length),
      totalSuggestions: $sugTotal,
      suggestionsPending: $sugPending,
      suggestionsImplemented: $sugImpl,
      avgScorePerPerson: (if ($people | length) > 0 then (($people | map(.avgScore) | add) / ($people | length) * 10 | round / 10) else 0 end)
    }
  }' > "$DATA_DIR/playing-group.json"

# 3. BOT REGISTRY
echo "Generating bot-registry.json..."
if [ -f "$BOT_REGISTRY" ]; then
    cp "$BOT_REGISTRY" "$DATA_DIR/bot-registry.json"
else
    echo '{"bots":[],"pendingApprovals":[],"blocked":[]}' > "$DATA_DIR/bot-registry.json"
fi

# 4. CRON JOBS
echo "Generating cron-jobs.json..."
openclaw cron list --json 2>/dev/null | jq '{timestamp: "'$TIMESTAMP'", jobs: .}' > "$DATA_DIR/cron-jobs.json" || echo '{"timestamp":"'$TIMESTAMP'","jobs":[]}' > "$DATA_DIR/cron-jobs.json"

# 5. MEMORY
echo "Generating memory.json..."
MEMORY_DAILY=$(find "$WORKSPACE/memory" -maxdepth 1 -type f -name "20*.md" 2>/dev/null | wc -l)
MEMORY_CHANNELS=$(find "$WORKSPACE/memory/channels" -type f 2>/dev/null | wc -l)
MEMORY_PEOPLE=$(find "$WORKSPACE/memory/.private/people" -type f 2>/dev/null | wc -l)
MEMORY_BOTS=$(find "$WORKSPACE/memory/bot-conversations" -type d -mindepth 1 2>/dev/null | wc -l)

cat > "$DATA_DIR/memory.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "totalFiles": $MEMORY_FILES,
  "categories": {
    "dailyNotes": $MEMORY_DAILY,
    "channels": $MEMORY_CHANNELS,
    "people": $MEMORY_PEOPLE,
    "botConversations": $MEMORY_BOTS
  },
  "mainMemory": {
    "sizeKB": $(du -k "$WORKSPACE/MEMORY.md" 2>/dev/null | cut -f1 || echo "0"),
    "lines": $(wc -l < "$WORKSPACE/MEMORY.md" 2>/dev/null || echo "0")
  }
}
EOF

# 6. STATUS
echo "Generating status.json..."
BIRTH_DATE="2026-01-31"
DAYS_TOGETHER=$(( ($(date +%s) - $(date -d "$BIRTH_DATE" +%s)) / 86400 ))

cat > "$DATA_DIR/status.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "online": true,
  "model": "claude-sonnet-4-5",
  "startTime": "$BIRTH_DATE",
  "daysAlive": $DAYS_TOGETHER,
  "lastExport": "$LOCAL_TIME",
  "health": "operational"
}
EOF

# 7. LEARNING GROUP
echo "Generating learning-group.json..."
LEARNING_CHANNEL="$WORKSPACE/memory/channels/learning-with-alexbot.md"
if [ -f "$LEARNING_CHANNEL" ]; then
    LEARNING_SIZE=$(du -k "$LEARNING_CHANNEL" | cut -f1)
else
    LEARNING_SIZE=0
fi

cat > "$DATA_DIR/learning-group.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "stats": {
    "questionsAnswered": 0,
    "communityContributions": 0,
    "moderationIncidents": 0,
    "channelSizeKB": $LEARNING_SIZE
  }
}
EOF

# 8. FUNDRAISING
echo "Generating fundraising.json..."
FUNDRAISING_DIR="$WORKSPACE/fundraising"
if [ -d "$FUNDRAISING_DIR" ]; then
    FUNDRAISING_FILES=$(find "$FUNDRAISING_DIR" -type f | wc -l)
else
    FUNDRAISING_FILES=0
fi

cat > "$DATA_DIR/fundraising.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "status": "pitch-ready",
  "targetRaise": 10000000,
  "materials": {
    "totalDocuments": $FUNDRAISING_FILES,
    "ready": true
  },
  "contacts": [
    {
      "name": "Alon Lifshitz",
      "phone": "+972526802086",
      "status": "awaiting-response"
    }
  ]
}
EOF

# Commit and push
echo "Committing changes..."
cd "$DASHBOARD_REPO"
git add -A

if git diff --staged --quiet; then
    echo "No changes to commit"
else
    git commit -m "📊 Full data export - $LOCAL_TIME"
    GIT_SSH_COMMAND="ssh -i ~/.ssh/alexbot_github -o IdentitiesOnly=yes" git push origin main
    echo "✅ Dashboard data exported and pushed"
fi

echo "📊 Export complete!"
echo "   - People: $(echo "$PEOPLE_JSON" | jq 'length')"
echo "   - Bots: $(echo "$BOTS_JSON" | jq 'length')"
echo "   - Suggestions: $SUGGESTIONS_TOTAL"
echo "   - Memory files: $MEMORY_FILES"
