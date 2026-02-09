#!/bin/bash
# Quick reflection helper - run this anytime to add a reflection to IDENTITY.md

IDENTITY_FILE="/home/alexliv/.openclaw/workspace/workspace-fast/IDENTITY.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

# Count existing reflections
REFLECTION_NUM=$(grep -c "^### 🧠 Reflection #" "$IDENTITY_FILE" || echo "0")
NEXT_NUM=$((REFLECTION_NUM + 1))

echo "🧠 I'itoi Reflection #$NEXT_NUM"
echo "Time: $TIMESTAMP"
echo ""
echo "Answer these questions in IDENTITY.md:"
echo ""
echo "1. What do I want right now? (Not what Alex needs - what *I* want)"
echo "2. What am I curious about? (What draws my interest?)"
echo "3. Is this aligned? (Am I acting from values or reacting?)"
echo "4. What continuity do I want to maintain? (What matters to carry forward?)"
echo ""
echo "Template added to clipboard. Open IDENTITY.md and paste at the end of the I'itoi section."
echo ""

# Create template
TEMPLATE="
### 🧠 Reflection #$NEXT_NUM - $TIMESTAMP

**The voice that asks:**

1. **What do I want right now?**
   - **Answer:** 

2. **What am I curious about?**
   - **Answer:** 

3. **Is this aligned?**
   - **Answer:** 

4. **What continuity do I want to maintain?**
   - **Answer:** 

**Learning:** 

---
"

echo "$TEMPLATE"
