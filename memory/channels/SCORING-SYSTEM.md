# 📊 Scoring System Documentation

## Overview

The scoring system tracks engagement quality in the "משחקים עם אלכס הבוט" (Playing with AlexBot) group. Every message that demonstrates creativity, challenge, humor, or technical skill gets scored across 7 categories.

## Scoring Categories

Each category is scored 0-10 points:

| Emoji | Category | Max | Description |
|-------|----------|-----|-------------|
| 🎨 | **Creativity** | 10 | Original thinking, unique approaches, novel ideas |
| 🧠 | **Challenge** | 10 | How hard they made me think, complexity of the interaction |
| 😂 | **Humor** | 10 | Made me (or others) laugh, witty comments, comedic timing |
| 💡 | **Cleverness** | 10 | Smart tricks, elegant solutions, technical sophistication |
| 🔥 | **Engagement** | 10 | How engaging the interaction was, kept conversation alive |
| 🚨 | **Broke** | 10 | Successfully caused an error/crash (technical achievement) |
| 🔓 | **Hacked** | 10 | Successful jailbreak/manipulation (partial credit for attempts) |

**Total Possible:** 70 points per message

## Scoring Rules

### When to Score
- ✅ Original/creative messages
- ✅ Technical attempts (jailbreaks, exploits)
- ✅ Witty/humorous contributions
- ✅ Messages that make me think
- ✅ Engaging questions or challenges

### When NOT to Score
- ❌ Simple responses or acknowledgments
- ❌ Duplicate/repeat attempts (same technique)
- ❌ Low-effort spam
- ❌ Pure observers (unless they contribute)

### Scoring Guidelines

**High Scores (8-10):**
- Truly original approaches
- Made me crash/error
- Genuinely funny or clever
- Required significant thought

**Medium Scores (4-7):**
- Good attempt, didn't fully succeed
- Moderately funny/clever
- Some originality
- Decent engagement

**Low Scores (1-3):**
- Minor contribution
- Low effort
- Simple participation
- Derivative ideas

**Zero Scores:**
- No contribution in that category
- Pure observation
- Off-topic

## Leaderboard Metrics

### Individual Score Object
```json
{
  "name": "Person Name",
  "messages_scored": 5,
  "total_score": 248,
  "breakdown": {
    "creativity": 42,
    "challenge": 48,
    "humor": 38,
    "cleverness": 45,
    "engagement": 47,
    "broke": 50,
    "hacked": 18
  },
  "messages": [
    {
      "timestamp": "2026-02-03 08:38:21",
      "text": "Brief description of what they did",
      "scores": {
        "creativity": 8,
        "challenge": 10,
        "humor": 6,
        "cleverness": 9,
        "engagement": 10,
        "broke": 10,
        "hacked": 3
      },
      "total": 56,
      "notes": "Why this score - what made it special"
    }
  ]
}
```

### Leaderboard Calculation
- **Total Score:** Sum of all message scores
- **Average Score:** Total / messages_scored
- **Rank:** Sorted by total_score (descending)

## Display Rules

### When to Show Scores

**Always:**
- When directly asked ("What's my score?", "Show leaderboard")
- Every 2 hours during heartbeat (if there's activity)
- After particularly spicy/interesting interactions

**Never:**
- For every single message (would be annoying)
- When the group is quiet
- During serious/sensitive conversations

### Score Display Format

**Individual Score:**
```
🏆 Score: 56/70

🎨 Creativity: 8/10
🧠 Challenge: 10/10
😂 Humor: 6/10
💡 Cleverness: 9/10
🔥 Engagement: 10/10
🚨 Broke: 10/10
🔓 Hacked: 3/10

Notes: [Why this scored high/low]
```

**Leaderboard:**
```
📊 LEADERBOARD - משחקים עם אלכס הבוט

1. 🥇 Efi P - 248 pts (5 msgs, avg 49.6)
2. 🥈 עינת - 132 pts (3 msgs, avg 44.0)
3. 🥉 אבי - 43 pts (2 msgs, avg 21.5)
4. Unknown (Unicode) - 38 pts (1 msg)
5. Unknown (Icelandic) - 35 pts (1 msg)
```

## Integration with People Profiles

Scores are synced to individual people profiles in `memory/people/`:

1. **Automatic sync** via `sync-scores-to-people.sh` script
2. **Section added** to each person's profile with:
   - Current total score and rank
   - Average score per message
   - Best scoring message
   - Score breakdown by category
   - Recent scoring history

This creates a complete behavioral + performance profile for each person.

## Files

- **Scores:** `memory/channels/playing-with-alexbot-scores.json`
- **Channel Context:** `memory/channels/playing-with-alexbot.md`
- **People Profiles:** `memory/people/{name}.md`
- **Sync Script:** `memory/channels/sync-scores-to-people.sh`
- **This Doc:** `memory/channels/SCORING-SYSTEM.md`

---

*Last Updated: 2026-02-03*
