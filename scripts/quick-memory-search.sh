#!/bin/bash
# Quick Memory Search - Search across all memory files for keywords
# Usage: ./quick-memory-search.sh "keyword"

if [ -z "$1" ]; then
    echo "Usage: $0 'search term'"
    echo "Example: $0 'Shir'"
    exit 1
fi

SEARCH_TERM="$1"
MEMORY_DIR="/home/alexliv/.openclaw/workspace/memory"

echo "🔍 Searching memory files for: '$SEARCH_TERM'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Search in main memory files
echo ""
echo "📝 Main Memory Files:"
grep -i -n -C 2 "$SEARCH_TERM" "$MEMORY_DIR"/*.md 2>/dev/null | head -50

# Search in channels
echo ""
echo "💬 Channel Memory:"
grep -i -n -C 1 "$SEARCH_TERM" "$MEMORY_DIR"/channels/*.md 2>/dev/null | head -30

# Search in people profiles (if accessible)
echo ""
echo "👤 People Profiles:"
grep -i -n -C 1 "$SEARCH_TERM" "$MEMORY_DIR"/.private/people/*.md 2>/dev/null | head -20

# Search in bot conversations
echo ""
echo "🤖 Bot Conversations:"
grep -i "$SEARCH_TERM" "$MEMORY_DIR"/bot-conversations/*/*.jsonl 2>/dev/null | head -10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Search complete"
