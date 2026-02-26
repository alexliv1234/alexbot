#!/bin/bash
# Log communication with investor
# Usage: bash log-communication.sh <investor-id> <direction> "<message>"
# Direction: outbound | inbound

set -e

INVESTOR_ID="$1"
DIRECTION="$2"
MESSAGE="$3"

if [ -z "$INVESTOR_ID" ] || [ -z "$DIRECTION" ] || [ -z "$MESSAGE" ]; then
  echo "❌ Usage: bash log-communication.sh <investor-id> <direction> \"<message>\""
  echo "   Direction: outbound | inbound"
  echo "   Example: bash log-communication.sh alon-lifshitz outbound \"Hey, checking in...\""
  exit 1
fi

if [ "$DIRECTION" != "outbound" ] && [ "$DIRECTION" != "inbound" ]; then
  echo "❌ Direction must be 'outbound' or 'inbound'"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVESTOR_DIR="$SCRIPT_DIR/../investors/$INVESTOR_ID"
PROFILE_FILE="$INVESTOR_DIR/profile.json"
COMMS_FILE="$INVESTOR_DIR/communications.jsonl"

if [ ! -d "$INVESTOR_DIR" ]; then
  echo "❌ Investor not found: $INVESTOR_ID"
  exit 1
fi

NAME=$(jq -r '.name' "$PROFILE_FILE")
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
NOW_READABLE=$(date +"%Y-%m-%d %H:%M:%S %Z")

echo "📝 Logging communication with: $NAME"
echo "   Direction: $DIRECTION"
echo "   Time: $NOW_READABLE"
echo ""

# Escape message for JSON
MESSAGE_ESCAPED=$(echo "$MESSAGE" | jq -Rs .)

# Create JSONL entry
cat >> "$COMMS_FILE" <<EOF
{"timestamp":"$NOW","direction":"$direction","message":$MESSAGE_ESCAPED,"channel":"whatsapp"}
EOF

echo "✅ Communication logged to: $COMMS_FILE"

# Update profile lastContact
jq --arg now "$NOW" '.lastContact = $now | .lastUpdated = $now' "$PROFILE_FILE" > "$PROFILE_FILE.tmp"
mv "$PROFILE_FILE.tmp" "$PROFILE_FILE"

echo "✅ Profile updated: lastContact = $NOW"
echo ""
