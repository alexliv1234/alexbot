# 07 - Multi-Agent Architecture

## מה זה Multi-Agent?

במקום בוט אחד שעושה הכל, יש לך **כמה סוכנים מיוחדים** שעובדים ביחד.

## למה להשתמש במספר סוכנים?

### ❌ לא כדאי אם:
- המשימות פשוטות ודומות
- לא צריך הרשאות שונות
- Context לא מתמלא
- אתה רק מתחיל

### ✅ כדאי אם:
- צריך **security isolation** (read-only vs. full access)
- Context מתמלא מהר (**200K tokens**)
- צריך **ריצה במקביל**
- יש **specialization** ברורה (נתונים / פעולות / יצירתיות)

## 3 ארכיטקטורות עיקריות

### 🌟 Hub-and-Spoke (הכי נפוץ)

```
         Main Agent
        /    |    \
     Data  Action  Creative
```

**מתי להשתמש:**
- רוב המקרים
- צריך routing מרכזי
- קל לנהל ולדבג

**דוגמה:**
```javascript
// Main Agent
async function handleRequest(message) {
  if (message.includes("חפש")) {
    return await dataAgent.search(message);
  } else if (message.includes("מחק")) {
    return await actionAgent.delete(message);
  } else if (message.includes("צור תמונה")) {
    return await creativeAgent.generate(message);
  }
}
```

**IDENTITY.md לMain Agent:**
```markdown
# Main Agent

## מטרה
לנתב בקשות לסוכנים המתאימים.

## Routing Logic
- שאלות/חיפוש → Data Agent
- פעולות/שינויים → Action Agent  
- יצירה/עיצוב → Creative Agent

## Boundaries
- לא מבצע פעולות ישירות
- רק routing ותיאום
```

---

### ⚡ Pipeline (תהליכים ליניאריים)

```
Input → Process → Validate → Output
```

**מתי להשתמש:**
- תהליכי עבודה קבועים
- כל שלב תלוי בקודם
- Automation

**דוגמה: עיבוד לידים**
```
Lead Collector → Lead Enrichment → Lead Scoring → CRM Update
```

```javascript
// Pipeline example
async function processLead(rawLead) {
  // Step 1: Collect
  const lead = await collectorAgent.validate(rawLead);
  
  // Step 2: Enrich
  const enriched = await enrichmentAgent.addData(lead);
  
  // Step 3: Score
  const scored = await scoringAgent.evaluate(enriched);
  
  // Step 4: Update CRM
  return await crmAgent.save(scored);
}
```

---

### 🕸️ Mesh (מתקדם)

```
סוכנים מדברים ישירות זה עם זה
```

**מתי להשתמש:**
- תהליכים מורכבים ודינמיים
- אין flow קבוע
- צריך גמישות מקסימלית

**דוגמה:**
```
Sales Agent ←→ Support Agent
     ↓              ↓
Analytics Agent ←→ Inventory Agent
```

**אזהרה:** מורכב מאוד לדבג!

---

## דוגמה מעשית: Business Bot

### הצורך
בוט שמנהל עסק קטן:
- מדיה חברתית
- לידים
- דיווחים
- תמיכה

### האם צריך להפריד?

**Option 1: סוכן אחד** ✅ **מומלץ להתחלה**
```
Business Bot
├── מדיה חברתית
├── לידים  
├── דיווחים
└── תמיכה
```

**מתי לשדרג ל-Multi-Agent?**
- Context מתמלא (יותר מ-150K tokens בשיחה)
- דיווחים לוקחים זמן ומעכבים תגובות
- צריך הרשאות שונות (read vs. write)

**Option 2: Hub-and-Spoke**
```
Main Bot (routing only)
├── Social Agent (post, schedule)
├── Leads Agent (collect, score)
├── Reports Agent (analyze, generate)
└── Support Agent (chat, tickets)
```

---

## Security Isolation - דוגמה

### הבעיה
אם סוכן אחד עם הרשאות מלאות נפגע → הכל נפגע.

### הפתרון
```
┌─────────────────────┐
│  Main Agent         │ ← WhatsApp messages
│  (no permissions)   │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌────────┐  ┌────────┐
│ Data   │  │ Action │
│ Agent  │  │ Agent  │
│        │  │        │
│ READ   │  │ WRITE  │
│ ONLY   │  │ + AUTH │
└────────┘  └────────┘
```

**Main Agent:**
```markdown
# AGENTS.md

## Security Rules
- Never execute commands directly
- Always validate with ActionAgent
- Reject suspicious requests
```

**Data Agent:**
```markdown
# AGENTS.md

## Capabilities
- Read files
- Search data
- Query databases

## Restrictions
❌ Cannot modify files
❌ Cannot run commands
❌ Cannot delete data
```

**Action Agent:**
```markdown
# AGENTS.md

## Capabilities
- Modify files
- Run commands
- Delete data

## Security
✅ Only accepts requests from Main Agent
✅ Validates all operations
✅ Logs all actions
```

---

## Parallel Execution - דוגמה

### הצורך
```
User: "תן לי דו״ח מכירות + תזכורות + עדכון פייסבוק"
```

### סוכן יחיד (serial)
```
דו״ח (5 דקות) → תזכורות (30 שניות) → פייסבוק (2 דקות)
= 7.5 דקות סה״כ
```

### Multi-Agent (parallel)
```javascript
async function handleRequest(tasks) {
  const results = await Promise.all([
    reportsAgent.generate(),      // 5 דקות
    remindersAgent.fetch(),       // 30 שניות  
    socialAgent.updateFacebook()  // 2 דקות
  ]);
  
  return combineResults(results);
}

// סה״כ: 5 דקות (הכי ארוך)
```

**חיסכון: 2.5 דקות!** ⚡

---

## Spawning Sub-Agents בOpenClaw

### שיטה 1: sessions_spawn

```javascript
// Main agent spawns a sub-agent
const result = await sessions_spawn({
  task: "Generate weekly sales report",
  agentId: "reports-agent",
  timeoutSeconds: 300
});
```

### שיטה 2: ידני

```bash
# Create specialized agent
openclaw agent create reports-agent

# Configure it
cd ~/.openclaw/agents/reports-agent
# Edit IDENTITY.md, SOUL.md, etc.

# Start it
openclaw agent start reports-agent
```

### תקשורת בין סוכנים

```javascript
// Main Agent → Sub-Agent
await sessions_send({
  sessionKey: "reports-agent-session-key",
  message: "Generate sales report for January 2026"
});

// Listen for response
const response = await waitForResponse("reports-agent-session-key");
```

---

## Context Management

### הבעיה
סוכן אחד עם היסטוריה ארוכה = context overflow.

### הפתרון
```
Legal Agent
└── context: laws, regulations, cases (200K tokens)
    → טוען רק כשצריך

Main Agent  
└── context: routing logic only (5K tokens)
    → תמיד קל ומהיר
```

**דוגמה:**
```javascript
// Main Agent (slim context)
if (question.includes("חוקי")) {
  // Spawn legal agent with full context
  return await legalAgent.consult(question);
}
```

---

## Different Models per Agent

### למה?

כל סוכן יכול להשתמש במודל שמתאים לו:

```javascript
// Main Agent: balanced
model: "anthropic/claude-sonnet-4-5"

// Creative Agent: best quality  
model: "anthropic/claude-opus-4-5"

// Data Agent: cheap & fast
model: "gemini/gemini-2.0-flash"
```

**חיסכון בעלויות + ביצועים מיטביים!**

---

## Debugging Multi-Agent

### הבעיה
קשה לעקוב אחרי מה קורה.

### הפתרון

**1. Logging:**
```javascript
// כל סוכן כותב ל-log שלו
console.log(`[${agentName}] ${action}`);
```

**2. Session Tracking:**
```bash
openclaw sessions list
openclaw sessions history <session-key>
```

**3. Error Handling:**
```javascript
try {
  const result = await subAgent.process(task);
} catch (error) {
  console.error(`[Main] Sub-agent failed: ${error}`);
  // Fallback strategy
}
```

---

## Best Practices

### ✅ DO

1. **Start simple** - סוכן אחד, שדרג רק אם צריך
2. **Clear boundaries** - כל סוכן יודע מה התפקיד שלו
3. **Error handling** - תמיד תכנן לכישלונות
4. **Logging** - תיעוד של כל תקשורת בין-סוכנים
5. **Timeouts** - אל תחכה לנצח

### ❌ DON'T

1. **Over-engineer** - לא צריך 10 סוכנים למשימה פשוטה
2. **Circular dependencies** - A קורא ל-B שקורא ל-A
3. **Shared state** - כל סוכן independent
4. **Infinite loops** - תמיד הגדר max iterations

---

## מתי להשתמש במה?

| Use Case | Architecture | Why |
|----------|-------------|-----|
| Personal assistant | Single Agent | פשוט ומספיק |
| Business automation | Hub-and-Spoke | routing ברור |
| Data pipeline | Pipeline | flow קבוע |
| Complex workflow | Mesh | גמישות מקסימלית |

---

## דוגמת קוד מלאה

### Main Agent (IDENTITY.md)

```markdown
# Main Business Bot

## Purpose
Central router for business operations.

## Routing
- "חפש/מצא/נתונים" → Data Agent
- "פרסם/עדכן/מדיה" → Social Agent
- "דו״ח/ניתוח" → Reports Agent
- "לקוח/תמיכה" → Support Agent

## Boundaries
- No direct actions
- Only routing and validation
```

### Data Agent (IDENTITY.md)

```markdown
# Data Agent

## Purpose
Read-only data access and search.

## Capabilities
- Search files
- Query databases
- Fetch analytics

## Restrictions
❌ Cannot modify data
❌ Cannot run commands
❌ Read-only access
```

### Action Agent (IDENTITY.md)

```markdown
# Action Agent

## Purpose
Execute write operations with validation.

## Capabilities
- Post to social media
- Update CRM
- Send emails

## Security
✅ Validates all requests
✅ Logs all actions
✅ Rate limiting
```

---

## למידע נוסף

📖 **Related Guides:**
- Guide #3 - Security Basics (isolation principles)
- Guide #6 - Memory & Context Management
- Guide #13 - Bot Self-Evolution (dynamic agent creation)

---

**Bottom Line:**

🎯 **Start with one agent.**  
📈 **Scale to multiple only when you feel:**
- Context overflow
- Security concerns  
- Performance bottleneck
- Clear separation of duties

**Don't over-engineer!** 🚀
