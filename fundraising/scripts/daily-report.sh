#!/bin/bash
# Generate daily fundraising report
# Usage: bash daily-report.sh [--markdown]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVESTORS_DIR="$SCRIPT_DIR/../investors"
PIPELINE_FILE="$SCRIPT_DIR/../investor-pipeline.json"

OUTPUT_FORMAT="${1}"

echo "📊 DAILY FUNDRAISING REPORT"
echo "==========================="
NOW=$(date +"%Y-%m-%d %H:%M %Z")
echo "Generated: $NOW"
echo ""

# Count investors by stage
declare -A STAGE_COUNTS
TOTAL=0

for INVESTOR_DIR in "$INVESTORS_DIR"/*/; do
  if [ ! -d "$INVESTOR_DIR" ]; then
    continue
  fi
  
  PROFILE_FILE="$INVESTOR_DIR/profile.json"
  
  if [ ! -f "$PROFILE_FILE" ]; then
    continue
  fi
  
  STAGE=$(jq -r '.stage' "$PROFILE_FILE")
  STATUS=$(jq -r '.status' "$PROFILE_FILE")
  
  # Only count active investors
  if [ "$STATUS" = "active" ]; then
    STAGE_COUNTS[$STAGE]=$((${STAGE_COUNTS[$STAGE]:-0} + 1))
    TOTAL=$((TOTAL + 1))
  fi
done

# Pipeline overview
echo "📈 PIPELINE OVERVIEW"
echo "-------------------"
echo "Total Active: $TOTAL investors"
echo ""
echo "By Stage:"
for stage in research strategy ready outreach responded meeting materials due_diligence term_sheet closed; do
  count=${STAGE_COUNTS[$stage]:-0}
  if [ $count -gt 0 ]; then
    echo "  • $stage: $count"
  fi
done
echo ""

# Today's activity
echo "📤 TODAY'S OUTREACH"
echo "------------------"
TODAY=$(date +%Y-%m-%d)
SENT_TODAY=0

for INVESTOR_DIR in "$INVESTORS_DIR"/*/; do
  if [ ! -d "$INVESTOR_DIR" ]; then
    continue
  fi
  
  COMMS_FILE="$INVESTOR_DIR/communications.jsonl"
  
  if [ ! -f "$COMMS_FILE" ]; then
    continue
  fi
  
  # Check for outbound messages today
  TODAY_MESSAGES=$(grep "\"$TODAY" "$COMMS_FILE" | grep "\"direction\":\"outbound\"" || echo "")
  
  if [ -n "$TODAY_MESSAGES" ]; then
    NAME=$(jq -r '.name' "$INVESTOR_DIR/profile.json")
    echo "  ✅ $NAME - Message sent"
    SENT_TODAY=$((SENT_TODAY + 1))
  fi
done

if [ $SENT_TODAY -eq 0 ]; then
  echo "  (No messages sent today)"
fi
echo ""

# Follow-ups needed
echo "⏰ FOLLOW-UPS NEEDED"
echo "-------------------"

NOW_EPOCH=$(date +%s)
FOLLOWUP_COUNT=0

for INVESTOR_DIR in "$INVESTORS_DIR"/*/; do
  if [ ! -d "$INVESTOR_DIR" ]; then
    continue
  fi
  
  PROFILE_FILE="$INVESTOR_DIR/profile.json"
  
  if [ ! -f "$PROFILE_FILE" ]; then
    continue
  fi
  
  NAME=$(jq -r '.name' "$PROFILE_FILE")
  STAGE=$(jq -r '.stage' "$PROFILE_FILE")
  LAST_CONTACT=$(jq -r '.lastContact' "$PROFILE_FILE")
  
  if [ "$STAGE" = "outreach" ] && [ "$LAST_CONTACT" != "null" ] && [ -n "$LAST_CONTACT" ]; then
    LAST_CONTACT_EPOCH=$(date -d "$LAST_CONTACT" +%s 2>/dev/null || echo "0")
    
    if [ "$LAST_CONTACT_EPOCH" != "0" ]; then
      DAYS_SINCE=$(( ($NOW_EPOCH - $LAST_CONTACT_EPOCH) / 86400 ))
      
      if [ $DAYS_SINCE -ge 5 ]; then
        echo "  • $NAME (Day $DAYS_SINCE)"
        FOLLOWUP_COUNT=$((FOLLOWUP_COUNT + 1))
      fi
    fi
  fi
done

if [ $FOLLOWUP_COUNT -eq 0 ]; then
  echo "  ✅ No follow-ups needed"
fi
echo ""

# Recent responses
echo "📬 RECENT RESPONSES"
echo "------------------"
RESPONSES_COUNT=0

for INVESTOR_DIR in "$INVESTORS_DIR"/*/; do
  if [ ! -d "$INVESTOR_DIR" ]; then
    continue
  fi
  
  PROFILE_FILE="$INVESTOR_DIR/profile.json"
  STAGE=$(jq -r '.stage' "$PROFILE_FILE")
  
  if [ "$STAGE" = "responded" ] || [ "$STAGE" = "meeting" ]; then
    NAME=$(jq -r '.name' "$PROFILE_FILE")
    LAST_CONTACT=$(jq -r '.lastContact' "$PROFILE_FILE")
    
    if [ "$LAST_CONTACT" != "null" ]; then
      LAST_CONTACT_READABLE=$(date -d "$LAST_CONTACT" +"%b %d" 2>/dev/null || echo "Unknown")
      echo "  ✅ $NAME ($LAST_CONTACT_READABLE)"
      RESPONSES_COUNT=$((RESPONSES_COUNT + 1))
    fi
  fi
done

if [ $RESPONSES_COUNT -eq 0 ]; then
  echo "  (No recent responses)"
fi
echo ""

# Goals & metrics
echo "🎯 GOALS & PROGRESS"
echo "------------------"

TARGET_RAISED=10000000
TARGET_INVESTORS=20

CURRENT_OUTREACH=${STAGE_COUNTS[outreach]:-0}
CURRENT_RESPONDED=${STAGE_COUNTS[responded]:-0}
CURRENT_MEETING=${STAGE_COUNTS[meeting]:-0}
CURRENT_DD=${STAGE_COUNTS[due_diligence]:-0}

PROGRESS_PCT=$(( ($CURRENT_OUTREACH * 100) / $TARGET_INVESTORS ))

echo "Outreach Target: $TARGET_INVESTORS investors"
echo "Current Outreach: $CURRENT_OUTREACH ($PROGRESS_PCT%)"
echo "Responded: $CURRENT_RESPONDED"
echo "Active Conversations: $CURRENT_MEETING"
echo "Due Diligence: $CURRENT_DD"
echo ""

# Next actions
echo "🎯 RECOMMENDED ACTIONS"
echo "---------------------"

if [ $FOLLOWUP_COUNT -gt 0 ]; then
  echo "1. Send $FOLLOWUP_COUNT follow-up messages"
fi

READY_COUNT=${STAGE_COUNTS[ready]:-0}
if [ $READY_COUNT -gt 0 ]; then
  echo "2. Send $READY_COUNT approved intro messages"
fi

RESEARCH_COUNT=${STAGE_COUNTS[research]:-0}
if [ $RESEARCH_COUNT -gt 0 ]; then
  echo "3. Complete research for $RESEARCH_COUNT investors"
fi

if [ $TOTAL -lt $TARGET_INVESTORS ]; then
  NEEDED=$(($TARGET_INVESTORS - $CURRENT_OUTREACH))
  echo "4. Add $NEEDED more investors to pipeline"
fi

echo ""
echo "---"
echo "Report complete. Run 'bash check-followups.sh' for details."
echo ""
