#!/bin/bash
# Session Monitor - Check all sessions for token overflow
# Reads totalTokens from sessions.json (the actual source of truth)

set -e

WORKSPACE="$HOME/.openclaw/workspace"
SESSIONS_FILE="$HOME/.openclaw/agents/main/sessions/sessions.json"
MEMORY_DIR="$WORKSPACE/memory/session-dumps"

# Create memory dir if needed
mkdir -p "$MEMORY_DIR"

# Thresholds (in tokens)
THRESHOLD_NOTICE=50000     # 50k tokens - start monitoring
THRESHOLD_WARNING=100000   # 100k tokens - should consider cleanup
THRESHOLD_CRITICAL=150000  # 150k tokens - needs immediate attention

echo "📊 Session Monitor - $(date '+%Y-%m-%d %H:%M:%S')"
echo "   Reading from: $SESSIONS_FILE"
echo ""

# Check if sessions.json exists
if [[ ! -f "$SESSIONS_FILE" ]]; then
    echo "❌ sessions.json not found!"
    exit 1
fi

# Get session data
SESSIONS_DATA=$(jq -r 'to_entries[] | "\(.value.totalTokens // 0)|\(.key)"' "$SESSIONS_FILE" 2>/dev/null | sort -t'|' -k1 -rn)

if [[ -z "$SESSIONS_DATA" ]]; then
    echo "❌ Could not read sessions data"
    exit 1
fi

# Output for cron to process
CRITICAL_SESSIONS=""
WARNING_SESSIONS=""
NOTICE_SESSIONS=""

while IFS='|' read -r tokens session_key; do
    [[ -z "$tokens" ]] && continue
    
    # Determine session type for display
    if [[ "$session_key" == *":main" ]]; then
        session_type="MAIN"
    elif [[ "$session_key" == *":group:"* ]]; then
        session_type="GROUP"
    elif [[ "$session_key" == *":cron:"* ]]; then
        session_type="CRON"
    elif [[ "$session_key" == *":whatsapp:"* ]] || [[ "$session_key" == *":telegram:"* ]]; then
        session_type="DM"
    else
        session_type="OTHER"
    fi
    
    # Short display name
    short_name=$(echo "$session_key" | sed 's/agent:main://' | cut -c1-40)
    
    # Categorize by threshold
    if [[ $tokens -ge $THRESHOLD_CRITICAL ]]; then
        echo "🔴 CRITICAL: $short_name ($session_type) - ${tokens} tokens"
        CRITICAL_SESSIONS="$CRITICAL_SESSIONS$session_key|$tokens\n"
    elif [[ $tokens -ge $THRESHOLD_WARNING ]]; then
        echo "🟡 WARNING: $short_name ($session_type) - ${tokens} tokens"
        WARNING_SESSIONS="$WARNING_SESSIONS$session_key|$tokens\n"
    elif [[ $tokens -ge $THRESHOLD_NOTICE ]]; then
        echo "🟢 NOTICE: $short_name ($session_type) - ${tokens} tokens"
        NOTICE_SESSIONS="$NOTICE_SESSIONS$session_key|$tokens\n"
    fi
done <<< "$SESSIONS_DATA"

echo ""

# Summary counts (count non-empty lines)
critical_count=$(echo -e "$CRITICAL_SESSIONS" | grep -v '^$' | wc -l | tr -d ' ')
warning_count=$(echo -e "$WARNING_SESSIONS" | grep -v '^$' | wc -l | tr -d ' ')
notice_count=$(echo -e "$NOTICE_SESSIONS" | grep -v '^$' | wc -l | tr -d ' ')

echo "📋 Summary: $critical_count critical, $warning_count warning, $notice_count notice"

# Output critical sessions for cron job to act on
if [[ -n "$CRITICAL_SESSIONS" ]]; then
    echo ""
    echo "⚠️ ACTION NEEDED: Critical sessions require immediate attention!"
    echo -e "$CRITICAL_SESSIONS" | while IFS='|' read -r session_key tokens; do
        [[ -z "$session_key" ]] && continue
        echo "  → $session_key ($tokens tokens)"
    done
fi

# Exit with status code indicating severity
if [[ $critical_count -gt 0 ]]; then
    exit 2  # Critical
elif [[ $warning_count -gt 0 ]]; then
    exit 1  # Warning
else
    exit 0  # OK
fi
