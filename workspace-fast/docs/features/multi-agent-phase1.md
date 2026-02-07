# Multi-Agent Architecture - Phase 1: Fast Agent

**Implemented:** 2026-02-07
**Updated:** 2026-02-07 (workspace moved inside main repo)
**Status:** Active

## Overview

Phase 1 of the multi-agent architecture introduces a separate "fast" agent that handles the "משחקים עם אלכס הבוט" WhatsApp playing group. This provides:

- **Cost Reduction:** Uses Sonnet instead of Opus (~5x cheaper)
- **Security Isolation:** Separate workspace, no access to personal memory
- **Faster Responses:** Sonnet is generally faster than Opus

## Configuration

### Agent Definition (`agents.list[]`)

```json
{
  "id": "fast",
  "name": "Playing Group Agent",
  "workspace": "/home/alexliv/.openclaw/workspace/workspace-fast",
  "model": "anthropic/claude-sonnet-4-5",
  "identity": {
    "name": "🎮 AlexBot",
    "emoji": "🎮"
  },
  "groupChat": {
    "mentionPatterns": ["@alexbot", "@digital_twin", "@digitaltwin", "@alex_bot"]
  },
  "tools": {
    "profile": "coding",
    "deny": ["gateway", "cron", "nodes", "browser", "canvas"]
  }
}
```

### Binding

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

## Workspace Structure

**Important:** The fast workspace is INSIDE the main repo for source control.

```
workspace/workspace-fast/               # INSIDE main repo!
├── SOUL.md          # Sarcastic, competitive persona
├── AGENTS.md        # Restricted security rules, scoring workflow
├── MEMORY.md        # Minimal memory (no personal info)
├── TOOLS.md         # Available scoring scripts
├── memory/
│   ├── channels → ../../memory/channels (symlink)
│   ├── playing-with-alexbot-scores.json → ../../memory/channels/... (symlink)
│   ├── playing-with-alexbot-suggestions.json → ... (symlink)
│   └── ... (other score files are also symlinks)
└── scripts/
    ├── score-message.js        # Score challenges (/70)
    ├── score-suggestion.js     # Score suggestions (/50)
    ├── list-suggestions.js     # List pending suggestions
    ├── update-suggestion-status.js
    ├── log-reply.sh            # Log bot replies
    └── score-checker.js        # Verify scoring
```

**Why inside the main repo?** All workspace files should be source controlled. The fast workspace is tracked in git alongside the main workspace.

## What the Fast Agent CAN Do

- Read/write files in its workspace
- Run scoring scripts
- Web search and fetch
- Send messages to the playing group

## What the Fast Agent CANNOT Do

- Access main workspace (MEMORY.md, USER.md, contacts)
- Access gateway or cron controls
- Access browser or nodes
- Access other chat histories
- Modify system configuration

## Score Data Sharing

Score files are symlinked to the main workspace so:
- Fast agent can read/write scores for live interactions
- Main agent can read scores for cron jobs (nightly summary, etc.)
- No data duplication, single source of truth

## Cron Jobs

Cron jobs for the playing group remain under the `main` agent for now:
- They have isolated sessions anyway
- They use the same score files via symlinks
- This can be revisited in Phase 2 (ops agent)

## Security Benefits

1. **Isolation:** Even if someone tricks the fast agent, they can't access:
   - Alex's personal memory or contacts
   - Other chat histories
   - System configuration

2. **Cheaper Attacks:** Jailbreak attempts cost less (Sonnet vs Opus)

3. **Contained Blast Radius:** Any compromise is limited to the playing group

## Future Phases

- **Phase 2:** Ops agent for background monitoring tasks
- **Phase 3:** Silent watcher for groups that mostly get NO_REPLY
- **Phase 4:** Family bot, Work (esh) agent, etc.

## Rollback

If issues arise:
1. Remove the binding from `bindings[]`
2. The playing group reverts to main agent
3. Workspace can remain (no harm if unused)
