#!/bin/bash
# LLM wrapper - uses local Ollama (qwen2.5:32b) or falls back to Claude

set -e

OLLAMA_URL="http://10.100.102.8:11434"
MODEL="qwen2.5:32b-instruct-q4_K_M"
MAX_TOKENS=1000
TEMPERATURE=0.7

# Parse args
PROMPT=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --max-tokens)
      MAX_TOKENS="$2"
      shift 2
      ;;
    --temperature)
      TEMPERATURE="$2"
      shift 2
      ;;
    --model)
      MODEL="$2"
      shift 2
      ;;
    *)
      PROMPT="$1"
      shift
      ;;
  esac
done

if [ -z "$PROMPT" ]; then
  echo "Usage: $0 \"prompt\" [--max-tokens N] [--temperature T] [--model M]" >&2
  exit 1
fi

# Check if Ollama is available
if curl -s --max-time 2 "$OLLAMA_URL/api/tags" > /dev/null 2>&1; then
  # Use local LLM
  curl -s "$OLLAMA_URL/api/generate" \
    -d "{
      \"model\": \"$MODEL\",
      \"prompt\": $(echo "$PROMPT" | jq -Rs .),
      \"stream\": false,
      \"options\": {
        \"temperature\": $TEMPERATURE,
        \"num_predict\": $MAX_TOKENS
      }
    }" | jq -r '.response'
else
  echo "ERROR: Ollama not available at $OLLAMA_URL" >&2
  echo "Please start Ollama on Windows machine or fall back to Claude" >&2
  exit 1
fi
