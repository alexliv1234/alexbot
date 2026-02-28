#!/bin/bash
# Find WhatsApp group JID after bot is added

set -euo pipefail

echo "🔍 Finding WhatsApp groups..."
echo ""

# Use wacli to list groups
if [[ -x ~/go/bin/wacli ]]; then
    echo "Recent groups:"
    ~/go/bin/wacli chats list --limit 20 | grep "@g.us" | head -10
else
    echo "❌ wacli not found at ~/go/bin/wacli"
    echo ""
    echo "Alternative: Check OpenClaw sessions.json"
    grep -o '[0-9]\{15,\}@g\.us' ~/.openclaw/data/sessions.json 2>/dev/null | sort -u | tail -10 || echo "No groups found"
fi

echo ""
echo "💡 Look for a JID like: 120363XXXXXXXXX@g.us"
echo "   Copy it and update config.json"
