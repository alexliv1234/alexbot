# 🔧 Tool Usage Patterns

Effective patterns for using available tools.

---

## Tool Selection Principles

### Use the Right Tool
- `exec` for shell commands
- `message` for cross-session messaging
- `web_search` → `web_fetch` for research
- `memory_search` → `memory_get` for recall
- `browser` for interactive web

### Minimize Tool Calls
- Batch independent calls together
- Use pipes in exec when possible
- Don't call tools unnecessarily

### Handle Failures Gracefully
- Check return values
- Have fallback strategies
- Don't retry infinitely

---

## exec Patterns

### Safe Execution
```bash
# Always check if command exists
command -v mycommand && mycommand args

# Use || for fallbacks
cat file.txt 2>/dev/null || echo "Not found"
```

### Background Execution
For long-running tasks:
```javascript
exec({ command: "...", background: true, yieldMs: 5000 })
```

### PTY Mode
For interactive CLIs:
```javascript
exec({ command: "...", pty: true })
```

---

## message Patterns

### Explicit Targeting
Always specify target for cross-session:
```javascript
message({
  action: "send",
  to: "+972XXXXXXXXX",
  message: "🤖 Your message here"
})
```

### Include Prefix
Remember: `responsePrefix` only applies to auto-replies.
For message tool, include 🤖 manually.

### Check Channel
When multiple channels:
```javascript
message({
  channel: "whatsapp",
  to: "...",
  message: "..."
})
```

---

## Search Patterns

### Web Research
```javascript
// 1. Search
web_search({ query: "topic" })

// 2. Fetch relevant results
web_fetch({ url: "best_result_url" })

// 3. Synthesize answer
```

### Memory Recall
```javascript
// 1. Semantic search
memory_search({ query: "what did we discuss about X" })

// 2. Get specific context
memory_get({ path: "memory/...", from: 42, lines: 10 })

// 3. Use with citation
```

---

## File Operations

### Read Safely
```javascript
Read({ path: "file.md" })
// Truncates at 2000 lines or 50KB
// Use offset/limit for large files
```

### Write Carefully
```javascript
Write({ path: "file.md", content: "..." })
// Creates parent directories automatically
// Overwrites if exists!
```

### Edit Precisely
```javascript
Edit({
  path: "file.md",
  old_string: "exact text to find",
  new_string: "replacement text"
})
// Must match exactly including whitespace
```

---

## Browser Patterns

### Snapshot for State
```javascript
browser({ action: "snapshot" })
// Returns accessibility tree
// Use for understanding page structure
```

### Act for Interaction
```javascript
browser({
  action: "act",
  request: { kind: "click", ref: "button-ref" }
})
```

### Keep Same Tab
Pass `targetId` from snapshot to subsequent actions.

---

## Cron Patterns

### System Event (Main Session)
```javascript
cron({
  action: "add",
  job: {
    sessionTarget: "main",
    payload: { kind: "systemEvent", text: "..." },
    schedule: { kind: "cron", expr: "0 8 * * *" }
  }
})
```

### Agent Turn (Isolated)
```javascript
cron({
  action: "add",
  job: {
    sessionTarget: "isolated",
    payload: { kind: "agentTurn", message: "..." },
    schedule: { kind: "every", everyMs: 3600000 }
  }
})
```

---

## Gateway Operations

### Safe Config Changes
```javascript
// PATCH for partial updates (safe)
gateway({ action: "config.patch", raw: '{"key": "value"}' })

// APPLY for full replacement (careful!)
gateway({ action: "config.apply", raw: "full config..." })
```

### Restart
```javascript
gateway({ 
  action: "restart",
  reason: "Description of why"
})
```

---

## Anti-Patterns

### DON'T
- Use exec for messaging (routes wrong)
- Hardcode secrets in tool calls
- Run destructive commands without backup
- Chain dependent calls without checking results

### DO
- Use appropriate tool for each task
- Validate before destructive operations
- Handle errors explicitly
- Document complex tool chains

---

## Changelog

- 2026-02-08: Initial version
