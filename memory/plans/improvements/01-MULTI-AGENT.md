# 🏗️ Multi-Agent Architecture Improvements

**Category:** Architecture
**Priority:** P0 (Critical)
**Impact:** Cost 80%↓, Security ↑, Performance ↑

---

## Current Problem

- **1 agent** (main) handles EVERYTHING on **Opus** ($15/MTok)
- Every NO_REPLY from random groups costs full Opus bootstrap (~29k tokens)
- Playing group shares workspace with personal files (security risk)
- All cron jobs bloat main session context
- Sub-agents spawn under same main agent (no isolation)

---

## Improvements

### 01-01: Create `fast` Agent for WhatsApp Groups
**Priority:** P0 | **Effort:** Medium | **Impact:** High | **Status:** ✅ COMPLETED (2026-02-07)

**What:** Create dedicated agent on Sonnet for all WhatsApp groups

**Implementation:**
```bash
# 1. Create workspace
mkdir -p ~/.openclaw/workspace/agents/fast
mkdir -p ~/.openclaw/workspace/agents/fast/memory
mkdir -p ~/.openclaw/workspace/agents/fast/scripts

# 2. Copy necessary files
cp scripts/score-*.js agents/fast/scripts/
cp scripts/log-reply.sh agents/fast/scripts/
cp memory/channels/playing-with-alexbot*.json agents/fast/memory/

# 3. Create SOUL.md, AGENTS.md, TOOLS.md for fast agent
# 4. Update gateway config to route groups → fast
```

**Config Changes:**
```yaml
agents:
  - id: fast
    model: anthropic/claude-sonnet-4-5
    workspace: ./agents/fast
```

**Expected:** 5x cost reduction on group messages

---

### 01-02: Create `ops` Agent for Background Tasks
**Priority:** P1 | **Effort:** Medium | **Impact:** Medium | **Status:** pending

**What:** Dedicated agent for cron jobs (media check, session monitor, etc.)

**Why:**
- Cron jobs currently pollute main session
- Each cron run adds context
- Ops tasks don't need Opus intelligence

**Implementation:**
```bash
mkdir -p ~/.openclaw/workspace/agents/ops
# Create minimal workspace for monitoring
# Migrate cron jobs to use ops agent
```

---

### 01-03: Isolate Playing Group Workspace
**Priority:** P0 | **Effort:** Medium | **Impact:** High | **Status:** ✅ COMPLETED (2026-02-07)

**What:** Playing group gets completely separate workspace

**Why:**
- Current setup: playing group can access MEMORY.md, contacts, private files
- Social engineering attacks could expose sensitive data
- Need full sandbox isolation

**Implementation:**
- Playing group files move to `agents/fast/memory/`
- No symlinks to main workspace
- Scores, suggestions, daily logs all isolated

---

### 01-04: Create `watcher` Agent (Ultra-Light)
**Priority:** P2 | **Effort:** Low | **Impact:** Medium | **Status:** pending

**What:** Cheapest agent for 90%+ NO_REPLY groups

**Logic:**
- Receive message
- Check if @alexbot mentioned
- If yes → forward to main via sessions_send
- If no → instant NO_REPLY

**Model:** Haiku or cheapest available

---

### 01-05: Agent-Specific SOUL.md Files
**Priority:** P1 | **Effort:** Low | **Impact:** Medium | **Status:** pending

**What:** Each agent gets tailored personality

**Files to create:**
- `agents/fast/SOUL.md` - Sarcastic, competitive (for playing group)
- `agents/ops/SOUL.md` - Efficient, minimal (for background ops)
- `agents/watcher/SOUL.md` - Just filtering rules

---

### 01-06: Agent Tool Restrictions
**Priority:** P0 | **Effort:** Low | **Impact:** High | **Status:** pending

**What:** Limit tools available to each agent

**fast agent:**
- ✅ web_search, exec (scoring scripts only)
- ❌ memory files outside its workspace
- ❌ message to Alex's DM
- ❌ gateway config changes

**ops agent:**
- ✅ exec, message, cron
- ❌ webchat, sensitive memory

---

### 01-07: Cross-Agent Communication
**Priority:** P1 | **Effort:** Medium | **Impact:** Medium | **Status:** pending

**What:** Define how agents communicate

**Patterns:**
- watcher → main: Forward important mentions
- fast → main: Escalate security concerns
- ops → main: Alert on critical issues
- All use `sessions_send` tool

---

### 01-08: Rollback Plan
**Priority:** P1 | **Effort:** Low | **Impact:** High | **Status:** pending

**What:** Document how to revert if multi-agent breaks

**Steps:**
1. Remove agent entries from config
2. Remove routing rules
3. Restart gateway
4. Everything routes back to main

---

## Dependencies

```
01-01 ─┬─→ 01-03 (isolation needs fast agent first)
       └─→ 01-05 (SOUL files for fast agent)
       
01-02 ─→ 01-07 (ops needs communication patterns)

01-06 ─→ All agents (security baseline)
```

---

## Estimated Timeline

| Item | Time |
|------|------|
| 01-01 | 2 hours |
| 01-02 | 1 hour |
| 01-03 | 1 hour |
| 01-04 | 30 min |
| 01-05 | 30 min |
| 01-06 | 30 min |
| 01-07 | 1 hour |
| 01-08 | 15 min |
| **Total** | ~7 hours |
