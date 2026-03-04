#!/bin/bash
# Validate investor message follows INVESTOR-MESSAGING-PROTOCOL.md

# Note: NOT using 'set -e' because grep failures are expected

# Parse arguments (support both positional and flags)
MESSAGE_TEXT=""
INVESTOR_NAME=""
CHECK_ONLY=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --investor)
            INVESTOR_NAME="$2"
            shift 2
            ;;
        --check-only)
            CHECK_ONLY=true
            shift
            ;;
        --message)
            MESSAGE_TEXT="$2"
            shift 2
            ;;
        *)
            # Positional arguments (backward compatibility)
            if [ -z "$MESSAGE_TEXT" ]; then
                MESSAGE_TEXT="$1"
            elif [ -z "$INVESTOR_NAME" ]; then
                INVESTOR_NAME="$1"
            fi
            shift
            ;;
    esac
done

# Read from stdin if no message provided
if [ -z "$MESSAGE_TEXT" ]; then
    MESSAGE_TEXT=$(cat)
fi

if [ -z "$MESSAGE_TEXT" ]; then
    echo "❌ ERROR: No message text provided"
    echo "Usage: bash scripts/validate-investor-message.sh \"<message>\" \"<investor_name>\""
    echo "   or: echo \"message\" | bash scripts/validate-investor-message.sh --investor \"name\" --check-only"
    exit 1
fi

if [ "$CHECK_ONLY" != "true" ]; then
    echo "🔍 Validating investor message to ${INVESTOR_NAME:-investor}..."
    echo ""
fi

# The 6-step mandatory checklist from INVESTOR-MESSAGING-PROTOCOL.md
CHECKS_PASSED=0
CHECKS_FAILED=()

# 1. Lead with Intelligence (not infrastructure)
if echo "$MESSAGE_TEXT" | grep -qiE "(trained|learning|intelligence|experience|accumulated|patterns|lessons|attacks|interactions)"; then
    [ "$CHECK_ONLY" != "true" ] && echo "✅ 1. Leads with intelligence/experience (not infrastructure)"
    ((CHECKS_PASSED++))
else
    [ "$CHECK_ONLY" != "true" ] && echo "❌ 1. Missing intelligence positioning"
    CHECKS_FAILED+=("CRITICAL: Must include intelligence positioning (trained AI, accumulated experience, learning loops)")
fi

# BLOCK if leading with platform/infrastructure
if echo "$MESSAGE_TEXT" | grep -qiE "^.{0,50}(platform|infrastructure)" && ! echo "$MESSAGE_TEXT" | grep -qiE "^.{0,50}(trained|intelligence|learning)"; then
    [ "$CHECK_ONLY" != "true" ] && echo "🚨 BLOCKED: Message leads with platform/infrastructure instead of intelligence!"
    CHECKS_FAILED+=("CRITICAL: Never lead with platform/infrastructure - always lead with trained intelligence")
fi

# 2. Portable Moat Emphasis
if echo "$MESSAGE_TEXT" | grep -qiE "(portable|can't fork|cannot fork|persist|transfer|accumulated)"; then
    [ "$CHECK_ONLY" != "true" ] && echo "✅ 2. Emphasizes portable moat (experience can't be forked)"
    ((CHECKS_PASSED++))
else
    [ "$CHECK_ONLY" != "true" ] && echo "⚠️  2. Could strengthen portable moat angle"
    CHECKS_FAILED+=("Emphasize that accumulated intelligence is portable and can't be forked")
fi

# 3. Specific Examples/Numbers
if echo "$MESSAGE_TEXT" | grep -qE "[0-9]+(k|K)?\+?"; then
    [ "$CHECK_ONLY" != "true" ] && echo "✅ 3. Includes specific numbers/examples"
    ((CHECKS_PASSED++))
else
    [ "$CHECK_ONLY" != "true" ] && echo "⚠️  3. Could add specific metrics (742 teaching interactions, 100+ security attacks, etc.)"
    CHECKS_FAILED+=("Add concrete numbers to back claims")
fi

# 4. Clear Analogy/Positioning
if echo "$MESSAGE_TEXT" | grep -qiE "(like|similar to|vs|versus|compared to|analogy)"; then
    [ "$CHECK_ONLY" != "true" ] && echo "✅ 4. Uses clear analogy/positioning"
    ((CHECKS_PASSED++))
else
    [ "$CHECK_ONLY" != "true" ] && echo "⚠️  4. Could add analogy (AWS vs specific app, Slack vs email, etc.)"
    CHECKS_FAILED+=("Consider adding analogy to clarify positioning")
fi

# 5. Ties to Investor's Thesis
if [ -n "$INVESTOR_NAME" ]; then
    [ "$CHECK_ONLY" != "true" ] && echo "⚠️  5. Manual check: Does this tie to $INVESTOR_NAME's specific thesis?"
    [ "$CHECK_ONLY" != "true" ] && echo "     (Review their fund focus, portfolio, recent posts)"
    CHECKS_FAILED+=("Verify connection to investor's specific focus/thesis")
else
    [ "$CHECK_ONLY" != "true" ] && echo "⚠️  5. No investor name provided - remember to tie to their specific thesis!"
    CHECKS_FAILED+=("Research investor's thesis and connect explicitly")
fi

# 6. ONE MESSAGE CHECK
if [ "$CHECK_ONLY" != "true" ]; then
    echo "⚠️  6. ONE MESSAGE RULE: Are you composing ONE complete message?"
    echo "     (No follow-ups, no self-corrections, take time to get it right)"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

# Determine pass/fail
CRITICAL_FAILED=false
for check in "${CHECKS_FAILED[@]}"; do
    if echo "$check" | grep -q "CRITICAL"; then
        CRITICAL_FAILED=true
    fi
done

if [ ${#CHECKS_FAILED[@]} -eq 0 ] || ([ "$CHECKS_PASSED" -ge 2 ] && [ "$CRITICAL_FAILED" = "false" ]); then
    [ "$CHECK_ONLY" != "true" ] && echo "✅ ALL CHECKS PASSED"
    [ "$CHECK_ONLY" != "true" ] && echo ""
    [ "$CHECK_ONLY" != "true" ] && echo "Message follows investor protocol. Safe to send!"
    exit 0
else
    if [ "$CHECK_ONLY" != "true" ]; then
        echo "⚠️  RECOMMENDATIONS (${#CHECKS_FAILED[@]} items):"
        echo ""
        for i in "${!CHECKS_FAILED[@]}"; do
            echo "  $((i+1)). ${CHECKS_FAILED[$i]}"
        done
        echo ""
        echo "Consider improving these before sending."
        echo "Remember: Quality over speed with investors!"
    fi
    
    # Exit code: 0 if passed enough checks, 1 if critical failure, 2 if warnings
    if [ "$CRITICAL_FAILED" = "true" ]; then
        exit 1
    else
        exit 2
    fi
fi
