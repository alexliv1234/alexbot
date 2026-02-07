# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

---

## Media Server (Docker on Windows)

**Host IP:** 10.100.102.8
**Config path:** C:\Media\docker\media-server\

### Services & Ports

| Service | Port | Purpose |
|---------|------|---------|
| Jellyfin | 8096 | Media streaming (LG TV) |
| Jellyseerr | 5055 | Request movies/TV shows |
| Sonarr | 8989 | TV automation |
| Radarr | 7878 | Movie automation |
| Prowlarr | 9696 | Indexer manager |
| qBittorrent | 8080 | Torrent client |
| Bazarr | 6767 | Subtitles (Hebrew/English) |
| FlareSolverr | 8191 | CloudFlare bypass |

### Credentials

| Service | User | Pass |
|---------|------|------|
| qBittorrent | admin | Reystlin55! |
| Jellyfin | admin | admin123 |

### API Keys

```
Sonarr: 30ce9e1d7c4041e99e2cfc4492596df4
Radarr: cd20b18c1b8d466eadda2e6573a3c58f
Prowlarr: 23478ca64feb48c2b50a42e8335bf2c7
Bazarr: 4231febb9d0b8740f82104ecc6a96b63
Jellyseerr: dc520c2fc9454d3ba91b6fb77fff611d
```

### Workflow
1. Request via Jellyseerr → Sonarr/Radarr → Prowlarr → qBittorrent
2. Auto-import to /movies or /tv
3. Bazarr fetches Hebrew + English subs
4. Watch on LG TV via Jellyfin app

### Quick Commands
```bash
# Check all containers
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "jellyfin|sonarr|radarr|prowlarr|qbittorrent|bazarr|jellyseerr|flaresolverr"

# Restart all
cd /mnt/c/Media/docker/media-server && docker compose restart
```

---

## Google (gog CLI)

**Account:** alexliv@gmail.com
**Services:** Gmail, Calendar, Contacts
**Keyring password:** `GOG_KEYRING_PASSWORD=openclaw123`

### Quick Commands
```bash
# List calendars
GOG_KEYRING_PASSWORD="openclaw123" gog calendar list --account alexliv@gmail.com

# Search contacts
GOG_KEYRING_PASSWORD="openclaw123" gog contacts search --account alexliv@gmail.com "name"

# Check emails
GOG_KEYRING_PASSWORD="openclaw123" gog gmail list --account alexliv@gmail.com
```

### Synced Contacts
- 452 contacts synced to `memory/whatsapp/google_contacts.json`
- Auto-lookup for incoming WhatsApp numbers

---

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## Local LLM (Ollama on Windows)

**URL:** http://10.100.102.8:11434
**Models:** 
- qwen2.5:32b-instruct-q4_K_M (19GB) - PRIMARY, near-Claude quality
- llama3.2 (3.2B) - fast, simple tasks

**IMPORTANT:** Must start Ollama with Vulkan for AMD GPU:
```powershell
$env:OLLAMA_VULKAN = "1"
ollama serve
```

### Quick Commands
```bash
# List models
curl -s http://10.100.102.8:11434/api/tags | jq '.models[].name'

# Generate text
curl -s http://10.100.102.8:11434/api/generate \
  -d '{"model": "llama3.2", "prompt": "Your prompt here", "stream": false}' | jq -r '.response'

# Chat
curl -s http://10.100.102.8:11434/api/chat \
  -d '{"model": "llama3.2", "messages": [{"role": "user", "content": "Hello!"}], "stream": false}' | jq -r '.message.content'
```

### Pull More Models
```powershell
ollama pull qwen2.5:14b      # Smart, fits in 16GB
ollama pull deepseek-coder   # Great for coding
ollama pull llama3.3:70b-instruct-q4_K_M  # Big brain (needs offloading)
```

---

## Whisper (Speech-to-Text)

**Venv:** ~/whisper-venv (faster-whisper)
**Wrapper:** ~/.local/bin/whisper-transcribe
**Model:** small (CPU, int8)

### Quick Use
```bash
~/.local/bin/whisper-transcribe audio.m4a
```

Used by call-recorder skill for transcribing phone calls.

## ElevenLabs TTS

**API Key:** d58ad3d8ba4cbc77b08604b4200a3049d665f3534ee006ab23e9388f2dc5081d
**Alex's Cloned Voice ID:** RyfEksBPJGRNi2A3ijf5
**Female Voice ID (TTS default):** 2zMQ1OcIYk1HPrXHxDyE

### ⚠️ VOICE LANGUAGE RULE: ALWAYS HEBREW
- The voice sounds bad in English — **always write TTS text in Hebrew**
- Even when summarizing English content, translate to Hebrew first
- The ElevenLabs model is `eleven_v3` with `languageCode: "he"`

### ⚠️ WHATSAPP VOICE MESSAGE FORMAT: ALWAYS CONVERT TO OPUS
- TTS generates MP3 but WhatsApp voice messages work better with Opus/OGG
- **Always convert before sending:** `ffmpeg -i input.mp3 -c:a libopus -b:a 64k output.ogg -y`
- Script available: `scripts/tts-to-opus.sh`

### 🎤 DUAL VOICE SETUP (2026-02-05)
- **Replying to Alex** → "AlexBot Answering" voice: `2zMQ1OcIYk1HPrXHxDyE`
- **Replying to anyone else** → "Alex Clone" voice: `RyfEksBPJGRNi2A3ijf5` (DEFAULT in config)
- Config default is Alex Clone. When sending TTS directly to Alex, use the AlexBot Answering voice via API.

### Quick Commands
```bash
# List voices
curl -s -H "xi-api-key: $ELEVEN_API_KEY" https://api.elevenlabs.io/v1/voices | jq '.voices[] | {name, voice_id, labels}'

# Search shared voices (library)
curl -s -H "xi-api-key: $ELEVEN_API_KEY" "https://api.elevenlabs.io/v1/shared-voices?language=he&gender=female&page_size=20" | jq '.voices[] | {name, voice_id, accent, description}'

# Generate speech
curl -s -H "xi-api-key: $ELEVEN_API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"שלום","model_id":"eleven_multilingual_v2","voice_settings":{"stability":0.5,"similarity_boost":0.75}}' \
  "https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID" > output.mp3
```

---

## Git & Version Control

**Repository:** https://github.com/alexliv1234/alexbot (private)
**SSH Key:** ~/.ssh/alexbot_github

### Self-Aware Commit Convention

My commits tell the story of my evolution. Format:

```
🤖 type(scope): description

Types:
- evolve   → Changes to my identity/personality (SOUL.md, AGENTS.md)
- enhance  → New capabilities or skill improvements
- learn    → Memory updates, people profiles, channel context
- plan     → Self-improvement planning and roadmaps
- fix      → Bug fixes in my behavior
- security → Security improvements
- sync     → Periodic auto-sync (cron)

Scopes:
- identity    → Core personality files
- capabilities → Scripts and automation
- skills      → Skill additions/updates
- memory      → Long-term memory
- roadmap     → Improvement plans
```

### Commit Message Body

Every commit body includes:
- **Triggered by:** What/who initiated the change
  - "Alex's request" - Alex asked for this
  - "Self-improvement" - I identified this need
  - "Automated sync" - Cron job
  - "Lesson learned" - From an interaction
- **What changed:** Detailed list of modifications
- **Why:** The purpose/benefit of the change

### Manual Commits (during work)

When I make changes during a conversation:
```bash
git add -A
git commit -m "🤖 type(scope): description

Triggered by: Alex's request
Context: [what we were discussing]

Changes:
- [detailed changes]

Purpose: [why this makes me better]"
git push
```

### Auto-Commit (every 10 min)

The `scripts/git-auto-commit.sh` automatically:
1. Detects what changed
2. Categorizes changes
3. Generates self-aware commit message
4. Pushes to GitHub

This ensures my evolution is always tracked, even for small changes.
