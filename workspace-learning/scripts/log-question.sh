#!/bin/bash
# log-question.sh - Log learning group questions and answers
# Usage: bash scripts/log-question.sh "<sender_phone>" "<sender_name>" "<question>" "<answer>"

SENDER_PHONE="$1"
SENDER_NAME="$2"
QUESTION="$3"
ANSWER="$4"

export TZ=Asia/Jerusalem
TODAY=$(date +%Y-%m-%d)
TIMESTAMP=$(date -Iseconds)

LOG_DIR="$HOME/.openclaw/workspace/memory/channels/learning-with-alexbot-daily"
LOG_FILE="$LOG_DIR/${TODAY}.jsonl"

mkdir -p "$LOG_DIR"

# Normalize phone format
if [[ "$SENDER_PHONE" =~ ^[0-9]+$ ]]; then
  SENDER_PHONE="+$SENDER_PHONE"
fi

# Create JSON entry
ENTRY=$(jq -n \
  --arg timestamp "$TIMESTAMP" \
  --arg from "$SENDER_PHONE" \
  --arg name "$SENDER_NAME" \
  --arg question "$QUESTION" \
  --arg answer "$ANSWER" \
  '{
    timestamp: $timestamp,
    from: $from,
    name: $name,
    question: $question,
    answer: $answer
  }')

# Append to daily log
echo "$ENTRY" >> "$LOG_FILE"

echo "✅ Logged question from $SENDER_NAME"
