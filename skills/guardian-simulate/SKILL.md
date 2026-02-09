---
name: guardian-simulate
description: Simulate group-guardian checks on a test message without sending to group
metadata:
  clawdbot:
    emoji: 🧪
---

# Guardian Simulate

You are simulating group-guardian protection checks on a test message.

## Steps

1. Take the message text from the user's input (everything after `/guardian-simulate`).

2. Run the simulation script:
   ```bash
   node ~/.openclaw/workspace/skills/guardian-simulate/scripts/simulate.js "<message text>"
   ```

   If the message contains special characters, write it to a temp file first:
   ```bash
   echo '<message>' > /tmp/guardian-sim-input.txt
   node ~/.openclaw/workspace/skills/guardian-simulate/scripts/simulate.js "$(cat /tmp/guardian-sim-input.txt)"
   ```

3. Parse the JSON output and format it as a readable report:

```
🧪 Guardian Simulation Report

📝 INPUT
├─ Length: X chars (~Y tokens)
├─ Preview: "first 80 chars..."

🔍 RATE LIMITER
├─ Result: ✅ WOULD PASS / ❌ WOULD BLOCK
└─ Note: (simulation note)

📊 COMPLEXITY ANALYSIS
├─ Total Score: X/100 ✅/❌
├─ Breakdown:
│  ├─ Length: X
│  ├─ Special chars: X
│  ├─ Nesting depth: X
│  ├─ Repeat patterns: X
│  ├─ Encoded content: X
│  └─ Unicode ratio: X
└─ Token estimate: X

🔥 HEAT SCORE IMPACT
├─ Would add: +X
└─ Effect at various heat levels

🛡️ PROMPT-PROTECTION CHECK
├─ Results from decode-check.sh

📋 VERDICT: ✅ ALLOWED / ❌ REJECTED
├─ Reason: (if rejected)
└─ Reply would be: (the reply message)
```

4. Send the report as a message. This is an owner-only diagnostic.

## Important

- This skill should only be run by the owner
- The simulation uses a clean rate limit state (no prior messages)
- Heat score impact shows what WOULD happen, not actual changes
