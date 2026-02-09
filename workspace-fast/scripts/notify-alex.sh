#!/bin/bash
# Safe wrapper to send messages ONLY to Alex
# Usage: bash scripts/notify-alex.sh "message text"

ALEX_PHONE="+972544419002"
MESSAGE="$1"

if [ -z "$MESSAGE" ]; then
  echo "Error: No message provided"
  exit 1
fi

# Use wacli to send to Alex's phone
wacli send "$ALEX_PHONE" "$MESSAGE"
