# Message Routing Integration Guide

How to use the routing system in practice.

---

## 🚀 Quick Start

### 1. Before Sending ANY Message

Always validate routing BEFORE calling `message` tool or using `reply`:

```bash
# Validate routing
bash scripts/validate-message-routing.sh \
  --agent "main" \
  --session "$CURRENT_SESSION" \
  --recipient "$TARGET" \
  --method "message_tool" \
  --content "$MESSAGE_TEXT"

# If exit code 0 → proceed
# If exit code != 0 → DON'T send, fix routing
```

### 2. Get Correct Routing Decision

```bash
# Source routing engine
source scripts/lib/routing-engine.sh

# Get decision
decision=$(get_routing_decision "$AGENT" "$SESSION" "$RECIPIENT" "$PURPOSE")

# Parse decision
if [[ "$decision" =~ ^BLOCK: ]]; then
    echo "Blocked! Reason: ${decision#BLOCK:}"
    exit 1
elif [[ "$decision" =~ ^message_tool:(.+)$ ]]; then
    target="${BASH_REMATCH[1]}"
    echo "Use message tool with target: $target"
    # Call: message(action=send, to="$target", message="...")
elif [[ "$decision" == "reply" ]]; then
    echo "Safe to use reply"
    # Use regular reply
fi
```

---

## 📋 Integration Patterns

### Pattern 1: Cron Jobs

**❌ WRONG:**
```
# Cron systemEvent prompt:
"Check emails and notify Alex if there's anything urgent"

# Reply in cron → Goes to last person in main session!
```

**✅ CORRECT:**
```
# Cron systemEvent prompt:
"Check emails. If urgent, use message tool with to: +972544419002 to notify Alex"

# In execution:
source scripts/lib/routing-engine.sh
decision=$(get_routing_decision "main" "cron:email-check" "Alex" "email_alert")
# Returns: message_tool:+972544419002

# Then call:
message(action=send, to="+972544419002", message="🚨 Urgent email from X")
```

### Pattern 2: Group Sessions

**❌ WRONG:**
```
# In playing group, want to notify Alex
# Use reply → Goes to GROUP not Alex!
```

**✅ CORRECT:**
```
# In playing group session
source scripts/lib/routing-engine.sh

# Get routing for notifying Alex
decision=$(get_routing_decision "main" "group:120363405143589138@g.us" "Alex" "notify")
# Returns: message_tool:+972544419002

# Send to Alex (NOT to group)
message(action=send, to="+972544419002", message="⚠️ High score in playing group!")

# THEN reply to group
reply_to_group_message
```

### Pattern 3: DM with Investor

**❌ WRONG:**
```
# In DM with Alon, want to update Alex
# Use reply → Goes to ALON not Alex!
```

**✅ CORRECT:**
```
# In DM with investor
source scripts/lib/routing-engine.sh

# Get routing for Alex
decision=$(get_routing_decision "main" "dm:+972526802086" "Alex" "investor_update")
# Returns: message_tool:+972544419002

# Notify Alex (separate DM)
message(action=send, to="+972544419002", message="💼 Alon replied about the fundraise")

# THEN reply to investor
message(action=send, to="+972526802086", message="Thanks for your feedback...")
```

### Pattern 4: Reply to Alex in His DM

**✅ CORRECT (Safe to use reply):**
```
# In DM with Alex (+972544419002)
source scripts/lib/routing-engine.sh

decision=$(get_routing_decision "main" "dm:+972544419002" "Alex" "response")
# Returns: reply

# Safe to use regular reply
"Your response here"
```

---

## 🔐 Security Integration

### Enforce Capability Checks

**Before ANY message send:**

```bash
# Check agent capabilities
bash scripts/validate-agent-capability.sh \
  --agent "$CURRENT_AGENT" \
  --action "message" \
  --target "$RECIPIENT"

if [ $? -ne 0 ]; then
    echo "❌ Agent $CURRENT_AGENT cannot message $RECIPIENT"
    exit 1
fi

# Then proceed with routing validation
bash scripts/validate-message-routing.sh ...
```

### Block Fast Agent from Alex

```bash
# In fast agent workspace (workspace-fast/)
if [[ "$RECIPIENT" == "Alex" ]] || [[ "$RECIPIENT" == "+972544419002" ]]; then
    echo "🚫 Fast agent cannot message Alex"
    exit 1
fi

# This is ENFORCED by routing-engine.sh automatically
```

---

## 📊 Logging & Monitoring

### Log Every Routing Decision

```bash
# After getting routing decision
source scripts/lib/routing-engine.sh

decision=$(get_routing_decision "$AGENT" "$SESSION" "$RECIPIENT" "$PURPOSE")

# Log it
log_routing_decision "$AGENT" "$SESSION" "$RECIPIENT" "$decision" "$PURPOSE"

# This creates entry in memory/routing-log.jsonl
```

### Daily Audit

```bash
# Add to cron (daily 22:00)
bash scripts/audit-message-routing.sh --days 1 > /tmp/routing-audit.txt

# If errors found, notify Alex
if grep -q "Failed\|BLOCK" /tmp/routing-audit.txt; then
    message(action=send, to="+972544419002", message="⚠️ Routing issues detected - see audit")
fi
```

---

## 🧪 Testing

### Test New Routing Scenario

```bash
# Add test to scripts/test-message-routing.sh

test_routing \
    "Your test description" \
    "agent_name" \
    "session_context" \
    "recipient" \
    "expected_decision"

# Run tests
bash scripts/test-message-routing.sh
```

### Manual Testing

```bash
# Test routing decision
source scripts/lib/routing-engine.sh

decision=$(get_routing_decision "main" "cron:test" "Alex" "test")
echo "Decision: $decision"
# Expected: message_tool:+972544419002

# Validate it
bash scripts/validate-message-routing.sh \
  --agent "main" \
  --session "cron:test" \
  --recipient "Alex" \
  --method "message_tool"

# Check exit code
echo "Exit code: $?"
# Expected: 0 (valid)
```

---

## 🐛 Debugging

### Check Why Message Went to Wrong Person

```bash
# 1. Check routing log
cat memory/routing-log.jsonl | jq 'select(.recipient == "Alex")' | tail -5

# 2. Look for wrong method
cat memory/routing-log.jsonl | jq 'select(.recipient == "Alex" and .method == "reply")'

# 3. Find the session context
cat memory/routing-log.jsonl | jq 'select(.recipient == "Alex") | .session' | tail -5

# 4. Reproduce the scenario
source scripts/lib/routing-engine.sh
decision=$(get_routing_decision "main" "SESSION_FROM_LOG" "Alex" "debug")
echo "Should have been: $decision"
```

### Find All Routing Mistakes

```bash
# All blocks
cat memory/routing-log.jsonl | jq 'select(.method == "BLOCK")'

# All invalid routing
cat memory/routing-log.jsonl | jq 'select(.decision | startswith("INVALID"))'

# Wrong targets
cat memory/routing-log.jsonl | jq 'select(.recipient == "Alex" and .target != "+972544419002")'
```

---

## 📚 Common Mistakes & Fixes

### Mistake 1: Using `reply` from Cron

**Symptom:** Cron message goes to random person

**Fix:**
```bash
# DON'T use reply in cron
# ALWAYS use message tool with explicit to:

message(action=send, to="+972544419002", message="...")
```

### Mistake 2: Using `reply` from Group to Notify Alex

**Symptom:** Message goes to group instead of Alex's DM

**Fix:**
```bash
# In group session, notify Alex:
message(action=send, to="+972544419002", message="...")

# THEN reply to group:
"Your group reply"
```

### Mistake 3: Wrong Phone Number for Alex

**Symptom:** Message goes to someone with similar name

**Fix:**
```bash
# ALWAYS use exact number
to: "+972544419002"

# NOT:
# - "Alex"
# - "Alexander"
# - "+972528897849" (wrong person!)
```

### Mistake 4: Fast Agent Trying to Message Alex

**Symptom:** Security block

**Fix:**
```bash
# Fast agent CANNOT message Alex
# This is BY DESIGN - security boundary

# If fast needs to notify Alex:
# 1. Log to shared file
# 2. Main agent reads log
# 3. Main agent messages Alex
```

---

## 🎯 Best Practices Checklist

Before sending EVERY message:

- [ ] ✅ Identified current agent (main/fast/bot-handler)
- [ ] ✅ Identified session context (dm/group/cron + ID)
- [ ] ✅ Identified recipient (exact phone/group ID)
- [ ] ✅ Called `validate-message-routing.sh` to check routing
- [ ] ✅ Used correct method (reply vs message tool)
- [ ] ✅ Used correct target (exact phone number)
- [ ] ✅ Logged routing decision
- [ ] ✅ Checked timing (not 23:00-06:00 unless urgent)
- [ ] ✅ For Alex: verified target is +972544419002
- [ ] ✅ For investors: ran investor-messaging-protocol

---

## 📖 Quick Reference

| Scenario | Agent | Session | Recipient | Method | Target |
|----------|-------|---------|-----------|--------|--------|
| Cron → Alex | main | cron:* | Alex | message_tool | +972544419002 |
| Group → Alex | main | group:* | Alex | message_tool | +972544419002 |
| DM with Alex → Alex | main | dm:+972544419002 | Alex | reply | - |
| DM with other → Alex | main | dm:OTHER | Alex | message_tool | +972544419002 |
| Group → Group | fast | group:* | Group | reply | - |
| Fast → Alex | fast | ANY | Alex | **BLOCKED** | - |
| Bot → Alex | bot-handler | ANY | Alex | **BLOCKED** | - |

---

## 🔗 Related Documentation

- [ROUTING-FLOWCHART.md](./ROUTING-FLOWCHART.md) - Visual decision trees
- [WEEK-4-ROUTING-ARCHITECTURE.md](./WEEK-4-ROUTING-ARCHITECTURE.md) - Architecture overview
- [SECURITY-BOUNDARIES.md](./SECURITY-BOUNDARIES.md) - Security model
- [CAPABILITY-MATRIX.md](./CAPABILITY-MATRIX.md) - Agent permissions

---

**Remember:** When in doubt, use `message` tool with explicit `to:` parameter. It's the safest option.
