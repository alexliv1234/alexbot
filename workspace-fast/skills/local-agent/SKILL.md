# Local Agent Skill

A powerful local LLM agent wrapper that can execute multi-step tasks autonomously using qwen2.5:32b.

## Configuration

```bash
OLLAMA_URL="http://10.100.102.8:11434"
OLLAMA_MODEL="qwen2.5:32b-instruct-q4_K_M"
```

## Usage

Call the local agent for tasks that don't require Claude's context or sensitive actions:

```bash
/home/alexliv/.openclaw/workspace/skills/local-agent/agent.sh "Your task here"
```

Or from Claude, use:
```bash
source /home/alexliv/.openclaw/workspace/skills/local-agent/agent.sh
local_agent "Research the top 5 AI startups in Israel"
```

## Supported Tools

| Tool | Description | Safety |
|------|-------------|--------|
| `read_file` | Read file contents | ✅ Safe |
| `write_file` | Write/create files | ⚠️ Non-destructive paths only |
| `exec_command` | Run shell commands | ⚠️ Allowlist enforced |
| `web_search` | Search the web | ✅ Safe |
| `web_fetch` | Fetch URL content | ✅ Safe |
| `list_directory` | List files in dir | ✅ Safe |
| `gmail_search` | Search emails | ✅ Safe |
| `gmail_read` | Read email content | ✅ Safe |
| `calendar_list` | List calendar events | ✅ Safe |
| `think` | Internal reasoning step | ✅ Safe |

## Safety Controls

- **No direct messaging** - Can draft but not send WhatsApp/Telegram
- **No destructive commands** - rm, delete, drop blocked
- **File write restricted** - Only to workspace and /tmp
- **Max steps limit** - Prevents infinite loops
- **Timeout per step** - Prevents hanging

## Architecture

```
┌─────────────────────────────────────────┐
│           LOCAL AGENT LOOP              │
│                                         │
│  1. Receive task                        │
│  2. Send to LLM with tool definitions   │
│  3. Parse response for tool calls       │
│  4. Execute tools, collect results      │
│  5. Feed results back to LLM            │
│  6. Repeat until "FINAL_ANSWER" or max  │
│  7. Return result                       │
└─────────────────────────────────────────┘
```
