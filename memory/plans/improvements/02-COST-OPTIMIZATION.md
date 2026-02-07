# 💰 Cost Optimization Improvements

**Category:** Cost Efficiency
**Priority:** P0 (Critical)
**Impact:** 60-80% cost reduction

---

## Current Problem

**Session Analysis (from sessions_list):**

| Session Type | Count | Model | Cost Issue |
|--------------|-------|-------|------------|
| Main (Alex DM) | 1 | Opus | ✅ Appropriate |
| Playing Group | 1 | Opus | ❌ Should be Sonnet |
| Clawders | 1 | Opus (94k tokens!) | ❌ Expensive NO_REPLY |
| Other Groups | 15+ | Opus | ❌ All just NO_REPLY |
| Cron Jobs | 14 | Mixed | ❌ Some on Opus |

**Cost Math:**
- Opus: $15/MTok input, $75/MTok output
- Sonnet: $3/MTok input, $15/MTok output
- **5x savings** by moving groups to Sonnet

---

## Improvements

### 02-01: Route All Groups to Sonnet
**Priority:** P0 | **Effort:** Low | **Impact:** Very High | **Status:** pending

**What:** Change model for all group sessions to Sonnet

**Implementation (gateway config):**
```yaml
whatsapp:
  bindings:
    - match: { isGroup: true }
      model: anthropic/claude-sonnet-4-5
    - match: { isGroup: false, from: "+972544419002" }
      model: anthropic/claude-opus-4-5  # Alex DM stays on Opus
```

**Expected Savings:** ~70% on group costs

---

### 02-02: Aggressive Session Cleanup
**Priority:** P1 | **Effort:** Low | **Impact:** Medium | **Status:** pending

**What:** Lower thresholds for session cleanup

**Current:**
- Groups: 50k WARNING, 150k CRITICAL
- Clawders currently at 94k (almost 2x warning!)

**Proposed:**
- Groups: 30k WARNING, 80k CRITICAL
- DMs: 50k WARNING, 100k CRITICAL

**Why:** Smaller sessions = less cache write costs

---

### 02-03: Instant NO_REPLY for Silent Groups
**Priority:** P1 | **Effort:** Medium | **Impact:** High | **Status:** pending

**What:** Skip full LLM call for groups where I never respond

**Logic:**
- Identify groups with 95%+ NO_REPLY rate
- Route to ultra-light handler
- Only call LLM if @alexbot mentioned

**Groups to target:**
- CTO groups (multiple)
- AI community groups
- esh work groups

---

### 02-04: Reduce Context Token Limit
**Priority:** P1 | **Effort:** Low | **Impact:** Medium | **Status:** pending

**What:** Lower `contextTokens` config

**Current:** 100,000 tokens
**Proposed:** 50,000 tokens (for groups)

**Why:** Forces earlier rotation, prevents expensive bloat

---

### 02-05: Cache-Aware Scheduling
**Priority:** P2 | **Effort:** Medium | **Impact:** Medium | **Status:** pending

**What:** Time cron jobs to maximize cache hits

**Insight:** Anthropic caches last ~5 minutes

**Implementation:**
- Run related cron jobs close together
- Session monitor → morning briefing (use same cache)
- Avoid spreading jobs that share context

---

### 02-06: Monitor & Alert on Cost Spikes
**Priority:** P2 | **Effort:** Medium | **Impact:** Low | **Status:** pending

**What:** Create cost tracking dashboard

**Metrics to track:**
- Daily cost per agent
- Cost per session
- Cost per message
- Alert if daily cost > threshold

**Implementation:**
- Parse session usage data
- Store in `memory/costs/daily-{date}.json`
- Cron job for daily summary

---

## Quick Wins

These can be done immediately:

1. **02-01** - Just config change, instant 70% savings
2. **02-04** - Config change, lower contextTokens
3. **02-02** - Update session-monitor thresholds

---

## Cost Projection

| Scenario | Monthly Cost (est.) |
|----------|---------------------|
| Current (all Opus) | $150-300 |
| After 02-01 (groups on Sonnet) | $50-80 |
| After all optimizations | $30-50 |

*Estimates based on current usage patterns*
