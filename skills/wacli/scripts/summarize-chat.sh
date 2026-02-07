#!/bin/bash
# Summarize a WhatsApp conversation using local LLM

set -e

WACLI="$HOME/go/bin/wacli"
LLM_SCRIPT="$(dirname "$0")/llm-query.sh"
RESOLVE_SCRIPT="$(dirname "$0")/resolve-contact.sh"

JID=""
DAYS=7
LIMIT=200

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --days)
      DAYS="$2"
      shift 2
      ;;
    --messages)
      LIMIT="$2"
      shift 2
      ;;
    *)
      JID="$1"
      shift
      ;;
  esac
done

if [ -z "$JID" ]; then
  echo "Usage: $0 <jid|phone> [--days N] [--messages N]" >&2
  exit 1
fi

# Normalize JID
if [[ "$JID" =~ ^\+?[0-9]+$ ]]; then
  JID="${JID#+}"
  JID="${JID}@s.whatsapp.net"
fi

# Resolve contact name
CONTACT_INFO=$("$RESOLVE_SCRIPT" "$JID" 2>/dev/null)
CONTACT_NAME=$(echo "$CONTACT_INFO" | jq -r '.name // .jid')

echo "📱 Summarizing conversation with: $CONTACT_NAME" >&2

# Fetch messages
AFTER_DATE=$(date -d "$DAYS days ago" +%Y-%m-%d 2>/dev/null || date -v-${DAYS}d +%Y-%m-%d)

MESSAGES=$("$WACLI" messages search "" --chat "$JID" --after "$AFTER_DATE" --limit "$LIMIT" --json 2>/dev/null || echo "[]")
MSG_COUNT=$(echo "$MESSAGES" | jq 'length')

if [ "$MSG_COUNT" -eq 0 ]; then
  echo "No messages found in the last $DAYS days" >&2
  exit 0
fi

echo "✅ Found $MSG_COUNT messages from last $DAYS days" >&2

# Format for LLM
MESSAGES_TEXT=$(echo "$MESSAGES" | jq -r '.[] | 
  "[\(.timestamp | split("T")[0])] \(.sender_name // "You"): \(.text // "[media: \(.media_type // "unknown")]")"')

echo "🤖 Generating summary with local LLM..." >&2

SUMMARY=$("$LLM_SCRIPT" "Summarize this WhatsApp conversation with $CONTACT_NAME from the last $DAYS days:

$MESSAGES_TEXT

Provide a structured summary:

## 📋 Main Discussion Points
- Key topics discussed (bullet points)

## ✅ Decisions Made
- Important decisions or agreements

## 🎯 Action Items
- Tasks or follow-ups mentioned
- Who's responsible for what

## 📅 Scheduling
- Dates, times, or events mentioned

## 💬 Notable Quotes
- Important or interesting statements

## 📊 Summary
- Brief 2-3 sentence overview of the conversation

Be concise, factual, and preserve important details." --max-tokens 1000 2>/dev/null)

# Output
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 CONVERSATION SUMMARY: $CONTACT_NAME"
echo "   Last $DAYS days • $MSG_COUNT messages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "$SUMMARY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
