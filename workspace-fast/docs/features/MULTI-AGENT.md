# Multi-Agent Architecture

**Status:** Phase 1 Active ✅
**Last Updated:** 2026-02-07

---

## Current State

### Active Agents

| Agent | Model | Purpose | Workspace |
|-------|-------|---------|-----------|
| `main` | Opus | Alex DMs, Telegram, all other traffic | `/home/alexliv/.openclaw/workspace` |
| `fast` | Sonnet | Playing group only | `/home/alexliv/.openclaw/workspace/workspace-fast` |

### Routing

| Source | Agent |
|--------|-------|
| WhatsApp: +972544419002 (Alex DM) | main |
| WhatsApp: משחקים עם אלכס הבוט (120363405143589138@g.us) | **fast** |
| WhatsApp: All other groups | main (NO_REPLY mostly) |
| Telegram | main |
| Cron jobs | main |

---

## Phase 1: Playing Group Isolation (2026-02-07) ✅

### What We Did
1. Created `fast` agent with separate workspace
2. Workspace lives INSIDE main repo: `workspace/workspace-fast/`
3. Score data shared via symlinks (single source of truth)
4. Tool restrictions: no gateway/cron/nodes/browser/canvas

### Key Files
- **Feature Doc:** `docs/features/multi-agent-phase1.md`
- **Architecture Plan:** `memory/plans/multi-agent-architecture.md`
- **Fast Workspace:** `workspace-fast/`

### Security Benefits
- Playing group can't access MEMORY.md, USER.md, contacts
- Cheaper to attack (Sonnet vs Opus)
- Contained blast radius

### Fix Applied Same Day
- **Problem:** Initially created workspace at `~/.openclaw/workspace-fast/` (OUTSIDE repo)
- **Fix:** Moved to `workspace/workspace-fast/` (inside main repo)
- **Lesson:** Always create new workspaces inside the main workspace directory

---

## Future Phases

### Phase 2: Ops Agent (Next)
- **Issue:** #114
- Background monitoring tasks (media check, session monitor)
- Cheaper model for automated tasks

### Phase 3: Group Watcher
- Silent watcher for groups that mostly get NO_REPLY
- Flash model (cheapest) for quick rejection
- Only escalate genuine mentions to main

### Phase 4: Specialized Agents
- Family bot (if ever needed)
- Work (esh) agent
- Dating agent

---

## Configuration Reference

### Agent Definition
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

---

## Commits

| Commit | Description |
|--------|-------------|
| d17d0e2 | Initial Phase 1 implementation |
| 77ebd1e | Fix: Move workspace inside repo |
| b5276c2 | Docs update after fix |

---

## Lessons Learned

1. **Source control everything:** New workspaces MUST be inside the main repo
2. **Symlinks for shared data:** Avoid duplication, maintain single source of truth
3. **Document immediately:** Create feature docs as part of implementation
4. **Update issues:** Keep GitHub in sync with work done
