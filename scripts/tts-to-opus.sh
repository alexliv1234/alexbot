#!/bin/bash
# Convert TTS MP3 to Opus format for WhatsApp compatibility
# Usage: tts-to-opus.sh <input.mp3> [output.ogg]

INPUT="$1"
OUTPUT="${2:-${INPUT%.mp3}.ogg}"

if [ -z "$INPUT" ]; then
    echo "Usage: tts-to-opus.sh <input.mp3> [output.ogg]"
    exit 1
fi

ffmpeg -i "$INPUT" -c:a libopus -b:a 64k "$OUTPUT" -y 2>/dev/null
echo "$OUTPUT"
