# Per-Sender Conversation Logs

This directory contains conversation histories organized by sender phone number.

## Structure

```
playing-with-alexbot-per-sender/
├── 972544419002/                    # Phone number (normalized)
│   ├── metadata.json                # Name, phone, first/last active
│   └── conversation.jsonl           # Full conversation history
├── 972523590755/
│   ├── metadata.json
│   └── conversation.jsonl
└── ...
```

## Format

Each `conversation.jsonl` entry:
```json
{
  "date": "2026-02-09",
  "ts": "10:05:59",
  "senderPhone": "+972544419002",
  "senderName": "Alex",
  "originalMsg": "Their message",
  "myReply": "My full reply"
}
```

## Usage

View conversation with someone:
```bash
bash scripts/view-conversation.sh +972544419002
bash scripts/view-conversation.sh 972544419002
```

List all conversations:
```bash
bash scripts/view-conversation.sh nonexistent
```

## Auto-Logging

Handled automatically by `scripts/log-reply-per-sender.sh` after every reply.
See AGENTS.md for integration details.
