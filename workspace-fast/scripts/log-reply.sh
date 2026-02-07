#!/bin/bash
# Log bot reply VERBATIM to daily JSONL
# Usage: log-reply.sh "<channel>" "<chat_id>" "<sender_phone>" "<sender_name>" "<original_msg>" "<my_reply_full_text>"
# 
# For playing group shortcut:
#   log-reply.sh "<sender_phone>" "<sender_name>" "<original_msg>" "<my_reply_full_text>"

# Detect short form (4 args = playing group) vs full form (6 args)
if [ "$#" -eq 4 ]; then
  CHANNEL="whatsapp"
  CHAT_ID="120363405143589138@g.us"
  SENDER_PHONE="$1"
  SENDER_NAME="$2"
  ORIG_MSG="$3"
  MY_REPLY="$4"
elif [ "$#" -eq 6 ]; then
  CHANNEL="$1"
  CHAT_ID="$2"
  SENDER_PHONE="$3"
  SENDER_NAME="$4"
  ORIG_MSG="$5"
  MY_REPLY="$6"
else
  echo "Usage: log-reply.sh [channel chat_id] <phone> <name> <orig_msg> <reply>"
  exit 1
fi

DATE=$(date +%Y-%m-%d)
TS=$(TZ=Asia/Jerusalem date +%H:%M:%S)

# Determine log directory based on channel and chat
if [ "$CHAT_ID" = "120363405143589138@g.us" ]; then
  DIR="$HOME/.openclaw/workspace/memory/channels/playing-with-alexbot-daily"
else
  # General log: memory/replies/YYYY-MM-DD.jsonl
  DIR="$HOME/.openclaw/workspace/memory/replies"
fi

FILE="$DIR/$DATE.jsonl"
mkdir -p "$DIR"

# Log FULL reply verbatim - no truncation, no summarization
jq -nc \
  --arg ts "$TS" \
  --arg from "AlexLivBot" \
  --arg phone "bot" \
  --arg msg "$MY_REPLY" \
  --arg replyTo "$SENDER_NAME" \
  --arg replyToPhone "$SENDER_PHONE" \
  --arg origMsg "$ORIG_MSG" \
  --arg channel "$CHANNEL" \
  --arg chatId "$CHAT_ID" \
  '{ts:$ts,from:$from,phone:$phone,msg:$msg,replyTo:$replyTo,replyToPhone:$replyToPhone,origMsg:$origMsg,channel:$channel,chatId:$chatId}' >> "$FILE"

echo "✅ Reply logged to $FILE"
