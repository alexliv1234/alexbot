# 🔌 Integrations

Platform connections and external service patterns.

---

## WhatsApp Integration

### Configuration
```json
"channels": {
  "whatsapp": {
    "dmPolicy": "allowlist",
    "groupPolicy": "open",
    "allowFrom": ["+972..."],
    "groupAllowFrom": ["...@g.us"]
  }
}
```

### Policies

**DM Policies:**
- `allowlist`: Only allowed numbers
- `open`: Anyone can DM
- `pairing`: Requires pairing flow

**Group Policies:**
- `disabled`: No group messages
- `open`: All groups
- `allowlist`: Only specified groups

### Message Features
- Voice messages (with transcription)
- Media attachments
- Reactions
- Replies/quotes

### Limitations
- No markdown tables
- No inline buttons (unless enabled)
- Rate limiting applies

---

## Telegram Integration

### Configuration
```json
"channels": {
  "telegram": {
    "dmPolicy": "pairing",
    "botToken": "...",
    "groupPolicy": "disabled"
  }
}
```

### Features
- Rich markdown support
- Inline buttons
- Bot commands
- Stream mode for long responses

---

## Voice Integration

### Text-to-Speech (TTS)
```json
"tts": {
  "provider": "elevenlabs",
  "elevenlabs": {
    "voiceId": "...",
    "modelId": "eleven_v3",
    "languageCode": "he"
  }
}
```

### Speech-to-Text (Transcription)
```json
"audio": {
  "transcription": {
    "command": ["/path/to/whisper-transcribe"],
    "timeoutSeconds": 120
  }
}
```

### Voice Message Workflow
1. Receive audio → Transcribe → Process as text
2. Generate response → (optionally) TTS → Send

---

## Calendar Integration

### Pattern
Use Google Calendar via CLI (gog) or API:
1. Check upcoming events
2. Show availability (not details)
3. Respect privacy - titles and attendees stay private

### Common Use Cases
- Morning briefing with today's schedule
- Availability checks for scheduling
- Meeting reminders

---

## Email Integration

### Read Pattern
- Scan for important/unread
- Summarize key points
- Flag for owner attention

### Send Pattern
- Always draft first
- Owner approval before sending
- Log sent messages

---

## External APIs

### Pattern for API Calls
1. Check rate limits
2. Handle errors gracefully
3. Cache when appropriate
4. Don't expose credentials

### Common Integrations
- Weather APIs (free tiers)
- News/RSS feeds
- Media servers (Sonarr, Radarr, etc.)
- Search APIs (Brave, etc.)

---

## Media Server Pattern

### Components
- Request system (Jellyseerr)
- TV automation (Sonarr)
- Movie automation (Radarr)
- Indexer (Prowlarr)
- Download client (qBittorrent)
- Subtitles (Bazarr)
- Streaming (Jellyfin/Plex)

### Workflow
1. Request via Jellyseerr
2. Sonarr/Radarr picks up
3. Prowlarr finds sources
4. qBittorrent downloads
5. Auto-import to library
6. Bazarr fetches subtitles
7. Ready to watch

---

## Changelog

- 2026-02-08: Initial version
