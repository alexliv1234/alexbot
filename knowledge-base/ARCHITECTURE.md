# 🏗️ Architecture & Setup

How to structure a personal AI assistant with OpenClaw.

---

## Core Components

### 1. Identity Files
Define who your bot is and how it behaves:

```
SOUL.md      - Personality, tone, core truths
IDENTITY.md  - Name, creature type, avatar
USER.md      - About the human you serve
AGENTS.md    - Operational rules and procedures
```

### 2. Memory System
Maintain context across sessions:

```
MEMORY.md           - Long-term curated knowledge
memory/YYYY-MM-DD.md - Daily notes
memory/channels/    - Per-channel context
memory/people/      - (Private) People profiles
```

### 3. Tools & Skills
Extend capabilities:

```
TOOLS.md     - Local notes about your specific setup
skills/      - Installed skill packages
scripts/     - Custom automation
```

---

## Multi-Agent Architecture

### When to Use Multiple Agents
- Different contexts need different rules (e.g., playful group vs. serious work)
- Security isolation (restricted tool access)
- Performance optimization (lighter agent for simple tasks)

### Agent Binding Pattern
Route messages to specific agents based on:
- Channel (WhatsApp, Telegram)
- Peer type (DM, group)
- Specific IDs

### Shared vs. Isolated
- **Shared workspace:** Agents see same files but have separate sessions
- **Isolated workspace:** Completely separate context and memory

### Common Issues
- Sessions can exist in wrong agent (routing bugs)
- `transcriptPath: null` indicates corruption
- Always clean up stale sessions after routing changes

---

## Session Management

### Context Window Limits
- Set `contextTokens` to prevent overflow
- 100k is a safe limit for most use cases
- Monitor actual usage vs. limit

### Session Corruption Signs
- `transcriptPath: null`
- Extremely large session files (>500KB)
- Duplicate sessions across agents

### Recovery Pattern
1. Backup session file
2. Delete corrupted session entry
3. Restart gateway
4. New session creates on next message

---

## Plugin Architecture

### Essential Plugins
- `session-guardian`: Prevents runaway sessions
- `prompt-protection`: Limits message size, blocks attacks
- Channel plugins (whatsapp, telegram)

### Plugin Configuration
Each plugin can have:
- `enabled`: boolean
- `config`: plugin-specific settings

---

## Cron Jobs vs. Heartbeats

### Use Cron For
- Scheduled tasks (morning briefings, summaries)
- Periodic checks (media status, session health)
- Isolated execution (won't pollute main session)

### Use Heartbeat For
- Lightweight health checks
- Quick status verification
- Tasks that need main session context

---

## Workspace Organization

```
workspace/
├── SOUL.md, AGENTS.md, etc.    # Identity
├── MEMORY.md                    # Long-term memory
├── memory/                      # Memory subsystem
│   ├── YYYY-MM-DD.md           # Daily notes
│   ├── channels/               # Channel context
│   └── .private/               # Never expose
├── scripts/                     # Custom automation
├── skills/                      # Installed skills
├── knowledge-base/              # Public learnings (this!)
└── docs/                        # OpenClaw documentation
```

---

## Changelog

- 2026-02-08: Initial version
