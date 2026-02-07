#!/bin/bash
# Check Google Drive for new call recordings and process them
# Called by cron every 15 minutes

set -e

SKILL_DIR="$(dirname "$(readlink -f "$0")")"
STATE_FILE="$SKILL_DIR/state.json"
RECORDINGS_DIR="$HOME/.openclaw/workspace/memory/call-recordings"
SUMMARIES_DIR="$HOME/.openclaw/workspace/memory/call-summaries"
DRIVE_FOLDER_ID="1qrY6VKGahgLQNC7sgMNq4Kiaz9cF8QUa"  # com.nll.cb folder

export GOG_KEYRING_PASSWORD="openclaw123"

# Initialize directories
mkdir -p "$RECORDINGS_DIR" "$SUMMARIES_DIR"

# Initialize state file if not exists
if [ ! -f "$STATE_FILE" ]; then
    echo '{"processedFiles": [], "lastCheck": null}' > "$STATE_FILE"
fi

echo "=== Checking for new call recordings $(date -Iseconds) ==="

# List files in Google Drive call recorder folder
DRIVE_OUTPUT=$(gog drive ls --account alexliv@gmail.com --parent "$DRIVE_FOLDER_ID" --json 2>/dev/null || echo '{"files":[]}')

# Get list of already processed file IDs
PROCESSED_IDS=$(jq -r '.processedFiles[]' "$STATE_FILE" 2>/dev/null || echo "")

# Process each file
echo "$DRIVE_OUTPUT" | jq -c '.files[]' 2>/dev/null | while read -r file_json; do
    FILE_ID=$(echo "$file_json" | jq -r '.id')
    FILE_NAME=$(echo "$file_json" | jq -r '.name')
    
    # Skip if already processed
    if echo "$PROCESSED_IDS" | grep -q "$FILE_ID"; then
        continue
    fi
    
    # Skip non-audio files
    if [[ ! "$FILE_NAME" =~ \.(m4a|mp3|wav|ogg)$ ]]; then
        continue
    fi
    
    echo "NEW RECORDING: $FILE_NAME"
    echo "FILE_ID: $FILE_ID"
    
    # Download the file
    SAFE_NAME=$(echo "$FILE_NAME" | tr ' ' '_' | tr -cd '[:alnum:]._-')
    OUTPUT_FILE="$RECORDINGS_DIR/$SAFE_NAME"
    
    gog drive download "$FILE_ID" --account alexliv@gmail.com --out "$OUTPUT_FILE" 2>/dev/null
    
    if [ -f "$OUTPUT_FILE" ]; then
        echo "Downloaded: $OUTPUT_FILE"
        
        # Output for cron job to process
        echo "PROCESS:$FILE_ID:$OUTPUT_FILE:$FILE_NAME"
        
        # Mark as processed
        jq --arg id "$FILE_ID" '.processedFiles += [$id]' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
    fi
done

# Update last check time
jq --arg time "$(date -Iseconds)" '.lastCheck = $time' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"

echo "=== Done ==="
