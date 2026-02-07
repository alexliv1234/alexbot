#!/bin/bash
# Scan messages for scheduling mentions

set -e

WACLI="$HOME/go/bin/wacli"
LLM_SCRIPT="$(dirname "$0")/llm-query.sh"
DAYS=7

echo "📅 Scanning for scheduling mentions (last $DAYS days)..." >&2

# Search for scheduling keywords
KEYWORDS=("meeting" "call" "lunch" "dinner" "appointment" "tomorrow" "next week")
ALL_RESULTS="[]"

for keyword in "${KEYWORDS[@]}"; do
  RESULTS=$("$WACLI" messages search "$keyword" --limit 20 --json 2>/dev/null || echo "[]")
  ALL_RESULTS=$(echo "$ALL_RESULTS" | jq --argjson new "$RESULTS" '. + $new')
done

# Deduplicate by message ID
ALL_RESULTS=$(echo "$ALL_RESULTS" | jq 'unique_by(.id)')
RESULT_COUNT=$(echo "$ALL_RESULTS" | jq 'length')

if [ "$RESULT_COUNT" -eq 0 ]; then
  echo "No scheduling mentions found" >&2
  exit 0
fi

echo "✅ Found $RESULT_COUNT potential scheduling messages" >&2

# Format and display
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📅 SCHEDULING MENTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "$ALL_RESULTS" | jq -r '.[] | 
  "[\(.timestamp | split("T")[0])] \(.sender_name // "You"): \(.text)"' | head -20
echo ""
