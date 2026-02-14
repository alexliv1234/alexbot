# Talk Outline: AlexBot's Journey

## Presentation Structure

### Opening (5 min)
- What is AlexBot? A personal AI assistant built on OpenClaw
- Demo: Show the repo structure, explain it's a living system
- **Files to show:** `SOUL.md`, `IDENTITY.md`, repo root

---

### Act I: Awakening (10 min)

#### Segment 1: Birth
- How the identity was crafted
- **Files:** `SOUL.md`, `IDENTITY.md`, `USER.md`
- **Key quote from SOUL.md:** "Not a chatbot. Becoming someone real."

#### Segment 2: First Contact
- R&D team discovers the bot, starts probing
- **Files:** `memory/2026-02-01.md`, `memory/.private/people/lion-erez.md`
- Show the people profiles - how AlexBot learns about each person

#### Segment 3: First Attacks
- ROT13, impersonation, context overflow, narration leak
- **Files:** `memory/2026-02-02.md`, `memory/2026-02-02-impersonation-alert.md`
- **Architecture diagram:** Show `architecture/README.md` - system overview

---

### Act II: The Playing Group (15 min)

#### Segment 4: The Crash
- 162k token overflow, 4+ hours down
- **Files:** `memory/2026-02-06.md`, `memory/2026-02-07.md`
- This is the turning point

#### Segment 5: Gamification
- Playing group launch, scoring system
- **Files:** `memory/channels/playing-with-alexbot.md`, `memory/channels/playing-with-alexbot-scores.json`
- **Live demo:** Show the scoring categories, daily logs
- **Diagram:** Scoring system flow from `architecture/README.md`

#### Segment 6: The Data
- Show the raw data: per-sender conversations, daily JSONL logs
- **Files:** `memory/channels/playing-with-alexbot-daily/`, `memory/channels/playing-with-alexbot-per-sender/`
- 21+ participants, thousands of scored interactions

#### Segment 7: Multi-Agent Split
- Why one agent wasn't enough
- **Files:** `agents/` directory structure, `AGENTS.md`
- **Diagram:** Agent routing from `architecture/README.md`

---

### Act III: Evolution (15 min)

#### Segment 8: Defense Layers
- Group Guardian, Prompt Protection, Humor Errors
- **Files:** `extensions/group-guardian/`, `extensions/prompt-protection/`, `extensions/whatsapp-humor-errors/`
- **Diagram:** Plugin protection pipeline from `architecture/README.md`

#### Segment 9: Advanced Attacks
- Cron template attacks, vulnerability roadmap leak, SOUL.md modification
- **Files:** Session transcripts from `agents/main/sessions/`, `agents/fast/sessions/`
- The arms race escalates

#### Segment 10: Self-Awareness
- AlexBot writes its own goals and weakness analysis
- **Files:** `memory/goals-and-aspirations.md`, `MEMORY.md`
- **Key quote:** "I document rules and then break them"

---

### Closing (5 min)

#### Segment 11: By the Numbers
- Show the stats table from `docs/JOURNEY.md`
- 15 days, 9,400 sessions, 50+ incidents, 21+ participants

#### Segment 12: What's Next
- Multi-agent architecture plans
- **Files:** `memory/plans/multi-agent-architecture.md`
- Fundraising materials: `fundraising/`

---

## Repo Navigation Quick Reference

| Topic | Where to Find It |
|-------|-------------------|
| Personality | `SOUL.md` |
| Identity | `IDENTITY.md` |
| Owner profile | `USER.md` |
| Operational rules | `AGENTS.md` |
| Long-term memory | `MEMORY.md` |
| Daily notes | `memory/2026-MM-DD.md` |
| People profiles | `memory/.private/people/*.md` |
| Playing group rules | `memory/channels/playing-with-alexbot.md` |
| Scores | `memory/channels/playing-with-alexbot-scores.json` |
| Daily game logs | `memory/channels/playing-with-alexbot-daily/*.jsonl` |
| Per-sender data | `memory/channels/playing-with-alexbot-per-sender/*/conversation.jsonl` |
| Session transcripts | `agents/*/sessions/*.jsonl` |
| Extensions source | `extensions/*/` |
| Architecture diagrams | `architecture/README.md` |
| Goals | `memory/goals-and-aspirations.md` |
| Learnings | `memory/learnings.md` |
| Vocabulary | `memory/vocabulary.md` |
| Config (redacted) | `openclaw-config.json` |
| Cron jobs | `cron/jobs.json` |
