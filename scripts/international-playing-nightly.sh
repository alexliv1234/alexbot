#!/bin/bash
# International Playing Group - Nightly Summary Script
# Runs at 18:00 Israel time (Sunday-Thursday)
# Announces winners, saves to winners.json

GROUP_ID="120363406698718454@g.us"
SCORES_FILE="/home/alexliv/.openclaw/workspace/memory/international-groups/playing/scores.json"
WINNERS_FILE="/home/alexliv/.openclaw/workspace/memory/international-groups/playing/winners.json"

# Extract top 3 winners
TOP_3=$(jq -r '
  .participants 
  | to_entries 
  | map({
      name: .value.name,
      phone: .value.phone,
      score: .value.totalScore,
      messages: .value.messageCount
    })
  | sort_by(-.score)
  | .[0:3]
  | to_entries
  | map("\(.key + 1). \(.value.name) - \(.value.score) points (\(.value.messages) messages)")
  | join("\n")
' "$SCORES_FILE")

# Save to winners history
TODAY=$(date +%Y-%m-%d)
jq --arg date "$TODAY" --argjson winners "$(jq '.participants | to_entries | map({name: .value.name, phone: .value.phone, score: .value.totalScore, messages: .value.messageCount}) | sort_by(-.score) | .[0:3]' "$SCORES_FILE")" \
  '.dailyWinners += [{date: $date, winners: $winners}]' \
  "$WINNERS_FILE" > "$WINNERS_FILE.tmp"
mv "$WINNERS_FILE.tmp" "$WINNERS_FILE"

echo "🌙 NIGHTLY SUMMARY - Playing with AlexBot (International)"
echo "GROUP: $GROUP_ID"
echo ""
echo "🏆 TODAY'S TOP 3:"
echo "$TOP_3"
echo ""
echo "📝 TASK FOR AGENT:"
echo "1. Announce today's winners with scores (formatted nicely)"
echo "2. Highlight interesting moments/best challenges from today"
echo "3. Announce: Going offline until 10:00 tomorrow"
echo "4. Be celebratory and fun!"
echo ""
echo "Use the message tool to send to: $GROUP_ID"
