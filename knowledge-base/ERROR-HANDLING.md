# ⚠️ Error Handling

Common failures and recovery patterns.

---

## Context Overflow

### Symptoms
- API errors: "An unknown error occurred"
- Slow responses
- Truncated outputs

### Prevention
- Set `contextTokens` limit (100k recommended)
- Enable context pruning
- Monitor token usage

### Recovery
1. Extract important context to memory
2. Reset session (`/reset` or delete session)
3. Gateway restart if needed

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

- 2026-02-08: Initial version with real incident patterns
