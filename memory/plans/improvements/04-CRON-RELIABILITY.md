# ⏰ Cron & Reliability Improvements

**Category:** Automation & Reliability
**Priority:** P1 (High)
**Current Jobs:** 14 active

---

## Current State

**Cron Jobs (14 total):**

| Job | Schedule | Issue |
|-----|----------|-------|
| Morning Briefing | 06:30 | Missed today (gateway issue) |
| Playing Morning | 08:00 | Complex, sometimes fails |
| Playing Hourly | Every hour | Too frequent |
| Playing Activity | Every 30min | Often nothing to do |
| Playing Nightly | 23:00 | Works well |
| Playing Weekly | Sunday 22:00 | New |
| Score Checker | Every 1min | Very frequent |
| Broke Check | Every 2min | Redundant with above |
| Session Monitor | Every 5min | Works well |
| Media Check | Every 10min | Often nothing |
| Call Recording | Every 15min | Works well |
| Tal Lunch | 13:00 daily | Trial (ends 02-16) |
| Moltbook | Every 12h | Works well |
| Session Cleanup | Every 3min | Disabled |

**Issues:**
1. Morning briefing missed (no fallback)
2. Too many frequent jobs (cost + session bloat)
3. No retry mechanism for failures
4. Jobs don't report errors well

---

## Improvements

### 04-01: Add Cron Fallback/Retry
**Priority:** P0 | **Effort:** Medium | **Impact:** High | **Status:** pending

**What:** If critical cron fails, retry or alert

**Critical Jobs (need fallback):**
- Morning Briefing
- Playing Morning/Nightly
- Session Monitor

**Implementation:**
```javascript
// In cron payload, add retry logic:
"If this job fails or doesn't complete within 5 minutes, 
 retry once. If still fails, alert Alex via WhatsApp."
```

**Or:** Heartbeat check for missed crons:
```
If time > 06:45 and morning briefing not run:
  Run manually, alert Alex about delay
```

---

### 04-02: Consolidate Frequent Jobs
**Priority:** P1 | **Effort:** Medium | **Impact:** Medium | **Status:** pending

**What:** Merge jobs that run too often

**Merge Plan:**

| Current | Merged Into | New Schedule |
|---------|------------|--------------|
| Score Checker (1min) | Combined Check | Every 5min |
| Broke Check (2min) | Combined Check | Every 5min |
| Activity Wake-Up (30min) | Morning Job | Adaptive |
| Hourly Leaderboard | 3x Daily | 12:00, 17:00, 21:00 |

**Expected:** 14 jobs → 9 jobs

---

### 04-03: Add Job Health Dashboard
**Priority:** P2 | **Effort:** Medium | **Impact:** Medium | **Status:** pending

**What:** Track job success/failure rates

**Metrics:**
- Last run time
- Last status (ok/error)
- Success rate (7 day)
- Average duration

**Implementation:**
```bash
# Daily cron health report
cron action=runs --limit 100 | analyze
```

**Output to:** `memory/cron-health/daily-{date}.json`

---

### 04-04: Smart Media Check
**Priority:** P2 | **Effort:** Low | **Impact:** Low | **Status:** pending

**What:** Only check media when PC is likely on

**Current:** Checks every 10min, often fails (Windows sleeping)

**Proposed:**
- Check only 18:00-01:00 (when Alex uses PC)
- Skip weekends during day
- Cache last check result

---

### 04-05: Cron Session Isolation
**Priority:** P1 | **Effort:** Low | **Impact:** Medium | **Status:** pending

**What:** All cron jobs use isolated sessions

**Current:** Some use main session (pollutes context)

**Fix:** Ensure all crons have `sessionTarget: "isolated"`

**Jobs to fix:**
- media-ready-check (currently main)
- moltbook-update (currently main)

---

### 04-06: Dead Cron Cleanup
**Priority:** P2 | **Effort:** Low | **Impact:** Low | **Status:** pending

**What:** Remove or update stale jobs

**Review:**
- Tal Lunch (ends 02-16) - set reminder to remove
- Session Cleanup (disabled) - delete or fix
- Any other disabled jobs

---

### 04-07: Cron Documentation
**Priority:** P2 | **Effort:** Low | **Impact:** Low | **Status:** pending

**What:** Document all cron jobs in one place

**Create:** `memory/CRON-JOBS.md`

**Content:**
- Job name, schedule, purpose
- Dependencies
- What to do if fails
- Owner (auto/Alex approval needed)

---

## Reliability Patterns to Implement

### Pattern 1: Retry with Backoff
```
Attempt 1: immediate
Attempt 2: wait 1 min
Attempt 3: wait 5 min
Then: alert Alex
```

### Pattern 2: Health Heartbeat
```
Every hour, verify:
- All critical jobs ran
- No jobs stuck
- Sessions not bloated
```

### Pattern 3: Graceful Degradation
```
If feature X fails:
- Log error
- Continue with partial functionality
- Alert only if critical
```

---

## Quick Wins

1. **04-05** - Make all crons isolated (config change)
2. **04-06** - Remove disabled/stale jobs
3. **04-02** - Reduce frequency of score checks
