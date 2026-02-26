#!/bin/bash
# Investor Pipeline Management
# Usage: bash manage-pipeline.sh [command] [args]

PIPELINE_FILE="/home/alexliv/.openclaw/workspace/fundraising/investor-pipeline.json"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Commands
case "$1" in
  
  status)
    echo -e "${BLUE}📊 Investor Pipeline Status${NC}\n"
    
    # Count by stage
    echo "By Stage:"
    for stage in research outreach intro_sent responded meeting_scheduled demo_completed due_diligence term_sheet closed passed; do
      count=$(jq -r ".investors[] | select(.stage == \"$stage\") | .name" "$PIPELINE_FILE" 2>/dev/null | wc -l)
      if [ "$count" -gt 0 ]; then
        echo -e "  ${YELLOW}$stage${NC}: $count"
        jq -r ".investors[] | select(.stage == \"$stage\") | \"    - \" + .name + \" (\" + .priority + \")\"" "$PIPELINE_FILE" 2>/dev/null
      fi
    done
    
    echo ""
    echo "By Priority:"
    for priority in high medium low; do
      count=$(jq -r ".investors[] | select(.priority == \"$priority\") | .name" "$PIPELINE_FILE" 2>/dev/null | wc -l)
      if [ "$count" -gt 0 ]; then
        echo -e "  ${YELLOW}$priority${NC}: $count"
      fi
    done
    
    echo ""
    echo -e "${GREEN}Target: \$10M | 20-25% equity${NC}"
    ;;
  
  list)
    echo -e "${BLUE}📋 All Investors${NC}\n"
    jq -r '.investors[] | "[\(.priority)] \(.name) - \(.stage) - \(.temperature)"' "$PIPELINE_FILE"
    ;;
  
  show)
    if [ -z "$2" ]; then
      echo "Usage: manage-pipeline.sh show <investor-id>"
      exit 1
    fi
    
    echo -e "${BLUE}👤 Investor Details${NC}\n"
    jq -r ".investors[] | select(.id == \"$2\")" "$PIPELINE_FILE"
    ;;
  
  update)
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo "Usage: manage-pipeline.sh update <investor-id> <new-stage>"
      exit 1
    fi
    
    INVESTOR_ID="$2"
    NEW_STAGE="$3"
    DATE=$(date +%Y-%m-%d)
    
    # Add timeline entry
    jq --arg id "$INVESTOR_ID" \
       --arg stage "$NEW_STAGE" \
       --arg date "$DATE" \
       '(.investors[] | select(.id == $id) | .stage) = $stage |
        (.investors[] | select(.id == $id) | .timeline) += [{
          "date": $date,
          "action": $stage,
          "details": "Stage updated to \($stage)",
          "outcome": "in_progress"
        }] |
        (.investors[] | select(.id == $id) | .lastContact) = $date' \
       "$PIPELINE_FILE" > "$PIPELINE_FILE.tmp" && mv "$PIPELINE_FILE.tmp" "$PIPELINE_FILE"
    
    echo -e "${GREEN}✅ Updated $INVESTOR_ID to stage: $NEW_STAGE${NC}"
    ;;
  
  add-note)
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo "Usage: manage-pipeline.sh add-note <investor-id> \"<note>\""
      exit 1
    fi
    
    INVESTOR_ID="$2"
    NOTE="$3"
    DATE=$(date +%Y-%m-%d)
    
    jq --arg id "$INVESTOR_ID" \
       --arg note "$NOTE" \
       --arg date "$DATE" \
       '(.investors[] | select(.id == $id) | .timeline) += [{
          "date": $date,
          "action": "note",
          "details": $note,
          "outcome": "n/a"
        }]' \
       "$PIPELINE_FILE" > "$PIPELINE_FILE.tmp" && mv "$PIPELINE_FILE.tmp" "$PIPELINE_FILE"
    
    echo -e "${GREEN}✅ Added note to $INVESTOR_ID${NC}"
    ;;
  
  research)
    echo -e "${BLUE}🔍 Research Pipeline${NC}\n"
    jq -r '.research[] | "\n[\(.category)]\n" + (.targets[] | "  - \(.name) (\(.checkSize)) - \(.relevance) relevance\n    Notes: \(.notes)")' "$PIPELINE_FILE"
    ;;
  
  next-actions)
    echo -e "${BLUE}⏭️  Next Actions${NC}\n"
    jq -r '.investors[] | select(.nextAction != null) | "[\(.priority)] \(.name):\n  → \(.nextAction)\n"' "$PIPELINE_FILE"
    ;;
  
  weekly-report)
    echo -e "${BLUE}📈 Weekly Fundraising Report${NC}"
    echo -e "${YELLOW}Date: $(date +%Y-%m-%d)${NC}\n"
    
    echo "Active Conversations:"
    jq -r '.investors[] | select(.status == "active") | "  - \(.name) (\(.stage))"' "$PIPELINE_FILE"
    
    echo ""
    echo "This Week's Activity:"
    WEEK_AGO=$(date -d '7 days ago' +%Y-%m-%d 2>/dev/null || date -v-7d +%Y-%m-%d 2>/dev/null)
    jq -r --arg week "$WEEK_AGO" '.investors[].timeline[] | select(.date >= $week) | "  [\(.date)] \(.action) - \(.details)"' "$PIPELINE_FILE"
    
    echo ""
    echo "Next Week's Actions:"
    jq -r '.investors[] | select(.nextAction != null) | "  - \(.name): \(.nextAction)"' "$PIPELINE_FILE"
    ;;
  
  *)
    echo "Investor Pipeline Management"
    echo ""
    echo "Commands:"
    echo "  status          - Pipeline overview by stage"
    echo "  list            - List all investors"
    echo "  show <id>       - Show investor details"
    echo "  update <id> <stage> - Update investor stage"
    echo "  add-note <id> \"<note>\" - Add timeline note"
    echo "  research        - Show research targets"
    echo "  next-actions    - Show required next actions"
    echo "  weekly-report   - Generate weekly summary"
    ;;
esac
