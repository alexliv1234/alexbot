# Week 6 - Complete Cron Migration Plan

**Goal:** Migrate ALL remaining cron jobs (38/40) from main→fast + merge learning workspace

**Status:** ✅ Started - 2026-01-02
**Target:** Complete by Week 6 end

---

## Phase 1: Group Jobs Migration (16 jobs)

### Playing Group Jobs (7 jobs)
- [ ] `Playing Group - Hourly Leaderboard` (cron: 11-17 Sun-Thu)
- [ ] `Playing Group - Morning Wakeup` (cron: 9:55 Sun-Thu)
- [ ] `Playing Group - Nightly Summary` (cron: 18:00 Sun-Thu)
- [ ] `Playing Group - Broke Score Check` (every 5min)
- [ ] `Playing Group - Weekly Suggestion Summary` (cron: 22:00 Sunday) - **ALREADY IN FAST**
- [ ] `International Playing Group - Hourly Challenge` (cron: 11-17 Sun-Thu)
- [ ] `International Playing Group - Morning Wakeup` (cron: 10:00 Sun-Thu)
- [ ] `International Playing Group - Nightly Summary` (cron: 18:00 Sun-Thu)

### Learning Group Jobs (4 jobs)
- [ ] `International Learning Group - Hourly Tip` (cron: 11-17 Sun-Thu)
- [ ] `Learning Group - Daily Insights` (cron: 22:00 daily)
- [ ] `Learning Group - Weekly Summary` (cron: 22:00 Sunday)
- [ ] `Teaching Quality - Daily Review` (cron: 22:00 daily)

### Fundraising Jobs (2 jobs)
- [ ] `International Fundraising Group - Hourly Insight` (cron: 11-17 Sun-Thu)
- [ ] `Fundraising - Evening Report` (cron: 18:00 daily)
- [ ] `Fundraising - Morning Check` (cron: 8:00 daily)

### Bot Management (3 jobs)
- [ ] `Bot Message Check` (every 5min)
- [ ] `Bot Registration Scanner` (every 10min)

---

## Phase 2: System Jobs Migration (8 jobs)

### Session Health (3 jobs)
- [ ] `Session Health Check` (every 10min)
- [ ] `session-monitor` (every 15min)
- [ ] `User Pattern Analysis` (cron: 3:00 daily)

### Git & Updates (2 jobs)
- [ ] `Git Auto-Commit` (every 10min)
- [ ] `Dashboard Auto-Update` (every 30min)
- [ ] `GitHub Pages Update - Morning` (cron: 8:00 daily)
- [ ] `GitHub Pages Update - Afternoon` (cron: 14:00 daily)
- [ ] `GitHub Pages Update - Evening` (cron: 20:00 daily)

### Media & External (2 jobs)
- [ ] `media-ready-check` (every 10min)
- [ ] `moltbook-update` (every 12h)
- [ ] `Call Recording Check` (every 15min)

---

## Phase 3: Morning/Evening Automation (7 jobs)

### Daily Lifecycle
- [ ] `Auto-create daily memory file` (cron: 0:00 daily)
- [ ] `למידה עצמית - לילה` (cron: 2:00 daily)
- [ ] `morning-briefing` (cron: 6:30 daily)
- [ ] `שאלת למידה - בוקר` (cron: 7:30 daily)
- [ ] `שאלת למידה - צהריים` (cron: 13:00 daily)
- [ ] `שאלת למידה - ערב + אימון` (cron: 20:00 daily)

### Weekly/Recurring
- [ ] `נקיון שבועי - יום חמישי` (cron: 8:00 Thursday)
- [ ] `הפעלת Dreame - כל יומיים` (cron: 10:00 every 2 days)
- [ ] `תזכורת הליכה עם רון - שני` (cron: 8:15 Monday)
- [ ] `תזכורת הליכה עם רון - רביעי` (cron: 8:15 Wednesday)

---

## Phase 4: Learning Workspace Merge

### Files to Merge
1. **Memory files:**
   - `workspace-learning/memory/` → `workspace-fast/memory/international-groups/learning/`
   - Consolidate Q&A tracking
   - Merge teaching lessons

2. **Scripts:**
   - Teaching scoring scripts
   - Daily review scripts
   - Pattern analysis tools

3. **Documentation:**
   - Teaching protocols
   - Best practices
   - Quick reference guides

4. **Test merged setup:**
   - Verify all learning jobs work in fast workspace
   - Check file paths
   - Confirm memory persistence

---

## Migration Process (per job)

1. **Copy job definition** to fast agent cron
2. **Update file paths** (workspace → workspace-fast)
3. **Test in fast** (dry run)
4. **Disable in main**
5. **Monitor for 24h**
6. **Delete from main** if stable

---

## Completion Criteria

- [ ] 38 jobs migrated to fast
- [ ] 2 jobs remain in main (session-bound only)
- [ ] All tests passing
- [ ] 24h stable operation
- [ ] Learning workspace fully merged
- [ ] Documentation updated

---

**RESULT:** Single coordinated system, zero conflicts, all 40 jobs running efficiently
