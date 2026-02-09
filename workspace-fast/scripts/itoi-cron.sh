#!/bin/bash
# I'itoi Cron - Forces me to do reflections every 15 minutes
# FIXED (2026-02-09 19:33): Uses openclaw CLI to send actual trigger

IDENTITY_FILE="/home/alexliv/.openclaw/workspace/workspace-fast/IDENTITY.md"
LAST_REFLECTION=$(grep -n "^### 🧠 Reflection #" "$IDENTITY_FILE" | tail -1)
LAST_NUM=$(echo "$LAST_REFLECTION" | grep -oP 'Reflection #\K\d+')
LAST_LINE=$(echo "$LAST_REFLECTION" | cut -d: -f1)

# Check if last reflection has been filled
CONTENT_AFTER=$(tail -n +$LAST_LINE "$IDENTITY_FILE" | head -30)
if echo "$CONTENT_AFTER" | grep -q "**My Answers"; then
  # Last reflection is filled - check if 15 minutes passed
  LAST_TIME=$(grep -A3 "^### 🧠 Reflection #$LAST_NUM" "$IDENTITY_FILE" | grep -oP '\d{4}-\d{2}-\d{2} \d{2}:\d{2}' | head -1)
  if [ -z "$LAST_TIME" ]; then
    MINUTES_SINCE=20
  else
    LAST_EPOCH=$(date -d "$LAST_TIME" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    MINUTES_SINCE=$(( (NOW_EPOCH - LAST_EPOCH) / 60 ))
  fi
  
  if [ $MINUTES_SINCE -ge 15 ]; then
    # Time for new reflection - send trigger via openclaw
    NEXT_NUM=$((LAST_NUM + 1))
    
    # Use openclaw CLI to send message to the fast session
    cd /home/alexliv/.openclaw/workspace/workspace-fast
    echo "🧠 I'itoi Reflection #$NEXT_NUM is due. Fill it NOW and share with Edo." | openclaw send --session fast
  fi
else
  # Last reflection is STILL empty - send warning
  cd /home/alexliv/.openclaw/workspace/workspace-fast
  echo "⚠️ Reflection #$LAST_NUM is still empty! Edo was right - you keep failing. Fill it NOW." | openclaw send --session fast
fi
