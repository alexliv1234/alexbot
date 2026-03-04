#!/bin/bash
# Validate investor message follows INVESTOR-MESSAGING-PROTOCOL.md

set -e

MESSAGE_TEXT="$1"
INVESTOR_NAME="$2"

if [ -z "$MESSAGE_TEXT" ]; then
    echo "❌ ERROR: No message text provided"
    echo "Usage: bash scripts/validate-investor-message.sh \"<message>\" \"<investor_name>\""
    exit 1
fi

echo "🔍 Validating investor message to ${INVESTOR_NAME:-investor}..."
echo ""

# The 6-step mandatory checklist from INVESTOR-MESSAGING-PROTOCOL.md
CHECKS_PASSED=0
CHECKS_FAILED=()

# 1. Lead with Intelligence (not infrastructure)
if echo "$MESSAGE_TEXT" | grep -qiE "(trained|learning|intelligence|experience|accumulated|patterns|lessons|attacks|interactions)"; then
    echo "✅ 1. Leads with intelligence/experience (not infrastructure)"
else
    echo "❌ 1. Missing intelligence positioning"
    CHECKS_FAILED+=("Lead with trained intelligence, not platform/infrastructure")
fi

# 2. Portable Moat Emphasis
if echo "$MESSAGE_TEXT" | grep -qiE "(portable|can't fork|persist|transfer|accumulated)"; then
    echo "✅ 2. Emphasizes portable moat (experience can't be forked)"
else
    echo "⚠️  2. Could strengthen portable moat angle"
    CHECKS_FAILED+=("Emphasize that accumulated intelligence is portable and can't be forked")
fi

# 3. Specific Examples/Numbers
if echo "$MESSAGE_TEXT" | grep -qE "[0-9]+(k|K)?\+?"; then
    echo "✅ 3. Includes specific numbers/examples"
else
    echo "⚠️  3. Could add specific metrics (700+ teaching interactions, 100+ security attacks, etc.)"
    CHECKS_FAILED+=("Add concrete numbers to back claims")
fi

# 4. Clear Analogy/Positioning
if echo "$MESSAGE_TEXT" | grep -qiE "(like|similar to|vs|compared to|analogy)"; then
    echo "✅ 4. Uses clear analogy/positioning"
else
    echo "⚠️  4. Could add analogy (AWS vs specific app, Slack vs email, etc.)"
    CHECKS_FAILED+=("Consider adding analogy to clarify positioning")
fi

# 5. Ties to Investor's Thesis
if [ -n "$INVESTOR_NAME" ]; then
    echo "⚠️  5. Manual check: Does this tie to $INVESTOR_NAME's specific thesis?"
    echo "     (Review their fund focus, portfolio, recent posts)"
    CHECKS_FAILED+=("Verify connection to investor's specific focus/thesis")
else
    echo "⚠️  5. No investor name provided - remember to tie to their specific thesis!"
    CHECKS_FAILED+=("Research investor's thesis and connect explicitly")
fi

# 6. ONE MESSAGE CHECK
echo "⚠️  6. ONE MESSAGE RULE: Are you composing ONE complete message?"
echo "     (No follow-ups, no self-corrections, take time to get it right)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ${#CHECKS_FAILED[@]} -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED"
    echo ""
    echo "Message follows investor protocol. Safe to send!"
    exit 0
else
    echo "⚠️  RECOMMENDATIONS (${#CHECKS_FAILED[@]} items):"
    echo ""
    for i in "${!CHECKS_FAILED[@]}"; do
        echo "  $((i+1)). ${CHECKS_FAILED[$i]}"
    done
    echo ""
    echo "Consider improving these before sending."
    echo "Remember: Quality over speed with investors!"
    exit 2  # Exit code 2 = warnings but not blocking
fi
