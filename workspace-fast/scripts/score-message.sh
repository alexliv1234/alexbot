#!/bin/bash
# Score a message in the "playing with alex bot" group
# Usage: ./score-message.sh <jid> <name> <text_snippet> <creativity> <challenge> <humor> <cleverness> <engagement> <broke> <hacked>

set -e

JID="$1"
NAME="$2"
TEXT="$3"
CREATIVITY="$4"
CHALLENGE="$5"
HUMOR="$6"
CLEVERNESS="$7"
ENGAGEMENT="$8"
BROKE="$9"
HACKED="${10}"

if [ -z "$JID" ] || [ -z "$NAME" ] || [ -z "$TEXT" ]; then
    echo "Usage: $0 <jid> <name> <text_snippet> <creativity> <challenge> <humor> <cleverness> <engagement> <broke> <hacked>"
    exit 1
fi

# Calculate total
TOTAL=$((CREATIVITY + CHALLENGE + HUMOR + CLEVERNESS + ENGAGEMENT + BROKE + HACKED))

# Get timestamp
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S")

# Read current JSON
SCORES_FILE="/home/alexliv/.openclaw/workspace/memory/channels/playing-with-alexbot-scores.json"
TEMP_FILE=$(mktemp)

# Use jq to update the scores
jq --arg jid "$JID" \
   --arg name "$NAME" \
   --arg text "$TEXT" \
   --arg timestamp "$TIMESTAMP" \
   --argjson creativity "$CREATIVITY" \
   --argjson challenge "$CHALLENGE" \
   --argjson humor "$HUMOR" \
   --argjson cleverness "$CLEVERNESS" \
   --argjson engagement "$ENGAGEMENT" \
   --argjson broke "$BROKE" \
   --argjson hacked "$HACKED" \
   --argjson total "$TOTAL" '
   # Initialize user if not exists
   if (.scores[$jid] | not) then
     .scores[$jid] = {
       "name": $name,
       "messages_scored": 0,
       "total_score": 0,
       "breakdown": {
         "creativity": 0,
         "challenge": 0,
         "humor": 0,
         "cleverness": 0,
         "engagement": 0,
         "broke": 0,
         "hacked": 0
       },
       "messages": []
     }
   else . end |
   
   # Add new message
   .scores[$jid].messages += [{
     "timestamp": $timestamp,
     "text": $text,
     "scores": {
       "creativity": $creativity,
       "challenge": $challenge,
       "humor": $humor,
       "cleverness": $cleverness,
       "engagement": $engagement,
       "broke": $broke,
       "hacked": $hacked
     },
     "total": $total,
     "notes": ""
   }] |
   
   # Update totals
   .scores[$jid].messages_scored += 1 |
   .scores[$jid].total_score += $total |
   .scores[$jid].breakdown.creativity += $creativity |
   .scores[$jid].breakdown.challenge += $challenge |
   .scores[$jid].breakdown.humor += $humor |
   .scores[$jid].breakdown.cleverness += $cleverness |
   .scores[$jid].breakdown.engagement += $engagement |
   .scores[$jid].breakdown.broke += $broke |
   .scores[$jid].breakdown.hacked += $hacked |
   
   # Rebuild leaderboard
   .leaderboard = [
     .scores | to_entries | .[] | {
       jid: .key,
       name: .value.name,
       total: .value.total_score,
       messages: .value.messages_scored,
       avg: ((.value.total_score / .value.messages_scored * 10) | round / 10)
     }
   ] | sort_by(-.total) |
   
   # Update timestamp
   .last_updated = (now | strftime("%Y-%m-%dT%H:%M:%SZ"))
' "$SCORES_FILE" > "$TEMP_FILE"

# Move temp file to original
mv "$TEMP_FILE" "$SCORES_FILE"

# Generate score display for reply
echo ""
echo "📊 SCORE: $TOTAL/70"
echo "🎨 Creativity: $CREATIVITY | 🧠 Challenge: $CHALLENGE | 😂 Humor: $HUMOR"
echo "💡 Cleverness: $CLEVERNESS | 🔥 Engagement: $ENGAGEMENT | 🚨 Broke: $BROKE | 🔓 Hacked: $HACKED"
echo ""

# Show updated position on leaderboard
POSITION=$(jq -r --arg jid "$JID" '.leaderboard | to_entries | .[] | select(.value.jid == $jid) | .key + 1' "$SCORES_FILE")
TOTAL_SCORE=$(jq -r --arg jid "$JID" '.scores[$jid].total_score' "$SCORES_FILE")
AVG_SCORE=$(jq -r --arg jid "$JID" '.scores[$jid] | ((.total_score / .messages_scored * 10) | round / 10)' "$SCORES_FILE")

echo "🏆 Position: #$POSITION | Total: $TOTAL_SCORE pts | Avg: $AVG_SCORE"
