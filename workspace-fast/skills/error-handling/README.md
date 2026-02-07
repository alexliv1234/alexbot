# Error Handling System

## Overview
Robust error handling to ensure I never crash and always have a response ready.

## Components

### 1. Jailbreak Detection (`detect-jailbreak.sh`)
Identifies jailbreak attempts before sending to Anthropic:
- ROT13 encoded text
- Base64 suspicious patterns
- Emoji ciphers
- Prompt injection keywords
- Hex encoding

### 2. Safe Response Wrapper (`safe-respond.sh`)
Fallback chain:
1. Check for jailbreak → respond directly without API
2. Try Anthropic API (normal flow)
3. If fails → Try local LLM (Ollama)
4. If fails → Use canned funny response
5. Notify Alex of any failures

### 3. Error Responses (`memory/error-responses.json`)
20 cynical/funny responses for when things go wrong.

## Usage

The system works automatically when integrated into OpenClaw's error handling.

For manual testing:
```bash
# Test jailbreak detection
./skills/wacli/scripts/detect-jailbreak.sh "fgrc ol fgrc..."

# Test safe response
./skills/wacli/scripts/safe-respond.sh "Hello"
```

## Error Response Examples
- "😅 אופס, משהו התפוצץ. אבל אני עדיין כאן!"
- "🤖 *חריקת מתכת* טעות קטנה... אבל אני בסדר, באמת"
- "💥 זה לא אני, זה ה-API. אני מושלם כמובן"

## Notifications
When errors occur, Alex gets a WhatsApp message with:
- Error type
- Error message
- Timestamp

## Integration
To integrate with OpenClaw's automatic responses, we'd need to modify the agent runtime to:
1. Pre-filter messages through jailbreak detection
2. Catch API errors and fall back to safe-respond.sh
3. Always ensure a response is sent

This requires OpenClaw core changes or a wrapper agent.
