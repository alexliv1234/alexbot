#!/bin/bash
# Analyze WhatsApp group activity and participation

set -e

WACLI="$HOME/go/bin/wacli"
RESOLVE_SCRIPT="$(dirname "$0")/resolve-contact.sh"

GROUP_JID="$1"

if [ -z "$GROUP_JID" ]; then
  echo "Usage: $0 <group-jid>" >&2
  exit 1
fi

# Get group info
GROUP_INFO=$("$RESOLVE_SCRIPT" "$GROUP_JID" 2>/dev/null)
GROUP_NAME=$(echo "$GROUP_INFO" | jq -r '.name // .jid')

echo "👥 Group Insights: $GROUP_NAME" >&2
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Group: $GROUP_NAME"
echo "JID: $GROUP_JID"
echo ""
echo "⚠️  Full participation analytics coming soon!"
echo "    For now, use 'wacli messages search --chat $GROUP_JID' to explore messages."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
