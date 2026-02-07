# Session Management Workflow

## Overview
Active monitoring of all sessions with smart summarization and learning at different levels.

## Monitoring Strategy

### Check Frequency: Every 5 minutes (cron)

### Size Thresholds (KB)
| Type | Notice | Warning | Critical | Action |
|------|--------|---------|----------|--------|
| **Group** | 300KB | 500KB | 800KB | Clean early - groups bloat fast |
| **DM** | 500KB | 1MB | 1.5MB | More lenient - richer context |
| **Main** | 1MB | 2MB | 3MB | Most lenient - my primary workspace |

## Summarization Levels

### NOTICE (Yellow Flag)
- Log the size
- No action yet
- Monitor next check

### WARNING (Orange Flag)
- **For Groups:**
  - Start extracting context to `memory/channels/{group}.md`
  - Update participant list
  - Capture key dynamics
  - Note recent topics
  
- **For DMs:**
  - Extract person details to their contact memory
  - Capture preferences discovered
  - Note communication style
  
- **For Main:**
  - Review for MEMORY.md updates
  - Capture important learnings

### CRITICAL (Red Flag)
- **Immediate summarization required**
- Extract all context using LLM
- Save to appropriate memory files
- **Learn from the session:**
  - What went well?
  - What caused bloat?
  - Communication patterns?
  - Mistakes made?
  - Insights discovered?
- Update `memory/session-learning.md`
- Delete session file (context preserved)
- Let session restart fresh

## Learning Mechanism

### After Each Interaction
1. **Reflect** (quick):
   - Did my response help?
   - Did I understand correctly?
   - Was my tone appropriate?
   - Did I miss context?

2. **Capture** (if notable):
   - Log to `memory/session-learning.md`
   - Update relevant memory files
   - Adjust approach for next time

### During Summarization
1. **Extract patterns:**
   - Who talks how
   - What topics matter
   - Communication styles
   - Cultural context
   - Relationship dynamics

2. **Update knowledge:**
   - MEMORY.md (long-term)
   - Channel memory (group-specific)
   - Contact files (person-specific)
   - Session learning log

3. **Improve responses:**
   - What worked → do more
   - What failed → avoid
   - What confused → clarify next time

## Session Types Detected

### Group Sessions
- Multiple participants
- WhatsApp groups, Discord channels
- High message volume
- Need channel memory files

### DM Sessions  
- One-on-one conversations
- More personal context
- Need contact memory files

### Main Session
- Direct with Alex
- Can access all private data
- Most important context

## File Structure

```
memory/
├── session-monitor-config.json    # Thresholds and rules
├── session-learning.md            # What I learn over time
├── channels/                      # Group-specific memory
│   ├── clawders.md
│   ├── playing-with-alexbot.md
│   └── esh-*.md
└── whatsapp/contacts/             # Person-specific memory
    ├── {name}.md
    └── ...
```

## Cron Job
Runs every 5 minutes:
- Check all sessions
- Identify type (group/dm/main)
- Apply appropriate threshold
- Summarize if needed
- Learn from interaction
- Clean up when critical

## Manual Triggers
Alex can always request:
- "Summarize this conversation"
- "What have we learned?"
- "Clean up sessions"
- "Show session stats"
