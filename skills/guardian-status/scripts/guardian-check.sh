#!/bin/bash
set -e
export TZ="Asia/Jerusalem"

echo "=== HOOK STATUS ==="
CORE_FILE=$(ls /usr/lib/node_modules/openclaw/dist/reply-*.js 2>/dev/null | head -1)
if [ -z "$CORE_FILE" ]; then
  echo "CORE_FILE: NOT FOUND"
else
  BMP=$(grep -c 'runBeforeMessageProcessing' "$CORE_FILE" 2>/dev/null || echo 0)
  MS=$(grep -c 'runMessageSending' "$CORE_FILE" 2>/dev/null || echo 0)
  echo "before_message_processing: $([ "$BMP" -gt 0 ] && echo 'PATCHED' || echo 'MISSING')"
  echo "message_sending: $([ "$MS" -gt 0 ] && echo 'PATCHED' || echo 'MISSING')"
  echo "before_agent_start: NATIVE"
  echo "agent_error: NATIVE"
fi

echo ""
echo "=== PLUGIN STATUS ==="
export PATH="$HOME/.local/bin:$PATH"
openclaw plugins 2>/dev/null | grep -E 'group-guardian|prompt-protection|humor-errors' || echo "No matching plugins found"

echo ""
echo "=== STATE ==="
STATE_FILE="$HOME/.openclaw/data/group-guardian/state.json"
if [ -f "$STATE_FILE" ]; then
  echo "State file exists: $(stat -c%s "$STATE_FILE" 2>/dev/null || stat -f%z "$STATE_FILE" 2>/dev/null || echo 'unknown') bytes"
  if command -v jq &>/dev/null; then
    cat "$STATE_FILE" | jq '{
      totalUsers: (.heatScores | length),
      topHeat: [.heatScores | to_entries | sort_by(-.value.score) | .[:5][] | {user: .key, score: .value.score}],
      stats: .groupStats
    }' 2>/dev/null || echo "Failed to parse state with jq"
  else
    echo "jq not available, raw state:"
    cat "$STATE_FILE"
  fi
else
  echo "State file not found (plugin may not have started yet)"
fi

echo ""
echo "=== OPENCLAW VERSION ==="
openclaw --version 2>/dev/null || echo "Unknown"
