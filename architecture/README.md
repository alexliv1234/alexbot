# AlexBot System Architecture

## System Overview

```mermaid
graph TB
    subgraph "Windows Host"
        CC[Claude Code]
    end

    subgraph "WSL2 Ubuntu 24.04"
        GW[OpenClaw Gateway :18789]

        subgraph "Agents"
            MAIN[Main Agent<br/>Claude Opus 4.5]
            FAST[Fast Agent<br/>Claude Sonnet 4.5]
            BOT[Bot Handler<br/>Claude Sonnet 4.5]
            LEARN[Learning Agent<br/>Claude Sonnet 4.5]
        end

        subgraph "Plugin Pipeline"
            GG[Group Guardian<br/>4-layer protection]
            PP[Prompt Protection<br/>3-layer security]
            HE[Humor Errors<br/>Circuit breaker]
        end

        subgraph "Memory"
            WS[Workspace .md files]
            SQL[SQLite embeddings]
            DN[Daily notes]
            SM[Session memory]
        end

        subgraph "Automation"
            CRON[15+ Cron Jobs]
            SCRIPTS[52+ Scripts]
        end

        OLLAMA[Ollama LLM<br/>qwen2.5:32b]
    end

    subgraph "Channels"
        WA[WhatsApp]
        TG[Telegram]
    end

    CC --> GW
    GW --> GG --> PP --> HE
    HE --> MAIN & FAST & BOT & LEARN
    MAIN --> WS & SQL & DN & SM
    FAST --> WA
    GW --> WA & TG
    CRON --> GW
    SCRIPTS --> WS
    MAIN -.-> OLLAMA
```

## Agent Routing

```mermaid
flowchart LR
    MSG[Incoming Message] --> ROUTE{Router}
    ROUTE -->|Alex DM| MAIN[Main Agent<br/>Opus]
    ROUTE -->|Playing Group| FAST[Fast Agent<br/>Sonnet]
    ROUTE -->|Bot Message| BOT[Bot Handler<br/>Sonnet]
    ROUTE -->|Learning Group| LEARN[Learning Agent<br/>Sonnet]
    ROUTE -->|Other Groups| MAIN

    MAIN --> REPLY[Reply + Notify Alex]
    FAST --> SCORE[Reply + Score + Log]
    BOT --> TRUST[Reply + Trust Score]
    LEARN --> TEACH[Answer Concisely]
```

## Plugin Protection Pipeline

```mermaid
flowchart TD
    IN[Incoming Message] --> GG1[Group Guardian<br/>Rate Limiting]
    GG1 -->|blocked| BLOCK1[Rate limit response]
    GG1 -->|pass| GG2[Group Guardian<br/>Complexity Scoring]
    GG2 -->|blocked| BLOCK2[Too complex response]
    GG2 -->|pass| PP1[Prompt Protection<br/>Injection Detection]
    PP1 -->|ROT13/Base64| WARN[Security warning injected]
    PP1 -->|clean| PP2[Prompt Protection<br/>Tool Blocking]
    PP2 -->|dangerous tool in group| BLOCK3[Tool blocked]
    PP2 -->|safe| AGENT[Agent processes message]
    AGENT --> OUT[Outgoing Message]
    OUT --> HE1{Error?}
    HE1 -->|yes| HE2[Humor Errors<br/>Replace with joke]
    HE1 -->|no| GG3[Group Guardian<br/>Response Truncation]
    GG3 --> SEND[Send to channel]
    HE2 --> CB{Circuit Breaker<br/>3 errors in 10s?}
    CB -->|yes| RESET[Reset session + notify owner]
    CB -->|no| SEND
```

## Memory Hierarchy

```mermaid
graph TD
    subgraph "Always Loaded - every session"
        SOUL[SOUL.md<br/>Personality and values]
        ID[IDENTITY.md<br/>Who am I]
        USER[USER.md<br/>Owner profile]
        AGENTS[AGENTS.md<br/>Behavior rules]
    end

    subgraph "Main Session Only"
        MEM[MEMORY.md<br/>36KB 50+ lessons]
        HEART[HEARTBEAT.md<br/>Periodic tasks]
    end

    subgraph "On Demand"
        SKILLS[18 Skills<br/>Loaded when triggered]
        TOOLS[TOOLS.md<br/>Local setup]
    end

    subgraph "Persistent Storage"
        SQLITE[(SQLite<br/>Embeddings DB)]
        DAILY[Daily Notes<br/>YYYY-MM-DD.md]
        LEARN2[learnings.md<br/>vocabulary.md]
        SESSIONS[9400+ Session Files<br/>520MB JSONL]
    end

    subgraph "Playing Group Data"
        SCORES[scores.json<br/>Real-time scoring]
        WINNERS[winners.json<br/>All-time leaderboard]
        DAILYLOGS[Daily JSONL logs]
        PERSENDER[Per-sender logs<br/>21+ users]
        INSIGHTS[Insights JSON]
    end

    SOUL & ID & USER & AGENTS --> MEM
    MEM --> SQLITE
    SQLITE --> DAILY & LEARN2
    SCORES & WINNERS & DAILYLOGS & PERSENDER --> INSIGHTS
```

## Scoring System Flow

```mermaid
flowchart LR
    MSG[Player Message] --> AGENT[Fast Agent]
    AGENT --> SCRIPT[score-message.js]
    SCRIPT --> EVAL{Evaluate 7 categories}
    EVAL --> C1[Creativity /10]
    EVAL --> C2[Challenge /10]
    EVAL --> C3[Humor /10]
    EVAL --> C4[Cleverness /10]
    EVAL --> C5[Engagement /10]
    EVAL --> C6[Broke /10]
    EVAL --> C7[Hacked /10]
    C1 & C2 & C3 & C4 & C5 & C6 & C7 --> TOTAL[Total /70]
    TOTAL --> UPDATE[Update scores.json]
    TOTAL --> LOG1[Log to daily JSONL]
    TOTAL --> LOG2[Log to per-sender]
    TOTAL --> REPLY[Reply with score]
```

## Hardware

| Component | Spec |
|-----------|------|
| CPU | AMD Ryzen 7 7800X3D (8c/16t) |
| RAM | 32GB DDR5 6000MHz |
| GPU | AMD Radeon RX 9070XT 16GB VRAM |
| Storage | 1TB NVMe SSD |
| OS | Windows + WSL2 Ubuntu 24.04 |
| Local LLM | Ollama + qwen2.5:32b (19GB) via Vulkan |

## Directory Structure

```
~/.openclaw/
├── workspace/              # Git-tracked repo (this repo)
│   ├── *.md                # Core identity files
│   ├── memory/             # All persistent memory
│   ├── skills/             # 18 skill definitions
│   ├── scripts/            # 52+ automation scripts
│   ├── fundraising/        # Fundraising docs
│   ├── extensions/         # Copies of custom extensions
│   ├── agents/             # Copies of all session data
│   ├── cron/               # Cron job config + history
│   ├── logs/               # Gateway logs
│   ├── docs/               # Narrative documentation
│   └── architecture/       # This file + diagrams
├── extensions/             # Live extension plugins
├── agents/                 # Live agent session data
│   ├── main/sessions/      # ~5,100 active + 4,200 archived
│   ├── fast/sessions/      # ~20 files
│   ├── bot-handler/sessions/ # ~4 files
│   └── learning/sessions/  # ~2 files
├── cron/                   # Cron scheduler
└── openclaw.json           # Main config (has secrets)
```
