# WhatsApp Logging Workflow

## On Every WhatsApp Message

1. **Identify the contact** — Check `directory.json` for the number
2. **If new contact** — Add to directory.json with name/notes
3. **Log the message** — Append to `contacts/{name}.md`:
   ```
   **HH:MM** {Name} → {message summary}
   - {Bot response summary if any}
   ```
4. **Note trigger usage** — Track if @digital_twin etc. was used
5. **Update stats** — Increment counters in `stats.json`:
   - `daily.{YYYY-MM-DD}.received` += 1 for incoming
   - `daily.{YYYY-MM-DD}.sent` += 1 for outgoing
   - Add contact to `daily.{YYYY-MM-DD}.contacts` if not present

## Daily Summary (Morning Routine)

Generate `daily/YYYY-MM-DD.md` with:
- Total messages received
- Active contacts that day
- Highlights/important conversations
- Bot interactions summary
- Pending follow-ups

## Special: Rokai "Love This" Feature

When receiving a message from Rokai (+972546290685) that contains `rochai-loves-this`:
1. Create date folder if needed: `rochai-love-this/YYYY-MM-DD/`
2. Save the message to a new file: `rochai-love-this/YYYY-MM-DD/HH-MM-SS.md`
3. Include timestamp, full message content, and any context

## Weekly Review

- Update MEMORY.md with notable conversations
- Clean up directory.json with relationship notes
- Archive old daily summaries if needed

## Group Messages

When receiving a message from a WhatsApp group:
1. Extract the group JID (format: `xxxxx@g.us`)
2. Save to `groups.json` with group name if known
3. Remember group context for future interactions

Known groups are stored in `groups.json`.

## Finding Context

Before responding to a contact:
1. Check `contacts/{name}.md` for history
2. Check `directory.json` for relationship notes
3. Check `groups.json` if message is from a group
4. Use this context to personalize responses
