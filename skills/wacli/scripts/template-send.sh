#!/bin/bash
# Send WhatsApp message using template

set -e

WACLI="$HOME/go/bin/wacli"
TEMPLATE_DIR="$(dirname "$0")/../templates"

TEMPLATE=""
TO=""
VARS="{}"

while [[ $# -gt 0 ]]; do
  case $1 in
    --template)
      TEMPLATE="$2"
      shift 2
      ;;
    --to)
      TO="$2"
      shift 2
      ;;
    --vars)
      VARS="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

if [ -z "$TEMPLATE" ] || [ -z "$TO" ]; then
  echo "Usage: $0 --template <name> --to <jid|phone> [--vars '{\"key\":\"val\"}']" >&2
  exit 1
fi

TEMPLATE_FILE="$TEMPLATE_DIR/${TEMPLATE}.txt"
if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "Error: Template not found: $TEMPLATE_FILE" >&2
  exit 1
fi

MESSAGE=$(cat "$TEMPLATE_FILE")

# Simple variable replacement
echo "$VARS" | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' | while IFS='=' read -r key value; do
  MESSAGE="${MESSAGE//\{\{$key\}\}/$value}"
done

echo "📤 Sending template '$TEMPLATE' to $TO" >&2
"$WACLI" send text --to "$TO" --message "$MESSAGE"
echo "✅ Sent" >&2
