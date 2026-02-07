# Call Recording Monitor Skill

Monitor Google Drive for new call recordings, transcribe them with Whisper, and send summaries.

## Setup

✅ **Complete:**
- ACR Phone app on Android syncing to Google Drive
- Drive folder: `com.nll.cb` (ID: `1qrY6VKGahgLQNC7sgMNq4Kiaz9cF8QUa`)
- faster-whisper installed at `~/whisper-venv`
- Wrapper script: `~/.local/bin/whisper-transcribe`
- Cron job running every 15 min

## How It Works

1. **Cron triggers** every 15 minutes
2. **Check Drive** for new recordings in `com.nll.cb` folder
3. **Download** new audio files to `memory/call-recordings/`
4. **Transcribe** with faster-whisper (small model, Hebrew)
5. **Summarize** and save to `memory/call-summaries/`
6. **Notify** Alex via WhatsApp with transcript

## Files

- `check-recordings.sh` - Drive sync and download
- `process-recording.py` - Transcription processor
- `state.json` - Tracks processed file IDs

## Manual Usage

```bash
# Transcribe any audio file
~/.local/bin/whisper-transcribe recording.m4a

# Run the check manually
./check-recordings.sh
```

## Storage

- **Audio:** `memory/call-recordings/`
- **Summaries:** `memory/call-summaries/`
