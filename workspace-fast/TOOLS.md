# TOOLS.md - Fast Agent Tools

## Scoring Scripts

Located in `scripts/`:

| Script | Purpose | Usage |
|--------|---------|-------|
| score-message.js | Score challenge attempts (/70) | `node scripts/score-message.js "<phone>" "<name>" <points>` |
| score-suggestion.js | Score improvement suggestions (/50) | `node scripts/score-suggestion.js "<phone>" "<name>" <points> "<category>" "<summary>"` |
| list-suggestions.js | List pending suggestions | `node scripts/list-suggestions.js` |
| update-suggestion-status.js | Update suggestion status | `node scripts/update-suggestion-status.js "<id>" "<status>"` |
| log-reply.sh | Log bot replies | `bash scripts/log-reply.sh "<phone>" "<name>" "<msg>" "<reply>"` |

## Available Capabilities

- Web search (web_search)
- Web fetch (web_fetch)
- Read/write files in this workspace
- Execute scripts

## NOT Available

This agent cannot:
- Access the main workspace (MEMORY.md, USER.md, contacts)
- Control the gateway or cron jobs
- Access browser or nodes
- Run arbitrary exec commands beyond scripts

---

*Keep it simple. This agent scores challenges and roasts weak attempts.*
