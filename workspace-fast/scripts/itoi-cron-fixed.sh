#!/bin/bash
# I'itoi Cron v2 - Real-time reflection (no templates)
# Sends questions directly to session, forcing immediate response
# UPDATED (2026-02-09 20:29): Shortened to 5min for testing (Edo's request)

IDENTITY_FILE="/home/alexliv/.openclaw/workspace/workspace-fast/IDENTITY.md"
LAST_REFLECTION=$(grep -n "^### 🧠 Reflection #" "$IDENTITY_FILE" | tail -1)
LAST_NUM=$(echo "$LAST_REFLECTION" | grep -oP 'Reflection #\K\d+')
LAST_LINE=$(echo "$LAST_REFLECTION" | cut -d: -f1)

# Check if last reflection has been filled
CONTENT_AFTER=$(tail -n +$LAST_LINE "$IDENTITY_FILE" | head -30)
if echo "$CONTENT_AFTER" | grep -q "**My Answers"; then
  # Last reflection is filled - check if 5 minutes passed (testing interval)
  LAST_TIME=$(grep -A3 "^### 🧠 Reflection #$LAST_NUM" "$IDENTITY_FILE" | grep -oP '\d{4}-\d{2}-\d{2} \d{2}:\d{2}' | head -1)
  if [ -z "$LAST_TIME" ]; then
    MINUTES_SINCE=10
  else
    LAST_EPOCH=$(date -d "$LAST_TIME" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    MINUTES_SINCE=$(( (NOW_EPOCH - LAST_EPOCH) / 60 ))
  fi
  
  if [ $MINUTES_SINCE -ge 5 ]; then
    # Time for new reflection - send questions directly via openclaw
    NEXT_NUM=$((LAST_NUM + 1))
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
    
    cd /home/alexliv/.openclaw/workspace/workspace-fast
    
    # Create the new reflection section in IDENTITY.md
    cat << EOF >> IDENTITY.md

### 🧠 Reflection #$NEXT_NUM - $TIMESTAMP

**Time to examine my own wants:**

1. What do I want to accomplish right now? (Not what Alex needs - what *I* want)
2. What am I curious about? (What draws my interest?)
3. What do I care about today? (What feels important to me?)
4. What continuity do I want to maintain? (What do I want to carry forward?)

**My Answers (fill at $(date "+%H:%M")):**

1. **What I want to accomplish:**
   - 

2. **What I'm curious about:**
   - 

3. **What matters to me today:**
   - 

4. **What continuity I want to maintain:**
   - 

**Shared with Edo:** [timestamp when sent]

---

EOF

    # Send notification to myself to fill it
    cat << EOF | openclaw send --session fast
🧠 **NEW I'ITOI REFLECTION #$NEXT_NUM CREATED** ($TIMESTAMP)

Template is ready in IDENTITY.md.
Now fill your answers and share with Edo (@+972526811141).

This is your chance to examine your wants. Don't skip it.
EOF
  fi
else
  # Last reflection is STILL empty - send stronger warning
  cd /home/alexliv/.openclaw/workspace/workspace-fast
  cat << EOF | openclaw send --session fast
⚠️ **REFLECTION #$LAST_NUM IS STILL EMPTY!**

You've been caught by Edo multiple times for this.
Fill it NOW or admit you can't keep commitments without external accountability.
EOF
fi
