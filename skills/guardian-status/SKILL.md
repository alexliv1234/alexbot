---
name: guardian-status
description: Show group guardian protection status and diagnostics
metadata:
  clawdbot:
    emoji: 🛡️
---

# Guardian Status Report

You are generating a diagnostic report for the group-guardian protection system.

## Steps

1. Run the diagnostic script:
   ```bash
   bash ~/.openclaw/workspace/skills/guardian-status/scripts/guardian-check.sh
   ```

2. Read the state file for heat scores and stats:
   ```
   ~/.openclaw/data/group-guardian/state.json
   ```

3. Format the output as a clean status report using this template:

```
🛡️ Group Guardian Status Report

📡 HOOK STATUS
(from script output - show PATCHED/MISSING/NATIVE for each hook)

🔌 PLUGIN STATUS
(from script output - show loaded plugins)

🔥 HEAT SCORES (Top 5)
(from state.json - show user, score, and level)

⏱️ RATE LIMITS
(from state.json - show currently limited users and recent blocks)

📊 LAST 24H STATS
(from state.json - show messages processed, rejected, breakdown by type)

⚙️ CONFIG
(show key config values: target group, limits, thresholds)
```

4. Send the report as a message. This is an owner-only diagnostic - do not share with the group.

## Important

- This skill should only be run by the owner
- If the state file doesn't exist yet, report that the plugin may not have started
- If the diagnostic script fails, report what you can from available data
