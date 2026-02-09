#!/bin/bash
# Log bot reply per sender - creates a separate file for each person
# Usage: log-reply-per-sender.sh "<sender_phone>" "<sender_name>" "<original_msg>" "<my_reply>"

if [ "$#" -ne 4 ]; then
  echo "Usage: log-reply-per-sender.sh <phone> <name> <orig_msg> <reply>"
  exit 1
fi

SENDER_PHONE="$1"
SENDER_NAME="$2"
ORIG_MSG="$3"
MY_REPLY="$4"

DATE=$(date +%Y-%m-%d)
TS=$(TZ=Asia/Jerusalem date +%H:%M:%S)

# Normalize phone to safe filename (remove + and @)
SAFE_PHONE=$(echo "$SENDER_PHONE" | sed 's/[^0-9]//g')

# Per-sender directory
DIR="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-per-sender/$SAFE_PHONE"
FILE="$DIR/conversation.jsonl"
mkdir -p "$DIR"

# Create metadata file if doesn't exist
META_FILE="$DIR/metadata.json"
if [ ! -f "$META_FILE" ]; then
  jq -nc \
    --arg phone "$SENDER_PHONE" \
    --arg name "$SENDER_NAME" \
    --arg created "$DATE $TS" \
    '{phone:$phone,name:$name,created:$created,lastActive:$created}' > "$META_FILE"
else
  # Update last active
  jq --arg lastActive "$DATE $TS" '.lastActive = $lastActive' "$META_FILE" > "$META_FILE.tmp" && mv "$META_FILE.tmp" "$META_FILE"
fi

# Log the exchange - both original message and my reply
jq -nc \
  --arg date "$DATE" \
  --arg ts "$TS" \
  --arg senderPhone "$SENDER_PHONE" \
  --arg senderName "$SENDER_NAME" \
  --arg originalMsg "$ORIG_MSG" \
  --arg myReply "$MY_REPLY" \
  '{date:$date,ts:$ts,senderPhone:$senderPhone,senderName:$senderName,originalMsg:$originalMsg,myReply:$myReply}' >> "$FILE"

echo "✅ Logged to $FILE"
