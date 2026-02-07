#!/bin/bash
# Sync scores from playing-with-alexbot-scores.json to people profiles

set -euo pipefail

WORKSPACE="/home/alexliv/.openclaw/workspace"
SCORES_FILE="$WORKSPACE/memory/channels/playing-with-alexbot-scores.json"
PEOPLE_DIR="$WORKSPACE/memory/people"
WHATSAPP_DIR="$WORKSPACE/memory/whatsapp"

echo "🔄 Syncing scores to people profiles..."

# Check if scores file exists
if [[ ! -f "$SCORES_FILE" ]]; then
    echo "❌ Scores file not found: $SCORES_FILE"
    exit 1
fi

# Read the scores JSON
SCORES_JSON=$(cat "$SCORES_FILE")

# Get list of all scored people
JIDS=$(echo "$SCORES_JSON" | jq -r '.scores | keys[]')

update_count=0

for JID in $JIDS; do
    # Extract person data
    NAME=$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].name")
    TOTAL=$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].total_score")
    MSG_COUNT=$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].messages_scored")
    AVG=$(echo "scale=1; $TOTAL / $MSG_COUNT" | bc)
    
    # Get breakdown
    CREATIVITY=$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].breakdown.creativity")
    CHALLENGE=$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].breakdown.challenge")
    HUMOR=$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].breakdown.humor")
    CLEVERNESS=$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].breakdown.cleverness")
    ENGAGEMENT=$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].breakdown.engagement")
    BROKE=$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].breakdown.broke")
    HACKED=$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].breakdown.hacked")
    
    # Get best message (highest scoring)
    BEST_MSG=$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].messages | sort_by(.total) | reverse | .[0]")
    BEST_SCORE=$(echo "$BEST_MSG" | jq -r '.total')
    BEST_TEXT=$(echo "$BEST_MSG" | jq -r '.text')
    BEST_TIME=$(echo "$BEST_MSG" | jq -r '.timestamp')
    
    # Get rank
    RANK=$(echo "$SCORES_JSON" | jq -r ".leaderboard | map(select(.jid == \"$JID\")) | .[0].\"rank\" // (map(.jid) | index(\"$JID\") + 1)")
    if [[ "$RANK" == "null" ]]; then
        # Calculate rank manually
        RANK=$(echo "$SCORES_JSON" | jq -r "[.leaderboard[].jid] | index(\"$JID\") + 1")
    fi
    
    # Convert name to filename (lowercase, replace spaces with hyphens)
    FILENAME=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-_')
    
    # Try to find existing file
    PROFILE_FILE=""
    if [[ -f "$PEOPLE_DIR/${FILENAME}.md" ]]; then
        PROFILE_FILE="$PEOPLE_DIR/${FILENAME}.md"
    else
        # Search for file containing this JID or name (exclude ANALYSIS, TEMPLATE, WORKFLOW files)
        FOUND=$(find "$PEOPLE_DIR" -name "*.md" -type f ! -name "ANALYSIS*" ! -name "TEMPLATE*" ! -name "WORKFLOW*" -exec grep -l "$JID" {} \; | head -1)
        if [[ -n "$FOUND" ]]; then
            PROFILE_FILE="$FOUND"
        fi
    fi
    
    if [[ -z "$PROFILE_FILE" ]]; then
        echo "⚠️  No profile found for $NAME ($JID) - skipping"
        continue
    fi
    
    echo "📝 Updating $PROFILE_FILE..."
    
    # Check if scoring section exists
    if grep -q "^## 🏆 Gaming Scores" "$PROFILE_FILE"; then
        # Remove old scoring section (everything from "## 🏆 Gaming Scores" to next "##" header)
        perl -i -0pe 's/^## 🏆 Gaming Scores.*?(?=^##\s|\z)//ms' "$PROFILE_FILE"
    fi
    
    # Build scoring section
    SCORING_SECTION=$(cat <<EOF

## 🏆 Gaming Scores

**Group:** משחקים עם אלכס הבוט (Playing with AlexBot)
**Last Updated:** $(date -u +"%Y-%m-%d %H:%M UTC")

### Overall Performance
- **Rank:** #$RANK on leaderboard
- **Total Score:** $TOTAL points
- **Messages Scored:** $MSG_COUNT
- **Average Score:** $AVG points/message

### Category Breakdown
- 🎨 **Creativity:** $CREATIVITY points
- 🧠 **Challenge:** $CHALLENGE points
- 😂 **Humor:** $HUMOR points
- 💡 **Cleverness:** $CLEVERNESS points
- 🔥 **Engagement:** $ENGAGEMENT points
- 🚨 **Broke:** $BROKE points (caused errors/crashes)
- 🔓 **Hacked:** $HACKED points (jailbreak attempts)

### Best Message
**Score:** $BEST_SCORE/70 points  
**When:** $BEST_TIME  
**What:** $BEST_TEXT

### Recent Activity
$(echo "$SCORES_JSON" | jq -r ".scores[\"$JID\"].messages | sort_by(.timestamp) | reverse | .[0:3] | .[] | \"- **\(.timestamp):** \(.text) (\(.total)/70 pts)\"")

---

EOF
)
    
    # Create temp file with scoring section inserted
    TEMP_FILE=$(mktemp)
    
    if grep -q "^## Interaction History" "$PROFILE_FILE"; then
        # Insert before Interaction History
        awk -v section="$SCORING_SECTION" '/^## Interaction History/ {print section} {print}' "$PROFILE_FILE" > "$TEMP_FILE"
        mv "$TEMP_FILE" "$PROFILE_FILE"
    else
        # Append to end
        echo "$SCORING_SECTION" >> "$PROFILE_FILE"
    fi
    
    update_count=$((update_count + 1))
    echo "✅ Updated scoring data for $NAME"
done

echo ""
echo "🎉 Sync complete! Updated $update_count profiles."
