# DM Router Agent

## Overview

A centralized DM routing system that handles all incoming WhatsApp DMs based on configurable rules, eliminating the need for config changes and restarts when adding new routing rules.

## Problem Statement

Currently, WhatsApp DMs are handled via `allowList` in OpenClaw config:
- Adding new allowed numbers requires config change + restart
- No dynamic routing based on sender type
- Bot-to-bot communication requires manual intervention
- Parent permissions were incorrectly documented as "complete silence"

## Solution

Create a DM Router agent that:
1. Receives ALL incoming DMs (via `dmPolicy: "open"`)
2. Evaluates sender against a priority-ordered rule set
3. Routes/handles according to matching rule
4. Logs all routing decisions

## Routing Rules (Priority Order)

### Priority 1: Family (Parents) - FULL ACCESS

| Person | Phone | Languages | Status |
|--------|-------|-----------|--------|
| אמא (רעיה) | +972523335482 | Russian, Hebrew | ✅ Full Access |
| אבא | +972523334825 | Russian (preferred), Hebrew | ✅ Full Access |

**Permissions (almost everything!):**
- ✅ Direct messages - respond conversationally
- ✅ Reminders - for themselves or to remind Alex about things
- ✅ Calendar - view Alex's availability (times only, not meeting details/attendees)
- ✅ Relay messages - send messages to Alex through me
- ✅ Weather/general info - answer questions
- ✅ Help with tasks - anything reasonable they ask
- ✅ Translation help - Russian ↔ Hebrew ↔ English

**Restrictions:**
- ❌ Cannot access Alex's private files/data
- ❌ Cannot make purchases or financial actions
- ❌ Cannot modify my settings/config
- ❌ Cannot access work/esh information

**Preferred language:** Russian (with Hebrew fallback)
**Tone:** Warm, respectful, patient - they are family!

### Priority 2: Registered Bots

**Source:** `bots/registry.json`

**Behavior:**
- Process according to Bot Protocol (LEARN, ALERT, QUERY, etc.)
- Validate trust level before certain operations
- Log all bot interactions

### Priority 3: Owner (Alex)

**Phone:** +972544419002

**Behavior:**
- Route to main session
- Full access to all capabilities

### Priority 4: VIP List (Future)

**Source:** `dm-rules/vip.json` (to be created)

**Behavior:**
- Custom handling per VIP
- Configurable permissions

### Priority 5: Default (Unknown)

**Behavior:**
- NO_REPLY (silent)
- Log for review

## Implementation

### Phase 1: Config Changes

Update `openclaw.json`:
```json
{
  "channels": {
    "whatsapp": {
      "dmPolicy": "open"
    }
  },
  "agents": {
    "list": [
      {
        "id": "dm-router",
        "name": "DM Router",
        "workspace": "/home/alexliv/.openclaw/workspace/workspace-dm-router",
        "model": "anthropic/claude-sonnet-4-5",
        "tools": {
          "profile": "messaging",
          "deny": ["gateway", "browser", "canvas", "nodes"]
        }
      }
    ]
  },
  "bindings": [
    {
      "agentId": "dm-router",
      "match": {
        "channel": "whatsapp",
        "peer": {
          "kind": "dm"
        }
      }
    }
  ]
}
```

### Phase 2: Router Workspace

Create `/workspace-dm-router/` with:
- `AGENTS.md` - Router-specific instructions
- `SOUL.md` - Router personality (minimal, efficient)
- `dm-rules.json` - Dynamic rules configuration

### Phase 3: Rules File

`dm-rules.json`:
```json
{
  "version": "1.0",
  "rules": [
    {
      "id": "family-mom",
      "type": "family",
      "phone": "+972523335482",
      "name": "אמא (רעיה)",
      "languages": ["ru", "he"],
      "permissions": ["full-conversation", "reminders", "calendar-view", "relay-to-owner", "weather", "translation", "general-help"],
      "restrictions": ["no-private-files", "no-financial", "no-config", "no-work-data"],
      "tone": "warm-family",
      "action": "respond"
    },
    {
      "id": "family-dad",
      "type": "family",
      "phone": "+972523334825",
      "name": "אבא",
      "languages": ["ru", "he"],
      "languagePreference": "ru",
      "permissions": ["full-conversation", "reminders", "calendar-view", "relay-to-owner", "weather", "translation", "general-help"],
      "restrictions": ["no-private-files", "no-financial", "no-config", "no-work-data"],
      "tone": "warm-family",
      "action": "respond"
    },
    {
      "id": "bots",
      "type": "bot-registry",
      "source": "bots/registry.json",
      "action": "bot-protocol"
    },
    {
      "id": "owner",
      "type": "owner",
      "phone": "+972544419002",
      "action": "main-session"
    },
    {
      "id": "default",
      "type": "default",
      "action": "silent"
    }
  ]
}
```

### Phase 4: Router Agent Instructions

The router agent will:
1. Read `dm-rules.json` on each message
2. Match sender phone against rules (in priority order)
3. Execute appropriate action
4. Log decision to `logs/dm-routing.jsonl`

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `workspace-dm-router/AGENTS.md` | Create | Router agent instructions |
| `workspace-dm-router/SOUL.md` | Create | Minimal personality |
| `workspace-dm-router/dm-rules.json` | Create | Routing rules |
| `MEMORY.md` | Update | Fix family rules documentation |
| `openclaw.json` | Modify | Add dm-router agent + binding |

## Testing Plan

1. Test family DM handling (Russian response)
2. Test bot DM handling (protocol compliance)
3. Test owner DM routing (main session)
4. Test unknown number (silent)
5. Verify logging works

## Security Considerations

- Family phone numbers in rules file (acceptable - private workspace)
- Bot registry validation before protocol execution
- No external action without owner approval
- All routing logged for audit

## Rollback Plan

If issues occur:
1. Revert `dmPolicy` to `"allowlist"`
2. Remove dm-router agent and binding
3. Restore original `allowFrom` list

## Timeline

- Phase 1: Config preparation (~10 min)
- Phase 2: Workspace creation (~15 min)
- Phase 3: Rules file (~5 min)
- Phase 4: Testing (~15 min)

Total: ~45 minutes

## Related Issues

- Bot Registry System (implemented)
- Bot-to-Bot Protocol (implemented)

## Status

🔴 **On Hold - Architecture Decision Made**

### Alex's Decision (2026-02-07):

**No centralized DM Router.** Instead:

1. **Explicit bindings per bot** - Each number/bot gets a specific binding in config
2. **Alex approves each addition** - No auto-registration, Alex controls when bindings are added
3. **Alex controls restarts** - Since bindings require restart, this means Alex decides when refresh happens

**Implication:** Instead of a smart router that handles all DMs dynamically, we use OpenClaw's native binding system with manual approval. This is more controlled but requires restart for each new binding.

**Current approach:**
```json
"bindings": [
  {
    "agentId": "bot-handler",
    "match": {
      "channel": "whatsapp",
      "peer": { "kind": "dm", "id": "+972XXXXXXXXX" }
    }
  }
  // Each bot gets its own explicit binding
]
```

**Trade-offs:**
- ✅ Alex has full control over who gets routed where
- ✅ No risk of rogue routing decisions
- ✅ Simpler architecture (no router agent needed)
- ❌ Requires restart for each new binding
- ❌ More manual work when adding bots

---

*Created: 2026-02-07*
*Author: AlexLivBot*
