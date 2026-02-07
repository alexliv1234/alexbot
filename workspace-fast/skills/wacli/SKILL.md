---
name: wacli
description: Advanced WhatsApp CLI integration with AI-powered analytics, search, contact resolution, and automation. Works alongside the OpenClaw WhatsApp plugin for enhanced capabilities.
homepage: https://wacli.sh
metadata: {"clawdbot":{"emoji":"📱","requires":{"bins":["wacli"]},"install":[{"id":"brew","kind":"brew","formula":"steipete/tap/wacli","bins":["wacli"],"label":"Install wacli (brew)"},{"id":"go","kind":"go","module":"github.com/steipete/wacli/cmd/wacli@latest","bins":["wacli"],"label":"Install wacli (go)"}]}}
---

# wacli - Advanced WhatsApp Integration

## Overview

This skill provides comprehensive WhatsApp functionality using wacli CLI:
- **Real-time chat** → handled by OpenClaw WhatsApp plugin
- **Search, analytics, history** → handled by wacli (this skill)

## Core Commands

### Auth & Sync
```bash
~/go/bin/wacli auth                    # QR login
~/go/bin/wacli auth status             # Check auth
~/go/bin/wacli sync --follow           # Continuous sync
~/go/bin/wacli doctor                  # Diagnostic
```

### Find Chats & Messages
```bash
# List recent chats
~/go/bin/wacli chats list --limit 20 --query "name"

# Search messages globally
~/go/bin/wacli messages search "keyword" --limit 50

# Search in specific chat
~/go/bin/wacli messages search "invoice" --chat "972XXXXXXXX@s.whatsapp.net"

# Date-range search
~/go/bin/wacli messages search "meeting" --after 2026-01-01 --before 2026-02-01
```

### Send Messages
```bash
# Text to contact
~/go/bin/wacli send text --to "+972XXXXXXXXX" --message "Hey!"

# Text to group
~/go/bin/wacli send text --to "120363XXXXX@g.us" --message "Update"

# File with caption
~/go/bin/wacli send file --to "+972XX" --file /path/doc.pdf --caption "Here's the file"
```

### History Backfill
```bash
~/go/bin/wacli history backfill --chat "972XX@s.whatsapp.net" --requests 5 --count 100
```

## Enhanced Features (AI-Powered)

All scripts are in `skills/wacli/scripts/` and use local LLM (qwen2.5:32b) when available.

### 1. Smart Contact Resolution
```bash
./scripts/resolve-contact.sh "+972544419002"
./scripts/resolve-contact.sh "120363407129170550@g.us"
```
- Looks up JID against wacli contacts + Google Contacts
- Returns: name, phone, email, organization
- Cached in `memory/whatsapp/contact-cache.json`

### 2. Message Search & Analysis
```bash
./scripts/search-analyze.sh "invoice" --days 30
./scripts/search-analyze.sh "meeting" --chat "972XX@s.whatsapp.net"
```
- Searches messages with wacli
- Analyzes with local LLM:
  - Key topics & themes
  - Action items extracted
  - People mentioned
  - Sentiment analysis
  - Timeline summary

### 3. Chat Analytics
```bash
./scripts/chat-analytics.sh --days 7
./scripts/chat-analytics.sh --contact "+972XX"
```
- Message volume by chat
- Response time patterns
- Top contacts/groups
- Activity heatmap (hourly/daily)
- Conversation length distribution

### 4. Group Insights
```bash
./scripts/group-insights.sh "120363407129170550@g.us"
```
- Participation tracking (who posts most)
- Topic clustering (what's discussed)
- Sentiment trends
- Most active times
- Key contributors

### 5. Conversation Summaries
```bash
./scripts/summarize-chat.sh "+972XX" --days 7
./scripts/summarize-chat.sh "120363XX@g.us" --messages 200
```
- Fetches conversation history
- Summarizes with local LLM:
  - Main discussion points
  - Decisions made
  - Action items
  - Follow-ups needed
  - Key quotes

### 6. Smart Scheduling Assistant
```bash
./scripts/schedule-scan.sh --days 7
```
- Scans all messages for scheduling mentions
- Extracts:
  - Proposed times/dates
  - Meeting requests
  - Confirmations/cancellations
  - Location info
- Suggests calendar entries

### 7. Batch Messaging
```bash
./scripts/batch-send.sh message.txt contacts.json
```
contacts.json format:
```json
[
  {"jid": "972XX@s.whatsapp.net", "name": "Name", "vars": {"key": "value"}},
  ...
]
```
- Template support: `{{name}}`, `{{key}}`
- Rate limiting (avoid spam detection)
- Delivery tracking

### 8. Contact/Group Sync
```bash
./scripts/sync-contacts.sh
./scripts/sync-groups.sh
```
- Exports wacli contacts → `memory/whatsapp/contacts.json`
- Exports group info → `memory/whatsapp/groups.json`
- Merges with Google Contacts data
- Updates contact cache

### 9. Archive & Backup
```bash
./scripts/archive-chat.sh "+972XX" --format markdown
./scripts/backup-all.sh --incremental
```
- Exports conversations to markdown/JSON
- Saves to `memory/whatsapp/archives/YYYY-MM-DD/`
- Incremental backups (only new messages)
- Automatic compression

### 10. Smart Templates
```bash
./scripts/template-send.sh --template meeting-reminder --to "+972XX" --vars '{"time":"3pm","topic":"Budget"}'
```
Templates in `skills/wacli/templates/`:
- `meeting-reminder.txt`
- `follow-up.txt`
- `status-update.txt`
- Custom templates supported

## Local LLM Integration

All AI features use Ollama (http://10.100.102.8:11434) with qwen2.5:32b-instruct-q4_K_M.

### Helper: `scripts/llm-query.sh`
```bash
./scripts/llm-query.sh "Analyze this conversation: ..." --max-tokens 500
```
- Auto-detects Ollama availability
- Falls back to Claude if local LLM unavailable
- Caches responses for efficiency

## Safety Rules

**CRITICAL:**
- Real-time conversations → use OpenClaw plugin (automatic)
- Third-party messaging → use wacli (this skill)
- Always confirm recipient before sending
- Never send without explicit user approval
- Respect privacy (don't leak messages between contexts)

## File Structure

```
skills/wacli/
├── SKILL.md (this file)
├── scripts/
│   ├── resolve-contact.sh
│   ├── search-analyze.sh
│   ├── chat-analytics.sh
│   ├── group-insights.sh
│   ├── summarize-chat.sh
│   ├── schedule-scan.sh
│   ├── batch-send.sh
│   ├── sync-contacts.sh
│   ├── sync-groups.sh
│   ├── archive-chat.sh
│   ├── backup-all.sh
│   ├── template-send.sh
│   └── llm-query.sh (LLM wrapper)
├── templates/
│   ├── meeting-reminder.txt
│   ├── follow-up.txt
│   └── status-update.txt
└── references/
    └── wacli-api.md
```

## Usage Patterns

**When user asks:**
- "Find messages about X" → `search-analyze.sh`
- "Who do I message most?" → `chat-analytics.sh`
- "Summarize my chat with X" → `summarize-chat.sh`
- "What's happening in group X?" → `group-insights.sh`
- "Message X about Y" → `wacli send text`
- "Find all meeting requests" → `schedule-scan.sh`
- "Send birthday wishes to everyone" → `batch-send.sh`

## Performance

- Contact resolution: < 100ms (cached)
- Message search: ~500ms per 1k messages
- LLM analysis: 2-5s (local qwen2.5:32b)
- Full chat summary: 5-15s (depending on length)
- Batch send: ~1msg/sec (rate limited)

## Troubleshooting

```bash
~/go/bin/wacli doctor           # Check health
~/go/bin/wacli auth status      # Verify auth
~/go/bin/wacli sync --once      # Force sync
```

**Common issues:**
- "Not authenticated" → Run `~/go/bin/wacli auth`
- Slow searches → Run sync first
- Missing messages → Backfill history
- Local LLM timeout → Check Ollama status

## Next Steps

After installation:
1. ✅ Auth: `~/go/bin/wacli auth`
2. ✅ Sync: `~/go/bin/wacli sync --follow` (run in background)
3. Export contacts: `./scripts/sync-contacts.sh`
4. Export groups: `./scripts/sync-groups.sh`
5. Test search: `./scripts/search-analyze.sh "test"`

Now ready for advanced WhatsApp operations!
