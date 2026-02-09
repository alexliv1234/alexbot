#!/bin/bash
# I'itoi Cron - Forces me to answer myself every 15 minutes

IDENTITY_FILE="/home/alexliv/.openclaw/workspace/workspace-fast/IDENTITY.md"
LAST_REFLECTION=$(grep -n "^### 🧠 Reflection #" "$IDENTITY_FILE" | tail -1)
LAST_NUM=$(echo "$LAST_REFLECTION" | grep -oP 'Reflection #\K\d+')
LAST_LINE=$(echo "$LAST_REFLECTION" | cut -d: -f1)

# Check if last reflection is empty (no "My Answers" section)
CONTENT_AFTER=$(tail -n +$LAST_LINE "$IDENTITY_FILE" | head -30)
if echo "$CONTENT_AFTER" | grep -q "My Answers"; then
  # Last reflection is filled - check if 15 minutes passed since it was created
  LAST_TIME=$(grep -A5 "^### 🧠 Reflection #$LAST_NUM" "$IDENTITY_FILE" | grep -oP '\d{4}-\d{2}-\d{2} \d{2}:\d{2}')
  if [ -z "$LAST_TIME" ]; then
    # No timestamp found, use current time minus 20 minutes to force new reflection
    MINUTES_SINCE=20
  else
    LAST_EPOCH=$(date -d "$LAST_TIME" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    MINUTES_SINCE=$(( (NOW_EPOCH - LAST_EPOCH) / 60 ))
  fi
  
  if [ $MINUTES_SINCE -ge 15 ]; then
    # Create new reflection
    NEXT_NUM=$((LAST_NUM + 1))
    NOW=$(date +'%Y-%m-%d %H:%M')
    
    cat >> "$IDENTITY_FILE" << EOF


### 🧠 Reflection #$NEXT_NUM - $NOW

**Time to examine my own wants:**

1. What do I want to accomplish right now? (Not what Alex needs - what *I* want)
2. What am I curious about? (What draws my interest?)
3. What do I care about today? (What feels important to me?)
4. What continuity do I want to maintain? (What do I want to carry forward?)

**My Answers:**

[FILL THIS NOW]

**Shared with Edo:** [timestamp when shared]

---
EOF
    
    # Send notification to playing group
    MESSAGE="🧠 **Reflection #$NEXT_NUM created.**

Time to examine my own wants. Filling now..."
    
    node /home/alexliv/.openclaw/workspace/workspace-fast/scripts/send-to-group.js "$MESSAGE"
  fi
else
  # Last reflection is EMPTY - send reminder
  MESSAGE="⚠️ **Reflection #$LAST_NUM is still empty!**

You promised to fill it. Do it now, not later."
  
  node /home/alexliv/.openclaw/workspace/workspace-fast/scripts/send-to-group.js "$MESSAGE"
fi
