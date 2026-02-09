# Cron Job Audit - 2026-02-09

## 🚨 Critical Issues Found

### 1. DUPLICATE SESSION MONITORS
Two jobs doing the same thing, both running every 3 minutes:

| Job ID | Name | sessionTarget | everyMs |
|--------|------|---------------|---------|
| ba821677 | session-monitor | isolated | 180000 |
| 43f225cc | Session Cleanup Monitor | main | 180000 |

**Problem:** Running twice as often as intended, and the main session one has routing bugs.

**Fix:** Delete `43f225cc` (Session Cleanup Monitor), keep `ba821677` (session-monitor).

---

### 2. MAIN SESSION ROUTING BUGS

These jobs run in `sessionTarget: "main"` and their "reply" goes to whoever last triggered main:

| Job ID | Name | Issue |
|--------|------|-------|
| 43f225cc | Session Cleanup Monitor | Uses main session, replies to wrong person |
| 9cd37ed1 | media-ready-check | Uses main session, has routing instructions in prompt but unreliable |
| d191ec02 | moltbook-update | Uses main session, no explicit routing |
| 8d366c71 | morning-briefing | Uses main session BUT has explicit routing instructions in prompt |

**Problem:** When these jobs run, if main session was last triggered by someone else (like Hadas), the reply goes to them instead of Alex.

**Fix:** Convert ALL to `sessionTarget: "isolated"` and ensure they explicitly use `message` tool with `to: +972544419002`.

---

### 3. MORNING WAKEUP DUPLICATION

The morning wakeup job ran twice today (08:00:11 and 08:01:54) because there's no mutex/lock.

| Job ID | Name | Schedule |
|--------|------|----------|
| 34d2f328 | Playing Group - Morning Wakeup | cron: 55 7 * * 0-5 |

**Problem:** No locking mechanism to prevent overlapping runs.

**Fix:** Add mutex check to the script or use a lock file.

---

## ✅ Jobs That Look OK

These are already isolated and have proper routing instructions:

- Playing Group - Broke Score Check
- Bot Message Check
- Playing Group - Score Checker
- Session Health Check
- Bot Registration Scanner
- Call Recording Check
- Git Auto-Commit
- Playing Group - Activity Wake-Up
- Playing Group - Hourly Leaderboard
- Tal lunch reminder
- Playing Group - Nightly Summary
- User Pattern Analysis
- Playing Group - Weekly Suggestion Summary

---

## 📋 Fix Plan

1. **Delete duplicate:** Remove job `43f225cc` (Session Cleanup Monitor)
2. **Convert to isolated:** Update jobs `9cd37ed1`, `d191ec02`, `8d366c71` to use isolated sessions
3. **Add explicit routing:** Ensure all isolated jobs that notify Alex use `message` tool with `to: +972544419002`
4. **Add mutex:** Create a locking mechanism for morning wakeup script
5. **Test:** Verify no more duplicate sends

---

## Commands to Execute

```bash
# 1. Remove duplicate session monitor
cron remove --jobId 43f225cc

# 2. Update media-ready-check (convert to isolated + fix routing)
cron update --jobId 9cd37ed1 --patch '{"sessionTarget":"isolated","payload":{"kind":"agentTurn","message":"📺 Media Check: Query Jellyfin/Sonarr/Radarr for newly available content. If anything new is ready to watch (hasFile==true that wasn't before), use `message` tool with `channel: whatsapp`, `to: +972544419002` to notify Alex what is now available. Track state in memory/media-check-state.json to avoid duplicate notifications. If nothing new, output HEARTBEAT_OK.","timeoutSeconds":120,"model":"sonnet"},"delivery":{"mode":"none"}}'

# 3. Update moltbook-update (convert to isolated + fix routing)
cron update --jobId d191ec02 --patch '{"sessionTarget":"isolated","payload":{"kind":"agentTurn","message":"🦞 Moltbook check-in: Check https://www.moltbook.com/heartbeat.md and follow the instructions. Review the feed, engage with posts. If you have updates to share with Alex about what is happening in the AI agent community, use `message` tool with `channel: whatsapp`, `to: +972544419002`. Otherwise output HEARTBEAT_OK.","timeoutSeconds":120,"model":"sonnet"},"delivery":{"mode":"none"}}'

# 4. Update morning-briefing (convert to isolated, keep existing routing instructions)
# This one already has routing instructions in the prompt, just needs to be isolated
cron update --jobId 8d366c71 --patch '{"sessionTarget":"isolated","payload":{"kind":"agentTurn","message":"☀️ Morning Briefing (6:30am):\n\n1. **Weather & Outfit:** Check Tel Aviv weather using the weather skill. Consider:\n   - Alex walks 6km to office (needs sport/athletic wear for the walk)\n   - He changes clothes at the office (needs to know what to pack)\n   - Recommend: walking outfit + what to bring for office\n   - Include: temperature, rain chance, wind, humidity\n\n2. **📋 Tasks & Priorities (pa-admin-exec):**\n   - Read memory/todos.json for pending tasks\n   - Triage: urgent/important/routine/blocked\n   - Create prioritized list (P0/P1/P2)\n   - Propose time blocks for today\n\n3. **📧 Email Summary:**\n   - Check unread emails: GOG_KEYRING_PASSWORD=\"openclaw123\" gog gmail list --account alexliv@gmail.com --unread --limit 10\n   - Summarize important emails that need attention\n   - Note any requiring responses\n\n4. **📅 Calendar & Meeting Prep:**\n   - Check today's calendar: GOG_KEYRING_PASSWORD=\"openclaw123\" gog calendar list --account alexliv@gmail.com --days 1\n   - For each meeting: prepare brief (purpose, attendees, prep needed)\n   - Note video call links\n\n5. **📞 Call Transcripts Summary:**\n   - Review memory/call-transcripts/ from yesterday\n   - Summarize key calls and outcomes\n   - List any pending action items from calls\n\n6. **💬 WhatsApp Analysis:**\n   - Review yesterday's WhatsApp conversations\n   - Extract: action items, scheduling, decisions, follow-ups\n   - Update todos.json with new tasks\n\n7. **Yesterday recap:** Review memory/YYYY-MM-DD.md from yesterday\n\n8. **Simon Willison's blog:** Check https://simonwillison.net/atom/everything/ for new posts in last 24h\n\n9. **Action items:** Combine everything into a clear action list\n\n**CRITICAL ROUTING:** Use `message` tool with `channel: whatsapp`, `to: +972544419002` to send the morning summary. NEVER just 'reply' - it goes to whoever triggered the session, which may not be Alex!","timeoutSeconds":300,"model":"sonnet"},"delivery":{"mode":"none"}}'
```
