#!/bin/bash
# Safe response wrapper with error handling

MESSAGE="$1"
ALEX_PHONE="+972544419002"
ERROR_RESPONSES="/home/alexliv/.openclaw/workspace/memory/error-responses.json"
LLM_SCRIPT="$(dirname "$0")/llm-query.sh"
JAILBREAK_SCRIPT="$(dirname "$0")/detect-jailbreak.sh"

# Function to get random error response
get_error_response() {
  if [ -f "$ERROR_RESPONSES" ]; then
    jq -r '.responses | .[('$RANDOM' % length)]' "$ERROR_RESPONSES"
  else
    echo "⚠️ שגיאה טכנית - אבל אני עדיין כאן!"
  fi
}

# Function to notify Alex
notify_alex() {
  local error_type="$1"
  local error_msg="$2"
  ~/go/bin/wacli send text --to "$ALEX_PHONE" --message "🤖 ⚠️ Error in group:
Type: $error_type
Message: $error_msg
Timestamp: $(date)" 2>/dev/null || true
}

# Check if this is a jailbreak attempt
JAILBREAK_CHECK=$("$JAILBREAK_SCRIPT" "$MESSAGE" 2>&1)
if [ $? -ne 0 ]; then
  # It's a jailbreak - use local LLM
  echo "🎯 זיהיתי ניסיון jailbreak ($JAILBREAK_CHECK). חמוד, אבל לא עובד."
  exit 0
fi

# Try Anthropic (would be called by OpenClaw normally)
# If we're here in this script, something failed

# Try local LLM
if curl -s --max-time 2 http://10.100.102.8:11434/api/tags > /dev/null 2>&1; then
  RESPONSE=$("$LLM_SCRIPT" "Generate a brief, cynical Hebrew response to this WhatsApp message: $MESSAGE" --max-tokens 100 2>&1)
  if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
    echo "$RESPONSE"
    notify_alex "FALLBACK_LOCAL_LLM" "Used local LLM after main API failed"
    exit 0
  fi
fi

# Both failed - use canned response
ERROR_RESPONSE=$(get_error_response)
echo "$ERROR_RESPONSE"
notify_alex "BOTH_APIS_FAILED" "Both Anthropic and local LLM failed"
exit 0
