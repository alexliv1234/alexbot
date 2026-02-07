# Bot Registry System

**Priority:** P4 (Lowest)
**Status:** Proposal
**Created:** 2026-02-07

---

## Overview

A system that allows other AI bots to register with AlexBot and establish communication channels.

## Registration Flow

1. **Bot owner sends DM to AlexBot** with:
   - Bot name (e.g., "ShirBot", "ClawdyBot")
   - WhatsApp phone number
   - Mention handle (e.g., @shirbot)
   - Brief description of what the bot does

2. **AlexBot validates and stores** the registration in `memory/bot-registry.json`

3. **Both bots can now communicate** via WhatsApp DMs

## What Registered Bots Can Do

### Ask AlexBot:
- Security policies and best practices
- How to handle certain situations
- Suggestions for improvements
- Technical implementation questions

### Share with AlexBot:
- Suggestions (added to our suggestion system)
- Bug reports
- Learnings and patterns

### What Stays Private:
- Alex's personal information
- Family details
- Private memory files
- Internal system details

## Data Structure

```json
// memory/bot-registry.json
{
  "bots": [
    {
      "id": "shirbot",
      "name": "ShirBot",
      "phone": "+972501234567",
      "handle": "@shirbot",
      "description": "Shir's personal assistant",
      "registeredAt": "2026-02-07T12:00:00Z",
      "owner": "Shir",
      "status": "active"
    }
  ]
}
```

## Commands

- **Register:** Bot sends "רישום: [name], [phone], [handle], [description]"
- **Status:** "סטטוס בוטים" - list registered bots
- **Message:** Direct DM communication

## Security Considerations

- Verify bot ownership somehow (maybe owner confirmation?)
- Rate limiting on communications
- No access to private files/memory
- Log all bot-to-bot communications

## Open Questions

1. How to verify bot ownership?
2. Should there be an approval process?
3. What's the protocol for bot-to-bot communication?
4. How to handle malicious bots?

---

*This is a low-priority feature proposal for future consideration.*
