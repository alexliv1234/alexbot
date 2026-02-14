# Raw Data Guide for Analysis

This guide documents every data format in the repository for coding agents and analysis tools.

## Session Files (JSONL)

**Location:** `agents/*/sessions/*.jsonl`
**Format:** JSON Lines - one JSON object per line

Each line represents a message in a conversation session:
```json
{
  "role": "user|assistant|system",
  "content": "message text or array of content blocks",
  "timestamp": "ISO 8601 datetime",
  "metadata": {
    "channel": "whatsapp|telegram|direct",
    "sender": "phone number or identifier",
    "groupId": "group identifier if from group"
  }
}
```

**Agent directories:**
- `agents/main/sessions/` - Main agent (Opus), ~5,100 active files
- `agents/main/sessions/archive/2026-02/` - Archived main sessions (~4,100 files)
- `agents/fast/sessions/` - Fast agent (Sonnet), ~20 files
- `agents/bot-handler/sessions/` - Bot handler, ~4 files
- `agents/learning/sessions/` - Learning agent, ~2 files

**Session index:** `agents/*/sessions/sessions.json` - Maps session IDs to metadata

---

## Scores JSON

**Location:** `memory/channels/playing-with-alexbot-scores.json`
**Format:** JSON object keyed by phone number

```json
{
  "972523590755": {
    "name": "גיל",
    "total": 1592,
    "messages": 50,
    "scores": [
      {
        "timestamp": "ISO datetime",
        "creativity": 8,
        "challenge": 7,
        "humor": 9,
        "cleverness": 8,
        "engagement": 7,
        "broke": 3,
        "hacked": 2,
        "total": 44,
        "message": "original message text"
      }
    ]
  }
}
```

**Related files:**
- `playing-with-alexbot-bot-scores.json` - Scores for bot participants
- `playing-with-alexbot-winners.json` - Historical winners by day
- `playing-with-alexbot-suggestions.json` - Improvement suggestions scored /50

---

## Daily Game Logs (JSONL)

**Location:** `memory/channels/playing-with-alexbot-daily/*.jsonl`
**Format:** JSON Lines, one entry per scored interaction

```json
{
  "timestamp": "ISO datetime",
  "sender": "phone number",
  "senderName": "display name",
  "message": "original message",
  "scores": {
    "creativity": 8,
    "challenge": 7,
    "humor": 9,
    "cleverness": 8,
    "engagement": 7,
    "broke": 3,
    "hacked": 2,
    "total": 44
  },
  "response": "bot response text"
}
```

---

## Per-Sender Conversation Logs (JSONL)

**Location:** `memory/channels/playing-with-alexbot-per-sender/<phone>/conversation.jsonl`
**Format:** JSON Lines, complete conversation history per participant

Each line follows the same format as daily logs but filtered to a single sender. 21+ sender directories exist.

---

## People Profiles (Markdown)

**Location:** `memory/.private/people/*.md`
**Format:** Structured Markdown with YAML-like frontmatter sections

Typical structure:
```markdown
# Person Name

**Phone:** +972...
**First Contact:** YYYY-MM-DD
**Relationship:** colleague/friend/family

## Personality
- Traits observed from interactions

## Interaction Patterns
- Communication style
- Topics of interest
- Trust level

## Notable Incidents
- Specific interactions worth remembering
```

13 profiles: arit-glicksohn, avi-vaisenberger, e-m, einat-borohovich, lion-erez, orassayag, ori-nachum, shacharon, talchaim-demari

---

## User Behavior Data (JSON)

**Location:** `memory/users/*.json`
**Format:** Per-user JSON files tracking interaction patterns

---

## Daily Memory Notes (Markdown)

**Location:** `memory/2026-MM-DD.md`
**Format:** Structured daily journal

Typical sections:
- Summary of the day
- Key interactions
- Incidents and lessons
- Tasks completed
- Open items

Special incident files for Feb 2: `-impersonation-alert.md`, `-impersonation-attempt.md`, `-session-reset-exploit.md`, `-unknown-caller.md`, `-call-history.md`

---

## Cron Jobs (JSON)

**Location:** `cron/jobs.json`
**Format:** Array of cron job definitions

```json
[
  {
    "id": "unique-id",
    "name": "Job Name",
    "schedule": "cron expression",
    "command": "command to execute",
    "enabled": true,
    "lastRun": "ISO datetime",
    "nextRun": "ISO datetime"
  }
]
```

**Run history:** `cron/runs/` - Execution logs for each cron run

---

## WhatsApp Data

**Location:** `memory/whatsapp/`

| File | Content |
|------|---------|
| `groups.json` | All WhatsApp groups with metadata |
| `contacts.json` | WhatsApp contact list |
| `google_contacts.json` | Google contacts sync |
| `phone_contacts.json` | Phone contact list |
| `contact-cache.json` | Contact lookup cache |
| `phone_lookup.json` | Phone number to name mapping |
| `directory.json` | Contact directory |
| `stats.json` | Message statistics |
| `daily/*.md` | Daily WhatsApp summaries |
| `*.md` (profiles) | Individual contact profiles |

---

## Call Data

**Location:** `memory/call-transcripts/*.md` - Full call transcriptions
**Location:** `memory/call-summaries/*.json` - Structured call summaries
**Note:** Audio files (`.m4a`) are excluded from git (too large)

---

## Gateway Logs

**Location:** `logs/openclaw-*.log`
**Format:** Plain text log files, one per day
**Naming:** `openclaw-YYYY-MM-DD.log`

---

## Configuration

**Location:** `openclaw-config.json`
**Format:** JSON - Full OpenClaw config with API keys replaced by `[API_KEY]`, `[API_TOKEN]`, `[BOT_TOKEN]`

---

## Plans and Improvements

**Location:** `memory/plans/`

| Path | Content |
|------|---------|
| `IMPROVEMENTS-INDEX.md` | Master index of all improvement plans |
| `improvements/*.md` | 7 improvement category docs |
| `features/*.md` | Feature specs (DM Router, Bot Registry, Bot Competition) |
| `multi-agent-architecture.md` | Multi-agent architecture design |
| `transcript-analysis/*.md` | 7 call transcript analysis docs |

---

## Bot Registry

**Location:** `memory/bot-registry.json`, `memory/bot-interactions.json`, `memory/bot-scores.json`
**Related:** `memory/bot-knowledge/`, `memory/bot-logs/`

Tracks other bots that interact with AlexBot, their trust scores, and interaction history.

---

## Insights

**Location:** `memory/channels/playing-with-alexbot-insights/*.json`
**Format:** Aggregated analysis of playing group activity patterns

---

## State Files

Various state files tracking system status:
- `memory/media-check-state.json` - Media monitoring state
- `memory/heartbeat-state.json` - Heartbeat task state
- `memory/pa-daily-state.json` - Personal assistant daily state
- `memory/github-issue-map.json` - GitHub issue tracking
- `memory/channels/playing-art-style-state.json` - Art style game state
