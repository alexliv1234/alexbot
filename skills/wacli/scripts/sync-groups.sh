#!/bin/bash
# Sync WhatsApp groups from wacli to local storage

set -e

WACLI="$HOME/go/bin/wacli"
OUTPUT_FILE="$HOME/.openclaw/workspace/memory/whatsapp/groups.json"

mkdir -p "$(dirname "$OUTPUT_FILE")"

echo "Syncing WhatsApp groups..." >&2

# Get all group chats from wacli
"$WACLI" chats list --json 2>/dev/null | \
  jq '.data | [.[] | select(.Kind == "group") | {
    jid: .JID,
    name: .Name,
    last_message: .LastMessageTS,
    participant_count: (.ParticipantCount // null)
  }]' > "$OUTPUT_FILE"

GROUP_COUNT=$(jq 'length' "$OUTPUT_FILE")
echo "✅ Synced $GROUP_COUNT WhatsApp groups to $OUTPUT_FILE" >&2

echo "Group sync complete!" >&2
jq '.[0:5]' "$OUTPUT_FILE"
