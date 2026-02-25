#!/bin/bash
# Learning insights - analyze messages from "לומדים עם אלכס הבוט"

SESSION_FILE=~/.openclaw/agents/learning/sessions/a813cace-1ffb-402c-88f1-75d53fcf3503.jsonl

echo "📊 ניתוח שאלות מקבוצת הלמידה"
echo "=============================="
echo ""

# חלץ רק הודעות משתמש
echo "🔍 שאלות שנשאלו היום:"
cat "$SESSION_FILE" | \
  jq -r 'select(.type=="message" and .message.role=="user") | .message.content[0].text' | \
  grep -oP '\] .*?: \K.*' | \
  head -20

echo ""
echo "📈 סטטיסטיקות:"
TOTAL_USER=$(cat "$SESSION_FILE" | jq -r 'select(.type=="message" and .message.role=="user")' | wc -l)
TOTAL_ASSISTANT=$(cat "$SESSION_FILE" | jq -r 'select(.type=="message" and .message.role=="assistant")' | wc -l)

echo "שאלות: $TOTAL_USER"
echo "תשובות: $TOTAL_ASSISTANT"

echo ""
echo "🔥 נושאים חמים:"
# חלץ מילות מפתח
cat "$SESSION_FILE" | \
  jq -r 'select(.type=="message" and .message.role=="user") | .message.content[0].text' | \
  grep -i "reasoning\|llama\|ollama\|model\|openrouter\|dashboard\|מודל" | wc -l

echo "נושאים טכניים: $(cat "$SESSION_FILE" | jq -r 'select(.type=="message" and .message.role=="user") | .message.content[0].text' | grep -i "reasoning\|llama\|ollama\|model\|openrouter\|dashboard" | wc -l)"

echo ""
echo "💾 מיקום הקובץ:"
echo "$SESSION_FILE"
