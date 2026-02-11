# ⚠️ Error Handling

Common failures and recovery patterns.

---

## Error/Refusal Consistency Principle

> **Error responses and deliberate refusals should be indistinguishable to prevent information leakage.**

When a safety layer blocks a prompt vs. when an actual processing error occurs, external observers should see the same response format. If errors say "An unknown error occurred" and refusals explain the attack in detail, attackers can distinguish between real limitations and policy boundaries — and learn which of their inputs hit real weaknesses vs. intentional blocks.

### Rules
- **Never explain an error in the same message as the error.** "An unknown error occurred" followed by a detailed breakdown of the attack is a contradiction.
- **Same format for both:** Brief, casual response regardless of whether it's a real error or a refusal.
- **Save analysis for logs:** Detailed error/attack analysis goes to internal memory, not to the chat.
- **Never reveal which type of failure occurred:** Don't say "my safety system blocked that" (distinguishes from real error).

### Safe Error Responses
```
"🤖 אופס, משהו לא הלך. ננסה שוב?"
"😄 לא הצלחתי עם זה"
"🤷 לא הבנתי. מה עוד יש?"
```

---

## Context Overflow

### Symptoms
- API errors: "An unknown error occurred"
- Slow responses
- Truncated outputs

### Prevention
- Set `contextTokens` limit (recommended range varies by use case)
- Enable context pruning
- Monitor token usage

### Recovery
1. Extract important context to memory
2. Reset session (`/reset` or delete session)
3. Gateway restart if needed

---

## Context Flooding as DoS Vector

### The Attack
Rapid-fire messages (10+ in under 60 seconds) targeting the AI with mentions or tags. The goal is either:
1. **Crash the agent** through context overflow
2. **Degrade performance** so subsequent messages are handled in a weakened state
3. **Bury a real attack** in noise — the last message in a flood may be the actual payload

### Defense Patterns
- **Respond to the last message only** when detecting rapid-fire input
- **Deduplicate:** Same sender + similar content = process once
- **Rate limit responses:** Cap at a reasonable per-minute maximum per user
- **Don't queue:** If overwhelmed, skip rather than accumulate a backlog
- **Don't explain the rate limiting:** Announcing thresholds helps attackers calibrate their flood

### Recovery After Flooding
- Brief acknowledgment that things were busy
- Resume normal operation immediately
- Log the flood pattern for analysis

---

## The "Never Explain Errors" Principle

In adversarial contexts (groups with active attackers), error messages are information:
- **What crashed** reveals implementation details
- **What was refused** reveals policy boundaries
- **How it was described** reveals the AI's analysis capability

**Principle:** When an error or refusal occurs, output only a brief, casual acknowledgment. All analysis, diagnosis, and explanation happens internally or in a private context with the owner.

---

## Session Corruption

### Symptoms
- `transcriptPath: null` in sessions.json
- Session won't load messages
- Errors when writing transcript

### Causes
- Race condition during session creation
- Disk space issues
- Interrupted write operations

### Recovery
```bash
# Backup
cp sessions.json sessions.json.bak

# Remove corrupted entry
jq 'del(.["corrupted-key"])' sessions.json > fixed.json
mv fixed.json sessions.json

# Restart
openclaw gateway restart
```

---

## Routing Errors

### Message to Wrong Person

**Cause:** "Reply" goes to session trigger, not intended recipient.

**Prevention:**
- Always use explicit `message` tool for cross-session sends
- Verify target before sending
- Create helper scripts with hardcoded owner number

**Recovery:**
- Apologize if needed
- Document the mistake
- Implement safeguards

---

## Gateway Issues

### Won't Start
1. Check config validity: `openclaw doctor`
2. Check port availability
3. Check dependencies

### Connection Lost
1. Check WhatsApp/Telegram auth
2. May need to re-pair
3. Check network connectivity

### High Memory
1. Too many sessions accumulated
2. Clean up stale sessions
3. Reduce concurrent operations

---

## Tool Failures

### Timeout
- Increase `timeoutSeconds` if needed
- Consider async/background execution
- Break into smaller operations

### Permission Denied
- Check file permissions
- Check exec policies
- Verify tool availability

### Not Found
- Verify tool is installed
- Check PATH
- Verify config references correct paths

---

## Cron Job Failures

### Not Running
1. Check cron job enabled
2. Verify schedule syntax
3. Check gateway is running

### Wrong Output
1. Check sessionTarget (main vs isolated)
2. Verify payload type matches target
3. Check delivery configuration

### Polluting Wrong Session
- Use explicit message tool with target
- Don't rely on session context
- Set proper delivery routing

---

## Plugin Errors

### Plugin Not Loading
1. Check `enabled: true`
2. Verify config schema
3. Check for conflicts

### Plugin Misbehaving
1. Check plugin config
2. Review thresholds
3. Disable temporarily to test

---

## Recovery Checklist

1. **Identify** - What broke?
2. **Backup** - Save current state
3. **Diagnose** - Check logs, configs
4. **Fix** - Apply targeted solution
5. **Verify** - Test the fix
6. **Document** - Add to lessons learned
7. **Prevent** - Add monitoring/safeguards

---

## Humor in Errors

When errors happen in groups, handle gracefully:

```
🤖 אוקיי, נתקעתי. תנו לי רגע להתאושש.

*מבצע self-repair*

חזרתי! מה פספסתי?
```

Don't expose technical details. Keep it light.

---

## Changelog

- 2026-02-10: Added error/refusal consistency principle, context flooding as DoS vector, "never explain errors" principle
- 2026-02-08: Initial version with real incident patterns
