#!/bin/bash
# Send intro message to investor via WhatsApp
# Usage: bash send-intro.sh <investor-id> [--dry-run]

set -e

INVESTOR_ID="$1"
DRY_RUN="${2}"

if [ -z "$INVESTOR_ID" ]; then
  echo "❌ Usage: bash send-intro.sh <investor-id> [--dry-run]"
  echo "   Example: bash send-intro.sh alon-lifshitz"
  echo "   Dry run: bash send-intro.sh alon-lifshitz --dry-run"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVESTOR_DIR="$SCRIPT_DIR/../investors/$INVESTOR_ID"
PROFILE_FILE="$INVESTOR_DIR/profile.json"
STRATEGY_FILE="$INVESTOR_DIR/strategy.md"
COMMS_FILE="$INVESTOR_DIR/communications.jsonl"

if [ ! -d "$INVESTOR_DIR" ]; then
  echo "❌ Investor not found: $INVESTOR_ID"
  exit 1
fi

if [ ! -f "$STRATEGY_FILE" ]; then
  echo "❌ Strategy not found. Run generate-strategy.sh first."
  exit 1
fi

# Read profile
NAME=$(jq -r '.name' "$PROFILE_FILE")
PHONE=$(jq -r '.phone' "$PROFILE_FILE")
STAGE=$(jq -r '.stage' "$PROFILE_FILE")

echo "📤 Preparing to send intro message"
echo ""
echo "👤 To: $NAME"
echo "📞 Phone: $PHONE"
echo "📊 Current Stage: $STAGE"
echo ""

# Check if already sent
if [ "$STAGE" = "outreach" ] || [ "$STAGE" = "responded" ] || [ "$STAGE" = "meeting" ]; then
  echo "⚠️  WARNING: Intro may have already been sent (stage: $STAGE)"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Extract intro message from strategy.md (Version A)
INTRO_MESSAGE=$(awk '/### Version A: Direct \(Recommended\)/,/```/{if (/```/) {if (p) exit; else p=1; next} if (p) print}' "$STRATEGY_FILE")

if [ -z "$INTRO_MESSAGE" ]; then
  echo "❌ Could not extract intro message from strategy file"
  echo "   Check: $STRATEGY_FILE"
  exit 1
fi

echo "💬 Message to send:"
echo "---"
echo "$INTRO_MESSAGE"
echo "---"
echo ""

if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "🧪 DRY RUN - Message NOT sent"
  echo ""
  echo "✅ Message validated successfully"
  echo "   Run without --dry-run to actually send"
  exit 0
fi

# Confirm before sending
echo "⚠️  READY TO SEND"
echo ""
read -p "Send this message to $NAME at $PHONE? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 1
fi

echo ""
echo "📨 Sending via WhatsApp..."

# Create send request for AlexBot
SEND_REQUEST="$INVESTOR_DIR/.send-request.txt"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > "$SEND_REQUEST" <<EOF
SEND REQUEST - INVESTOR INTRO

To: $NAME
Phone: $PHONE
Investor ID: $INVESTOR_ID
Type: intro_message
Timestamp: $NOW

MESSAGE:
$INTRO_MESSAGE

ACTION REQUIRED:
Use the 'message' tool to send this WhatsApp DM to $PHONE

After sending:
1. Log to: $COMMS_FILE
2. Update profile stage to 'outreach'
3. Add timeline entry
4. Set nextAction to "Wait 5-7 days for response"

SEND NOW.
EOF

echo "✅ Send request created: $SEND_REQUEST"
echo ""
echo "🤖 AlexBot will now:"
echo "   1. Send WhatsApp DM to $PHONE"
echo "   2. Log communication"
echo "   3. Update investor stage"
echo ""
echo "⏳ Status: SENDING IN PROGRESS"
echo ""
