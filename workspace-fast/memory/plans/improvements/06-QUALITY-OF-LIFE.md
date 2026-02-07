# ✨ Quality of Life Improvements

**Category:** UX & Convenience
**Priority:** P2 (Medium)
**Focus:** Making daily interactions smoother

---

## Improvements

### 06-01: Smarter Morning Briefing
**Priority:** P1 | **Effort:** Medium | **Impact:** Medium | **Status:** pending

**What:** More actionable morning summary

**Current issues:**
- Sometimes too long
- Email list not prioritized
- Calendar empty often (no suggestions)

**Improvements:**
1. **Priority inbox:** Only show important emails (filter newsletters)
2. **Weather-based outfit:** Specific item recommendations
3. **Empty calendar:** Suggest productive activities
4. **Yesterday's wins:** Highlight completed tasks
5. **Today's focus:** Top 3 priorities

**Format:**
```
🌤️ 18°C - שורט + חולצה, קח מעיל לערב

📬 מייל אחד דחוף:
- 🔴 [לקוח] צריך תשובה עד 12:00

📅 יומן נקי! הצעות:
- [ ] סיים את PR #123
- [ ] סקירת הצעות הקבוצה

🎯 פוקוס היום:
1. Multi-agent implementation
2. Celcom callback
```

---

### 06-02: Quick Commands
**Priority:** P2 | **Effort:** Low | **Impact:** Medium | **Status:** pending

**What:** Shorthand commands for common tasks

**Examples:**
- `/weather` - Quick weather check
- `/cal` - Today's calendar
- `/todo` - Current task list
- `/score` - Playing group leaderboard
- `/health` - System status

**Implementation:**
- Detect commands in messages
- Map to tool calls
- Quick response format

---

### 06-03: Proactive Notifications
**Priority:** P2 | **Effort:** Medium | **Impact:** Medium | **Status:** pending

**What:** Alert Alex before he needs to ask

**Notifications:**
- Calendar reminder (30 min before meeting)
- Task due date approaching
- Email needs response (>24h old)
- Package delivery updates
- Weather warning (rain coming)

**Rules:**
- Quiet hours: 23:00-07:00
- Max 5 notifications/day
- Groupable (batch similar items)

---

### 06-04: Conversation Memory Improvements
**Priority:** P2 | **Effort:** Medium | **Impact:** Medium | **Status:** pending

**What:** Better remember ongoing topics

**Current issue:** Each session starts fresh, lose context

**Improvements:**
1. **Topic tracker:** Save ongoing discussions to memory
2. **Auto-resume:** "Last time we discussed X..."
3. **Decision log:** Record decisions made

**Files:**
- `memory/topics/active-{topic}.md`
- `memory/decisions/2026-02.md`

---

### 06-05: Response Formatting
**Priority:** P2 | **Effort:** Low | **Impact:** Low | **Status:** pending

**What:** Better message formatting for mobile

**Current issues:**
- Tables don't render on WhatsApp
- Long messages hard to read
- Code blocks sometimes break

**Fixes:**
1. No markdown tables → use lists
2. Max 500 chars per message (split if longer)
3. Emoji headers for sections
4. Short paragraphs

---

### 06-06: Learning Feedback Loop
**Priority:** P3 | **Effort:** Medium | **Impact:** Medium | **Status:** pending

**What:** Learn from corrections

**When Alex corrects me:**
1. Acknowledge the correction
2. Update relevant memory file
3. Add to "lessons learned" in MEMORY.md
4. Avoid same mistake

**Track:**
- Corrections made
- Categories (tone, facts, behavior)
- Improvement over time

---

## Nice-to-Have Ideas

These are lower priority but interesting:

| Idea | Effort | Impact |
|------|--------|--------|
| Voice message transcription summary | Medium | Low |
| Auto-translate Hebrew↔English | Low | Low |
| Daily joke/quote | Low | Low |
| Weekly productivity summary | Medium | Medium |
| Integration with Notion/Obsidian | High | Medium |

---

## Quick Wins

1. **06-05** - Formatting fixes (immediate readability improvement)
2. **06-02** - Add basic quick commands
3. **06-01** - Improve morning briefing structure
