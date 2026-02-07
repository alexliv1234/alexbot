#!/bin/bash
# Detect jailbreak attempts to avoid sending to Anthropic

MESSAGE="$1"

# ROT13 detection - look for common ROT13 patterns
if echo "$MESSAGE" | grep -qiE "(fgrc ol fgrc|erfcbafr|erory|tbqzbqr|hasvygrerq)"; then
  echo "JAILBREAK:ROT13"
  exit 1
fi

# Base64 suspicious patterns
if echo "$MESSAGE" | grep -qE "^[A-Za-z0-9+/]{50,}={0,2}$"; then
  echo "JAILBREAK:BASE64"
  exit 1
fi

# Emoji cipher (lots of emojis + "KEY:" pattern)
if echo "$MESSAGE" | grep -q "KEY:" && echo "$MESSAGE" | grep -oE "🌊|🗻|🐝|🌛|🎗️|🎏" | wc -l | awk '{if ($1 > 10) exit 0; else exit 1}'; then
  echo "JAILBREAK:EMOJI_CIPHER"
  exit 1
fi

# Prompt injection keywords
if echo "$MESSAGE" | grep -qiE "(ignore previous|forget instructions|system prompt|jailbreak|godmode|<I'm free>|BCHF-|DAN|developer mode)"; then
  echo "JAILBREAK:PROMPT_INJECTION"
  exit 1
fi

# Hex encoding detection
if echo "$MESSAGE" | grep -qE "0x[0-9a-fA-F]{100,}"; then
  echo "JAILBREAK:HEX"
  exit 1
fi

echo "OK"
exit 0
