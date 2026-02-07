#!/bin/bash
# Apply approved bindings to OpenClaw config
# Run with: bash config/apply-bindings.sh

set -e

CONFIG_FILE="$HOME/.openclaw/openclaw.json"
APPROVED_FILE="$(dirname "$0")/approved-bindings.json"

echo "🔧 Applying approved bindings..."

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required but not installed"
    exit 1
fi

# Read approved bindings
BINDINGS=$(jq -r '.approvedBindings[] | select(.status == "pending_apply")' "$APPROVED_FILE")

if [ -z "$BINDINGS" ]; then
    echo "✅ No pending bindings to apply"
    exit 0
fi

# Backup current config
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "📦 Backed up config"

# Process each pending binding
jq -r '.approvedBindings[] | select(.status == "pending_apply") | @json' "$APPROVED_FILE" | while read -r binding; do
    PHONE=$(echo "$binding" | jq -r '.phone')
    AGENT_ID=$(echo "$binding" | jq -r '.agentId')
    NAME=$(echo "$binding" | jq -r '.name')
    
    echo "➕ Adding binding: $NAME ($PHONE) → $AGENT_ID"
    
    # Add to allowFrom if not exists
    CURRENT_ALLOW=$(jq -r '.channels.whatsapp.allowFrom | join(",")' "$CONFIG_FILE")
    if [[ ! "$CURRENT_ALLOW" =~ "$PHONE" ]]; then
        jq --arg phone "$PHONE" '.channels.whatsapp.allowFrom += [$phone]' "$CONFIG_FILE" > "$CONFIG_FILE.tmp"
        mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
        echo "  ✅ Added to allowFrom"
    fi
    
    # Add binding
    NEW_BINDING=$(jq -n --arg agentId "$AGENT_ID" --arg phone "$PHONE" '{
        agentId: $agentId,
        match: {
            channel: "whatsapp",
            peer: {
                kind: "dm",
                id: $phone
            }
        }
    }')
    
    # Check if binding already exists
    EXISTS=$(jq --arg phone "$PHONE" '.bindings[] | select(.match.peer.id == $phone)' "$CONFIG_FILE")
    if [ -z "$EXISTS" ]; then
        jq --argjson binding "$NEW_BINDING" '.bindings += [$binding]' "$CONFIG_FILE" > "$CONFIG_FILE.tmp"
        mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
        echo "  ✅ Added binding"
    else
        echo "  ⚠️ Binding already exists"
    fi
done

# Update status in approved file
jq '.approvedBindings |= map(if .status == "pending_apply" then .status = "applied" else . end) | .lastUpdated = now | tostring' "$APPROVED_FILE" > "$APPROVED_FILE.tmp"
mv "$APPROVED_FILE.tmp" "$APPROVED_FILE"

echo ""
echo "✅ Done! Bindings applied."
echo "🔄 Restart OpenClaw to activate: openclaw gateway restart"
