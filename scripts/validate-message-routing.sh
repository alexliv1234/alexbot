#!/bin/bash
# validate-message-routing.sh - Ensure messages go to the right recipient
# Part of Week 4: Smart Message Routing

set -euo pipefail

# Usage: bash scripts/validate-message-routing.sh "<current_session>" "<intended_target>" "<message_type>"
# Example: bash scripts/validate-message-routing.sh "whatsapp:dm:+972544419002" "+972544419002" "reply"

CURRENT_SESSION="${1:-unknown}"
INTENDED_TARGET="${2:-unknown}"
MESSAGE_TYPE="${3:-unknown}"  # reply | message_tool | notify_alex

ALEX_PHONE="+972544419002"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== MESSAGE ROUTING VALIDATOR ==="
echo "Current session: $CURRENT_SESSION"
echo "Intended target: $INTENDED_TARGET"
echo "Message type: $MESSAGE_TYPE"
echo ""

# Extract session info
SESSION_TYPE="unknown"
SESSION_TARGET="unknown"

if [[ "$CURRENT_SESSION" == *"whatsapp:dm:"* ]]; then
    SESSION_TYPE="dm"
    SESSION_TARGET=$(echo "$CURRENT_SESSION" | grep -oP 'whatsapp:dm:\K[+0-9]+' || echo "unknown")
elif [[ "$CURRENT_SESSION" == *"whatsapp:group:"* ]]; then
    SESSION_TYPE="group"
    SESSION_TARGET=$(echo "$CURRENT_SESSION" | grep -oP 'whatsapp:group:\K[^:]+' || echo "unknown")
elif [[ "$CURRENT_SESSION" == *"webchat"* ]] || [[ "$CURRENT_SESSION" == "main" ]]; then
    SESSION_TYPE="main"
    SESSION_TARGET="main"
elif [[ "$CURRENT_SESSION" == *"cron"* ]] || [[ "$CURRENT_SESSION" == *"isolated"* ]]; then
    SESSION_TYPE="cron"
    SESSION_TARGET="cron"
else
    SESSION_TYPE="unknown"
fi

echo "Detected session type: $SESSION_TYPE"
echo "Detected session target: $SESSION_TARGET"
echo ""

# Validation rules
VALIDATION_PASSED=true
WARNINGS=()
ERRORS=()

# Rule 1: If intended target is Alex, validate routing method
if [[ "$INTENDED_TARGET" == "$ALEX_PHONE" ]]; then
    if [[ "$SESSION_TYPE" == "main" ]] && [[ "$MESSAGE_TYPE" == "reply" ]]; then
        echo -e "${GREEN}✓${NC} Main session → Alex: 'reply' is safe"
    elif [[ "$SESSION_TYPE" == "dm" ]] && [[ "$SESSION_TARGET" == "$ALEX_PHONE" ]] && [[ "$MESSAGE_TYPE" == "reply" ]]; then
        echo -e "${GREEN}✓${NC} Alex's DM session → Alex: 'reply' is safe"
    elif [[ "$MESSAGE_TYPE" == "message_tool" ]] || [[ "$MESSAGE_TYPE" == "notify_alex" ]]; then
        echo -e "${GREEN}✓${NC} Using message tool to reach Alex: safe"
    elif [[ "$MESSAGE_TYPE" == "reply" ]]; then
        ERRORS+=("🚨 ROUTING BUG: Using 'reply' from $SESSION_TYPE session will NOT reach Alex!")
        ERRORS+=("   → Current session target: $SESSION_TARGET")
        ERRORS+=("   → 'reply' goes to session target, not Alex")
        ERRORS+=("   → FIX: Use message tool with to:$ALEX_PHONE")
        VALIDATION_PASSED=false
    fi
fi

# Rule 2: If in group session and replying, warn about visibility
if [[ "$SESSION_TYPE" == "group" ]] && [[ "$MESSAGE_TYPE" == "reply" ]]; then
    if [[ "$INTENDED_TARGET" != "$SESSION_TARGET" ]]; then
        ERRORS+=("🚨 GROUP ROUTING ERROR: You want to message $INTENDED_TARGET but you're in group $SESSION_TARGET")
        ERRORS+=("   → 'reply' in group session sends to THE GROUP, not individuals")
        ERRORS+=("   → FIX: Use message tool for DM or verify you want group message")
        VALIDATION_PASSED=false
    else
        WARNINGS+=("⚠️  Reply in group: Message will be PUBLIC to all group members")
    fi
fi

# Rule 3: If in cron session, validate Alex notification method
if [[ "$SESSION_TYPE" == "cron" ]]; then
    if [[ "$MESSAGE_TYPE" == "reply" ]]; then
        ERRORS+=("🚨 CRON ROUTING BUG: Using 'reply' from cron job is DANGEROUS")
        ERRORS+=("   → Cron jobs often run in main session")
        ERRORS+=("   → 'reply' goes to whoever last triggered main session")
        ERRORS+=("   → Could send Alex's private info to wrong person!")
        ERRORS+=("   → FIX: ALWAYS use message tool with to:$ALEX_PHONE from cron")
        VALIDATION_PASSED=false
    elif [[ "$INTENDED_TARGET" == "$ALEX_PHONE" ]] && [[ "$MESSAGE_TYPE" == "message_tool" ]]; then
        echo -e "${GREEN}✓${NC} Cron job using message tool to Alex: safe"
    fi
fi

# Rule 4: Validate target phone format
if [[ "$INTENDED_TARGET" =~ ^\+972[0-9]{9}$ ]]; then
    echo -e "${GREEN}✓${NC} Target phone format valid: $INTENDED_TARGET"
elif [[ "$INTENDED_TARGET" == "main" ]] || [[ "$INTENDED_TARGET" == *"@g.us" ]]; then
    echo -e "${GREEN}✓${NC} Target is group/session: $INTENDED_TARGET"
else
    WARNINGS+=("⚠️  Target format unusual: $INTENDED_TARGET")
fi

# Rule 5: Double-check it's actually Alex
if [[ "$INTENDED_TARGET" =~ ^\+972 ]] && [[ "$INTENDED_TARGET" != "$ALEX_PHONE" ]]; then
    WARNINGS+=("⚠️  Target is NOT Alex ($ALEX_PHONE), it's: $INTENDED_TARGET")
    WARNINGS+=("   → Verify this is intentional (parent, investor, etc.)")
fi

echo ""
echo "=== VALIDATION RESULTS ==="

# Print warnings
if [ ${#WARNINGS[@]} -gt 0 ]; then
    for warning in "${WARNINGS[@]}"; do
        echo -e "${YELLOW}$warning${NC}"
    done
    echo ""
fi

# Print errors
if [ ${#ERRORS[@]} -gt 0 ]; then
    for error in "${ERRORS[@]}"; do
        echo -e "${RED}$error${NC}"
    done
    echo ""
fi

# Final result
if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}✅ ROUTING VALIDATION PASSED${NC}"
    echo ""
    echo "Safe to send message."
    exit 0
else
    echo -e "${RED}❌ ROUTING VALIDATION FAILED${NC}"
    echo ""
    echo "DO NOT SEND - Fix routing first!"
    exit 1
fi
