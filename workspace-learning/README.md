# Learning Group Analytics System

**Status:** ✅ Fully implemented (2026-02-26)

## What Was Built

A complete analytics and insight extraction system for the "לומדים עם אלכס הבוט" learning group, matching the sophistication of the playing group system.

## Components

### 1. Question/Answer Logger
**File:** `scripts/log-question.sh`

Logs every Q&A exchange to daily JSONL files:
```bash
bash scripts/log-question.sh "<phone>" "<name>" "<question>" "<answer>"
```

**Output:** `memory/channels/learning-with-alexbot-daily/YYYY-MM-DD.jsonl`

**Format:**
```json
{
  "timestamp": "2026-02-26T22:00:00+02:00",
  "from": "+972XXXXXXXXX",
  "name": "Name",
  "question": "How does X work?",
  "answer": "X works by..."
}
```

### 2. Nightly Analysis Script
**File:** `scripts/learning-group-nightly.sh`

Runs at 22:00 daily via cron. Uses local LLM (qwen2.5:32b) to analyze:

- **Knowledge Gaps** - What topics people struggle with
- **Common Questions** - Recurring questions (should be in FAQ)
- **Confusion Patterns** - What's unclear/confusing
- **Top Learners** - Who asks good questions / contributes
- **Guide Improvements** - What to add/fix in KB
- **Fun Facts** - Interesting observations

**Outputs:**
- `memory/channels/learning-with-alexbot-insights/YYYY-MM-DD.json` (structured data)
- `memory/channels/learning-with-alexbot-daily-summaries/YYYY-MM-DD.md` (markdown report)
- WhatsApp group summary (if there was activity)

### 3. Integration with AGENTS.md
**File:** `AGENTS.md`

**MANDATORY workflow added:**
```
After EVERY reply in learning group → log it with log-question.sh
```

This ensures all Q&A is tracked for analysis.

### 4. Updated Cron Job
**Name:** "Learning Group - Daily Insights"
**Schedule:** 22:00 daily (Jerusalem time)
**Action:** Run nightly script, send summary to group if activity

## How It Works

### Daily Flow

1. **During the day:** Learning agent answers questions
2. **After each answer:** Agent runs `log-question.sh` to record Q&A
3. **At 22:00:** Cron triggers nightly analysis
4. **Script processes:** All questions from today's JSONL
5. **LLM analyzes:** Extracts patterns, gaps, insights
6. **Results saved:** JSON + Markdown summaries
7. **Group notified:** If there was activity today

### Example Output

```markdown
🎓 סיכום לימוד יומי - 2026-02-26

📝 ניתוח:
יום פרודוקטיבי בקבוצה עם שאלות על context management ו-multi-agent systems.

📊 סטטיסטיקות
- שאלות ותשובות: 12
- משתתפים פעילים: 5

🔍 פערי ידע שזוהו
• Context window management (בינוני) — 4 שאלות
• Multi-agent coordination (קשה) — 2 שאלות

❓ שאלות נפוצות
• "איך מגדילים context?" (x3) — מבלבל
• "מה ההבדל בין agent ל-skill?" (x2) — ברור

😕 דפוסי בלבול
• אנשים לא מבינים את ההבדל בין session ו-context

🌟 לומדים בולטים
• איתי — שואל שאלות מעמיקות
• נועה — תורמת דוגמאות מהניסיון שלה

📚 הצעות לשיפור מדריכים
• [03-context-management.md]: הוסף דיאגרמה של context growth
• [08-multi-agent.md]: הסבר session isolation טוב יותר

💡 עובדות מעניינות
• רוב השאלות היו על debugging
• 2 אנשים חדשים הצטרפו היום
```

## Files & Directories

```
workspace-learning/
├── scripts/
│   ├── log-question.sh          # Q&A logger
│   └── learning-group-nightly.sh # Nightly analysis
├── memory/
│   └── channels/
│       ├── learning-with-alexbot-daily/          # Daily JSONL logs
│       │   └── YYYY-MM-DD.jsonl
│       ├── learning-with-alexbot-insights/       # Analysis JSON
│       │   └── YYYY-MM-DD.json
│       └── learning-with-alexbot-daily-summaries/ # Markdown reports
│           └── YYYY-MM-DD.md
├── AGENTS.md                    # Updated with logging requirement
└── README.md                    # This file
```

## Testing

### Manual Test
```bash
# 1. Log a test question
bash workspace-learning/scripts/log-question.sh \
  "+972551234567" \
  "Test User" \
  "How does context work?" \
  "Context is the conversation history..."

# 2. Run analysis
bash workspace-learning/scripts/learning-group-nightly.sh

# 3. Check output
cat memory/channels/learning-with-alexbot-daily-summaries/$(date +%Y-%m-%d).md
```

### Verify Cron Job
```bash
openclaw cron list | grep -A10 "Learning Group"
```

## Comparison: Playing vs Learning Groups

| Feature | Playing Group | Learning Group |
|---------|---------------|----------------|
| **Purpose** | Score attacks | Track learning |
| **Metrics** | Creativity, humor, cleverness | Knowledge gaps, clarity |
| **Analysis** | Attack patterns, top performers | Common questions, confusion |
| **LLM Used** | qwen2.5:32b | qwen2.5:32b |
| **Output** | Leaderboard + insights | Q&A stats + improvements |
| **Cron Time** | 08:00, hourly, 23:00 | 22:00 |
| **Logging** | `log-reply.sh` | `log-question.sh` |

## What Was Wrong Before

**Old system (`learning-insights.sh`):**
```bash
# Just wrote placeholder text
echo "### Questions Asked"
echo "- (Analysis pending)"
```

No actual analysis. No logging. No LLM. No insights.

**New system:**
- ✅ Real logging of all Q&A
- ✅ LLM-powered analysis
- ✅ Structured data storage
- ✅ Actionable insights for KB improvement
- ✅ Group engagement tracking

## Future Enhancements

Ideas for later:
- Weekly summary (like playing group's suggestion summary)
- KB gap auto-fixing (draft articles when patterns detected)
- Learner progression tracking (who's improving?)
- Question difficulty analysis (beginner vs advanced)
- Cross-reference with KB usage stats

---

**Built:** 2026-02-26  
**Status:** Production ready  
**Next run:** Today at 22:00
