#!/bin/bash
# Send WhatsApp messages in batch with templating

set -e

WACLI="$HOME/go/bin/wacli"

MESSAGE_FILE="$1"
CONTACTS_FILE="$2"

if [ -z "$MESSAGE_FILE" ] || [ -z "$CONTACTS_FILE" ]; then
  echo "Usage: $0 <message.txt> <contacts.json>" >&2
  echo "" >&2
  echo "contacts.json format:" >&2
  echo '[{"jid": "972XX@s.whatsapp.net", "name": "Name", "vars": {"key": "val"}}]' >&2
  exit 1
fi

if [ ! -f "$MESSAGE_FILE" ]; then
  echo "Error: Message file not found: $MESSAGE_FILE" >&2
  exit 1
fi

if [ ! -f "$CONTACTS_FILE" ]; then
  echo "Error: Contacts file not found: $CONTACTS_FILE" >&2
  exit 1
fi

MESSAGE_TEMPLATE=$(cat "$MESSAGE_FILE")
CONTACTS=$(cat "$CONTACTS_FILE")
CONTACT_COUNT=$(echo "$CONTACTS" | jq 'length')

echo "📨 Batch send: $CONTACT_COUNT recipients" >&2
echo "" >&2
echo "⚠️  WARNING: This will send messages to $CONTACT_COUNT people!" >&2
echo "   Press Ctrl+C to cancel, or Enter to continue..." >&2
read

SENT=0
FAILED=0

echo "$CONTACTS" | jq -c '.[]' | while read -r contact; do
  JID=$(echo "$contact" | jq -r '.jid')
  NAME=$(echo "$contact" | jq -r '.name')
  
  # Simple template replacement (just {{name}} for now)
  MESSAGE="${MESSAGE_TEMPLATE//\{\{name\}\}/$NAME}"
  
  echo "Sending to $NAME ($JID)..." >&2
  
  if "$WACLI" send text --to "$JID" --message "$MESSAGE" 2>/dev/null; then
    ((SENT++)) || true
    echo "  ✅ Sent" >&2
  else
    ((FAILED++)) || true
    echo "  ❌ Failed" >&2
  fi
  
  # Rate limiting: 1 second between messages
  sleep 1
done

echo "" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "📊 Batch send complete" >&2
echo "   Sent: $SENT" >&2
echo "   Failed: $FAILED" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
