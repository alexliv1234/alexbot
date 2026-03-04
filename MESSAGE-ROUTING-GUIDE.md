# MESSAGE ROUTING GUIDE
*Week 4: Smart Message Routing - Decision Trees & Best Practices*

## 🎯 The Core Problem

**"reply" is context-dependent** - it goes to whoever/whatever triggered the current session.

This causes bugs when:
- In group session → "reply" goes to group (not Alex)
- In cron job → "reply" goes to last person who triggered main session
- In DM session → "reply" goes to that DM sender (might not be Alex)

## 🔍 Decision Tree: How to Send Messages

```
START: I want to send a message
│
├─ To ALEX specifically?
│  ├─ YES → Are you in MAIN session or Alex's DM session?
│  │  ├─ YES → ✅ Use "reply" (safe)
│  │  └─ NO (group/cron/other DM) → ✅ Use message tool with to:+972544419002
│  └─ NO → Continue to next check
│
├─ To current CHAT/GROUP (public reply)?
│  ├─ In group session → ✅ Use "reply" (goes to group)
│  ├─ In main session → ❌ Can't reply to group from main
│  └─ In DM session → ✅ Use "reply" (goes to that DM)
│
└─ To SOMEONE ELSE (parent/investor/bot)?
   └─ ALWAYS use message tool with specific target
```

## 📊 Routing Matrix

| From Session | To | Method | Safe? |
|--------------|----|---------| ------|
| **Main** | Alex | `reply` | ✅ Yes |
| **Main** | Anyone else | `message tool` | ✅ Yes |
| **Alex DM** | Alex | `reply` | ✅ Yes |
| **Alex DM** | Anyone else | `message tool` | ✅ Yes |
| **Group** | Group (public) | `reply` | ✅ Yes |
| **Group** | Alex (private) | `message tool` | ✅ Yes |
| **Group** | Alex (private) | `reply` | 🚨 **BUG** - goes to group! |
| **Other DM** | That person | `reply` | ✅ Yes |
| **Other DM** | Alex | `message tool` | ✅ Yes |
| **Other DM** | Alex | `reply` | 🚨 **BUG** - goes to DM sender! |
| **Cron** | Alex | `message tool` | ✅ Yes |
| **Cron** | Alex | `reply` | 🚨 **BUG** - unpredictable! |

## 🛡️ Safety Rules

### Rule 1: Validate Before Sending
**ALWAYS run validator before sending:**
```bash
bash scripts/validate-message-routing.sh "<session>" "<target>" "<method>"
```

### Rule 2: When in Doubt, Use Message Tool
If you're not 100% sure where "reply" goes → use message tool with explicit target.

### Rule 3: Alex = +972544419002
**NEVER confuse with:**
- +972528897849 (Alexander L - different person!)
- Any other similar names

### Rule 4: Cron Jobs = Message Tool Only
**ABSOLUTE RULE:** Cron jobs MUST use message tool to reach Alex.
- Cron runs in main session
- Main session target = whoever last triggered it
- Could send Alex's private data to wrong person

### Rule 5: Group Sessions = Public by Default
Any "reply" in group session = public message to entire group.
- To notify Alex from group → use message tool
- To reply in group publicly → use "reply"

## 🔧 Common Scenarios

### Scenario 1: Playing Group Score Reply
**Context:** In playing group, want to reply WITH score publicly
```
Method: "reply"
Target: The group (public)
Validation: ✅ Safe - public reply intended
```

### Scenario 2: Playing Group → Notify Alex
**Context:** In playing group, found bug and want to notify Alex privately
```
Method: message tool
Target: +972544419002
Validation: ✅ Safe - explicit private message
Example:
  message(action=send, channel=whatsapp, to=+972544419002, message="🤖 Alert: Bug found in group...")
```

### Scenario 3: Cron Job Morning Briefing
**Context:** Cron job wants to send morning briefing to Alex
```
Method: message tool
Target: +972544419002
Validation: ✅ Safe - explicit target from cron
Example:
  message(action=send, channel=whatsapp, to=+972544419002, message="🌅 Morning briefing...")
```

### Scenario 4: Main Session Regular Chat
**Context:** Alex asks question in main session webchat
```
Method: "reply"
Target: Main session (Alex)
Validation: ✅ Safe - main session = Alex
```

### Scenario 5: Investor DM
**Context:** Investor (+972525214507) asks question
```
To reply to investor:
  Method: "reply"
  Target: That DM session
  Validation: ✅ Safe - replying in context

To notify Alex about investor:
  Method: message tool
  Target: +972544419002
  Validation: ✅ Safe - separate notification
```

## 🚨 Common Bugs (Real Examples)

### Bug #1: Group → Alex via Reply
```
❌ WRONG:
  Session: whatsapp:group:120363405143589138@g.us
  Intent: Notify Alex about something
  Method: "reply"
  Result: Message goes to GROUP, not Alex!

✅ CORRECT:
  message(action=send, to=+972544419002, message="...")
```

### Bug #2: Cron → Alex via Reply
```
❌ WRONG:
  Session: cron (runs in main)
  Intent: Send morning briefing to Alex
  Method: "reply"
  Result: Goes to last person who triggered main! (Could be investor, parent, anyone)

✅ CORRECT:
  message(action=send, to=+972544419002, message="...")
```

### Bug #3: Wrong Alexander
```
❌ WRONG:
  Target: +972528897849 (Alexander L)
  Intent: Message Alex
  Method: message tool
  Result: Wrong person gets message!

✅ CORRECT:
  Target: +972544419002 (Alex Liverant)
```

## 📝 Pre-Send Checklist

Before EVERY message that's not a direct reply in main session:

1. ✅ **Identify current session type** (main/group/dm/cron)
2. ✅ **Identify intended target** (Alex/group/specific person)
3. ✅ **Choose method** (reply vs message tool)
4. ✅ **Run validator** (`validate-message-routing.sh`)
5. ✅ **Verify target phone** (if Alex: +972544419002)
6. ✅ **Send message**

## 🔬 Testing Your Understanding

**Quiz:**

1. You're in "משחקים עם אלכס הבוט" group and want to notify Alex about a security issue.
   - Method? **message tool**
   - Target? **+972544419002**

2. You're in main session and Alex asks a question.
   - Method? **reply**
   - Safe? **Yes**

3. A cron job needs to send daily summary to Alex.
   - Method? **message tool**
   - Why not reply? **Cron in main = unpredictable target**

4. You're in investor DM and want to both reply to investor AND notify Alex.
   - Reply to investor: **"reply"**
   - Notify Alex: **message tool to +972544419002**
   - How many messages? **Two separate messages**

## 🛠️ Integration with Existing Tools

### With notify-alex.sh
```bash
# Safe wrapper that ONLY sends to Alex
bash scripts/notify-alex.sh "Message content"
# Internally uses message tool with to:+972544419002
```

### With Cron Jobs
All cron job `payload.text` should include:
```
"Use message tool with to:+972544419002 to send results to Alex. NEVER use 'reply' from cron."
```

### With Auto-Detect-Context
```bash
bash scripts/auto-detect-context.sh "$CHAT_ID" "$CHANNEL" "$TARGET"
# Shows which protocol to use + routing method
```

## 📊 Monitoring (Week 4 Addition)

All routing decisions logged to: `memory/routing-log.jsonl`

Format:
```json
{
  "timestamp": "2026-03-04T10:30:00Z",
  "session_type": "group",
  "session_target": "120363405143589138@g.us",
  "intended_target": "+972544419002",
  "method": "message_tool",
  "validation_result": "pass",
  "action": "sent"
}
```

Analyze patterns:
```bash
# Count routing bugs caught
jq 'select(.validation_result == "fail")' memory/routing-log.jsonl | wc -l

# Most common session types
jq -r '.session_type' memory/routing-log.jsonl | sort | uniq -c | sort -rn
```

---

**Last Updated:** 2026-03-04 (Week 4)
**Status:** Active - Runtime enforcement enabled
