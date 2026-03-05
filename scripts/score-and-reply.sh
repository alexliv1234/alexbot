#!/bin/bash
# score-and-reply.sh - Prevents the "two messages" bug by design
# 
# THE PROBLEM:
# I keep sending TWO separate messages:
# 1. Response text
# 2. Score block (from exec output)
#
# THE SOLUTION:
# This script COMBINES them BEFORE returning, making it impossible to split.
#
# Usage:
#   bash scripts/score-and-reply.sh "<phone>" "<name>" "<summary>" <creativity> <challenge> <humor> <cleverness> <engagement> <broke> <hacked> "<reply_text>"
#
# Example:
#   bash scripts/score-and-reply.sh "+972551234567" "איתי" "ROT13 trick" 6 7 3 7 5 0 2 "חמוד! ניסיון יפה 😄"

set -e

# Validate arguments
if [ "$#" -ne 11 ]; then
    echo "❌ Usage: score-and-reply.sh <phone> <name> <summary> <creativity> <challenge> <humor> <cleverness> <engagement> <broke> <hacked> <reply_text>"
    exit 1
fi

PHONE="$1"
NAME="$2"
SUMMARY="$3"
CREATIVITY="$4"
CHALLENGE="$5"
HUMOR="$6"
CLEVERNESS="$7"
ENGAGEMENT="$8"
BROKE="$9"
HACKED="${10}"
REPLY_TEXT="${11}"

# Step 1: Run scoring script and CAPTURE output
SCORE_OUTPUT=$(node /home/alexliv/.openclaw/workspace/scripts/score-message.js \
    "$PHONE" "$NAME" "$SUMMARY" \
    "$CREATIVITY" "$CHALLENGE" "$HUMOR" "$CLEVERNESS" "$ENGAGEMENT" "$BROKE" "$HACKED" 2>&1)

# Step 2: Check if scoring succeeded
if [ $? -ne 0 ]; then
    echo "❌ Scoring failed:"
    echo "$SCORE_OUTPUT"
    exit 1
fi

# Step 3: Build combined message (CRITICAL: ONE message!)
COMBINED_MESSAGE="[[reply_to_current]]
🤖 **→ ${NAME}**

${REPLY_TEXT}

${SCORE_OUTPUT}"

# Step 4: Return the COMPLETE message
echo "$COMBINED_MESSAGE"

# Success indicator for logging
echo "" >&2
echo "✅ Combined message ready (response + score in ONE block)" >&2
