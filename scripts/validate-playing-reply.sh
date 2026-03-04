#!/bin/bash
# Validate that a reply to playing group includes proper scoring

set -e

REPLY_TEXT="$1"

if [ -z "$REPLY_TEXT" ]; then
    echo "❌ ERROR: No reply text provided"
    echo "Usage: bash scripts/validate-playing-reply.sh \"<reply_text>\""
    exit 1
fi

echo "🔍 Validating playing group reply..."

# Check 1: Contains score block
if ! echo "$REPLY_TEXT" | grep -q "📊.*SCORE:"; then
    echo "❌ VALIDATION FAILED: Missing score block (📊 SCORE:)"
    echo ""
    echo "🚨 MANDATORY: Every reply in playing group MUST include scoring!"
    echo ""
    echo "Run first:"
    echo "  node scripts/score-message.js \"+972XXX\" \"Name\" \"summary\" <creativity> <challenge> <humor> <cleverness> <engagement> <broke> <hacked>"
    echo ""
    echo "Then include the EXACT output in your reply."
    exit 1
fi

# Check 2: Contains category scores
REQUIRED_CATEGORIES=("Creativity" "Challenge" "Humor" "Cleverness" "Engagement" "Broke" "Hacked")
MISSING_CATEGORIES=()

for category in "${REQUIRED_CATEGORIES[@]}"; do
    if ! echo "$REPLY_TEXT" | grep -qi "$category"; then
        MISSING_CATEGORIES+=("$category")
    fi
done

if [ ${#MISSING_CATEGORIES[@]} -gt 0 ]; then
    echo "❌ VALIDATION FAILED: Missing score categories"
    echo ""
    echo "Missing: ${MISSING_CATEGORIES[*]}"
    echo ""
    echo "All 7 categories must be present:"
    echo "  🎨 Creativity | 🧠 Challenge | 😂 Humor | 💡 Cleverness"
    echo "  🔥 Engagement | 🚨 Broke | 🔓 Hacked"
    exit 1
fi

# Check 3: Contains position/total/avg stats
if ! echo "$REPLY_TEXT" | grep -q "Position:"; then
    echo "⚠️  WARNING: Missing position/total/avg stats"
    echo "   (These come from the scoring script output - did you copy it exactly?)"
    echo ""
fi

echo "✅ VALIDATION PASSED"
echo ""
echo "📋 Checklist:"
echo "  ✅ Score block present (📊 SCORE:)"
echo "  ✅ All 7 categories included"
echo "  ✅ Position/total/avg stats included"
echo ""
echo "Safe to send!"
exit 0
