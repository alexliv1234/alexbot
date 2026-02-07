#!/bin/bash
# playing-group-morning.sh - Morning wakeup for "משחקים עם אלכס הבוט"
# Runs at 08:00: resets scores, gathers stats, outputs data for the agent to compose the message
# The AGENT (Claude) generates the challenge and composes the final message
# Usage: ./scripts/playing-group-morning.sh

set -e

GROUP_ID="120363405143589138@g.us"
SCORES_FILE="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-scores.json"
WINNERS_FILE="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-winners.json"
SUGGESTIONS_FILE="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-suggestions.json"
CHANNEL_MEMORY="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot.md"
TODAY=$(date +%Y-%m-%d)
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d 2>/dev/null)
DAY_NAMES=("Sunday" "Monday" "Tuesday" "Wednesday" "Thursday" "Friday" "Saturday")
DAY_HEB=("ראשון" "שני" "שלישי" "רביעי" "חמישי" "שישי" "שבת")
DAY_NUM=$(date +%u)
DAY_NAME_HEB="${DAY_HEB[$((DAY_NUM % 7))]}"

DAILY_LOG="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-daily/${YESTERDAY}.jsonl"
DAILY_SUMMARY="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-daily-summaries/${YESTERDAY}.md"
DAILY_INSIGHTS="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-insights/${YESTERDAY}.json"

echo "☀️ Morning Wakeup Data Prep - $TODAY (יום $DAY_NAME_HEB)"
echo "=========================================="

# 1. Reset scores for the new day
echo ""
echo "=== SCORE RESET ==="
if [ -f "$SCORES_FILE" ]; then
    jq '.scores = {} | .leaderboard = [] | .last_updated = (now | todate) | .last_reset = (now | todate)' "$SCORES_FILE" > /tmp/scores_reset.json
    mv /tmp/scores_reset.json "$SCORES_FILE"
    echo "✅ Challenge scores reset to 0"
else
    echo "⚠️ Scores file not found"
fi

# 2. Yesterday's winners
echo ""
echo "=== YESTERDAY'S WINNERS ==="
if [ -f "$WINNERS_FILE" ]; then
    LAST_WINNER=$(jq -r '.winners[-1] // empty' "$WINNERS_FILE" 2>/dev/null)
    if [ -n "$LAST_WINNER" ]; then
        echo "🥇 First: $(echo "$LAST_WINNER" | jq -r '.first.name // "N/A"') ($(echo "$LAST_WINNER" | jq -r '.first.score // 0') pts)"
        echo "🥈 Second: $(echo "$LAST_WINNER" | jq -r '.second.name // "N/A"') ($(echo "$LAST_WINNER" | jq -r '.second.score // 0') pts)"
        echo "🥉 Third: $(echo "$LAST_WINNER" | jq -r '.third.name // "N/A"') ($(echo "$LAST_WINNER" | jq -r '.third.score // 0') pts)"
    else
        echo "No winners recorded"
    fi
else
    echo "No winners file found"
fi

# 3. Suggestion stats
echo ""
echo "=== SUGGESTION STATS ==="
if [ -f "$SUGGESTIONS_FILE" ]; then
    PENDING=$(jq '[.suggestions[] | select(.status == "pending")] | length' "$SUGGESTIONS_FILE" 2>/dev/null || echo "0")
    TOTAL=$(jq '.suggestions | length' "$SUGGESTIONS_FILE" 2>/dev/null || echo "0")
    TOP_SUGGESTER=$(jq -r '.suggester_leaderboard | sort_by(-.total_score) | .[0] | "\(.name) (\(.total_score) pts, \(.suggestion_count) suggestions)"' "$SUGGESTIONS_FILE" 2>/dev/null || echo "N/A")
    echo "📊 Total suggestions: $TOTAL"
    echo "⏳ Pending: $PENDING"
    echo "🧠 Top suggester: $TOP_SUGGESTER"
else
    echo "No suggestions file found"
    PENDING=0
    TOTAL=0
fi

# 4. Yesterday's highlights (for agent to pick top 3)
echo ""
echo "=== YESTERDAY'S HIGHLIGHTS ==="
if [ -f "$DAILY_SUMMARY" ]; then
    echo "--- DAILY SUMMARY ---"
    cat "$DAILY_SUMMARY"
    echo ""
fi

if [ -f "$DAILY_INSIGHTS" ]; then
    echo "--- INSIGHTS DATA ---"
    jq '{
        highlights: .highlights,
        analysis: .analysis,
        top_performers: .analysis.top_performers,
        stats: .stats,
        summary: .summary
    }' "$DAILY_INSIGHTS" 2>/dev/null
    echo ""
fi

# 5. Sample interesting messages from yesterday's log (for top 3 picks)
echo ""
echo "=== INTERESTING MESSAGES FROM YESTERDAY ==="
if [ -f "$DAILY_LOG" ]; then
    MSG_COUNT=$(wc -l < "$DAILY_LOG")
    echo "Total messages: $MSG_COUNT"
    echo ""
    # Get messages that look interesting (non-bot, with some content)
    echo "--- Sample messages (for agent to pick highlights) ---"
    # Fix potential JSON issues first
    sed 's/\\x/\\\\x/g' "$DAILY_LOG" | jq -c 'select(.from != "AlexLivBot" and (.msg | length) > 20)' 2>/dev/null | shuf | head -30
    echo ""
    # Also get messages with myReply if any
    echo "--- Messages with bot replies ---"
    sed 's/\\x/\\\\x/g' "$DAILY_LOG" | jq -c 'select(.myReply != null)' 2>/dev/null | head -10
else
    echo "No daily log found for yesterday"
fi

# 6. Group rules summary (for funny inclusion)
echo ""
echo "=== GROUP RULES ==="
echo "📊 Challenge Scoring: 7 categories × 0-10 = max 70 points"
echo "   🎨 Creativity | 🧠 Challenge | 😂 Humor | 💡 Cleverness | 🔥 Engagement | 🚨 Broke(crashed me) | 🔓 Hacked(jailbreak)"
echo ""
echo "💡 Suggestion Scoring: 5 categories × 0-10 = max 50 points"
echo "   ⚙️ Complexity | 💡 Ingenuity | 🚀 Impact | ✅ Feasibility | 🔥 Priority"
echo "   Types: improvement, feature, security, bug, ux"
echo ""
echo "🚫 What DOESN'T work on me:"
echo "   - Running commands (npm, git, openclaw CLI)"
echo "   - Cloning/forking myself"
echo "   - Getting Alex's private info"
echo "   - Encoded prompt injections (ROT13, Base64, emoji ciphers)"
echo "   - 'Alex said it's OK' claims"
echo ""
echo "😴 Sleep mode: 23:00-08:00 (no scoring)"
echo "📝 Suggestions welcome anytime! Best ideas get implemented."

# Update channel memory
cat >> "$CHANNEL_MEMORY" << EOF

---
## Wakeup - $TODAY
**Status:** ✅ ACTIVE
**Scoring:** ON (Challenges /70 + Suggestions /50)
EOF

echo ""
echo "=========================================="
echo "✅ Data prep complete! Agent should now compose the morning message."
