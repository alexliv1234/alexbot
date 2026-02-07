#!/bin/bash
# Archive a WhatsApp conversation

set -e

WACLI="$HOME/go/bin/wacli"
JID="$1"
FORMAT="markdown"

if [ -z "$JID" ]; then
  echo "Usage: $0 <jid|phone> [--format markdown|json]" >&2
  exit 1
fi

# Normalize JID
if [[ "$JID" =~ ^\+?[0-9]+$ ]]; then
  JID="${JID#+}@s.whatsapp.net"
fi

ARCHIVE_DIR="$HOME/.openclaw/workspace/memory/whatsapp/archives/$(date +%Y-%m-%d)"
mkdir -p "$ARCHIVE_DIR"

FILENAME=$(echo "$JID" | tr '@' '_' | tr '.' '_')
OUTPUT_FILE="$ARCHIVE_DIR/${FILENAME}.${FORMAT}"

echo "📦 Archiving chat: $JID" >&2
echo "   Output: $OUTPUT_FILE" >&2

# Fetch all available messages
MESSAGES=$("$WACLI" messages search "" --chat "$JID" --limit 1000 --json 2>/dev/null || echo "[]")
MSG_COUNT=$(echo "$MESSAGES" | jq 'length')

if [ "$FORMAT" == "json" ]; then
  echo "$MESSAGES" > "$OUTPUT_FILE"
else
  # Convert to markdown
  {
    echo "# WhatsApp Archive: $JID"
    echo ""
    echo "Archived: $(date)"
    echo "Messages: $MSG_COUNT"
    echo ""
    echo "---"
    echo ""
    echo "$MESSAGES" | jq -r '.[] |
      "**[\(.timestamp)]** \(.sender_name // "You"):\n\(.text // "[media: \(.media_type // "unknown")]")\n"'
  } > "$OUTPUT_FILE"
fi

echo "✅ Archived $MSG_COUNT messages to $OUTPUT_FILE" >&2
