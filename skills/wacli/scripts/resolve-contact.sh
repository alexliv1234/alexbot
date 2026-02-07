#!/bin/bash
# Resolve WhatsApp JID to contact information

set -e

WACLI="$HOME/go/bin/wacli"
CACHE_FILE="$HOME/.openclaw/workspace/memory/whatsapp/contact-cache.json"
GOOGLE_CONTACTS="$HOME/.openclaw/workspace/memory/whatsapp/google_contacts.json"

mkdir -p "$(dirname "$CACHE_FILE")"

# Initialize cache if doesn't exist
if [ ! -f "$CACHE_FILE" ]; then
  echo '{}' > "$CACHE_FILE"
fi

JID="$1"
if [ -z "$JID" ]; then
  echo "Usage: $0 <jid>" >&2
  exit 1
fi

# Normalize JID (add @s.whatsapp.net if just a number)
if [[ "$JID" =~ ^\+?[0-9]+$ ]]; then
  # Strip + and add @s.whatsapp.net
  JID="${JID#+}"
  JID="${JID}@s.whatsapp.net"
fi

# Check cache first
CACHED=$(jq -r --arg jid "$JID" '.[$jid] // empty' "$CACHE_FILE")
if [ -n "$CACHED" ]; then
  echo "$CACHED"
  exit 0
fi

# Look up in wacli
CONTACT_INFO=$("$WACLI" chats list --json 2>/dev/null | \
  jq --arg jid "$JID" '.[] | select(.jid == $jid) | {
    jid: .jid,
    name: .name,
    kind: .kind,
    source: "wacli"
  }' || echo "{}")

# If found in wacli, cache and return
if [ "$CONTACT_INFO" != "{}" ]; then
  jq --arg jid "$JID" --argjson info "$CONTACT_INFO" \
    '.[$jid] = $info' "$CACHE_FILE" > "${CACHE_FILE}.tmp"
  mv "${CACHE_FILE}.tmp" "$CACHE_FILE"
  echo "$CONTACT_INFO"
  exit 0
fi

# Try Google Contacts if available
if [ -f "$GOOGLE_CONTACTS" ]; then
  # Extract phone number from JID (remove @s.whatsapp.net)
  PHONE="${JID%@*}"
  PHONE="+${PHONE}"
  
  GOOGLE_INFO=$(jq --arg phone "$PHONE" \
    '[.[] | select(.phones[]? | .value == $phone)] | first | {
      jid: $ARGS.named.jid,
      name: .name,
      phone: $phone,
      email: (.emails[0].value // null),
      organization: (.organizations[0].name // null),
      source: "google"
    }' --arg jid "$JID" "$GOOGLE_CONTACTS" 2>/dev/null || echo "{}")
  
  if [ "$GOOGLE_INFO" != "{}" ]; then
    jq --arg jid "$JID" --argjson info "$GOOGLE_INFO" \
      '.[$jid] = $info' "$CACHE_FILE" > "${CACHE_FILE}.tmp"
    mv "${CACHE_FILE}.tmp" "$CACHE_FILE"
    echo "$GOOGLE_INFO"
    exit 0
  fi
fi

# Not found - return minimal info
UNKNOWN=$(jq -n --arg jid "$JID" '{
  jid: $jid,
  name: $jid,
  source: "unknown"
}')
echo "$UNKNOWN"
