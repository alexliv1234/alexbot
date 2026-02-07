#!/bin/bash
# Sync WhatsApp contacts from wacli to local storage

set -e

WACLI="$HOME/go/bin/wacli"
OUTPUT_FILE="$HOME/.openclaw/workspace/memory/whatsapp/contacts.json"
GOOGLE_CONTACTS="$HOME/.openclaw/workspace/memory/whatsapp/google_contacts.json"

mkdir -p "$(dirname "$OUTPUT_FILE")"

echo "Syncing WhatsApp contacts..." >&2

# Get all DM chats from wacli
"$WACLI" chats list --json 2>/dev/null | \
  jq '.data | [.[] | select(.Kind == "dm") | {
    jid: .JID,
    phone: (.JID | split("@")[0]),
    name: .Name,
    last_message: .LastMessageTS
  }]' > "$OUTPUT_FILE"

CONTACT_COUNT=$(jq 'length' "$OUTPUT_FILE")
echo "✅ Synced $CONTACT_COUNT WhatsApp contacts to $OUTPUT_FILE" >&2

# Merge with Google Contacts if available
if [ -f "$GOOGLE_CONTACTS" ]; then
  echo "Merging with Google Contacts..." >&2
  
  jq --slurpfile google "$GOOGLE_CONTACTS" '
    . as $wa |
    $google[0] as $g |
    $wa | map(. as $contact |
      ($g[] | select(.phones[]? | .value == ("+"+$contact.phone))) as $gcontact |
      if $gcontact then
        $contact + {
          email: ($gcontact.emails[0].value // null),
          organization: ($gcontact.organizations[0].name // null),
          google_id: $gcontact.id
        }
      else
        $contact
      end
    )
  ' "$OUTPUT_FILE" > "${OUTPUT_FILE}.tmp"
  
  mv "${OUTPUT_FILE}.tmp" "$OUTPUT_FILE"
  echo "✅ Merged with Google Contacts" >&2
fi

echo "Contact sync complete!" >&2
jq '.[0:5]' "$OUTPUT_FILE"
