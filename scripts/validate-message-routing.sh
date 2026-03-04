#!/bin/bash
# validate-message-routing.sh - Pre-send message routing validator
# Checks if the proposed routing is correct and allowed
#
# Usage:
#   bash scripts/validate-message-routing.sh \
#     --agent "main" \
#     --session "dm:+972528897849" \
#     --recipient "+972544419002" \
#     --method "reply" \
#     --content "Hello Alex"
#
# Exit Codes:
#   0 - Valid routing
#   1 - Invalid routing (wrong recipient/method)
#   2 - Security block (agent not allowed)
#   3 - Timing block (inappropriate time)

set -euo pipefail

WORKSPACE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$WORKSPACE/scripts/lib/routing-engine.sh"

# Parse arguments
AGENT=""
SESSION=""
RECIPIENT=""
METHOD=""
CONTENT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --agent)
            AGENT="$2"
            shift 2
            ;;
        --session)
            SESSION="$2"
            shift 2
            ;;
        --recipient)
            RECIPIENT="$2"
            shift 2
            ;;
        --method)
            METHOD="$2"
            shift 2
            ;;
        --content)
            CONTENT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Validate required arguments
if [[ -z "$AGENT" ]] || [[ -z "$SESSION" ]] || [[ -z "$RECIPIENT" ]] || [[ -z "$METHOD" ]]; then
    echo "ERROR: Missing required arguments" >&2
    echo "Usage: $0 --agent <agent> --session <session> --recipient <recipient> --method <method> [--content <content>]" >&2
    exit 1
fi

echo "🔍 Validating message routing..."
echo "   Agent: $AGENT"
echo "   Session: $SESSION"
echo "   Recipient: $RECIPIENT"
echo "   Method: $METHOD"
echo ""

# Get correct routing decision from engine
CORRECT_DECISION=$(get_routing_decision "$AGENT" "$SESSION" "$RECIPIENT" "validation")

# Check if routing is blocked
if [[ "$CORRECT_DECISION" =~ ^BLOCK: ]]; then
    REASON="${CORRECT_DECISION#BLOCK:}"
    echo "❌ SECURITY BLOCK: $REASON"
    log_routing_decision "$AGENT" "$SESSION" "$RECIPIENT" "$CORRECT_DECISION" "validation"
    exit 2
fi

# Extract correct method
CORRECT_METHOD=""
CORRECT_TARGET=""
if [[ "$CORRECT_DECISION" =~ ^message_tool:(.+)$ ]]; then
    CORRECT_METHOD="message_tool"
    CORRECT_TARGET="${BASH_REMATCH[1]}"
elif [[ "$CORRECT_DECISION" == "reply" ]]; then
    CORRECT_METHOD="reply"
    CORRECT_TARGET="$RECIPIENT"
fi

# Compare proposed method with correct method
if [[ "$METHOD" != "$CORRECT_METHOD" ]]; then
    echo "❌ WRONG METHOD"
    echo "   Proposed: $METHOD"
    echo "   Correct: $CORRECT_METHOD"
    echo ""
    echo "💡 Fix: Use $CORRECT_METHOD instead of $METHOD"
    if [[ "$CORRECT_METHOD" == "message_tool" ]]; then
        echo "   Call: message(action=send, target=\"$CORRECT_TARGET\", message=\"...\")"
    fi
    log_routing_decision "$AGENT" "$SESSION" "$RECIPIENT" "INVALID:wrong_method($METHOD)" "validation"
    exit 1
fi

# If using message tool, validate target
if [[ "$METHOD" == "message_tool" ]]; then
    # Check if target matches correct target
    NORMALIZED_RECIPIENT=$(normalize_phone "$RECIPIENT")
    if [[ "$NORMALIZED_RECIPIENT" != "$CORRECT_TARGET" ]] && [[ "$RECIPIENT" != "$CORRECT_TARGET" ]]; then
        echo "❌ WRONG TARGET"
        echo "   Recipient: $RECIPIENT"
        echo "   Correct target: $CORRECT_TARGET"
        echo ""
        echo "💡 Fix: Use target=\"$CORRECT_TARGET\""
        log_routing_decision "$AGENT" "$SESSION" "$RECIPIENT" "INVALID:wrong_target" "validation"
        exit 1
    fi
fi

# Check timing (don't send between 23:00-06:00 unless urgent)
CURRENT_HOUR=$(date +%H)
if [[ "$CONTENT" != *"urgent"* ]] && [[ "$CONTENT" != *"emergency"* ]]; then
    if [[ $CURRENT_HOUR -ge 23 ]] || [[ $CURRENT_HOUR -lt 6 ]]; then
        echo "⏰ TIMING WARNING"
        echo "   Current time: $(date +%H:%M)"
        echo "   Quiet hours: 23:00-06:00"
        echo ""
        echo "💡 Consider: Wait until morning unless urgent"
        # Don't block, just warn
    fi
fi

# Security capability check
if [[ -f "$WORKSPACE/scripts/validate-agent-capability.sh" ]]; then
    if ! bash "$WORKSPACE/scripts/validate-agent-capability.sh" \
        --agent "$AGENT" \
        --action "message" \
        --target "$RECIPIENT" 2>/dev/null; then
        echo "❌ CAPABILITY CHECK FAILED"
        echo "   Agent $AGENT is not allowed to message $RECIPIENT"
        log_routing_decision "$AGENT" "$SESSION" "$RECIPIENT" "BLOCKED:capability" "validation"
        exit 2
    fi
fi

# All checks passed
echo "✅ Routing valid"
echo "   Method: $CORRECT_METHOD"
if [[ "$CORRECT_METHOD" == "message_tool" ]]; then
    echo "   Target: $CORRECT_TARGET"
fi

log_routing_decision "$AGENT" "$SESSION" "$RECIPIENT" "VALID:$CORRECT_DECISION" "validation"
exit 0
