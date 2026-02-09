#!/bin/bash
# View conversation history with a specific person
# Usage: view-conversation.sh <phone_or_name>

if [ "$#" -ne 1 ]; then
  echo "Usage: view-conversation.sh <phone_or_name>"
  echo "Example: view-conversation.sh +972544419002"
  echo "         view-conversation.sh 972544419002"
  exit 1
fi

SEARCH="$1"
DIR="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-per-sender"

# Try to find by phone number (normalized)
SAFE_PHONE=$(echo "$SEARCH" | sed 's/[^0-9]//g')
TARGET_DIR="$DIR/$SAFE_PHONE"

if [ -d "$TARGET_DIR" ]; then
  echo "📁 Found conversation with $(jq -r '.name' "$TARGET_DIR/metadata.json")"
  echo "📞 Phone: $(jq -r '.phone' "$TARGET_DIR/metadata.json")"
  echo "📅 First: $(jq -r '.created' "$TARGET_DIR/metadata.json")"
  echo "📅 Last: $(jq -r '.lastActive' "$TARGET_DIR/metadata.json")"
  echo ""
  echo "💬 Messages:"
  jq -r '"[\(.date) \(.ts)] \(.senderName): \(.originalMsg)\n           🤖 → \(.myReply)\n"' "$TARGET_DIR/conversation.jsonl"
else
  echo "❌ No conversation found for: $SEARCH"
  echo ""
  echo "Available conversations:"
  for d in "$DIR"/*/; do
    if [ -f "$d/metadata.json" ]; then
      PHONE=$(jq -r '.phone' "$d/metadata.json")
      NAME=$(jq -r '.name' "$d/metadata.json")
      LAST=$(jq -r '.lastActive' "$d/metadata.json")
      echo "  📞 $PHONE ($NAME) - last: $LAST"
    fi
  done
fi
