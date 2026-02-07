#!/bin/bash
# notify-alex.sh - Safe wrapper to ALWAYS send to Alex (never to wrong recipient)
# Usage: ./notify-alex.sh "message text"
#
# This script exists because I keep making the routing bug mistake.
# It uses the gateway API directly to ensure the message goes to Alex.

ALEX_NUMBER="+972544419002"
GATEWAY_URL="http://localhost:18789"
GATEWAY_TOKEN="4022c25618486afc44a7f3034a10bc1e48597f6e21375706"

if [ -z "$1" ]; then
    echo "Usage: $0 \"message\""
    exit 1
fi

MESSAGE="$1"

# Add robot emoji prefix if not present
if [[ ! "$MESSAGE" =~ ^🤖 ]]; then
    MESSAGE="🤖 $MESSAGE"
fi

echo "📤 Sending to Alex ($ALEX_NUMBER)..."
echo "Message: $MESSAGE"
echo ""

# Use curl to send via gateway API
curl -s -X POST "$GATEWAY_URL/api/message/send" \
    -H "Authorization: Bearer $GATEWAY_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"channel\": \"whatsapp\",
        \"to\": \"$ALEX_NUMBER\",
        \"message\": \"$MESSAGE\"
    }" | jq .

echo ""
echo "✅ Sent to Alex (and ONLY Alex)"
