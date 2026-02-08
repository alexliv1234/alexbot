# 📊 Session Management

Handling context limits, compaction, and multi-session patterns.

---

## Context Window Management

### The Problem
- LLM context windows have limits (100k-200k tokens)
- Sessions accumulate messages over time
- Overflow causes errors or performance degradation

### Prevention Strategy

1. **Set Hard Limits**
   ```json
   "contextTokens": 100000
   ```

2. **Enable Pruning**
   ```json
   "contextPruning": {
     "mode": "cache-ttl",
     "keepLastAssistants": 50
   }
   ```

3. **Configure Compaction**
   ```json
   "compaction": {
     "mode": "default",
     "reserveTokensFloor": 25000
   }
   ```

### Monitoring Thresholds
| Session Type | Warning | Critical |
|--------------|---------|----------|
| Groups | 50k tokens | 150k tokens |
| DMs | 100k tokens | 150k tokens |
| Main | 150k tokens | 200k tokens |

---

## Session Health Checks

### What to Monitor
- Total tokens vs. limit
- Transcript file size (>500KB is concerning)
- `transcriptPath` validity (null = corrupted)
- Session age and activity

### Automated Monitoring
Run session health checks via cron every 5-30 minutes:
1. Check all agent session files
2. Validate JSON structure
3. Flag oversized sessions
4. Detect duplicate sessions across agents
5. Auto-cleanup corrupted entries

### Recovery Procedures

**For oversized sessions:**
1. Extract important context to memory files
2. Summarize conversation
3. Delete session (or reset via `/reset`)
4. New session starts fresh

**For corrupted sessions (transcriptPath: null):**
1. Backup session file
2. Remove corrupted entry from sessions.json
3. Restart gateway
4. Next message creates fresh session

---

## Multi-Agent Session Patterns

### Session Routing
Messages route to agents based on bindings:
```json
{
  "agentId": "fast",
  "match": {
    "channel": "whatsapp",
    "peer": { "kind": "group", "id": "..." }
  }
}
```

### Common Problems

**Stray Sessions:**
Session exists in wrong agent (e.g., group session in main when bound to fast).
- Cause: Routing changed after session created
- Fix: Delete stray session, restart

**Duplicate Sessions:**
Same peer has sessions in multiple agents.
- Cause: Binding misconfiguration
- Fix: Decide correct agent, delete from others

**Session Collision:**
Multiple messages arrive before session fully initializes.
- Cause: Race condition
- Fix: Usually self-resolves; restart if stuck

---

## Session Persistence

### What's Stored
- `sessions.json`: Session metadata (key, tokens, paths)
- `*.jsonl`: Transcript files (actual conversation)

### Location Pattern
```
~/.openclaw/agents/{agentId}/sessions/
├── sessions.json
└── {uuid}.jsonl
```

### Backup Strategy
Before any session manipulation:
```bash
cp sessions.json sessions.json.bak-$(date +%Y%m%d-%H%M%S)
```

---

## Best Practices

1. **Don't fight the limits** - Accept that context is finite
2. **Write to memory proactively** - Important info → memory files
3. **Monitor before crisis** - 50k warning, not 150k panic
4. **One session per peer per agent** - Clean routing
5. **Restart after session changes** - Ensure clean state

---

## Changelog

- 2026-02-08: Initial version with corruption handling lessons
