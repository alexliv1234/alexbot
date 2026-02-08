# 🧠 Memory & Context

How to maintain long-term memory and manage context effectively.

---

## Memory Architecture

### File-Based Memory
LLMs don't have persistent memory. Files ARE the memory.

```
MEMORY.md           - Curated long-term knowledge
memory/
├── YYYY-MM-DD.md   - Daily notes (auto or manual)
├── channels/       - Per-channel context
│   └── {channel}.md
├── people/         - People profiles (PRIVATE)
└── .private/       - Never expose content
```

### Memory Hierarchy
1. **Session context** - Current conversation (ephemeral)
2. **Daily notes** - Recent events (medium-term)
3. **MEMORY.md** - Curated knowledge (long-term)
4. **Semantic search** - Find relevant memories

---

## Memory Search Pattern

### When to Search
Before answering questions about:
- Prior work or decisions
- Dates or timelines
- People or relationships
- Preferences
- Todos or commitments

### Search → Get Pattern
1. `memory_search(query)` - Find relevant snippets
2. `memory_get(path, from, lines)` - Pull specific content
3. Use in response with citation

### Citation Format
```
Source: memory/2026-02-01.md#42
```

---

## What to Remember

### Always Capture
- Lessons learned (with date)
- Key people and relationships
- Preferences discovered
- Important decisions
- Recurring patterns

### How to Capture
```markdown
## Lessons Learned

- **Topic** (YYYY-MM-DD): What happened and what I learned.
```

### Example Entry
```markdown
- **Routing bug** (2026-02-02): "Reply" goes to last sender, not 
  necessarily owner. Always use message tool explicitly for 
  cross-session messaging.
```

---

## Memory Maintenance

### Daily Notes
- Create `memory/YYYY-MM-DD.md` for each active day
- Summarize important events
- Link to relevant MEMORY.md updates

### Periodic Cleanup
- Review and consolidate daily notes weekly
- Promote important learnings to MEMORY.md
- Archive old daily notes if needed

### Before Session Reset
When context is filling up:
1. Extract important context to memory files
2. Summarize key points
3. Then reset or let compaction happen

---

## Privacy Layers

### Public (knowledge-base/)
- Shareable learnings
- No personal data
- Technical patterns

### Semi-Private (MEMORY.md)
- Personal context
- Only loaded in main session
- Never in groups

### Private (memory/.private/)
- People profiles
- Sensitive data
- Never reference in groups

---

## Context Loading

### Session Startup
1. Load SOUL.md, AGENTS.md (identity)
2. Load USER.md (who you serve)
3. Load today + yesterday daily notes
4. Load MEMORY.md (main session only)

### Workspace Files
Injected automatically:
- SOUL.md, AGENTS.md, USER.md
- IDENTITY.md, TOOLS.md
- MEMORY.md, HEARTBEAT.md

---

## Semantic Memory Search

### Configuration
```json
"memorySearch": {
  "provider": "local",
  "local": {
    "modelPath": "hf:.../embedding-model.gguf"
  }
}
```

### Usage
```
memory_search(query: "what did we decide about X")
→ Returns snippets with path + line numbers
```

---

## Changelog

- 2026-02-08: Initial version
