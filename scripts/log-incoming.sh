#!/bin/bash
# Log incoming message to daily JSONL
# Usage: log-incoming.sh "<phone>" "<name>" "<message>"

PHONE="$1"
NAME="$2"
MSG="$3"
CHAT_ID="${4:-120363405143589138@g.us}"

DATE=$(date +%Y-%m-%d)
TS=$(TZ=Asia/Jerusalem date +%H:%M:%S)

# Normalize phone to +972 format
normalize_phone() {
    local p="$1"
    p="${p//@*/}"  # Remove @s.whatsapp.net etc
    p="${p//[^0-9+]/}"  # Keep only digits and +
    
    if [[ "$p" == +972* ]]; then
        echo "$p"
    elif [[ "$p" == 972* ]]; then
        echo "+$p"
    elif [[ "$p" == 0* && ${#p} == 10 ]]; then
        echo "+972${p:1}"
    else
        echo "+$p"
    fi
}

NORM_PHONE=$(normalize_phone "$PHONE")

# Determine log directory
if [ "$CHAT_ID" = "120363405143589138@g.us" ]; then
    DIR="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-daily"
else
    DIR="$HOME/.openclaw/workspace/memory/incoming/$CHAT_ID"
fi

FILE="$DIR/$DATE.jsonl"
mkdir -p "$DIR"

# Log incoming message
jq -nc \
    --arg ts "$TS" \
    --arg phone "$NORM_PHONE" \
    --arg name "$NAME" \
    --arg msg "$MSG" \
    --arg type "incoming" \
    --arg chatId "$CHAT_ID" \
    '{ts:$ts,type:$type,phone:$phone,name:$name,msg:$msg,chatId:$chatId}' >> "$FILE"

echo "✅ Incoming logged: $NAME ($NORM_PHONE)"
