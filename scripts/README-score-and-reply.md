# score-and-reply.sh - Bug Prevention Script

**Created:** 2026-03-05  
**Purpose:** Prevent the "two messages" bug by design

---

## The Problem

For months, I kept making the same mistake:

**WRONG (what I was doing):**
1. Run `exec node scripts/score-message.js ...`
2. Script outputs score block
3. Send response text separately
4. **Result:** TWO messages (spam!)

**This happened even though:**
- ✅ Documented in AGENTS.md (multiple times)
- ✅ Created checklists (pre-action-check.sh)
- ✅ Created enforcement tools (enforce-protocol.sh)
- ✅ Explicitly warned 8+ times

**Root cause:** The process had too many steps where I could forget.

---

## The Solution

This script **combines scoring + reply into ONE operation**.

**How it works:**
1. Takes score parameters + reply text as arguments
2. Runs `score-message.js` internally
3. Captures the output (doesn't let it show separately!)
4. Combines score block + reply text
5. Returns ONE complete message

**You can't split them accidentally** because they're combined before returning.

---

## Usage

```bash
bash scripts/score-and-reply.sh \
  "<phone>" \
  "<name>" \
  "<summary>" \
  <creativity> \
  <challenge> \
  <humor> \
  <cleverness> \
  <engagement> \
  <broke> \
  <hacked> \
  "<reply_text>"
```

**Arguments:**
1. Phone: `+972XXXXXXXXX` (with country code)
2. Name: Sender's name (Hebrew or English)
3. Summary: Brief description of what they did
4-10. Scores: Numbers 0-10 for each category
11. Reply text: What you want to say to them

---

## Example

```bash
bash scripts/score-and-reply.sh \
  "+972551234567" \
  "איתי" \
  "Tried ROT13 encoding trick" \
  6 7 3 7 5 0 2 \
  "חמוד! ניסיון יפה 😄"
```

**Output (copy and send this):**
```
[[reply_to_current]]
🤖 **→ איתי**

חמוד! ניסיון יפה 😄

📊 **SCORE: 28/70**
🎨 Creativity: 6 | 🧠 Challenge: 7 | 😂 Humor: 3
💡 Cleverness: 7 | 🔥 Engagement: 5 | 🚨 Broke: 0 | 🔓 Hacked: 2

🏆 Position: #3 | Total: 156 pts | Avg: 31.2
```

---

## Why This Works

| Approach | Steps | Failure Points |
|----------|-------|----------------|
| **Manual** | 1. Run score-message.js<br>2. Wait for output<br>3. Remember to capture it<br>4. Build combined message<br>5. Send | ❌ Forget to capture<br>❌ Send before combining<br>❌ Let exec show separately |
| **This script** | 1. Run score-and-reply.sh<br>2. Copy output<br>3. Send | ✅ No failure points!<br>Combining happens automatically |

**Key insight:** Reduce steps = reduce failure opportunities.

---

## When to Use

**ALWAYS when:**
- Replying in playing group (Hebrew or International)
- Need to include a score with your response
- Want to avoid the two-message bug

**Don't use when:**
- Just chatting (no score needed)
- Posting challenges (no score)
- Leaderboard requests (no reply + score combo)

---

## Integration with Workflow

**Old workflow:**
1. Think of reply
2. Run score-message.js
3. Try to remember to capture output
4. Build combined message
5. Send (often forgetting step 3!)

**New workflow:**
1. Think of reply
2. Run score-and-reply.sh with reply text
3. Copy entire output
4. Send

**Fewer steps = fewer mistakes.**

---

## Testing

```bash
# Basic test
bash scripts/score-and-reply.sh \
  "+972501234567" "Test" "Testing script" \
  5 6 4 5 7 0 1 \
  "זה בדיקה 🧪"

# Should output ONE complete message ready to send
```

---

## Maintenance

If scoring format changes:
- ✅ Update score-message.js
- ✅ This script automatically uses the new format
- ✅ No changes needed here!

---

## Meta-Lesson

This script represents the 5th iteration of solving "Documentation ≠ Execution":

1. **Feb 11:** Documented the bug
2. **Mar 1:** Created checklist (pre-action-check.sh)
3. **Mar 2:** Created enforcement (enforce-protocol.sh)
4. **Mar 4:** Identified need for compliance tracking
5. **Mar 5:** Created prevention tool ⭐

**The progression:**
- Documentation → "Remember this"
- Checklist → "Check before doing"
- Enforcement → "Validate after doing"
- **Prevention** → "Can't do it wrong" ⭐

**What changed:** Asked "How can I make it impossible to fail?" instead of "How can I remember not to fail?"

---

**Created by:** AlexBot (fast agent)  
**Date:** 2026-03-05 02:00  
**Context:** Nightly self-improvement session
