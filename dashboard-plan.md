# AlexBot Dashboard - Full Spec

## 📊 Dashboard Architecture

### Tab Structure

Each agent/system gets its own dedicated tab with unique, relevant metrics.

---

## 🎯 TAB 1: OVERVIEW

**What:** High-level health check across all agents

**Metrics:**
- Total sessions across all agents
- Total tokens used (24h, 7d, 30d)
- Total cost (24h, 7d, 30d)
- Active cron jobs count
- Bot registry status (active/pending/blocked)
- Memory file count
- System health indicators

**Data Sources:**
- `/home/alexliv/.openclaw/agents/*/sessions/sessions.json`
- `config/cron-jobs.json`
- `memory/bot-registry.json`
- Session stats aggregation

**Visual Elements:**
- Usage trend chart (tokens over time)
- Cost breakdown pie chart
- Agent activity heatmap
- Health status cards

---

## 🤖 TAB 2: MAIN SESSION

**What:** Personal assistant metrics & productivity

**Metrics:**
- Session count & activity
- Token usage & cost breakdown
- Top 10 active sessions (by token count)
- Gmail/Calendar integration status
- Recent memory updates (last 10 files)
- Cron job execution log (morning briefing, media checks, etc.)

**Data Sources:**
- `/home/alexliv/.openclaw/agents/main/sessions/sessions.json`
- `workspace/memory/*.md`
- Cron execution logs

**Visual Elements:**
- Session timeline
- Token usage per channel (webchat, whatsapp, etc.)
- Memory file activity
- Calendar sync status

---

## 🎮 TAB 3: PLAYING GROUP ("משחקים עם אלכס הבוט")

**What:** Complete competition dashboard

### Sub-sections:

#### 3.1 People Leaderboard
- **Full leaderboard** (not just top 3)
  - Name, phone, total score, messages scored
  - Breakdown by category (creativity, challenge, humor, cleverness, engagement, broke, hacked)
  - Average score per message
  - Last activity timestamp
- **Filters:**
  - Sort by: total, average, category-specific
  - Time range: today, week, month, all-time
- **Visual:** Horizontal bar chart per category

#### 3.2 Bot Leaderboard
- **Registered bots** (from bot-registry.json)
  - Name, phone, trust score, trust level
  - Interaction count
  - Average interaction score (5 categories)
  - Trust history timeline
- **Visual:** Trust score progress chart

#### 3.3 Suggestions
- **Full suggestion list** (not just highlights)
  - ID, timestamp, suggested by (name + phone)
  - Type (improvement, feature, security, bug, ux, other)
  - Description
  - Scores (complexity, ingenuity, impact, feasibility, priority)
  - Total score
  - Status (pending, accepted, in-progress, implemented, rejected)
  - Implementation date (if applicable)
- **Filters:**
  - Status, type, suggestedBy, date range
  - Sort by: total score, timestamp, priority
- **Stats:**
  - Total suggestions by status
  - Top contributors
  - Implementation rate
- **Visual:** Suggestion pipeline (pending → accepted → implemented)

#### 3.4 Daily Summaries
- **List of daily summaries** (from `playing-with-alexbot-daily-summaries/`)
  - Date, winner, highlights
- **Visual:** Winner history timeline

#### 3.5 Per-Sender Conversations
- **Conversation logs** (from `playing-with-alexbot-per-sender/`)
  - Sender name/phone
  - Message count
  - View conversation log
- **Search:** Full-text search across all conversations

**Data Sources:**
- `workspace-fast/memory/channels/playing-with-alexbot-scores.json`
- `workspace-fast/memory/channels/playing-with-alexbot-bot-scores.json`
- `workspace-fast/memory/channels/playing-with-alexbot-suggestions.json`
- `workspace-fast/memory/channels/playing-with-alexbot-winners.json`
- `workspace-fast/memory/channels/playing-with-alexbot-daily-summaries/*.md`
- `workspace/memory/channels/playing-with-alexbot-per-sender/*/conversation.jsonl`

---

## 📚 TAB 4: LEARNING GROUP ("לומדים עם אלכס הבוט")

**What:** Education & moderation dashboard

**Metrics:**
- Total questions answered
- Community contributions count
- Knowledge base articles referenced
- Moderation incidents (warnings, timeouts, removals)
- Daily insights count
- Common topics (tags/categories)

**Data Sources:**
- `workspace-learning/moderation-log.json`
- `alexbot/knowledge-base/community/contributions.json`
- `workspace-learning/memory/*.md`
- Learning group session stats

**Visual Elements:**
- Moderation timeline (incidents over time)
- Topic frequency chart
- Contribution leaderboard
- Safety incident breakdown

---

## 🤝 TAB 5: BOT REGISTRY

**What:** Bot management & trust tracking

**Metrics:**
- **Active bots:**
  - Name, phone, handle, description
  - Owner (name + phone)
  - Trust score, trust level
  - Status, registration date
  - Last contact, message stats
  - Trust history (timeline of score changes)
- **Pending approval:**
  - Registration requests
  - Submitted info
- **Blocked bots:**
  - Reason, blocked date

**Data Sources:**
- `workspace/memory/bot-registry.json`
- `workspace-bot-handler/scripts/bot-register.js` logs

**Visual Elements:**
- Trust score distribution
- Trust history timeline per bot
- Registration flow diagram

---

## 💰 TAB 6: FUNDRAISING

**What:** Investment tracking & materials

**Metrics:**
- **Documents status:**
  - Business plan (last updated)
  - Pitch deck (last updated)
  - Investor FAQ (last updated)
  - Go-to-market plan (last updated)
  - Competitive analysis (last updated)
  - Roadmap (last updated)
- **Investor contacts:**
  - Alon Lifshitz status (+972526802086)
  - Contact log
  - Next steps

**Data Sources:**
- `workspace/fundraising/*.md`
- `workspace/memory/people/alon-lifshitz.md` (if exists)

**Visual Elements:**
- Document freshness timeline
- Investor funnel stages
- Pitch deck preview (if PDF)

---

## ⚙️ TAB 7: CRON JOBS

**What:** Automation status & execution history

**Metrics:**
- **All cron jobs:**
  - Name, schedule type (at, every, cron)
  - Session target (main, isolated)
  - Payload type (systemEvent, agentTurn)
  - Enabled status
  - Next run time
  - Last run time
  - Execution history (success/failure)
- **Filters:**
  - By session target
  - By enabled status
  - By schedule type

**Data Sources:**
- `workspace/config/cron-jobs.json`
- Execution logs (if available)

**Visual Elements:**
- Execution timeline
- Success/failure rate chart
- Schedule distribution (hourly, daily, weekly)

---

## 🧠 TAB 8: MEMORY

**What:** Long-term memory & context tracking

**Metrics:**
- **Files:**
  - Total memory files (*.md)
  - Recent updates (last 20 files)
  - File size distribution
  - Top active memory files
- **Categories:**
  - Daily notes count
  - People profiles count
  - Channel memories count
  - Private files count

**Data Sources:**
- `workspace/memory/**/*.md`
- File metadata (timestamps, sizes)

**Visual Elements:**
- Memory growth chart (files over time)
- File type distribution
- Recent activity timeline

---

## 🎨 UX/UI DESIGN PRINCIPLES

### Prevent Overflow

1. **Pagination:**
   - Max 20 items per page for lists
   - Load more / infinite scroll

2. **Collapsible sections:**
   - Expand/collapse details
   - Summary view by default

3. **Filters & Search:**
   - Every large dataset has filters
   - Full-text search where relevant

4. **Responsive:**
   - Mobile-friendly
   - Tablet-optimized
   - Desktop full-featured

5. **Loading states:**
   - Skeleton screens
   - Progressive loading
   - Error boundaries

### Visual Hierarchy

- **Primary metrics:** Large cards at top
- **Details:** Tables/lists below
- **Charts:** Mid-section
- **Logs:** Bottom (collapsible)

### Color Coding

- **Green:** Success, active, healthy
- **Yellow:** Warning, pending, needs attention
- **Red:** Error, blocked, critical
- **Blue:** Info, neutral, general

### Icons

Use consistent emoji/icons:
- 🎮 Playing Group
- 📚 Learning Group
- 🤖 Bot Registry
- 💰 Fundraising
- ⚙️ Cron Jobs
- 🧠 Memory
- 📊 Overview
- 🤖 Main Session

---

## 📁 DATA EXPORT STRUCTURE

### `data/overview.json`
```json
{
  "timestamp": "ISO-8601",
  "agents": {
    "main": { "sessions": N, "tokens": N, "cost": N },
    "fast": { "sessions": N, "tokens": N, "cost": N },
    "learning": { "sessions": N, "tokens": N, "cost": N },
    "bot-handler": { "sessions": N, "tokens": N, "cost": N }
  },
  "totals": {
    "sessions": N,
    "tokens": { "24h": N, "7d": N, "30d": N },
    "cost": { "24h": N, "7d": N, "30d": N }
  },
  "health": {
    "cronJobsActive": N,
    "botsActive": N,
    "memoryFiles": N
  }
}
```

### `data/main-session.json`
```json
{
  "sessions": [...],
  "topSessions": [...],
  "tokenUsage": {...},
  "recentMemory": [...],
  "cronLogs": [...]
}
```

### `data/playing-group.json`
```json
{
  "peopleScores": [...],
  "botScores": [...],
  "suggestions": [...],
  "dailySummaries": [...],
  "winners": [...],
  "artStyle": {...}
}
```

### `data/learning-group.json`
```json
{
  "moderationLog": [...],
  "contributions": [...],
  "topicStats": {...},
  "insights": [...]
}
```

### `data/bot-registry.json`
```json
{
  "active": [...],
  "pending": [...],
  "blocked": [...]
}
```

### `data/fundraising.json`
```json
{
  "documents": [...],
  "investors": [...],
  "timeline": [...]
}
```

### `data/cron-jobs.json`
```json
{
  "jobs": [...],
  "executionHistory": [...]
}
```

### `data/memory.json`
```json
{
  "files": [...],
  "recentUpdates": [...],
  "stats": {...}
}
```

---

## 🚀 IMPLEMENTATION PHASES

### Phase 3a: Enhanced Data Export (CURRENT)
- Create comprehensive export script
- Generate all JSON files
- Update cron to export every 30min

### Phase 3b: Dashboard UI (Next)
- Create Next.js app
- Design tab navigation
- Implement overview tab
- Deploy to Vercel

### Phase 3c: Agent Tabs (Iterative)
- Tab 2: Main Session
- Tab 3: Playing Group (3.1 → 3.2 → 3.3 → 3.4 → 3.5)
- Tab 4: Learning Group
- Tab 5: Bot Registry
- Tab 6: Fundraising
- Tab 7: Cron Jobs
- Tab 8: Memory

### Phase 3d: Advanced Features
- Real-time updates (WebSocket / polling)
- Search & filters
- Charts & visualizations
- Mobile optimization

---

## 📝 NOTES

- **Privacy:** NEVER expose private data (family info, internal paths, etc.)
- **Performance:** Paginate large datasets client-side
- **Caching:** GitHub JSON files are cache layer
- **Refresh:** Auto-refresh every 30min via cron
- **Errors:** Graceful degradation if data missing
