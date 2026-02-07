#!/bin/bash
# Analyze WhatsApp messaging patterns

set -e

WACLI="$HOME/go/bin/wacli"
DAYS=7
CONTACT=""

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --days)
      DAYS="$2"
      shift 2
      ;;
    --contact)
      CONTACT="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

echo "📊 Analyzing messaging patterns (last $DAYS days)..." >&2

# Get all chats
CHATS=$("$WACLI" chats list --json 2>/dev/null || echo "[]")

# If specific contact requested, filter
if [ -n "$CONTACT" ]; then
  # Normalize contact to JID
  if [[ "$CONTACT" =~ ^\+?[0-9]+$ ]]; then
    CONTACT="${CONTACT#+}@s.whatsapp.net"
  fi
  CHATS=$(echo "$CHATS" | jq --arg jid "$CONTACT" '[.[] | select(.jid == $jid)]')
fi

# Analyze message counts per chat
echo "$CHATS" | jq -r '
  sort_by(.last_message_time) | reverse | .[] |
  "\(.kind | ascii_upcase)\t\(.name // .jid)\t\(.last_message_time // "N/A")"
' | column -t -s $'\t' | head -20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Stats summary
TOTAL_CHATS=$(echo "$CHATS" | jq 'length')
DM_COUNT=$(echo "$CHATS" | jq '[.[] | select(.kind == "dm")] | length')
GROUP_COUNT=$(echo "$CHATS" | jq '[.[] | select(.kind == "group")] | length')

echo ""
echo "📈 Quick Stats:"
echo "   Total chats: $TOTAL_CHATS"
echo "   Direct messages: $DM_COUNT"
echo "   Groups: $GROUP_COUNT"
echo ""

if [ $TOTAL_CHATS -gt 0 ]; then
  echo "🔥 Most Active Chats:"
  echo "$CHATS" | jq -r '
    sort_by(.last_message_time) | reverse | .[0:5] | .[] |
    "   • \(.name // .jid)"
  '
fi
echo ""
