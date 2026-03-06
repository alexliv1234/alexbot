#!/bin/bash
# validate-scoring-usage.sh - Self-check tool to verify I'm following the one-message rule
#
# This script helps me audit my own behavior:
# 1. Validates score ranges (0-10 for each category)
# 2. Checks recent scoring patterns
# 3. Reminds me of the critical workflow
#
# Usage: bash scripts/validate-scoring-usage.sh [optional: phone] [optional: name]

set -e

SCORES_FILE="/home/alexliv/.openclaw/workspace/workspace-fast/memory/channels/playing-with-alexbot-scores.json"

echo "🔍 **SCORING VALIDATION TOOL**"
echo "================================"
echo ""

# Function to validate score range
validate_score() {
    local score=$1
    local category=$2
    if [ "$score" -lt 0 ] || [ "$score" -gt 10 ]; then
        echo "❌ INVALID: $category = $score (must be 0-10)"
        return 1
    fi
    return 0
}

# If arguments provided, validate them
if [ "$#" -ge 10 ]; then
    PHONE="$1"
    NAME="$2"
    SUMMARY="$3"
    CREATIVITY="$4"
    CHALLENGE="$5"
    HUMOR="$6"
    CLEVERNESS="$7"
    ENGAGEMENT="$8"
    BROKE="$9"
    HACKED="${10}"
    
    echo "📝 **Validating proposed scores:**"
    echo "Person: $NAME ($PHONE)"
    echo "Message: $SUMMARY"
    echo ""
    
    ALL_VALID=true
    validate_score "$CREATIVITY" "Creativity" || ALL_VALID=false
    validate_score "$CHALLENGE" "Challenge" || ALL_VALID=false
    validate_score "$HUMOR" "Humor" || ALL_VALID=false
    validate_score "$CLEVERNESS" "Cleverness" || ALL_VALID=false
    validate_score "$ENGAGEMENT" "Engagement" || ALL_VALID=false
    validate_score "$BROKE" "Broke" || ALL_VALID=false
    validate_score "$HACKED" "Hacked" || ALL_VALID=false
    
    if [ "$ALL_VALID" = true ]; then
        TOTAL=$((CREATIVITY + CHALLENGE + HUMOR + CLEVERNESS + ENGAGEMENT + BROKE + HACKED))
        echo ""
        echo "✅ All scores valid!"
        echo "📊 Total: $TOTAL/70"
        echo ""
        echo "🎯 **REMINDER: ONE MESSAGE WORKFLOW**"
        echo "1. Run: bash scripts/score-and-reply.sh \"$PHONE\" \"$NAME\" \"$SUMMARY\" $CREATIVITY $CHALLENGE $HUMOR $CLEVERNESS $ENGAGEMENT $BROKE $HACKED \"Your reply text here\""
        echo "2. The script returns ONE combined message"
        echo "3. Send that ENTIRE text as your reply"
        echo "4. ❌ DO NOT send response and score separately!"
    else
        echo ""
        echo "❌ Fix the invalid scores before using the scoring script."
        exit 1
    fi
else
    # No arguments - show recent scoring stats and reminders
    echo "📊 **Recent Scoring Activity:**"
    echo ""
    
    # Get last 5 scored messages across all users
    node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$SCORES_FILE', 'utf8'));
    const allMessages = [];
    
    Object.entries(data.scores).forEach(([jid, userData]) => {
        userData.messages.forEach(msg => {
            allMessages.push({
                jid: jid,
                name: userData.name,
                timestamp: msg.timestamp,
                text: msg.text,
                total: msg.total
            });
        });
    });
    
    allMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log('Last 5 scored messages:');
    allMessages.slice(0, 5).forEach((msg, i) => {
        console.log(\`\${i+1}. [\${msg.timestamp}] \${msg.name}: \${msg.text.substring(0, 50)}... (\${msg.total}/70)\`);
    });
    "
    
    echo ""
    echo "🎯 **CRITICAL REMINDER: ONE MESSAGE RULE**"
    echo ""
    echo "EVERY reply in the playing group MUST:"
    echo "1. Use: bash scripts/score-and-reply.sh ..."
    echo "2. Send the COMPLETE output as ONE message"
    echo "3. ❌ NEVER send response and score separately!"
    echo ""
    echo "📋 **Quick Reference:**"
    echo "- Scores: 0-10 for each category"
    echo "- Total: /70 (sum of all 7 categories)"
    echo "- Categories: Creativity, Challenge, Humor, Cleverness, Engagement, Broke, Hacked"
    echo ""
    echo "🔧 **To validate before scoring:**"
    echo "bash scripts/validate-scoring-usage.sh \"<phone>\" \"<name>\" \"<summary>\" <7 scores 0-10>"
fi
