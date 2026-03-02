#!/bin/bash
# Validate a proposed reply against protocol
# Usage: bash scripts/validate-reply.sh <context-type> <reply-text>

CONTEXT="$1"
REPLY="$2"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [[ -z "$CONTEXT" ]] || [[ -z "$REPLY" ]]; then
    echo -e "${RED}❌ Usage: validate-reply.sh <context-type> <reply-text>${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Validating reply for context: $CONTEXT${NC}"
echo ""

ERRORS=0

case "$CONTEXT" in
    playing-group)
        echo "Checking playing group protocol..."
        
        # Check for score block
        if ! echo "$REPLY" | grep -q "📊.*SCORE"; then
            echo -e "${RED}❌ MISSING: Score block (📊 SCORE)${NC}"
            ((ERRORS++))
        else
            echo -e "${GREEN}✓ Score block found${NC}"
        fi
        
        # Check for scoring categories
        if ! echo "$REPLY" | grep -q "Creativity\|Challenge\|Humor"; then
            echo -e "${RED}❌ MISSING: Scoring categories${NC}"
            ((ERRORS++))
        else
            echo -e "${GREEN}✓ Scoring categories found${NC}"
        fi
        
        # Check for position/total/avg
        if ! echo "$REPLY" | grep -q "Position.*Total.*Avg"; then
            echo -e "${RED}❌ MISSING: Position/Total/Avg stats${NC}"
            ((ERRORS++))
        else
            echo -e "${GREEN}✓ Position stats found${NC}"
        fi
        ;;
        
    investor-message)
        echo "Checking investor protocol..."
        
        # Check for intelligence-first language
        if ! echo "$REPLY" | grep -iq "intelligence\|learn\|experience\|pattern\|accumulated"; then
            echo -e "${RED}❌ MISSING: Intelligence-first positioning${NC}"
            echo -e "  Should mention: accumulated intelligence, learning, patterns"
            ((ERRORS++))
        else
            echo -e "${GREEN}✓ Intelligence-first language found${NC}"
        fi
        
        # Check NOT leading with platform
        if echo "$REPLY" | head -3 | grep -iq "platform\|infrastructure\|built"; then
            echo -e "${RED}❌ WARNING: Leading with platform/infrastructure${NC}"
            echo -e "  Should lead with intelligence, not platform"
            ((ERRORS++))
        else
            echo -e "${GREEN}✓ Not leading with platform${NC}"
        fi
        ;;
        
    teaching-reply)
        echo "Checking teaching protocol..."
        
        # Check for examples/code
        if ! echo "$REPLY" | grep -q "\`\|\$\|bash\|node"; then
            echo -e "${RED}❌ MISSING: Code examples or commands${NC}"
            ((ERRORS++))
        else
            echo -e "${GREEN}✓ Code examples found${NC}"
        fi
        
        # Check for structure (headers/bullets)
        if ! echo "$REPLY" | grep -q "^#\|^-\|^[0-9]\."; then
            echo -e "${RED}❌ MISSING: Clear structure (headers/bullets/steps)${NC}"
            ((ERRORS++))
        else
            echo -e "${GREEN}✓ Structure found${NC}"
        fi
        ;;
        
    *)
        echo -e "${RED}Unknown context: $CONTEXT${NC}"
        exit 1
        ;;
esac

echo ""
if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}✅ Reply passes validation!${NC}"
    exit 0
else
    echo -e "${RED}❌ Reply has $ERRORS validation errors${NC}"
    echo -e "${YELLOW}Fix issues before sending!${NC}"
    exit 1
fi
