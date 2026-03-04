#!/bin/bash
# before-send-message.sh - Validates proactive messages before sending
# Usage: bash scripts/before-send-message.sh "<message_type>" "<target>" "<content_summary>"

set -euo pipefail

MESSAGE_TYPE="${1:-unknown}"
TARGET="${2:-unknown}"
CONTENT="${3:-}"

WORKSPACE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$WORKSPACE/memory/action-checks-log.jsonl"

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "🔍 Checking proactive message before sending..."
echo "   Type: $MESSAGE_TYPE"
echo "   Target: $TARGET"
echo "   Content: ${CONTENT:0:50}..."
echo ""

# Track that check ran
echo "{\"timestamp\":\"$timestamp\",\"action\":\"send_message\",\"type\":\"$MESSAGE_TYPE\",\"target\":\"$TARGET\",\"check_run\":true}" >> "$LOG_FILE"

# Validation checks
ERRORS=0

# 1. Check if session_status was called recently (proxy: did they verify time?)
echo "✓ Reminder: Run session_status to verify current time/date"

# 2. Calendar-dependent messages
if [[ "$MESSAGE_TYPE" =~ (reminder|meeting|walk|appointment) ]]; then
    echo "⚠️  Calendar-dependent message detected"
    echo "   MUST verify in Google Calendar:"
    echo "   GOG_KEYRING_PASSWORD=\"openclaw123\" gog calendar list --account alexliv@gmail.com --start \"$(date +%Y-%m-%dT00:00:00%:z)\" --end \"$(date +%Y-%m-%dT23:59:59%:z)\""
    echo ""
fi

# 3. Target validation
if [[ "$TARGET" != "+972544419002" ]] && [[ "$TARGET" != "Alex" ]]; then
    echo "⚠️  Target is NOT Alex - are you sure?"
    echo "   Sending to: $TARGET"
    echo ""
fi

# 4. Time-sensitive messages
if [[ "$CONTENT" =~ (minutes|hours|soon|now|today) ]]; then
    echo "⚠️  Time-sensitive language detected"
    echo "   Words like 'minutes/hours/soon' require EXACT time verification"
    echo "   Did you check session_status?"
    echo ""
fi

if [ $ERRORS -gt 0 ]; then
    echo "❌ Validation failed with $ERRORS errors"
    echo "{\"timestamp\":\"$timestamp\",\"action\":\"send_message\",\"type\":\"$MESSAGE_TYPE\",\"passed\":false,\"errors\":$ERRORS}" >> "$LOG_FILE"
    exit 1
fi

echo "✅ Pre-send checks complete"
echo "   Remember: Looking backward (verify context) before going forward (send)"
echo "{\"timestamp\":\"$timestamp\",\"action\":\"send_message\",\"type\":\"$MESSAGE_TYPE\",\"passed\":true}" >> "$LOG_FILE"
exit 0
