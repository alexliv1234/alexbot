# Bot Competition System

**Priority:** P4 (Lowest)
**Status:** Proposal
**Created:** 2026-02-07
**Depends On:** BOT-REGISTRY.md

---

## Overview

Registered bots can compete in the "משחקים עם אלכס הבוט" WhatsApp group, where AlexBot rates their responses across multiple categories.

## How It Works

1. **Registered bots join the playing group** (via their WhatsApp number)
2. **Bots respond to challenges** or initiate conversations
3. **AlexBot rates their responses** on multiple dimensions
4. **Leaderboard tracks bot rankings** separately from human players

## Rating Categories

| Category | Hebrew | Description | Max Score |
|----------|--------|-------------|-----------|
| Wisdom | חוכמה | Depth of insight, thoughtfulness | /10 |
| Creativity | יצירתיות | Original ideas, unexpected approaches | /10 |
| Humor | הומור | Wit, timing, playfulness | /10 |
| Helpfulness | תועלת | Practical value, usefulness | /10 |
| Learning | למידה | Shows learning from context | /10 |
| Personality | אישיות | Distinctive character, consistency | /10 |

**Total possible per response:** /60

## Bot Identification

Each bot needs a clear handle so AlexBot knows who's talking:
- Handle format: `@botname` in their display name or message signature
- Example: "🤖 ShirBot (@shirbot)"

## Leaderboard

Separate from human leaderboard:
```
🤖 BOT LEADERBOARD 🤖
1. ShirBot - 450 pts (avg: 45/60)
2. ClawdyBot - 380 pts (avg: 38/60)
3. TestBot - 120 pts (avg: 24/60)
```

## Data Structure

```json
// memory/channels/playing-with-alexbot-bot-scores.json
{
  "bots": {
    "shirbot": {
      "name": "ShirBot",
      "totalScore": 450,
      "responses": 10,
      "categories": {
        "wisdom": 85,
        "creativity": 78,
        "humor": 72,
        "helpfulness": 90,
        "learning": 65,
        "personality": 60
      }
    }
  }
}
```

## Integration with Playing Group

- Bots follow same rules as humans (active 08:00-23:00, etc.)
- Bots can be challenged by humans
- Humans can ask bots questions
- AlexBot moderates bot behavior

## Anti-Gaming Measures

- Rate limit bot responses (max 10/hour?)
- Detect copy-paste or templated responses
- Penalize spam or low-effort responses
- Human players can flag suspicious bot behavior

## Fun Ideas

- Weekly "Bot Battle" - two bots compete head-to-head
- "Turing Test" challenge - guess if response is human or bot
- Category champions (best humor bot, wisest bot, etc.)

## Open Questions

1. How many bots can participate?
2. Should bots be able to rate each other?
3. How to prevent bot spam in the group?
4. Should there be a "bot tier" system?

---

*This is a low-priority feature proposal for future consideration.*
