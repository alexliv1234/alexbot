#!/bin/bash
# Fix the "משחקים עם אלכס הבוט" group session when it breaks
# Common issue: deliveryContext loses 'to' and 'accountId' fields

SESSIONS_FILE="$HOME/.openclaw/agents/main/sessions/sessions.json"
GROUP_KEY="agent:main:whatsapp:group:120363405143589138@g.us"
GROUP_ID="120363405143589138@g.us"

echo "🔧 Checking playing group session..."

# Check current deliveryContext
CURRENT=$(jq -r ".\"$GROUP_KEY\".deliveryContext.to // \"MISSING\"" "$SESSIONS_FILE" 2>/dev/null)

if [ "$CURRENT" = "MISSING" ] || [ "$CURRENT" = "null" ]; then
    echo "❌ deliveryContext.to is missing - fixing..."
    
    # Fix the session
    jq --arg key "$GROUP_KEY" --arg gid "$GROUP_ID" '
        .[$key].deliveryContext = {
            "channel": "whatsapp",
            "to": $gid,
            "accountId": "default"
        } |
        .[$key].lastTo = $gid |
        .[$key].lastAccountId = "default"
    ' "$SESSIONS_FILE" > "${SESSIONS_FILE}.tmp" && mv "${SESSIONS_FILE}.tmp" "$SESSIONS_FILE"
    
    echo "✅ Fixed! deliveryContext now has proper routing info."
else
    echo "✅ Session looks OK (deliveryContext.to = $CURRENT)"
fi

# Also verify the session file exists
SESSION_ID=$(jq -r ".\"$GROUP_KEY\".sessionId // \"NONE\"" "$SESSIONS_FILE")
if [ "$SESSION_ID" != "NONE" ]; then
    SESSION_FILE="$HOME/.openclaw/agents/main/sessions/${SESSION_ID}.jsonl"
    if [ -f "$SESSION_FILE" ]; then
        echo "✅ Session file exists: $SESSION_FILE"
    else
        echo "⚠️ Session file missing - may need gateway restart"
    fi
fi
