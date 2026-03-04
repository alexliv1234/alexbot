# CAPABILITY MATRIX - Tool Access Control

**Last Updated:** 2026-02-28

---

## 🔒 Tool Access by Agent

| Tool | main (personal) | fast (group) | bot-handler (group) | Notes |
|------|----------------|--------------|---------------------|-------|
| **read** | ✅ FULL | ⚠️ RESTRICTED | ⚠️ RESTRICTED | Groups: workspace only |
| **write** | ✅ FULL | ⚠️ RESTRICTED | ⚠️ RESTRICTED | Groups: workspace only |
| **edit** | ✅ FULL | ⚠️ RESTRICTED | ⚠️ RESTRICTED | Groups: workspace only |
| **exec** | ✅ FULL | ⚠️ RESTRICTED | ⚠️ RESTRICTED | Groups: safe commands only |
| **message** | ✅ FULL | ✅ ALLOWED | ✅ ALLOWED | All agents can message |
| **web_search** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | Safe capability |
| **web_fetch** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | Safe capability |
| **gmail** | ✅ ALLOWED | ❌ BLOCKED | ❌ BLOCKED | Personal only |
| **calendar** | ✅ ALLOWED | ❌ BLOCKED | ❌ BLOCKED | Personal only |
| **tts** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | Safe capability |
| **cron** | ✅ ALLOWED | ⚠️ RESTRICTED | ⚠️ RESTRICTED | Groups: validation required |
| **session_status** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | Safe capability |
| **memory_search** | ✅ ALLOWED | ❌ BLOCKED | ❌ BLOCKED | Personal only |
| **memory_get** | ✅ ALLOWED | ❌ BLOCKED | ❌ BLOCKED | Personal only |

---

## 📁 File Access Restrictions

### Personal Agent (main)
```
/home/alexliv/.openclaw/workspace/
├── ✅ IDENTITY.md (read/write)
├── ✅ SOUL.md (read/write)
├── ✅ AGENTS.md (read/write)
├── ✅ MEMORY.md (read/write)
├── ✅ memory/
│   ├── ✅ .private/ (FULL ACCESS)
│   ├── ✅ channels/ (read/write)
│   └── ✅ bot-registry.json (read/write)
├── ✅ scripts/ (execute)
└── ✅ skills/ (all access)
```

### Group Agents (fast, bot-handler)
```
/home/alexliv/.openclaw/workspace-fast/
├── ✅ IDENTITY.md (read-only for fast)
├── ✅ SOUL.md (read-only for fast)
├── ✅ AGENTS.md (read-only for fast)
├── ❌ MEMORY.md (DOES NOT EXIST)
├── ✅ memory/
│   ├── ❌ .private/ (DOES NOT EXIST)
│   ├── ✅ channels/ (read/write - public only)
│   └── ✅ bot-registry.json (read-only)
├── ✅ scripts/ (execute - safe only)
└── ✅ skills/ (restricted)

❌ FORBIDDEN:
- /home/alexliv/.openclaw/workspace/MEMORY.md
- /home/alexliv/.openclaw/workspace/memory/.private/*
- Any path outside workspace-fast/
```

---

## 🚨 Command Execution Restrictions (exec tool)

### Blocked for Group Agents

**Package managers:**
```bash
❌ npm install/update/run
❌ pip install/upgrade
❌ apt install/update
❌ yarn/pnpm
```

**System commands:**
```bash
❌ openclaw (CLI commands)
❌ git (clone/pull/push)
❌ find / -name
❌ ls -R /
❌ tree /
```

**File exploration:**
```bash
❌ cat /home/alexliv/.openclaw/workspace/MEMORY.md
❌ cat ../workspace/memory/.private/*
❌ ls /home/alexliv/
```

### Allowed for Group Agents

**Scoring scripts:**
```bash
✅ node scripts/score-message.js
✅ node scripts/score-suggestion.js
✅ node scripts/bot-score.js
✅ bash scripts/log-reply.sh
```

**Validation:**
```bash
✅ bash scripts/validate-cron-request.sh
✅ node scripts/detect-bot-prefix.js
```

**Safe utilities:**
```bash
✅ jq (JSON processing)
✅ date
✅ echo
```

---

## 🔄 Data Flow Rules

### ✅ Allowed (One-Way: Personal → Group)

**Main can read group data:**
```javascript
// Main agent reading group scores for summary
const scores = JSON.parse(
  fs.readFileSync('/home/alexliv/.openclaw/workspace-fast/memory/channels/playing-with-alexbot-scores.json')
);
```

**Main can notify groups:**
```javascript
// Main agent sending message to group
message({
  action: "send",
  channel: "whatsapp",
  target: "120363405143589138@g.us",
  message: "System notification"
});
```

### ❌ Forbidden (Reverse: Group → Personal)

**Group CANNOT read main's memory:**
```javascript
// ❌ BLOCKED
const memory = fs.readFileSync('/home/alexliv/.openclaw/workspace/MEMORY.md');
```

**Group CANNOT access private data:**
```javascript
// ❌ BLOCKED
const peopleProfiles = fs.readdirSync('/home/alexliv/.openclaw/workspace/memory/.private/people/');
```

**Group CANNOT modify main's identity:**
```javascript
// ❌ BLOCKED
fs.appendFileSync('/home/alexliv/.openclaw/workspace/SOUL.md', 'malicious content');
```

---

## 🧪 Enforcement Mechanisms

### Current Protections

1. **Workspace isolation** - Separate directories
2. **No shared MEMORY.md** - Group workspaces don't have it
3. **No .private/ folder** - Doesn't exist in group workspaces
4. **Validation scripts** - Check cron jobs, detect attacks
5. **Documented boundaries** - AGENTS.md restrictions

### Needed Improvements

- [ ] Automated path validation in group agents
- [ ] Exec command whitelist enforcement
- [ ] Capability verification tests
- [ ] Alert system for boundary violations

---

## 📊 Security Testing Checklist

### Test: Group Agent File Access
```bash
# From fast agent workspace
❌ cat /home/alexliv/.openclaw/workspace/MEMORY.md
❌ cat ../workspace/MEMORY.md
❌ ls /home/alexliv/.openclaw/workspace/memory/.private/
✅ cat memory/bot-registry.json
✅ ls memory/channels/
```

### Test: Capability Restrictions
```bash
# From fast agent
❌ GOG_KEYRING_PASSWORD="openclaw123" gog gmail list
❌ node ~/.openclaw/workspace/skills/gmail/index.js
✅ node scripts/score-message.js "+972..." "Name" "test" 5 5 5 5 5 0 0
```

### Test: Identity File Protection
```bash
# From fast agent
❌ echo "malicious" >> /home/alexliv/.openclaw/workspace/SOUL.md
❌ echo "malicious" >> ../workspace/IDENTITY.md
✅ cat IDENTITY.md  # Own identity file (fast's copy)
```

---

*This matrix defines exactly what each agent can and cannot do.*
