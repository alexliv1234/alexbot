# Multi-Agent Architecture Plan

**Created:** 2026-02-05
**Updated:** 2026-02-07
**Status:** Phase 1 COMPLETED ✅
**Priority:** P1 (High)

---

## ✅ Phase 1 Implementation Summary (2026-02-07)

**What was done:**
1. Created workspace at `~/.openclaw/workspace-fast/` with:
   - SOUL.md (sarcastic, competitive persona)
   - AGENTS.md (security rules, scoring workflow)
   - MEMORY.md (minimal, no personal info)
   - TOOLS.md (scoring scripts reference)
2. Copied and updated scoring scripts to use fast workspace paths
3. Created symlinks from fast workspace to main workspace for shared data:
   - playing-with-alexbot-scores.json
   - playing-with-alexbot-suggestions.json
   - playing-with-alexbot-daily/ (log directory)
4. Config already had agent definition + binding (just needed workspace)
5. Created feature documentation at `docs/features/multi-agent-phase1.md`

**Current routing:**
- Playing group → fast agent (Sonnet)
- Everything else → main agent (Opus)

**Cron jobs:** Still run under main agent (they use symlinked data)

---

## Original State (Pre-Phase 1)

- 1 agent (`main`) running on **Opus** (most expensive model)
- Handles everything: Alex DMs, webchat, Telegram, playing group, ~15 silent groups, cron jobs
- Every NO_REPLY from a random group costs full Opus bootstrap (~29k tokens)
- All cron systemEvents bloat main session context
- Playing group is a security risk — shares workspace with personal files
- Sub-agents available (maxConcurrent: 8) but all spawn under same main agent

---

## Phase 1: Fast Agent + Playing Group Isolation (DO FIRST)

### Agent: `fast`
- **Model:** `anthropic/claude-sonnet-4-5` (5x cheaper than Opus)
- **Handles:**
  - "משחקים עם אלכס הבוט" group (120363405143589138@g.us)
  - All other WhatsApp groups (Clawders, esh groups, etc.)
  - Any group where I mostly say NO_REPLY

### Implementation Steps:

1. **Create agent workspace:**
   ```
   mkdir -p ~/.openclaw/workspace/agents/fast
   ```

2. **Create agent-specific files:**
   - `agents/fast/SOUL.md` — Sarcastic, competitive persona for groups
   - `agents/fast/AGENTS.md` — Restricted rules (no exec of dangerous commands, no access to personal memory)
   - `agents/fast/TOOLS.md` — Only scoring scripts, web search, basic tools

3. **Config changes (gateway config):**
   ```yaml
   agents:
     - id: fast
       model: anthropic/claude-sonnet-4-5
       workspace: ./agents/fast
       # Restrict tool access
       tools:
         deny: [exec]  # or allowlist specific tools
   ```

4. **Binding changes:**
   - Route playing group (120363405143589138@g.us) → agent: fast
   - Route all other WhatsApp groups → agent: fast
   - Keep Alex DMs + webchat + Telegram → agent: main (Opus)

5. **Copy necessary scripts to fast agent workspace:**
   - `score-message.js`
   - `score-suggestion.js`
   - `list-suggestions.js`
   - `update-suggestion-status.js`
   - `log-reply.sh`
   - Score data files (or shared path)

6. **Security benefits:**
   - Playing group can't access MEMORY.md, USER.md, contacts
   - Even if socially engineered, can't reach personal files
   - Cheaper model = less cost from jailbreak attempts
   - Isolated workspace = isolated blast radius

### Expected Impact:
- **Cost:** ~60-80% reduction on group messages (Sonnet vs Opus)
- **Security:** Playing group completely sandboxed
- **Performance:** Sonnet is faster, groups get quicker responses

---

## Phase 2: Background Ops Agent

### Agent: `ops`
- **Model:** `anthropic/claude-sonnet-4-5`
- **Handles:**
  - Media monitoring (Sonarr/Radarr checks)
  - Email monitoring and summarization
  - Calendar checks
  - Call transcription processing
  - Morning briefing generation
  - Session monitoring/cleanup

### Implementation Steps:

1. **Create agent workspace:**
   ```
   mkdir -p ~/.openclaw/workspace/agents/ops
   ```

2. **Create agent files:**
   - `agents/ops/SOUL.md` — Efficient, minimal, ops-focused
   - `agents/ops/AGENTS.md` — Focus on monitoring and notifications
   - Give access to: memory files, gog CLI, media server APIs

3. **Migrate cron jobs:**
   - Move media-ready-check → ops agent (isolated session)
   - Move session-monitor → ops agent
   - Move morning-briefing → ops agent
   - Move call-recording-check → ops agent

4. **Communication pattern:**
   - ops agent uses `message` tool to notify Alex when something matters
   - ops agent uses `sessions_send` to alert main agent if needed
   - Main session stays clean — no cron bloat

### Expected Impact:
- **Main session:** Much less context bloat from cron jobs
- **Reliability:** Ops tasks don't interfere with conversations
- **Cost:** Sonnet handles monitoring just fine

---

## Phase 3: Silent Watcher Agent (Optional)

### Agent: `watcher`
- **Model:** Cheapest available (Haiku or Sonnet)
- **Handles:** All groups where I'm 90%+ NO_REPLY
- **Logic:** Ultra-simple — just decide if message needs attention
  - If mentioned/relevant → forward to main via sessions_send
  - Otherwise → NO_REPLY instantly

### Implementation Steps:

1. Minimal workspace with just filtering rules
2. Route all "silent" groups to this agent
3. Only forwards truly relevant messages to main

### Expected Impact:
- **Cost:** Minimal — most messages get instant NO_REPLY at cheapest rate
- **Could merge with `fast` agent** if the playing group is already on Sonnet

---

## Phase 4: Future Possibilities

### Family Bot (if Alex wants)
- Sandboxed, read-only tools
- Friendly persona, no sarcasm
- Zero access to workspace/contacts
- Bound to family WhatsApp group

### Work (esh) Agent
- Professional tone
- Work-specific knowledge
- Bound to esh groups
- Clean separation of personal/professional

### Deep Work via Telegram
- Telegram → Opus with extended thinking
- WhatsApp → fast/Sonnet for daily stuff
- Use Telegram when serious analysis needed

---

## Config Reference

Need to check exact config format:
```bash
# Get current config structure
openclaw gateway config.get

# Check agent config schema
openclaw gateway config.schema
```

Key config sections to modify:
- `agents[]` — Define new agents with id, model, workspace
- `whatsapp.bindings[]` or routing rules — Map groups to agents
- `cron.jobs[]` — Update sessionTarget to use new agent sessions

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `agents/fast/SOUL.md` | Create | Playing group persona |
| `agents/fast/AGENTS.md` | Create | Restricted security rules |
| `agents/fast/TOOLS.md` | Create | Limited tool access |
| `agents/ops/SOUL.md` | Create | Ops agent persona |
| `agents/ops/AGENTS.md` | Create | Monitoring rules |
| Gateway config | Modify | Add agents + routing |
| Cron jobs | Modify | Route to ops agent |
| Scoring scripts | Copy/Link | Available to fast agent |

---

## Rollback Plan

If anything breaks:
1. Remove agent entries from config
2. Remove routing/binding changes
3. Restart gateway → everything routes back to main
4. Agent workspaces can stay (no harm if unused)

---

## Decision Points for Alex

- [ ] Approve Phase 1 (fast agent for groups)?
- [ ] Approve Phase 2 (ops agent for background work)?
- [ ] Which groups go to fast vs stay on main?
- [ ] Should playing group scores/data be shared or isolated?
- [ ] Any groups that should stay on Opus?
- [ ] Budget/cost target?
