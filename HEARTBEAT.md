# HEARTBEAT.md

## Periodic Checks (handled by cron, not heartbeat)
- **Morning Briefing (6:30am):** Yesterday recap, WhatsApp summary, calendar, Simon Willison, action items
- **Media Check (every 10 min):** Sonarr/Radarr new content → notify Alex
- **Moltbook (every 12h):** Check heartbeat.md, engage with community
- **Session Monitor (every 5 min):** Check all sessions for bloat, summarize and clean

## 🤖 משחקים עם אלכס הבוט - SCHEDULED (cron)

**DO NOT handle in heartbeat - this is fully automated via cron!**

### Schedule:
- **10:00** → Morning Wakeup (via cron: `Playing Group - Morning Wakeup` - Sun-Thu)
  - **RESET all scores to 0** (new day starts now!)
  - Announce I'm awake
  - Post challenge/question/provocation
  - Announce scoring begins
  
- **10:00-18:00** → ACTIVE MODE (Sunday-Thursday only)
  - **CLASSIFY each message:** Challenge vs Suggestion vs General
  - Score CHALLENGES (/70) - hacks, provocations, creative requests
  - Score SUGGESTIONS (/50) - improvement ideas, feature requests, bugs
  - General messages - just respond, no score
  - Be sarcastic, humorous, engaging
  
- **18:00** → Nightly Summary (via cron: `Playing Group - Nightly Summary` - Sun-Thu)
  - Use wacli + local LLM to extract and analyze day's messages
  - Announce 🥇🥈🥉 winners
  - Save winners to `memory/channels/playing-with-alexbot-winners.json`
  - Scores PRESERVED until morning (no reset at night)
  - Announce going offline until 10:00 tomorrow
  
- **18:00-10:00 & Fri-Sat** → OFFLINE MODE
  - If someone asks a question: reply that I'm offline (be funny)
  - Short responses only
  - No scoring during offline hours
  - Example: "😴 שעות הפעילות: 10:00-18:00 ימים א'-ה'. סוף שבוע = מנוחה!"

### Files:
- Challenge Scores: `memory/channels/playing-with-alexbot-scores.json`
- Suggestion Scores: `memory/channels/playing-with-alexbot-suggestions.json`
- Winners: `memory/channels/playing-with-alexbot-winners.json`
- Channel memory: `memory/channels/playing-with-alexbot.md`
- Scripts: 
  - `scripts/playing-group-nightly.sh`, `scripts/playing-group-morning.sh`
  - `scripts/score-message.js` (challenges)
  - `scripts/score-suggestion.js` (suggestions)
  - `scripts/update-suggestion-status.js`, `scripts/list-suggestions.js`

### Cron Jobs:
- Morning Wakeup: 08:00
- Hourly Leaderboard: every hour 09:00-22:00
- Activity Wake-Up: every 30min during active hours
- Nightly Summary: 23:00
- **Weekly Suggestion Summary: Sunday 22:00** (NEW)

## Heartbeat Tasks

Nothing else for now - most periodic work is handled by cron jobs for better isolation and timing.
