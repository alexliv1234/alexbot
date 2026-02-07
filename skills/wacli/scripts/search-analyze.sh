#!/bin/bash
# Search WhatsApp messages and analyze with local LLM

set -e

WACLI="$HOME/go/bin/wacli"
LLM_SCRIPT="$(dirname "$0")/llm-query.sh"

QUERY=""
DAYS=30
CHAT=""
LIMIT=50

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --days)
      DAYS="$2"
      shift 2
      ;;
    --chat)
      CHAT="$2"
      shift 2
      ;;
    --limit)
      LIMIT="$2"
      shift 2
      ;;
    *)
      QUERY="$1"
      shift
      ;;
  esac
done

if [ -z "$QUERY" ]; then
  echo "Usage: $0 \"search query\" [--days N] [--chat JID] [--limit N]" >&2
  exit 1
fi

echo "🔍 Searching for: $QUERY" >&2

# Build search command
SEARCH_CMD="$WACLI messages search --json --limit $LIMIT"
if [ -n "$CHAT" ]; then
  SEARCH_CMD="$SEARCH_CMD --chat $CHAT"
fi
if [ "$DAYS" -gt 0 ]; then
  AFTER_DATE=$(date -d "$DAYS days ago" +%Y-%m-%d 2>/dev/null || date -v-${DAYS}d +%Y-%m-%d)
  SEARCH_CMD="$SEARCH_CMD --after $AFTER_DATE"
fi
SEARCH_CMD="$SEARCH_CMD \"$QUERY\""

# Execute search
RESULTS=$(eval "$SEARCH_CMD" 2>/dev/null || echo "[]")
RESULT_COUNT=$(echo "$RESULTS" | jq 'length')

if [ "$RESULT_COUNT" -eq 0 ]; then
  echo "No messages found matching \"$QUERY\"" >&2
  exit 0
fi

echo "✅ Found $RESULT_COUNT messages" >&2

# Format messages for LLM analysis
MESSAGES_TEXT=$(echo "$RESULTS" | jq -r '.[] | 
  "[\(.timestamp)] \(.sender_name // .sender): \(.text // "[media]")"' | head -100)

# Analyze with local LLM
echo "🤖 Analyzing with local LLM..." >&2

ANALYSIS=$("$LLM_SCRIPT" "Analyze these WhatsApp messages about \"$QUERY\":

$MESSAGES_TEXT

Provide a structured analysis:
1. **Key Topics**: Main themes discussed
2. **Action Items**: Tasks or requests mentioned
3. **People**: Key participants and their roles
4. **Timeline**: Important dates/times mentioned
5. **Sentiment**: Overall tone (positive/neutral/negative)
6. **Summary**: Brief 2-3 sentence overview

Be concise and factual." --max-tokens 800 2>/dev/null)

# Output results
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ANALYSIS: \"$QUERY\""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "$ANALYSIS"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Found $RESULT_COUNT messages"
echo ""
