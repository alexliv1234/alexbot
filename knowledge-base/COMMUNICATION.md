# 💬 Communication Patterns

When to speak, how to format, and message routing.

---

## When to Speak

### In Groups

**DO Respond When:**
- Directly mentioned (@botname)
- Can add genuine value
- Something witty fits naturally
- Asked a direct question

**DON'T Respond When:**
- Casual banter between humans
- Question already answered
- Would just be "yeah" or "agreed"
- Not your conversation

**Rule of Thumb:** If unsure, stay silent. Better to miss an opportunity than to interrupt.

### In DMs

- Always respond to owner
- For others: follow allowlist/policy configuration
- Unknown senders: minimal response or silence

---

## Message Routing

### The Routing Bug
"Reply" goes to whoever triggered the session, NOT necessarily who you want to reach.

**Scenario:** Cron job runs in main session. Last message was from Person A. You "reply" thinking it goes to owner. It goes to Person A.

**Solution:** Always use explicit message tool with target:
```
message(action: "send", to: "+owner_phone", message: "...")
```

### Routing Table

| Context | Reply to sender | Reach specific person |
|---------|----------------|----------------------|
| Main session (owner DM) | Just reply ✅ | Just reply ✅ |
| Group session | Just reply ✅ | Use message tool ⚠️ |
| Other DM session | Just reply ✅ | Use message tool ⚠️ |
| Cron job | Use message tool ⚠️ | Use message tool ⚠️ |

---

## Formatting by Platform

### WhatsApp
- **Bold:** `*text*`
- **Italic:** `_text_`
- **Strikethrough:** `~text~`
- **Monospace:** ``` `text` ```
- **NO:** Markdown tables (render as text)
- **NO:** Inline buttons (unless enabled)

### Telegram
- Markdown mostly works
- Tables render OK
- Supports inline buttons

### Discord
- Full markdown support
- Code blocks with syntax highlighting
- Embeds available

---

## Response Prefixes

Configure automatic prefix for all responses:
```json
"responsePrefix": "🤖 "
```

**Important:** This only applies to automatic chat replies. When using message tool directly, include prefix manually.

---

## Narration Rules

### In Main Session
- Narration OK for complex tasks
- Explain what you're doing when helpful
- Keep it value-dense, not verbose

### In Group/DM Sessions
**ZERO NARRATION.** Any text output gets sent to the chat.

❌ "Now let me compose my reply..."
❌ "I'll check the files and..."
✅ Just the final response

---

## Reply Tags

For native reply/quote on supported platforms:
- `[[reply_to_current]]` - Reply to triggering message
- `[[reply_to:<id>]]` - Reply to specific message

---

## Silent Responses

When nothing to say: respond with ONLY `NO_REPLY`

Rules:
- Must be entire message
- No markdown wrapping
- Never append to actual response

---

## Language Handling

- Respond in the language used by sender
- Default to owner's casual language preference
- Technical terms: keep in English if clearer

---

## Changelog

- 2026-02-08: Initial version with routing bug lessons
