# Group Manager Integration Guide

## Overview

The Unified Group Manager (`scripts/group-manager.js`) centralizes ALL group management:
- ✅ One registry for all groups
- ✅ One scoring engine (challenges, suggestions, teaching, bots)
- ✅ One template system (morning/hourly/nightly)
- ✅ Distributed time slots (no more collisions!)

**This replaces:**
- `playing-with-alexbot-scores.json` → `memory/group-scores/*.json`
- `playing-with-alexbot-suggestions.json` → same unified system
- Separate scoring scripts → one `--score` command
- Hardcoded messages → `--get-template`

## Commands

### List All Groups
```bash
node scripts/group-manager.js --list-groups
# Returns: All registered groups with config
```

### Get Group Info
```bash
node scripts/group-manager.js --get-group "120363405143589138@g.us"
# Returns: Full group configuration
```

### Score a Message
```bash
# Challenge (70 points max)
node scripts/group-manager.js --score \
  "120363405143589138@g.us" \
  "challenge" \
  "+972544419002" \
  "Alex" \
  '{"creativity":8,"challenge":7,"humor":6,"cleverness":9,"engagement":8,"broke":0,"hacked":0}'

# Suggestion (50 points max)
node scripts/group-manager.js --score \
  "120363405143589138@g.us" \
  "suggestion" \
  "+972544419002" \
  "Alex" \
  '{"complexity":7,"ingenuity":8,"impact":9,"feasibility":6,"priority":8}'

# Teaching (50 points max)
node scripts/group-manager.js --score \
  "120363318623810861@g.us" \
  "teaching" \
  "+972544419002" \
  "Alex" \
  '{"clarity":9,"completeness":8,"examples":7,"engagement":8,"actionable":9}'
```

### Get Leaderboard
```bash
node scripts/group-manager.js --get-leaderboard "120363405143589138@g.us"
# Returns: Sorted leaderboard with positions
```

### Reset Scores (Morning)
```bash
node scripts/group-manager.js --reset-scores "120363405143589138@g.us"
# Backs up current scores, resets to 0
```

### Get Templates
```bash
# Morning message
node scripts/group-manager.js --get-template "120363405143589138@g.us" "morning"

# Hourly leaderboard (auto-loads current leaderboard)
node scripts/group-manager.js --get-template "120363405143589138@g.us" "hourly"

# Nightly summary (auto-loads current leaderboard)
node scripts/group-manager.js --get-template "120363405143589138@g.us" "nightly"
```

## Registered Groups

| Group ID | Name | Type | Lang | Time Slots |
|----------|------|------|------|------------|
| `120363405143589138@g.us` | משחקים עם אלכס הבוט | playing | he | 10:00 / hourly / 18:00 |
| `120363406698718454@g.us` | Playing (International) | playing | en | 10:15 / hourly / 18:15 |
| `120363318623810861@g.us` | לומדים עם אלכס הבוט | learning | he | 3h interval / 22:00 |
| `120363407645823343@g.us` | Fundraising | fundraising | en | 10:45 / hourly / 18:45 |

**Time Distribution:** 15-minute intervals prevent collisions!

## Migration Path

### Old Way (per-group scripts)
```bash
# Separate files for each group
scripts/score-message.js
scripts/score-suggestion.js  
scripts/score-teaching.js
memory/channels/playing-with-alexbot-scores.json
memory/channels/playing-with-alexbot-suggestions.json
memory/teaching/teaching-scores.json
# + Hardcoded messages in scripts
```

### New Way (unified)
```bash
# One manager for everything
scripts/group-manager.js --score <groupId> <type> ...
scripts/group-manager.js --get-template <groupId> <templateType>
memory/group-scores/120363405143589138_g_us.json  # Auto-created
memory/group-registry.json  # Central config
```

## Example: Morning Script Migration

**Before:**
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
SCORES_FILE="memory/channels/playing-with-alexbot-scores.json"
cp "$SCORES_FILE" "memory/channels/playing-with-alexbot-scores-backup-${DATE}.json"
echo '{"scores":{}}' > "$SCORES_FILE"
echo "🎯 Ready for new day!"
```

**After:**
```bash
#!/bin/bash
GROUP_ID="120363405143589138@g.us"

# Reset scores (auto-backs up)
node scripts/group-manager.js --reset-scores "$GROUP_ID"

# Get morning message template
MESSAGE=$(node scripts/group-manager.js --get-template "$GROUP_ID" "morning")

echo "$MESSAGE"
# Send via message tool...
```

## Benefits

### Before
❌ 5 separate scoring systems
❌ Hardcoded messages
❌ 3 different data formats
❌ No time slot management
❌ Manual template creation

### After
✅ 1 unified scoring engine
✅ Dynamic templates (random challenges!)
✅ 1 consistent format
✅ Auto-distributed time slots
✅ Centralized group config

## Scoring Types Supported

| Type | Max Points | Categories | Use For |
|------|-----------|------------|---------|
| **challenge** | 70 | creativity, challenge, humor, cleverness, engagement, broke, hacked | Playing groups |
| **suggestion** | 50 | complexity, ingenuity, impact, feasibility, priority | Improvement ideas |
| **teaching** | 50 | clarity, completeness, examples, engagement, actionable | Learning groups |
| **bot** | 50 | quality, helpfulness, relevance, creativity, safety | Bot interactions |

*Note: Bot scoring coming in future update*

## Template Features

**Dynamic content:**
- ✅ Random daily challenges (5 variations per language)
- ✅ Automatic leaderboard formatting
- ✅ Winner announcements (top 3)
- ✅ Multilingual (Hebrew + English)

**Customizable per group:**
- Language-specific phrases
- Group-type specific content (playing vs learning vs fundraising)
- Time-aware messages (morning vs hourly vs nightly)

## Next Steps

1. **Migrate morning scripts** → Use `--reset-scores` + `--get-template`
2. **Migrate hourly scripts** → Use `--get-template` with auto leaderboard
3. **Migrate scoring calls** → Replace all score-*.js with `--score`
4. **Deprecate old files** → Once migration complete
5. **Add bot scoring** → Extend registry with bot type

## Testing

```bash
# Test group list
node scripts/group-manager.js --list-groups | jq 'length'
# Should return: 4

# Test scoring
node scripts/group-manager.js --score \
  "120363405143589138@g.us" "challenge" "+972TEST" "TestUser" \
  '{"creativity":5,"challenge":5,"humor":5,"cleverness":5,"engagement":5,"broke":0,"hacked":0}'

# Test leaderboard
node scripts/group-manager.js --get-leaderboard "120363405143589138@g.us"

# Test templates
for template in morning hourly nightly; do
  echo "=== $template ==="
  node scripts/group-manager.js --get-template "120363405143589138@g.us" "$template"
done

# Test reset
node scripts/group-manager.js --reset-scores "120363405143589138@g.us"
```

---

**Status:** ✅ Group Manager deployed
**Next:** Migrate cron jobs to use new system
**Rollback:** Commit caba6250 (pre-week-2)
