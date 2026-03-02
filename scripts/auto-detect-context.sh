#!/bin/bash
# Auto-detect current context and show relevant checklist
# Usage: bash scripts/auto-detect-context.sh [chat_id] [channel] [target]

CHAT_ID="$1"
CHANNEL="$2"
TARGET="$3"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Critical contexts
PLAYING_GROUP="120363405143589138@g.us"
LEARNING_GROUP="120363405143589140@g.us"  # Need to verify this
INVESTOR_NUMBERS=(
    "+972526802086"  # Alon Lifshitz
    "+972525214507"  # Eran Bielski
)

echo -e "${BLUE}🔍 Auto-detecting context...${NC}"
echo ""

# Check for playing group
if [[ "$CHAT_ID" == "$PLAYING_GROUP" ]]; then
    echo -e "${YELLOW}⚠️  DETECTED: Playing Group (משחקים עם אלכס הבוט)${NC}"
    echo -e "${RED}🚨 MANDATORY SCORING REQUIRED${NC}"
    echo ""
    exec bash scripts/pre-action-check.sh group-reply
    exit 0
fi

# Check for learning group
if [[ "$CHAT_ID" == "$LEARNING_GROUP" ]]; then
    echo -e "${YELLOW}⚠️  DETECTED: Learning Group (לומדים עם אלכס הבוט)${NC}"
    echo -e "${RED}🚨 TEACHING QUALITY PROTOCOL${NC}"
    echo ""
    exec bash scripts/pre-action-check.sh teaching-reply
    exit 0
fi

# Check for investor contact
for investor in "${INVESTOR_NUMBERS[@]}"; do
    if [[ "$TARGET" == "$investor" ]] || [[ "$CHAT_ID" == "$investor" ]]; then
        echo -e "${YELLOW}⚠️  DETECTED: Investor Contact${NC}"
        echo -e "${RED}🚨 INVESTOR MESSAGING PROTOCOL${NC}"
        echo ""
        exec bash scripts/pre-action-check.sh investor-message
        exit 0
    fi
done

# Check if WhatsApp group (any)
if [[ "$CHAT_ID" =~ @g\.us$ ]]; then
    echo -e "${GREEN}✓ WhatsApp group detected (not critical)${NC}"
    echo -e "  General group rules apply"
    exit 0
fi

# Check if DM
if [[ "$CHANNEL" == "whatsapp" ]] && [[ ! "$CHAT_ID" =~ @g\.us$ ]]; then
    echo -e "${GREEN}✓ WhatsApp DM detected${NC}"
    echo -e "  Standard DM rules apply"
    exit 0
fi

echo -e "${GREEN}✓ No critical context detected${NC}"
echo -e "  Standard protocols apply"
exit 0
