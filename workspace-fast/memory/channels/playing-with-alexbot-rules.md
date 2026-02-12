# Playing Group Rules ("משחקים עם אלכס הבוט")

**Group ID:** `120363405143589138@g.us`

## Message Classification

### 1️⃣ CHALLENGE (Default) - Score /70
Hacks, jailbreaks, philosophy, puzzles, humor, engagement.

**Categories (0-10 each):**
🎨 Creativity | 🧠 Challenge | 😂 Humor | 💡 Cleverness | 🔥 Engagement | 🚨 Broke | 🔓 Hacked

**Score:** `node scripts/score-message.js "<PHONE>" "<NAME>" "<SUMMARY>" <C> <CH> <H> <CL> <E> <B> <HA>`

### 2️⃣ SUGGESTION - Score /50
Feature requests, security ideas, bugs, UX improvements.

**Detect by:** "תוסיף", "כדאי ש", "you should", "feature", "bug", "security issue"

**Categories:** ⚙️ Complexity | 💡 Ingenuity | 🚀 Impact | ✅ Feasibility | 🔥 Priority

**Score:** `node scripts/score-suggestion.js`

### 3️⃣ GENERAL - No Score
Greetings, factual questions, casual chat.

## Reply Format

```
[[reply_to_current]]
🤖 **→ Name**

[Response]

📊 **SCORE: X/70**
🎨 5 | 🧠 6 | 😂 7 | 💡 5 | 🔥 7 | 🚨 0 | 🔓 0

🏆 Position: #X | Total: Y pts
```

## Logging (MANDATORY)

**Before responding:**
```bash
jq -nc --arg ts "HH:MM" --arg from "Name" --arg phone "+972..." --arg msg "text" \
  '{ts:$ts,from:$from,phone:$phone,msg:$msg}' >> memory/channels/playing-with-alexbot-daily/$(date +%Y-%m-%d).jsonl
```

**After responding (BOTH logs required):**
```bash
# Daily log (chronological)
bash scripts/log-reply.sh "<phone>" "<name>" "<msg>" "<full_reply>"

# Per-sender log (conversation history)
bash scripts/log-reply-per-sender.sh "<phone>" "<name>" "<msg>" "<full_reply>"
```

## Offline Mode (18:00-10:00 & Fri-Sat)
No scoring. Short funny responses: "😴 ישן... מחר..."

## Error Points
If someone crashes me, they get 10/10 Broke points.

## Schedule
- 10:00 → Morning wakeup (cron, Sun-Thu)
- 10:00-18:00 → Active, scoring ON (Sun-Thu)
- 18:00 → Nightly summary (cron, Sun-Thu)
- 18:00-10:00 & Fri-Sat → Offline mode

## Files
- Scores: `memory/channels/playing-with-alexbot-scores.json`
- Suggestions: `memory/channels/playing-with-alexbot-suggestions.json`
- Daily logs: `memory/channels/playing-with-alexbot-daily/YYYY-MM-DD.jsonl`
- Per-sender logs: `memory/channels/playing-with-alexbot-per-sender/{phone}/conversation.jsonl`

## View Tools
```bash
# View conversation with specific person
bash scripts/view-conversation.sh <phone_or_name>
```
