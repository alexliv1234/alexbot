#!/bin/bash
# Check which investors need follow-ups
# Usage: bash check-followups.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVESTORS_DIR="$SCRIPT_DIR/../investors"

if [ ! -d "$INVESTORS_DIR" ]; then
  echo "❌ Investors directory not found"
  exit 1
fi

echo "🔍 Checking follow-up status for all investors..."
echo ""

# Current timestamp (seconds since epoch)
NOW=$(date +%s)

NEEDS_FOLLOWUP=()
WAITING=()
DONE=()

# Iterate through all investors
for INVESTOR_DIR in "$INVESTORS_DIR"/*/; do
  if [ ! -d "$INVESTOR_DIR" ]; then
    continue
  fi
  
  PROFILE_FILE="$INVESTOR_DIR/profile.json"
  
  if [ ! -f "$PROFILE_FILE" ]; then
    continue
  fi
  
  INVESTOR_ID=$(basename "$INVESTOR_DIR")
  NAME=$(jq -r '.name' "$PROFILE_FILE")
  STAGE=$(jq -r '.stage' "$PROFILE_FILE")
  LAST_CONTACT=$(jq -r '.lastContact' "$PROFILE_FILE")
  
  # Skip if not in outreach stage or no contact yet
  if [ "$STAGE" != "outreach" ] || [ "$LAST_CONTACT" = "null" ] || [ -z "$LAST_CONTACT" ]; then
    DONE+=("$NAME ($STAGE)")
    continue
  fi
  
  # Calculate days since last contact
  LAST_CONTACT_EPOCH=$(date -d "$LAST_CONTACT" +%s 2>/dev/null || echo "0")
  
  if [ "$LAST_CONTACT_EPOCH" = "0" ]; then
    # Invalid date format, skip
    continue
  fi
  
  DAYS_SINCE=$(( ($NOW - $LAST_CONTACT_EPOCH) / 86400 ))
  
  # Determine follow-up need
  if [ $DAYS_SINCE -ge 21 ]; then
    NEEDS_FOLLOWUP+=("$NAME (Day $DAYS_SINCE) - ⚠️  LAST CHANCE")
  elif [ $DAYS_SINCE -ge 10 ]; then
    NEEDS_FOLLOWUP+=("$NAME (Day $DAYS_SINCE) - Follow-up #2")
  elif [ $DAYS_SINCE -ge 5 ]; then
    NEEDS_FOLLOWUP+=("$NAME (Day $DAYS_SINCE) - Follow-up #1")
  else
    WAITING+=("$NAME (Day $DAYS_SINCE) - Still in waiting window")
  fi
done

# Display results
echo "📊 FOLLOW-UP STATUS REPORT"
echo "=========================="
echo ""

if [ ${#NEEDS_FOLLOWUP[@]} -gt 0 ]; then
  echo "🚨 NEEDS FOLLOW-UP (${#NEEDS_FOLLOWUP[@]}):"
  for item in "${NEEDS_FOLLOWUP[@]}"; do
    echo "   • $item"
  done
  echo ""
fi

if [ ${#WAITING[@]} -gt 0 ]; then
  echo "⏳ WAITING (${#WAITING[@]}):"
  for item in "${WAITING[@]}"; do
    echo "   • $item"
  done
  echo ""
fi

if [ ${#DONE[@]} -gt 0 ]; then
  echo "✅ OTHER STAGES (${#DONE[@]}):"
  for item in "${DONE[@]}"; do
    echo "   • $item"
  done
  echo ""
fi

if [ ${#NEEDS_FOLLOWUP[@]} -eq 0 ]; then
  echo "✅ No follow-ups needed right now"
  echo ""
fi

echo "🎯 Next actions:"
if [ ${#NEEDS_FOLLOWUP[@]} -gt 0 ]; then
  echo "   Run: bash send-followup.sh <investor-id>"
else
  echo "   Check back tomorrow"
fi
echo ""
