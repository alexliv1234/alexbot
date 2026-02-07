# 🏗️ Multi-Agent Architecture

**Implemented:** 2026-02-07
**Status:** Active
**GitHub Issue:** #109

## Summary

Separated the "משחקים עם אלכס הבוט" (Playing Group) from the main agent to:
- Reduce costs (Sonnet instead of Opus)
- Improve security (isolated workspace)
- Better separation of concerns

## Architecture

### Agents

| Agent | Model | Workspace | Purpose |
|-------|-------|-----------|---------|
| `main` (default) | Opus | ~/.openclaw/workspace | Alex's personal assistant |
| `fast` | Sonnet | ~/.openclaw/workspace-fast | Playing group only |

### Routing

The `fast` agent handles ONLY the playing group via binding:
```json
{
  "agentId": "fast",
  "match": {
    "channel": "whatsapp",
    "peer": {
      "kind": "group",
      "id": "120363405143589138@g.us"
    }
  }
}
```

All other WhatsApp messages (Alex's DM, other groups if added) → `main` agent.

## Cost Impact

**Before:**
- Every playing group message → Opus ($15/MTok in, $75/MTok out)
- ~1000 messages/day at ~2k tokens each = ~2M tokens/day = ~$30-150/day

**After:**
- Playing group → Sonnet ($3/MTok in, $15/MTok out)
- Same volume = ~$6-30/day
- **~80% cost reduction for playing group**

## Security Improvements

### Fast Agent Restrictions

**Denied tools:**
- `gateway` - can't modify OpenClaw config
- `cron` - can't schedule jobs
- `nodes` - can't access paired devices
- `browser` - can't browse the web
- `canvas` - can't render canvases

**Isolated workspace:**
- No access to main MEMORY.md (Alex's private info)
- No access to people profiles
- Own copy of scoring files
- Own SOUL.md/AGENTS.md tailored for the group

### Attack Surface Reduction

The playing group is a hostile environment (people actively trying to hack).
Isolating it means:
- Can't access Alex's contacts, calendar, personal files
- Can't modify system config
- Can't relay messages to Alex's DM
- Limited tool access

## Files Created

### Workspace Structure
```
~/.openclaw/workspace-fast/
├── SOUL.md          # Competitive, sarcastic personality
├── AGENTS.md        # Group-specific rules
├── memory/
│   ├── playing-with-alexbot-scores.json
│   ├── playing-with-alexbot-suggestions.json
│   ├── playing-with-alexbot-winners.json
│   └── ... (other channel files)
└── scripts/
    ├── score-message.js
    ├── score-suggestion.js
    ├── score-checker.js
    └── log-reply.sh
```

### Config Changes
```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "name": "AlexLivBot",
        "workspace": "/home/alexliv/.openclaw/workspace"
      },
      {
        "id": "fast",
        "name": "Playing Group Agent",
        "workspace": "/home/alexliv/.openclaw/workspace-fast",
        "model": "anthropic/claude-sonnet-4-5",
        "tools": {
          "profile": "coding",
          "deny": ["gateway", "cron", "nodes", "browser", "canvas"]
        }
      }
    ]
  },
  "bindings": [
    {
      "agentId": "fast",
      "match": {
        "channel": "whatsapp",
        "peer": {
          "kind": "group",
          "id": "120363405143589138@g.us"
        }
      }
    }
  ]
}
```

## Verification

```bash
# List agents and bindings
openclaw agents list --bindings

# Expected output:
# - main (default) → opus, no explicit routing
# - fast → sonnet, routes whatsapp group:120363405143589138@g.us
```

## Future Improvements

1. **Add `ops` agent** for cron jobs (media check, session monitor)
2. **Add `watcher` agent** for ultra-fast NO_REPLY filtering
3. **Full sandbox isolation** with Docker for the fast agent

## Related Issues

- #109: [PLAN 01-01] Create fast agent for WhatsApp groups
- #110: [PLAN 01-03] Isolate Playing Group Workspace
- #111: [PLAN 02-01] Route all groups to Sonnet model
