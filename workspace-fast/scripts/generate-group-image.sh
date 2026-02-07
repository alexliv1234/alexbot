#!/bin/bash
# generate-group-image.sh - Generate an image for the playing group with random art style
# Usage: ./scripts/generate-group-image.sh --subject "description of scene" --context "morning|nightly|leaderboard|wakeup|weekly" [--aspect "16:9"]
# 
# Picks a random art style from art-styles.json, combines with the subject,
# generates via Nano Banana, and outputs the MEDIA: line for WhatsApp.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE="$HOME/.openclaw/workspace"
NANO_BANANA="$WORKSPACE/skills/nano-banana-antigravity/scripts/generate_whatsapp_hd.sh"
STYLES_FILE="$SCRIPT_DIR/art-styles.json"
STYLE_STATE="$WORKSPACE/memory/channels/playing-group-art-style-state.json"

# Parse args
SUBJECT=""
CONTEXT=""
ASPECT="16:9"

while [[ $# -gt 0 ]]; do
  case $1 in
    --subject|-s) SUBJECT="$2"; shift 2;;
    --context|-c) CONTEXT="$2"; shift 2;;
    --aspect|-a) ASPECT="$2"; shift 2;;
    *) shift;;
  esac
done

if [ -z "$SUBJECT" ]; then
  echo "ERROR: --subject is required" >&2
  exit 1
fi

# Initialize state file if needed
if [ ! -f "$STYLE_STATE" ]; then
  mkdir -p "$(dirname "$STYLE_STATE")"
  echo '{"last_style": "", "style_history": [], "total_generated": 0}' > "$STYLE_STATE"
fi

# Pick a random style, avoiding the last one used
LAST_STYLE=$(jq -r '.last_style // ""' "$STYLE_STATE" 2>/dev/null || echo "")
TOTAL_STYLES=$(jq '.styles | length' "$STYLES_FILE")

# Get random style index, retry if same as last
MAX_ATTEMPTS=5
for i in $(seq 1 $MAX_ATTEMPTS); do
  STYLE_IDX=$((RANDOM % TOTAL_STYLES))
  PICKED_ID=$(jq -r ".styles[$STYLE_IDX].id" "$STYLES_FILE")
  if [ "$PICKED_ID" != "$LAST_STYLE" ] || [ $TOTAL_STYLES -le 1 ]; then
    break
  fi
done

# Extract style details
STYLE_NAME=$(jq -r ".styles[$STYLE_IDX].name" "$STYLES_FILE")
STYLE_EMOJI=$(jq -r ".styles[$STYLE_IDX].emoji" "$STYLES_FILE")
STYLE_SUFFIX=$(jq -r ".styles[$STYLE_IDX].suffix" "$STYLES_FILE")
STYLE_ID=$(jq -r ".styles[$STYLE_IDX].id" "$STYLES_FILE")

# Compose full prompt: subject + style
FULL_PROMPT="${SUBJECT}. ${STYLE_SUFFIX}"

# Generate filename
TIMESTAMP=$(date +%Y-%m-%d-%H-%M-%S)
FILENAME="playing-group-${CONTEXT:-image}-${TIMESTAMP}.jpg"

echo "🎨 Style: ${STYLE_EMOJI} ${STYLE_NAME} (${STYLE_ID})" >&2
echo "📐 Aspect: ${ASPECT}" >&2
echo "🖼️ File: ${FILENAME}" >&2

# Generate the image
"$NANO_BANANA" \
  --prompt "$FULL_PROMPT" \
  --filename "$FILENAME" \
  --aspect-ratio "$ASPECT" \
  --resolution 4K

# Update state
TOTAL_GEN=$(jq '.total_generated' "$STYLE_STATE" 2>/dev/null || echo "0")
jq --arg style "$STYLE_ID" \
   --arg ctx "$CONTEXT" \
   --arg ts "$(date -Iseconds)" \
   '.last_style = $style | .total_generated += 1 | .style_history += [{"style": $style, "context": $ctx, "timestamp": $ts}] | .style_history = .style_history[-20:]' \
   "$STYLE_STATE" > /tmp/style_state_new.json && mv /tmp/style_state_new.json "$STYLE_STATE"

# Output style info for the agent to include in message
echo ""
echo "STYLE_USED: ${STYLE_EMOJI} ${STYLE_NAME}"
