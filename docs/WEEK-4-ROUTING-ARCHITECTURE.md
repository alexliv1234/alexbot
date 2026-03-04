# Week 4: Smart Message Routing Architecture

## 🎯 Goal
Fix routing bugs + integrate security validation + add monitoring

---

## 🐛 Identified Routing Bugs

### Bug #1: Reply Goes to Wrong Person
**Problem:** `reply` sends to whoever triggered the current session
**Example:** Cron job runs in main session → reply goes to last DM contact (not Alex)
**Fix:** Explicit routing decision tree + validation

### Bug #2: Cron Job Routing
**Problem:** systemEvent prompts don't specify WHERE to send output
**Example:** "Check media and notify Alex" → sends to group instead
**Fix:** All cron jobs MUST use `message` tool with explicit `to: +972544419002`

### Bug #3: Narration Instead of Action
**Problem:** Describing what I'll send instead of actually calling `message` tool
**Example:** "✅ Replied to Eran" → never actually sent message
**Fix:** Runtime check that `message` tool was called

### Bug #4: Session Context Confusion
**Problem:** Multiple sessions (main/fast/bot-handler) share context
**Example:** Reply in fast session goes to group, not to Alex
**Fix:** Session-aware routing with explicit agent checks

---

## 🏗️ Architecture

### **Component 1: Routing Decision Engine**

**File:** `scripts/lib/routing-engine.sh`

**Input:**
- Current agent (main/fast/bot-handler)
- Current session context (chat_id, channel, chat_type)
- Intended recipient (Alex, group, investor, etc.)
- Message purpose (reply, notify, alert, etc.)

**Output:**
- Route decision (use reply | use message tool | BLOCK)
- Target validation (correct phone/group ID)
- Logging metadata

**Logic:**
```
IF agent=fast AND recipient=Alex
  → BLOCK (fast can't message Alex)

IF agent=main AND current_session=group AND recipient=Alex
  → Use message tool with to: +972544419002

IF agent=main AND current_session=dm:Alex AND recipient=Alex
  → Use reply

IF agent=main AND current_session=cron AND recipient=Alex
  → Use message tool with to: +972544419002

IF agent=main AND recipient=investor
  → Validate via investor-messaging-protocol

ELSE
  → Default to message tool with explicit target
```

### **Component 2: Pre-Send Validator**

**File:** `scripts/validate-message-routing.sh`

**Checks:**
1. ✅ Is recipient correct? (phone number validation)
2. ✅ Is agent allowed to send to this recipient?
3. ✅ Is method correct (reply vs message tool)?
4. ✅ Does content pass security checks?
5. ✅ Is timing appropriate (not midnight, etc.)?

**Usage:**
```bash
bash scripts/validate-message-routing.sh \
  --agent "main" \
  --session "dm:+972528897849" \
  --recipient "+972544419002" \
  --method "reply" \
  --content "Hello Alex"
```

**Exit Codes:**
- `0` - Valid routing
- `1` - Invalid routing (wrong recipient/method)
- `2` - Security block (agent not allowed)
- `3` - Timing block (inappropriate time)

### **Component 3: Message Interceptor**

**File:** `scripts/lib/message-interceptor.sh`

**Purpose:** Catch common routing mistakes at runtime

**Intercepts:**
1. Using `reply` when should use `message` tool
2. Using wrong phone number for Alex
3. Sending to group when meant for Alex
4. Missing `to:` parameter in message tool

**Integration Point:** Called BEFORE any message send

### **Component 4: Routing Logger**

**File:** `memory/routing-log.jsonl`

**Logs:**
- Timestamp
- Agent
- Session context
- Recipient (intended vs actual)
- Method (reply vs message tool)
- Validation result
- Delivery status

**Example Entry:**
```json
{
  "timestamp": "2026-03-04T10:30:00Z",
  "agent": "main",
  "session": "cron:morning-briefing",
  "intended_recipient": "Alex",
  "method": "message_tool",
  "target": "+972544419002",
  "validation": "passed",
  "delivered": true
}
```

### **Component 5: Routing Audit Report**

**File:** `scripts/audit-message-routing.sh`

**Generates:**
- Routing success rate
- Common mistakes
- Security blocks
- Recipient distribution

**Output:**
```
📊 Message Routing Audit (Last 7 Days)

✅ Successful: 142/150 (94.7%)
❌ Failed: 8/150 (5.3%)

Failed Breakdown:
- Wrong recipient: 3
- Security block: 2
- Timing block: 2
- Method mismatch: 1

Top Recipients:
1. Alex (+972544419002): 120 messages
2. Playing Group: 18 messages
3. Learning Group: 7 messages
4. Investors: 5 messages
```

---

## 🔐 Security Integration

### Capability Check Integration

**When sending message:**
1. Check sender agent (main/fast/bot-handler)
2. Validate recipient via `validate-agent-capability.sh`
3. Block if agent lacks messaging permission
4. Log attempt

**Example:**
```bash
# Before calling message tool
bash scripts/validate-agent-capability.sh \
  --agent "fast" \
  --action "message" \
  --target "+972544419002"

# Exit code 1 (denied) → BLOCK
```

---

## 📊 Monitoring

### Real-Time Alerts

**Alert Conditions:**
1. Message to wrong recipient (not intended target)
2. Security block (agent tried unauthorized send)
3. Repeated routing failures (>3 in 1 hour)
4. Critical contact timeout (investor no response >2h)

**Alert Method:** 
- Append to `memory/routing-alerts.jsonl`
- Weekly digest to Alex

### Weekly Digest

**Content:**
- Routing success rate
- Top mistakes
- Security blocks
- Recipient distribution
- Recommendations for improvement

---

## 🛠️ Implementation Plan

### Phase 1: Core Routing Engine (30 min)
- [ ] Create `routing-engine.sh` with decision logic
- [ ] Create `validate-message-routing.sh`
- [ ] Test with sample scenarios

### Phase 2: Message Interceptor (20 min)
- [ ] Create `message-interceptor.sh`
- [ ] Add validation hooks
- [ ] Test interception

### Phase 3: Logging & Monitoring (20 min)
- [ ] Set up `routing-log.jsonl`
- [ ] Create `audit-message-routing.sh`
- [ ] Add alert conditions

### Phase 4: Security Integration (15 min)
- [ ] Integrate capability validator
- [ ] Add agent checks
- [ ] Test security blocks

### Phase 5: Documentation & Testing (15 min)
- [ ] Create routing flowcharts
- [ ] Write test suite
- [ ] Validate all paths

**Total Estimated Time:** ~100 minutes

---

## ✅ Success Criteria

1. **Zero Wrong Recipients**
   - All messages to Alex go to +972544419002
   - No more "reply" bugs from cron/groups

2. **Security Enforcement**
   - Fast agent can't message Alex
   - Capability validator integrated
   - All blocks logged

3. **Full Visibility**
   - Every message logged
   - Routing decisions transparent
   - Audit trail complete

4. **Proactive Detection**
   - Alerts on routing failures
   - Weekly digest
   - Pattern identification

---

## 📁 Files to Create

1. `scripts/lib/routing-engine.sh` - Core decision logic
2. `scripts/validate-message-routing.sh` - Pre-send validator
3. `scripts/lib/message-interceptor.sh` - Runtime interception
4. `scripts/audit-message-routing.sh` - Reporting
5. `memory/routing-log.jsonl` - Message log
6. `memory/routing-alerts.jsonl` - Alert log
7. `docs/ROUTING-FLOWCHART.md` - Visual documentation
8. `scripts/test-message-routing.sh` - Test suite

---

**Next:** Implement Phase 1 - Core Routing Engine
