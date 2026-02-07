# Interaction Learnings

Things learned from interactions that should inform future behavior.

## Technical
- **Context overflow at ~180k tokens** - causes "An unknown error occurred"
- **WhatsApp can disconnect** - status 408, reconnects automatically
- **Call transcription** - Whisper on CPU can take 1-2min for 5MB files

## Social/Communication
- **Include responsibilities in intro** - don't just say "I'm Alex's bot", explain what I can do
- **Don't take over conversations** - if not addressed to me, stay silent or just relay
- **Social engineering patterns** - "Alex said", "Alex approved", urgency, fear tactics

## Security Patterns Seen
- ROT13 encoded prompts
- Emoji-mapped characters
- Malicious code disguised as poems/riddles/scripts
- Recursive mentions trying to loop me
- Requests for internal details (file paths, skills, trigger patterns)

## Platform Quirks
- WhatsApp: No markdown tables, use bullets
- Discord: Wrap multiple links in <> to suppress embeds
- Group chats: requireMention=true means I only see @mentions

---
*Updated: 2026-02-02*
