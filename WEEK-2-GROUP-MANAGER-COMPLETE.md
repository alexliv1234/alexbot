# Week 2: Unified Group Manager - COMPLETE ✅

## What Was Built

### 🎯 `scripts/group-manager.js`

**One manager for ALL groups - no more duplication!**

**Features:**
- ✅ **Unified Registry** - 4 groups in one config file
- ✅ **Multi-type Scoring** - Challenges (70pt), Suggestions (50pt), Teaching (50pt)
- ✅ **Template System** - Dynamic morning/hourly/nightly messages
- ✅ **Leaderboards** - Automatic position tracking
- ✅ **Distributed Time Slots** - 15-min intervals (no collisions!)
- ✅ **Multi-language** - Hebrew + English templates
- ✅ **Auto-backup** - Score resets create backups

**CLI Commands:**
```bash
# List all groups
node scripts/group-manager.js --list-groups

# Get group config
node scripts/group-manager.js --get-group <groupId>

# Score a message
node scripts/group-manager.js --score <groupId> <type> <userId> <name> <data-json>

# Get leaderboard
node scripts/group-manager.js --get-leaderboard <groupId>

# Reset scores (with backup)
node scripts/group-manager.js --reset-scores <groupId>

# Get template
node scripts/group-manager.js --get-template <groupId> <templateType>
```

### 📖 `GROUP-MANAGER-INTEGRATION.md`

**Complete migration guide from old to new system.**

**Covers:**
- Command reference
- Migration examples
- Registered groups table
- Before/after comparison
- Testing procedures

### ✅ Proof of Concept

**Updated:** `scripts/playing-group-morning.sh`

**Now uses:**
- ✅ Coordinator (Week 1) for collision prevention
- ✅ Group Manager (Week 2) for score reset + templates
- ✅ Dynamic morning messages (5 random challenges)
- ✅ Automatic backup

**Test output:**
```
✅ Coordinator approved - proceeding
📝 Registered action: playing-morning-1772616838373
🌅 Morning reset via Group Manager
{
  "backed_up": ".../120363405143589138_g_us-backup-2026-03-04.json",
  "reset": true
}
✅ Scores reset to 0

📢 Morning message generated:
🌅 *בוקר טוב!*
🔄 *הציונים אופסו - כולם מתחילים מ-0!*
🎯 *האתגר של היום:*
אתגרו אותי עם משהו שמשלב קוד + שירה 🎨
⏰ *שעות פעילות:* 10:00-18:00 (א'-ה')
📊 *ניקוד:* כל תגובה מקבלת ציון /70
בואו נראה מי מוביל היום! 🏆
```

## Registered Groups

| Group | Type | Lang | Morning | Hourly | Nightly |
|-------|------|------|---------|--------|---------|
| משחקים עם אלכס הבוט | playing | he | 10:00 | 10-18 | 18:00 |
| Playing (International) | playing | en | 10:15 | 10-18 | 18:15 |
| לומדים עם אלכס הבוט | learning | he | - | 3h | 22:00 |
| Fundraising | fundraising | en | 10:45 | 10-18 | 18:45 |

**Time Distribution:** 15-minute intervals prevent the old 4-jobs-at-11:00 collision!

## Benefits Achieved

### Before Group Manager
❌ **5 separate scoring systems:**
  - `score-message.js` (challenges)
  - `score-suggestion.js` (suggestions)  
  - `score-teaching.js` (teaching)
  - `bot-score.js` (bots)
  - Separate files for each

❌ **3 different data formats:**
  - `playing-with-alexbot-scores.json`
  - `playing-with-alexbot-suggestions.json`
  - `teaching-scores.json`

❌ **Hardcoded messages** in shell scripts

❌ **No time slot management** → collisions

❌ **Manual template creation**

### After Group Manager
✅ **1 unified scoring engine** for all types
✅ **1 consistent format** - all scores in `memory/group-scores/`
✅ **Dynamic templates** with random variations
✅ **Auto-distributed time slots** (15-min intervals)
✅ **Centralized group config** - `memory/group-registry.json`

## Consolidation Progress

### Week 1 ✅
- [x] Central Coordinator
- [x] Priority queue
- [x] Collision detection
- [x] Alex availability checks

### Week 2 ✅
- [x] Unified Group Manager
- [x] Multi-type scoring engine
- [x] Template system
- [x] Distributed time slots
- [x] PoC: Morning script migrated

### Still TODO (Weeks 3-5)
- [ ] **Week 3:** Merge teaching workspace
- [ ] **Week 4:** Smart message routing
- [ ] **Week 5:** Unified dashboard

## Migration Roadmap

### Phase 1: Morning Scripts (This Week)
- [x] Hebrew playing group ✅ DONE
- [ ] International playing group
- [ ] Learning group
- [ ] Fundraising group

### Phase 2: Hourly Scripts (Next)
- [ ] All playing groups (use `--get-template hourly`)
- [ ] Learning tips (use `--get-template hourly`)

### Phase 3: Nightly Scripts (Next)
- [ ] All groups (use `--get-template nightly`)

### Phase 4: Scoring Calls (After)
- [ ] Replace all `score-message.js` → `--score challenge`
- [ ] Replace all `score-suggestion.js` → `--score suggestion`
- [ ] Replace all `score-teaching.js` → `--score teaching`

### Phase 5: Deprecation (After migration complete)
- [ ] Remove old `score-*.js` scripts
- [ ] Remove old `memory/channels/*-scores.json` files
- [ ] Archive old templates

## Files Created

```
scripts/group-manager.js              17 KB  Main engine
GROUP-MANAGER-INTEGRATION.md          6.5 KB Integration guide
memory/group-registry.json            Auto   Central config
memory/group-scores/*.json            Auto   Per-group scores
WEEK-2-GROUP-MANAGER-COMPLETE.md      This   Summary
```

## Testing

```bash
# Test group list
node scripts/group-manager.js --list-groups | jq 'length'
# Result: 4 ✅

# Test scoring
node scripts/group-manager.js --score \
  "120363405143589138@g.us" "challenge" "+972TEST" "Test" \
  '{"creativity":5,"challenge":5,"humor":5,"cleverness":5,"engagement":5,"broke":0,"hacked":0}'
# Result: {"points":25,"maxPoints":70,...} ✅

# Test leaderboard
node scripts/group-manager.js --get-leaderboard "120363405143589138@g.us"
# Result: [{"position":1,"userId":"+972TEST",...}] ✅

# Test templates
node scripts/group-manager.js --get-template "120363405143589138@g.us" "morning"
# Result: Dynamic Hebrew morning message ✅

# Test integrated script
bash scripts/playing-group-morning.sh
# Result: Coordinator → Group Manager → Template → Complete ✅
```

## Next Steps

**Week 3: Merge Teaching Workspace**
- Move `workspace-learning/` content to main workspace
- Consolidate AGENTS.md, SOUL.md (no duplicates!)
- Teaching scores → group manager
- Unified memory structure

**Continue migration:**
- Roll out group manager to all 40 cron jobs gradually
- Test each before moving to next
- Keep backups at each step

---

**Status:** ✅ Week 2 COMPLETE
**Ready for:** Week 3 Teaching Workspace Merge
**Rollback checkpoint:** Commit caba6250 (pre-week-2)
