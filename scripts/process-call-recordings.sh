#!/bin/bash
# Process call recordings: download → transcribe → analyze
# Run as isolated agentTurn cron job

set -e

WORKSPACE="$HOME/.openclaw/workspace"
RECORDINGS_DIR="$WORKSPACE/memory/call-recordings"
TRANSCRIPTS_DIR="$WORKSPACE/memory/call-transcripts"
STATE_FILE="$WORKSPACE/skills/call-recorder/state.json"
WHISPER="$HOME/.local/bin/whisper-transcribe"
DRIVE_FOLDER_ID="1qrY6VKGahgLQNC7sgMNq4Kiaz9cF8QUa"

export GOG_KEYRING_PASSWORD="openclaw123"

mkdir -p "$RECORDINGS_DIR" "$TRANSCRIPTS_DIR"

# Initialize state if needed
[ ! -f "$STATE_FILE" ] && echo '{"processedFiles":[],"transcribed":[]}' > "$STATE_FILE"

echo "=== Call Recording Check $(date '+%Y-%m-%d %H:%M') ==="

# Step 1: Download new recordings from Drive
echo "Checking Drive for new recordings..."
DRIVE_OUTPUT=$(gog drive ls --account alexliv@gmail.com --parent "$DRIVE_FOLDER_ID" --json 2>/dev/null || echo '{"files":[]}')
PROCESSED_IDS=$(jq -r '.processedFiles[]' "$STATE_FILE" 2>/dev/null || echo "")

NEW_DOWNLOADS=0
echo "$DRIVE_OUTPUT" | jq -c '.files[]' 2>/dev/null | while read -r file_json; do
    FILE_ID=$(echo "$file_json" | jq -r '.id')
    FILE_NAME=$(echo "$file_json" | jq -r '.name')
    
    echo "$PROCESSED_IDS" | grep -q "$FILE_ID" && continue
    [[ ! "$FILE_NAME" =~ \.(m4a|mp3|wav|ogg)$ ]] && continue
    
    SAFE_NAME=$(echo "$FILE_NAME" | tr ' ' '_' | tr -cd '[:alnum:]._-')
    OUTPUT_FILE="$RECORDINGS_DIR/$SAFE_NAME"
    
    echo "Downloading: $FILE_NAME"
    gog drive download "$FILE_ID" --account alexliv@gmail.com --out "$OUTPUT_FILE" 2>/dev/null
    
    if [ -f "$OUTPUT_FILE" ]; then
        jq --arg id "$FILE_ID" '.processedFiles += [$id]' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
        NEW_DOWNLOADS=$((NEW_DOWNLOADS + 1))
    fi
done

# Step 2: Find recordings that need transcription
echo ""
echo "Checking for untranscribed recordings..."

TRANSCRIBED=$(jq -r '.transcribed[]' "$STATE_FILE" 2>/dev/null || echo "")
NEED_TRANSCRIPTION=()

for recording in "$RECORDINGS_DIR"/*.m4a; do
    [ -f "$recording" ] || continue
    basename_rec=$(basename "$recording")
    
    # Skip if already in transcribed list
    if echo "$TRANSCRIBED" | grep -qF "$basename_rec"; then
        continue
    fi
    
    # Skip test/junk files
    [[ "$basename_rec" == "voicemail_test"* ]] && continue
    
    NEED_TRANSCRIPTION+=("$recording")
done

echo "Found ${#NEED_TRANSCRIPTION[@]} recordings needing transcription"

# Output for agent to process
if [ ${#NEED_TRANSCRIPTION[@]} -gt 0 ]; then
    echo ""
    echo "=== NEEDS_TRANSCRIPTION ==="
    for rec in "${NEED_TRANSCRIPTION[@]}"; do
        basename_rec=$(basename "$rec")
        # Extract contact and date info
        contact=$(echo "$basename_rec" | sed 's/_[0-9]\{10,\}_.*//; s/__*/_/g; s/^_//; s/_$//')
        date_str=$(echo "$basename_rec" | grep -oP '\d{4}-\d{2}-\d{2}' | head -1)
        time_str=$(echo "$basename_rec" | grep -oP '\d{2}-\d{2}-\d{2}' | head -1)
        direction=$(echo "$basename_rec" | grep -oP '(Incoming|Outgoing)' | head -1)
        
        echo "FILE:$rec"
        echo "  Contact: $contact"
        echo "  Date: $date_str"
        echo "  Time: $time_str"
        echo "  Direction: $direction"
    done
    echo "=== END NEEDS_TRANSCRIPTION ==="
fi

echo ""
echo "Done."
