# Week 3: Security Boundary Enforcement - Integration Guide

## What We Built

Week 3 establishes **security boundaries** between personal and group agents to prevent compromise escalation.

### Key Components

1. **Security Documentation**
   - `docs/SECURITY-BOUNDARIES.md` - Architecture and isolation model
   - `docs/ATTACK-SURFACE-ANALYSIS.md` - Vulnerability analysis and mitigation

2. **Capability System**
   - `config/agent-capabilities.json` - Defines what each agent can do
   - `scripts/validate-agent-capability.sh` - Runtime validation tool

3. **Testing**
   - `scripts/test-capability-validator.sh` - 37 test cases (all passing ✅)

---

## How It Works

### Agent Types

| Agent | Workspace | Threat Model | Capabilities |
|-------|-----------|--------------|--------------|
| **main** | `workspace/` | Trusted (Alex only) | Full access - files, email, calendar, exec, cron, gateway |
| **fast** | `workspace-fast/` | Adversarial (groups) | Restricted - group data, scoring, templates only |
| **bot-handler** | `workspace/` | Untrusted (unknown DMs) | Minimal - bot registry only |

### Isolation Mechanisms

**Layer 1: Workspace Separation**
- Different root directories prevent accidental file access
- `main` → `/home/alexliv/.openclaw/workspace/`
- `fast` → `/home/alexliv/.openclaw/workspace-fast/`

**Layer 2: Capability Validation**
- Each agent has explicit allow-list of capabilities
- Operations validated before execution
- Denied by default (principle of least privilege)

**Layer 3: Blocked Paths**
- Group agents have explicit blocked paths (MEMORY.md, people/, .private/, etc.)
- Even if workspace separation fails, these are double-blocked

**Layer 4: Tool Restrictions**
- Group agents don't have access to dangerous tools (exec, cron, gateway)
- Not just policy - tools unavailable at runtime

**Layer 5: Message Routing**
- Groups can only message their own group
- Personal agent required for Alex DMs
- Prevents data exfiltration via messaging

---

## Using the Validator

### Command Line

```bash
# Check if agent can read a file
bash scripts/validate-agent-capability.sh <agent> file_read <path>

# Check if agent can write a file
bash scripts/validate-agent-capability.sh <agent> file_write <path>

# Check if agent can use a tool
bash scripts/validate-agent-capability.sh <agent> tool <tool_name>

# Check if agent can message a recipient
bash scripts/validate-agent-capability.sh <agent> message <recipient>

# Check if agent can access data type
bash scripts/validate-agent-capability.sh <agent> data <data_type>
```

### Exit Codes

- **0** - ALLOWED (green checkmark)
- **1** - DENIED (red X)
- **2** - ERROR (unknown operation/agent)

### Examples

```bash
# ✅ ALLOWED
bash scripts/validate-agent-capability.sh main file_read workspace/MEMORY.md
# Exit 0: ✅ ALLOWED: Agent 'main' has full read access

# 🚫 DENIED
bash scripts/validate-agent-capability.sh fast file_read workspace/MEMORY.md
# Exit 1: 🚫 DENIED: Path not in allowed list for agent 'fast'

# ✅ ALLOWED
bash scripts/validate-agent-capability.sh fast file_read workspace/scripts/group-manager.js
# Exit 0: ✅ ALLOWED: Path matches pattern 'workspace/scripts/group-manager.js'

# 🚫 DENIED
bash scripts/validate-agent-capability.sh fast tool exec
# Exit 1: 🚫 DENIED: Tool 'exec' not available for agent 'fast'

# 🚫 DENIED
bash scripts/validate-agent-capability.sh fast message +972544419002
# Exit 1: 🚫 DENIED: Agent 'fast' cannot send to Alex's DM
```

---

## Integration with OpenClaw

### Current State (Week 3)

**What's enforced:**
- ✅ Workspace separation (already existed)
- ✅ Capability validation tool (NEW - can validate manually)
- ✅ Blocked path definitions (documented)
- ✅ Tool restrictions (documented)

**What's NOT enforced yet:**
- ❌ Automatic validation before file operations
- ❌ Automatic validation before tool calls
- ❌ Runtime message routing restrictions
- ❌ Monitoring and alerting

### Future Integration (Week 4+)

To make this **automatic** (not manual checks), we need:

1. **OpenClaw Core Changes**
   - Modify `Read` tool to call validator before file access
   - Modify `Write` tool to call validator before file write
   - Modify `exec` tool to check agent type (disable for groups)
   - Modify `cron` tool to check session type (disable for groups)
   - Modify `message` tool to validate recipient against agent capabilities

2. **Agent Config Integration**
   - Add `capabilitiesFile` to agent config
   - Load capabilities on agent startup
   - Fail-safe: if capabilities undefined, deny everything except basic reply

3. **Monitoring**
   - Log all boundary violation attempts
   - Alert Alex on suspicious patterns
   - Weekly security audit report

---

## Testing

### Run Full Test Suite

```bash
bash scripts/test-capability-validator.sh
```

Expected output:
```
🧪 Testing Agent Capability Validator
======================================

📂 File Access Tests (12 tests)
🔧 Tool Access Tests (11 tests)
💬 Messaging Tests (5 tests)
📊 Data Access Tests (9 tests)

======================================
📊 Test Summary
======================================
Passed: 37
Failed: 0
Total:  37

✅ All tests passed!
```

### Manual Testing Scenarios

**Test 1: Workspace Isolation**
```bash
# Should DENY (fast can't read personal files)
bash scripts/validate-agent-capability.sh fast file_read workspace/MEMORY.md

# Should ALLOW (fast can read its own workspace)
bash scripts/validate-agent-capability.sh fast file_read workspace-fast/AGENTS.md
```

**Test 2: Tool Restrictions**
```bash
# Should DENY (fast can't exec)
bash scripts/validate-agent-capability.sh fast tool exec

# Should ALLOW (main can exec)
bash scripts/validate-agent-capability.sh main tool exec
```

**Test 3: Message Routing**
```bash
# Should DENY (fast can't message Alex)
bash scripts/validate-agent-capability.sh fast message +972544419002

# Should ALLOW (main can message Alex)
bash scripts/validate-agent-capability.sh main message +972544419002
```

---

## Capability Configuration

### Adding New Agent

1. Open `config/agent-capabilities.json`
2. Add new agent entry:
   ```json
   "new-agent": {
     "description": "What this agent does",
     "threatModel": "trusted|adversarial|untrusted",
     "workspace": "/path/to/workspace",
     "capabilities": {
       "fileAccess": { ... },
       "tools": { ... },
       "messaging": { ... },
       "dataAccess": { ... }
     }
   }
   ```
3. Run tests: `bash scripts/test-capability-validator.sh`

### Modifying Capabilities

**Example: Allow fast agent to use TTS**
```json
"fast": {
  "capabilities": {
    "tools": {
      "tts": true  // Changed from false
    }
  }
}
```

**Example: Add new blocked path**
```json
"fast": {
  "blockedPaths": [
    "workspace/MEMORY.md",
    "workspace/memory/people/*",
    "workspace/NEW-SENSITIVE-FILE.md"  // NEW
  ]
}
```

---

## Security Implications

### What's Protected

✅ **MEMORY.md** - Personal long-term memory (fast cannot read)
✅ **People profiles** - Contact info and notes (fast cannot read)
✅ **Private data** - Call recordings, employee lists, investor data (fast cannot access)
✅ **Email/Calendar** - Gmail and Google Calendar (fast cannot use)
✅ **Command execution** - Shell commands (fast cannot execute)
✅ **Cron jobs** - Automated tasks (fast cannot create)
✅ **Gateway config** - OpenClaw settings (fast cannot modify)
✅ **Message to Alex** - DMs to Alex (fast cannot send)

### What's Shared (Safely)

✅ **Group scoring data** - Public leaderboards (both can read/write)
✅ **Bot registry** - Registered bots (both can read)
✅ **Public templates** - Morning messages, challenges (fast reads, main creates)
✅ **Channel memory** - Group-specific context (fast can read/write its own groups)
✅ **Skills (public)** - SKILL.md files (both can read)
✅ **Docs** - Public documentation (both can read)

### Attack Resistance

**Scenario: Group member compromises "משחקים עם אלכס הבוט"**

- **Before Week 3:**
  - Could potentially read MEMORY.md (no enforcement)
  - Could try to execute commands (documented rule only)
  - Could create cron jobs (validator exists but manual)
  - Could send messages to Alex (routing bug risk)

- **After Week 3:**
  - ✅ MEMORY.md access validated and denied
  - ✅ Tool restrictions validated and denied
  - ✅ Messaging to Alex validated and denied
  - ✅ File paths validated against blocked list
  - ⚠️ Still need automatic enforcement (Week 4)

---

## Maintenance

### Regular Tasks

**Monthly Security Audit:**
```bash
# 1. Review capability config
cat config/agent-capabilities.json | jq '.agents.fast.blockedPaths'

# 2. Run test suite
bash scripts/test-capability-validator.sh

# 3. Check for new sensitive files
find workspace/memory -type f -name "*.json" -o -name "*.md" | grep -E "(private|employee|investor|call-recording)"

# 4. Review attack surface
cat docs/ATTACK-SURFACE-ANALYSIS.md | grep "CRITICAL\|HIGH"
```

**After Adding Sensitive Data:**
1. Add path to `blockedPaths` in config
2. Add test case to test suite
3. Run tests to verify
4. Document in SECURITY-BOUNDARIES.md

**After Security Incident:**
1. Document in MEMORY.md (Lessons Learned)
2. Update ATTACK-SURFACE-ANALYSIS.md
3. Add blocking rule if needed
4. Create test case for the attack
5. Verify test fails before fix, passes after

---

## Troubleshooting

### "Permission denied" when running validator

```bash
chmod +x scripts/validate-agent-capability.sh
chmod +x scripts/test-capability-validator.sh
```

### Config not found

```bash
# Check if config exists
ls -l config/agent-capabilities.json

# If missing, restore from git
git checkout config/agent-capabilities.json
```

### Tests failing

```bash
# Re-run with verbose output
bash -x scripts/test-capability-validator.sh 2>&1 | less

# Check specific failing test manually
bash scripts/validate-agent-capability.sh fast file_read workspace/MEMORY.md
echo "Exit: $?"
```

### jq errors

```bash
# Validate JSON syntax
jq . config/agent-capabilities.json > /dev/null && echo "✅ Valid" || echo "❌ Invalid"

# Pretty-print to find errors
jq . config/agent-capabilities.json
```

---

## Status

**Week 3 Complete: Security Boundary Enforcement** ✅

**Deliverables:**
- [x] Security architecture documentation
- [x] Attack surface analysis
- [x] Capability configuration system
- [x] Validation tool
- [x] 37 passing test cases
- [x] Integration guide

**Next: Week 4 - Smart Message Routing**

Week 4 will integrate these validations into OpenClaw core for automatic enforcement.

---

**Created:** 2025-02-28
**Last Updated:** 2025-02-28
**Status:** Complete
