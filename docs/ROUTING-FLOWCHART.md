# Message Routing Flowchart

Visual decision tree for message routing logic.

---

## 🎯 High-Level Flow

```
┌─────────────────────────────────────────┐
│ Need to send message                     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 1. Identify Context                      │
│  • Current agent (main/fast/bot-handler) │
│  • Session type (dm/group/cron)          │
│  • Recipient (Alex/group/investor/other) │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 2. Check Security (Agent Capabilities)   │
│  • Fast → Alex? BLOCK                    │
│  • Bot-handler → Alex? BLOCK             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 3. Get Routing Decision                  │
│  (routing-engine.sh)                     │
│  → reply | message_tool | BLOCK          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 4. Validate Routing                      │
│  (validate-message-routing.sh)           │
│  • Method correct?                       │
│  • Target correct?                       │
│  • Timing appropriate?                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 5. Log Decision                          │
│  (routing-log.jsonl)                     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 6. Send Message                          │
│  • Use reply OR                          │
│  • Call message tool                     │
└─────────────────────────────────────────┘
```

---

## 📋 Detailed Decision Tree

### When to use `reply` vs `message` tool?

```
Start: Need to send message to Alex
│
├─ Agent = fast?
│  └─ YES → ❌ BLOCK (fast cannot message Alex)
│
├─ Agent = bot-handler?
│  └─ YES → ❌ BLOCK (bot-handler cannot message Alex)
│
├─ Agent = main?
│  │
│  ├─ Session type = cron?
│  │  └─ YES → ✅ message tool with to: +972544419002
│  │
│  ├─ Session type = group?
│  │  └─ YES → ✅ message tool with to: +972544419002
│  │
│  ├─ Session type = dm?
│  │  │
│  │  ├─ Current DM = Alex (+972544419002)?
│  │  │  └─ YES → ✅ reply (safe to use reply)
│  │  │
│  │  └─ Current DM = someone else?
│  │     └─ YES → ✅ message tool with to: +972544419002
│  │
│  └─ Unknown session?
│     └─ ✅ message tool with to: +972544419002 (safest default)
```

---

## 🚨 Security Checks

```
Before sending ANY message:
│
├─ 1. Agent Capability Check
│  ├─ Can this agent use message tool? → validate-agent-capability.sh
│  └─ NO → BLOCK
│
├─ 2. Recipient Validation
│  ├─ Is recipient Alex?
│  │  └─ Target = +972544419002? (exact match)
│  │     └─ NO → ❌ ERROR: Wrong Alex number
│  │
│  ├─ Is recipient a group?
│  │  └─ Target ends with @g.us?
│  │     └─ NO → ❌ ERROR: Wrong group format
│  │
│  └─ Is recipient investor?
│     └─ Run investor-messaging-protocol?
│        └─ NO → ⚠️ WARNING: Skipped protocol
│
└─ 3. Timing Check
   ├─ Current hour 23:00-06:00?
   │  └─ Content = urgent/emergency?
   │     └─ NO → ⚠️ WARNING: Quiet hours
   │
   └─ Calendar-dependent message?
      └─ Verified in calendar?
         └─ NO → ⚠️ WARNING: Unverified event
```

---

## 📊 Common Scenarios

### Scenario 1: Cron Job Notification
```
Context:
  Agent: main
  Session: cron:morning-briefing
  Recipient: Alex

Decision Path:
  1. Agent = main ✅
  2. Session = cron → Use message tool
  3. Recipient = Alex → Target: +972544419002
  4. Validate: Method=message_tool, Target=+972544419002 ✅
  5. Send: message(action=send, to="+972544419002", message="...")

Result: ✅ Correct routing
```

### Scenario 2: Reply in Playing Group
```
Context:
  Agent: fast
  Session: group:120363405143589138@g.us
  Recipient: Group

Decision Path:
  1. Agent = fast ✅
  2. Session = group → Use message tool
  3. Recipient = Group → Target: 120363405143589138@g.us
  4. Validate: Method=message_tool, Target=120363405143589138@g.us ✅
  5. Send: Use reply (goes to current session = group) ✅

Result: ✅ reply is safe here (session = group)
```

### Scenario 3: Notify Alex from Group (COMMON BUG!)
```
Context:
  Agent: main
  Session: group:120363405143589138@g.us
  Recipient: Alex (wants to notify him)

❌ WRONG:
  Use reply → Goes to GROUP not Alex!

✅ CORRECT:
  1. Agent = main ✅
  2. Session = group → Use message tool
  3. Recipient = Alex → Target: +972544419002
  4. Validate: Method=message_tool ✅
  5. Send: message(action=send, to="+972544419002", message="...")

Result: ✅ Alex receives DM (not group message)
```

### Scenario 4: DM with Investor, Notify Alex
```
Context:
  Agent: main
  Session: dm:+972526802086 (Alon Lifshitz)
  Recipient: Alex (wants to notify about investor reply)

❌ WRONG:
  Use reply → Goes to INVESTOR not Alex!

✅ CORRECT:
  1. Agent = main ✅
  2. Session = dm:+972526802086 (not Alex)
  3. Recipient = Alex → Use message tool
  4. Target: +972544419002
  5. Validate: Method=message_tool ✅
  6. Send: message(action=send, to="+972544419002", message="...")

Result: ✅ Alex receives DM about investor (investor doesn't see it)
```

---

## 🔍 Debugging

### How to check routing decision?

```bash
# Source the routing engine
source scripts/lib/routing-engine.sh

# Test a scenario
decision=$(get_routing_decision "main" "cron:test" "Alex" "debug")
echo "Decision: $decision"
# Output: message_tool:+972544419002

# Validate it
if validate_routing "$decision" "main" "Alex"; then
    echo "Valid!"
else
    echo "Invalid!"
fi
```

### How to audit past routing?

```bash
# Run audit
bash scripts/audit-message-routing.sh

# Check recent routing log
tail -20 memory/routing-log.jsonl | jq .

# Find all blocks
cat memory/routing-log.jsonl | jq 'select(.method == "BLOCK")'

# Find all invalid attempts
cat memory/routing-log.jsonl | jq 'select(.decision | startswith("INVALID"))'
```

---

## 💡 Best Practices

1. **Always validate before sending**
   ```bash
   bash scripts/validate-message-routing.sh \
     --agent "main" \
     --session "$CURRENT_SESSION" \
     --recipient "$TARGET" \
     --method "message_tool"
   ```

2. **Log every routing decision**
   ```bash
   log_routing_decision "$AGENT" "$SESSION" "$RECIPIENT" "$DECISION" "$PURPOSE"
   ```

3. **Default to message tool when unsure**
   - `reply` can go to wrong person
   - `message tool` with explicit `to:` is safest

4. **Never bypass security checks**
   - Fast agent → Alex = ALWAYS blocked
   - No exceptions, no workarounds

5. **Audit regularly**
   ```bash
   bash scripts/audit-message-routing.sh --days 7
   ```

---

## 📚 Related Files

- `scripts/lib/routing-engine.sh` - Core decision logic
- `scripts/validate-message-routing.sh` - Pre-send validator
- `scripts/audit-message-routing.sh` - Audit reports
- `scripts/test-message-routing.sh` - Test suite
- `memory/routing-log.jsonl` - Routing decisions log
- `docs/WEEK-4-ROUTING-ARCHITECTURE.md` - Architecture overview
