#!/bin/bash
# Quick session bloat check - runs on every interaction
# Summarizes with local LLM before deleting
# THRESHOLD: 500KB (not 5MB) to catch problems earlier

SESSION_DIR="$HOME/.openclaw/agents/main/sessions"
THRESHOLD_KB=500
WORKSPACE="$HOME/.openclaw/workspace"

# Find bloated sessions (>500KB)
BLOATED=$(find "$SESSION_DIR" -name "*.jsonl" -size +${THRESHOLD_KB}k 2>/dev/null)

if [ -z "$BLOATED" ]; then
  exit 0  # All good, stay silent
fi

# Found bloated sessions - summarize then delete
echo "🧹 Auto-cleanup: Found bloated sessions (>${THRESHOLD_KB}KB), summarizing..."

for session in $BLOATED; do
  SIZE=$(du -h "$session" | cut -f1)
  BASENAME=$(basename "$session" .jsonl)
  
  # Extract last 200 messages
  MESSAGES=$(tail -200 "$session" | jq -r 'select(.message.role) | "\(.message.role): \(.message.content[0].text // .message.content[0].thinking // "")"' 2>/dev/null | head -1000)
  
  if [ -n "$MESSAGES" ]; then
    # Use local LLM to summarize
    SUMMARY=$(bash "$WORKSPACE/skills/local-agent/scripts/query.sh" "Summarize this conversation. Extract: key people, important discussions, decisions, action items. Be concise (max 300 words).

$MESSAGES" 2>/dev/null)
    
    # Save summary
    mkdir -p "$WORKSPACE/memory/session-summaries"
    echo "# Session Summary: $BASENAME" > "$WORKSPACE/memory/session-summaries/$(date +%Y-%m-%d)-$BASENAME.md"
    echo "**Date:** $(date)" >> "$WORKSPACE/memory/session-summaries/$(date +%Y-%m-%d)-$BASENAME.md"
    echo "**Original Size:** $SIZE" >> "$WORKSPACE/memory/session-summaries/$(date +%Y-%m-%d)-$BASENAME.md"
    echo "" >> "$WORKSPACE/memory/session-summaries/$(date +%Y-%m-%d)-$BASENAME.md"
    echo "$SUMMARY" >> "$WORKSPACE/memory/session-summaries/$(date +%Y-%m-%d)-$BASENAME.md"
    
    echo "  ✅ Summarized & deleted: $BASENAME ($SIZE)"
  else
    echo "  ⚠️ Empty/corrupt session: $BASENAME ($SIZE)"
  fi
  
  rm -f "$session"
done
