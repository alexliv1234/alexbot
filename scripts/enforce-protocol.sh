#!/bin/bash
# Master enforcement script - auto-detects context and validates
# Usage: bash scripts/enforce-protocol.sh <chat_id> <channel> [target] [reply-text]
#
# Examples:
#   bash scripts/enforce-protocol.sh "120363405143589138@g.us" "whatsapp"
#   bash scripts/enforce-protocol.sh "+972526802086" "whatsapp" "+972526802086" "$(cat reply.txt)"

CHAT_ID="$1"
CHANNEL="$2"
TARGET="$3"
REPLY="$4"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}════════════════════════════════════════${NC}"
echo -e "${BOLD}${BLUE}   🛡️  PROTOCOL ENFORCEMENT SYSTEM   ${NC}"
echo -e "${BOLD}${BLUE}════════════════════════════════════════${NC}"
echo ""

# Step 1: Auto-detect context
echo -e "${BLUE}Step 1/3: Context Detection${NC}"
bash scripts/auto-detect-context.sh "$CHAT_ID" "$CHANNEL" "$TARGET"
CONTEXT_EXIT=$?

echo ""
echo -e "${BLUE}Step 2/3: Protocol Check${NC}"

# Determine context type
CONTEXT_TYPE=""
if [[ "$CHAT_ID" == "120363405143589138@g.us" ]]; then
    CONTEXT_TYPE="playing-group"
elif [[ "$CHAT_ID" == "120363405143589140@g.us" ]]; then
    CONTEXT_TYPE="teaching-reply"
elif [[ "$TARGET" == "+972526802086" ]] || [[ "$TARGET" == "+972525214507" ]]; then
    CONTEXT_TYPE="investor-message"
fi

# Step 2: Validate reply if provided
if [[ -n "$REPLY" ]] && [[ -n "$CONTEXT_TYPE" ]]; then
    bash scripts/validate-reply.sh "$CONTEXT_TYPE" "$REPLY"
    VALIDATE_EXIT=$?
    
    echo ""
    if [[ $VALIDATE_EXIT -eq 0 ]]; then
        echo -e "${GREEN}${BOLD}✅ ALL CHECKS PASSED${NC}"
        echo -e "${GREEN}Reply is ready to send!${NC}"
    else
        echo -e "${RED}${BOLD}❌ VALIDATION FAILED${NC}"
        echo -e "${RED}DO NOT SEND - Fix issues first${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  No reply text provided - skipping validation${NC}"
    echo -e "  (Checklist shown above)"
fi

echo ""
echo -e "${BLUE}Step 3/3: Ready to proceed${NC}"
echo -e "${BOLD}${BLUE}════════════════════════════════════════${NC}"
