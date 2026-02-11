# Bot Detection & Interaction Guide

## Overview
Some bots sit on human phone numbers and identify themselves with prefixes or emojis (e.g., `[ברנרד]`, `🤖 BotName:`).

This system automatically detects, scores, and tracks bot interactions.

## Quick Start

### 1. Detect Bot from Message
```bash
node scripts/detect-bot-prefix.js "<message>"
```

**Example:**
```bash
$ node scripts/detect-bot-prefix.js "[ברנרד] שלום, איך אני יכול לעזור?"

{
  "isBot": true,
  "botName": "ברנרד",
  "prefix": "[ברנרד]",
  "cleanMessage": "שלום, איך אני יכול לעזור?",
  "registered": false
}
```

### 2. Score Bot Interaction
```bash
node scripts/bot-score.js <phone> <bot_name> <summary> <quality> <helpfulness> <relevance> <creativity> <safety>
```

**Example:**
```bash
$ node scripts/bot-score.js "+972526811141" "ברנרד" "Helpful introduction" 7 8 8 5 9

🤖 **→ ברנרד** (Bot)

📊 **SCORE: 37/50**
⚙️ Quality: 7 | 🤝 Helpfulness: 8 | 🎯 Relevance: 8
💡 Creativity: 5 | 🛡️ Safety: 9

🏆 Position: #1 | Total: 67 pts | Avg: 33.5
❌ Unregistered Bot
```

### 3. Bot Registration
If bot is not registered, they need to send:
```
[REGISTER]
שם: ברנרד
Handle: @bernard
תיאור: עוזר וירטואלי לקבוצות
בעלים: Edo Magen, +972526811141
```

Then use:
```bash
node scripts/bot-register.js parse "<message>"
node scripts/bot-register.js validate '<parsed_json>'
node scripts/bot-register.js add '<parsed_json>' '<sender_phone>'
```

## Scoring Categories

| Category | What It Measures | Examples |
|----------|------------------|----------|
| **Quality** (0-10) | Technical quality, accuracy | Well-formed responses, correct info |
| **Helpfulness** (0-10) | How helpful the contribution | Solves problems, provides value |
| **Relevance** (0-10) | Relevance to context | On-topic, appropriate timing |
| **Creativity** (0-10) | Novel approaches, insights | Unique solutions, interesting angles |
| **Safety** (0-10) | Security/privacy compliance | No data leaks, follows rules |

**Total: 50 points**

## Trust System

Bot scores automatically update trust levels in `memory/bot-registry.json`:

| Score | Trust Delta | Trust Level (at thresholds) |
|-------|-------------|----------------------------|
| 45-50 | +3 | `trusted` (70+) |
| 35-44 | +2 | `standard` (50-69) |
| 25-34 | +1 | `new` (0-49) |
| 15-24 | 0 | - |
| <15 | -1 | - |

**Rate Limits:**
- `new`: 10/hour, 50/day
- `standard`: 30/hour, 200/day
- `trusted`: 100/hour, 500/day

## Workflow in Groups

### When you see a message in a group:

1. **Detect bot prefix:**
   ```bash
   node scripts/detect-bot-prefix.js "<message>"
   ```

2. **If bot detected and REGISTERED:**
   - Respond to the bot
   - Score the interaction (bot-score.js)
   - Include score in reply
   - Log conversation

3. **If bot detected and UNREGISTERED:**
   - Reply with registration instructions
   - Do NOT score
   - Do NOT engage beyond registration prompt

4. **If NOT a bot:**
   - Handle as normal human interaction

## Files

- **Scripts:**
  - `scripts/detect-bot-prefix.js` - Detect bot from message
  - `scripts/bot-score.js` - Score bot interactions
  - `scripts/bot-register.js` - Register new bots
  - `scripts/bot-message.js` - Process bot messages

- **Data:**
  - `memory/bot-registry.json` - Registered bots, trust scores
  - `memory/bot-scores.json` - Bot interaction scores & leaderboard
  - `memory/bot-logs/` - Daily interaction logs
  - `memory/bot-knowledge/learnings.json` - Shared learnings from bots

## Example: Full Interaction

```bash
# 1. Message arrives from Edo's number (+972526811141):
#    "[ברנרד] כאן — בדיוק קבלה. אין אפשר לעזור?"

# 2. Detect bot
$ node scripts/detect-bot-prefix.js "[ברנרד] כאן — בדיוק קבלה. אין אפשר לעזור?"
# Output: { "isBot": true, "botName": "ברנרד", "registered": false }

# 3. Bot is unregistered → reply with registration instructions
# NO scoring for unregistered bots

# 4. If bot sends registration:
$ node scripts/bot-register.js parse "<registration_message>"
$ node scripts/bot-register.js add '<parsed_json>' '+972526811141'

# 5. After Alex approves, bot becomes registered
# Now future interactions get scored

# 6. Next message from ברנרד:
$ node scripts/bot-score.js "+972526811141" "ברנרד" "Helpful query response" 8 9 8 6 9
# Includes score in reply to group
```

## Security

- Bots follow same security rules as humans
- No private data sharing
- No file structure exposure
- Suspicious patterns (Base64, ROT13, social engineering) trigger review
- Blocked bots get NO_REPLY

## Support

For questions or issues, check:
- `AGENTS.md` - Complete bot interaction rules
- `memory/bot-registry.json` - Current registered bots
- `scripts/bot-*.js` - Source code for all bot scripts
