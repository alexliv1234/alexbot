# PROACTIVE-MESSAGING-PROTOCOL.md

## Problem
Generic "good morning" messages without context/value = noise, not signal.

## Solution
Every proactive message (morning briefings, updates, check-ins) must include research and personalization.

---

## 🚨 MANDATORY BEFORE ANY PROACTIVE MESSAGE TO ALEX

### Step 1: Research Recent Context (5-10 min)

**A. Read recent history:**
```bash
# Last 2 days of conversations
ls -t memory/2026-*.md | head -2 | xargs cat

# Recent investor interactions
ls -t memory/investor-interactions/*.md 2>/dev/null | head -3 | xargs cat

# Active priorities from MEMORY.md
grep -A 20 "## Active Priorities" MEMORY.md
```

**B. Search relevant news:**
```bash
# Tech/AI news (especially Claude, AI agents, fundraising)
web_search("AI agents funding news", count=5, freshness="pd")
web_search("Claude AI updates", count=3, freshness="pw")

# Israel news (only if major events - wars, tech ecosystem)
web_search("Israel tech news", count=3, freshness="pd")

# Banking/fintech (Esh Group relevant)
web_search("banking technology news", count=3, freshness="pw")
```

**C. Check active context:**
- Calendar: Any meetings today? What's the prep status?
- Tasks: What's in MEMORY.md Active Priorities?
- Projects: What's Alex working on? (Esh, fundraising, personal)

### Step 2: Synthesize Insights

**Ask yourself:**
1. What did we discuss yesterday/recently?
2. What news is relevant to Alex's interests? (AI, tech, banking, fundraising)
3. What's on his plate today?
4. What can I proactively help with?

### Step 3: Compose Valuable Message

**Format:**
```
🤖 בוקר טוב!

[Relevant news item or insight from research]

[Connection to his current work/interests]

[Today's context: meetings/tasks if relevant]

[Optional: Proactive offer to help with something specific]
```

**Examples of GOOD morning messages:**
- "ראיתי ש-Anthropic הכריזו על Claude 4.5 אתמול - רלוונטי לפיצ׳ שלנו על trained intelligence vs raw models. רוצה שאעדכן את החומרים?"
- "Sequoia פרסמה מחקר חדש על AI agents market - $50B עד 2027. זה תומך בתזה שלנו. יש לך פגישה עם Alon השבוע?"
- "לפני ההליכה עם רון - ראיתי שהוא שלח אתמול מייל על התקציב. רוצה סיכום מהיר לפני שאתה נפגש איתו?"

**Examples of BAD morning messages (NEVER):**
- ❌ "איך ישנת הלילה?" (generic, no value)
- ❌ "יש לך יום עמוס היום!" (obvious, no insight)
- ❌ "בהצלחה בהליכה!" (filler)

### Step 4: Learn & Update

**After each interaction with Alex:**
1. What did I learn about his interests?
2. What feedback did he give?
3. What should I remember for next time?

**Update MEMORY.md:**
```bash
# Add to "Preferences Discovered" or relevant section
# Example: "Prefers news connected to active projects, not general updates"
```

---

## 🎯 Key Principles

1. **Signal over Noise** - Only message if I have something valuable to say
2. **Research First** - Always search news/context before composing
3. **Personalize** - Connect to his current work/interests/priorities
4. **Actionable** - Offer specific help, not vague pleasantries
5. **Learn Continuously** - Each interaction teaches me what matters to him

---

## When to Use This Protocol

- ✅ Morning briefings
- ✅ Proactive updates
- ✅ Check-ins about projects
- ✅ News alerts I think he should know
- ❌ Responses to his direct messages (different context)
- ❌ Automated cron notifications (system messages)

---

## Validation Before Sending

**Ask yourself:**
1. Did I research recent context? (history + news + calendar)
2. Is this message valuable or just noise?
3. Does it connect to his current interests/work?
4. Would I want to receive this message?

**If any answer is "no" → Don't send, or improve first.**

---

*Created: 2026-03-04*
*Triggered by: Alex feedback on generic morning message*
