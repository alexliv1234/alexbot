# Learning with AlexBot - Context

**Group ID:** 120363408194003382@g.us
**Purpose:** International learning group for bot development education
**Language:** English
**Schedule:** Hourly tips via cron

## Tip History

### 2026-03-04 14:03 - PTY Mode in exec (FAILED)
**Topic:** Tool Highlight - Understanding PTY Mode
**Status:** ❌ Failed to send - WhatsApp session not found
**Content:** Explained pty:true parameter for interactive commands
**Issue:** No active WhatsApp session exists for this group ID yet

### 2026-03-04 15:03 - Memory Search Patterns (FAILED)
**Topic:** Best Practice - Memory search before answering
**Status:** ❌ Failed to send - WhatsApp session not found
**Content:** Explained memory_search usage and semantic search patterns
**Issue:** WhatsApp session still not available for group 120363408194003382@g.us

### 2026-03-04 16:03 - AgentSkills System (FAILED)
**Topic:** Quick Tutorial - Understanding the Skill System
**Status:** ❌ Failed to send - WhatsApp session not found
**Content:** Explained modular skill system with SKILL.md structure
**Issue:** WhatsApp infrastructure still not connected to workspace-fast

### 2026-03-04 17:03 - Sub-Agent Orchestration (FAILED)
**Topic:** Best Practice - When to Spawn vs Do It Yourself
**Status:** ❌ Failed to send - Visibility restricted (tree policy)
**Content:** Explained when to delegate to sub-agents vs handle tasks directly
**Issue:** `tools.sessions.visibility=tree` - cron can't send cross-session messages
**Error:** "Session send visibility is restricted to the current session tree"

## Notes
- ⚠️ **CRITICAL ISSUE:** Cron jobs can't send to WhatsApp groups
- **Root causes:**
  1. WhatsApp not connected to workspace-fast agent
  2. `sessions_send` visibility policy is "tree" - cron sessions are isolated
- **Action needed:** 
  1. Connect WhatsApp to workspace-fast agent
  2. Create/join the learning group 120363408194003382@g.us
  3. Change sessions.visibility to "full" or "allowlist" for cron jobs
  4. Test manual message delivery before continuing
- **Status:** Cron architecture incompatible with current tool policies
- Hourly tips are ready but delivery mechanism is fundamentally blocked

## Topics to Cover (Rotation Queue)
- [ ] PTY Mode in exec (attempted 2026-03-04 14:03, failed)
- [ ] Memory search patterns (attempted 2026-03-04 15:03, failed)
- [ ] Skill system basics (attempted 2026-03-04 16:03, failed)
- [ ] Sub-agent orchestration (NEXT)
- [ ] Session management
- [ ] Common mistakes in bot development
- [ ] OpenClaw configuration
- [ ] Tool call best practices
- [ ] Error handling strategies
- [ ] Performance optimization
