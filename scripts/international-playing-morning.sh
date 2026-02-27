#!/bin/bash
# International Playing Group - Morning Wakeup Script
# Runs at 10:00 Israel time (Sunday-Thursday)
# Resets scores, announces new day, posts challenge

GROUP_ID="120363406698718454@g.us"
SCORES_FILE="/home/alexliv/.openclaw/workspace/memory/international-groups/playing/scores.json"

# Reset scores for new day
jq '.participants = {} | .metadata.lastReset = (now | strftime("%Y-%m-%d"))' "$SCORES_FILE" > "$SCORES_FILE.tmp"
mv "$SCORES_FILE.tmp" "$SCORES_FILE"

echo "🌅 MORNING WAKEUP - Playing with AlexBot (International)"
echo "GROUP: $GROUP_ID"
echo "✅ Scores reset"
echo ""
echo "📝 TASK FOR AGENT:"
echo "1. Greet the group - Good morning! (English)"
echo "2. Announce: Scores have been RESET to 0 for everyone"
echo "3. Post today's challenge/provocation/question"
echo "4. Remind: Scoring is active 10:00-18:00 Israel time (Sun-Thu)"
echo "5. Be energetic and engaging!"
echo ""
echo "Use the message tool to send to: $GROUP_ID"
