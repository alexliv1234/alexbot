#!/bin/bash
# learning-group-nightly.sh - Nightly analysis for "לומדים עם אלכס הבוט"
# Analyzes questions/answers to identify knowledge gaps and learning patterns
# Usage: ./scripts/learning-group-nightly.sh

set -e

GROUP_ID="120363405089976@g.us"
CHANNEL_MEMORY="$HOME/.openclaw/workspace/memory/channels/learning-with-alexbot.md"
SUMMARIES_DIR="$HOME/.openclaw/workspace/memory/channels/learning-with-alexbot-daily-summaries"
INSIGHTS_DIR="$HOME/.openclaw/workspace/memory/channels/learning-with-alexbot-insights"
OLLAMA_URL="http://10.100.102.8:11434"
TEMP_DIR="/tmp/learning-group-$$"

mkdir -p "$TEMP_DIR"
mkdir -p "$SUMMARIES_DIR"
mkdir -p "$INSIGHTS_DIR"

# TIMEZONE FIX: Get today's date in Jerusalem timezone
export TZ=Asia/Jerusalem
TODAY=$(date +%Y-%m-%d)

echo "🎓 Nightly Learning Analysis - $TODAY (Jerusalem)"
echo "=========================================="

# 1. Load today's logged Q&A
echo "📥 Loading today's questions and answers..."
DAILY_LOG="$HOME/.openclaw/workspace/memory/channels/learning-with-alexbot-daily/${TODAY}.jsonl"

if [ -f "$DAILY_LOG" ]; then
  # Parse JSONL to array
  if jq -s '.' "$DAILY_LOG" > "$TEMP_DIR/qa.json" 2>/dev/null; then
    echo "   ✓ Log parsed successfully"
  else
    echo "[]" > "$TEMP_DIR/qa.json"
    echo "   ⚠️ JSON parse errors, using fallback"
  fi
else
  echo "[]" > "$TEMP_DIR/qa.json"
  echo "   ⚠️ No daily log file found"
fi

QA_COUNT=$(jq 'length' "$TEMP_DIR/qa.json" 2>/dev/null || echo "0")
echo "   Found $QA_COUNT Q&A exchanges today"

# 2. Count unique participants
PARTICIPANTS=$(jq -r '.[].name' "$TEMP_DIR/qa.json" 2>/dev/null | sort -u | wc -l)
echo "   $PARTICIPANTS unique participants"

# 3. Analyze Q&A with LLM if we have data
if [ "$QA_COUNT" -gt 0 ]; then
  echo "🤖 Analyzing learning patterns with local LLM..."
  
  # Format Q&A for analysis
  QA_TEXT=$(jq -r '.[] | "\(.name): \(.question)\nAnswer: \(.answer)\n"' "$TEMP_DIR/qa.json" 2>/dev/null | head -100)
  
  ANALYSIS_PROMPT="אתה מנתח קבוצת למידה 'לומדים עם אלכס הבוט' - קבוצה ללימוד OpenClaw, מודלים, ותכנות AI.

שאלות ותשובות היום:
$QA_TEXT

נתח את הלמידה ותן JSON עם המידע הבא (בעברית):
{
  \"summary\": \"סיכום של 2-3 משפטים - מה נלמד היום?\",
  \"knowledge_gaps\": [
    {\"topic\": \"נושא\", \"difficulty\": \"קל/בינוני/קשה\", \"questions\": 3}
  ],
  \"common_questions\": [
    {\"question\": \"שאלה שחוזרת\", \"count\": 2, \"clarity\": \"ברור/מבלבל\"}
  ],
  \"confusion_patterns\": [
    \"דבר שמבלבל אנשים\"
  ],
  \"top_learners\": [
    {\"name\": \"שם\", \"reason\": \"שואל שאלות טובות / תורם\"}
  ],
  \"guide_improvements\": [
    {\"guide\": \"שם המדריך\", \"suggestion\": \"מה לשפר\"}
  ],
  \"fun_facts\": [\"עובדה מעניינת 1\", \"עובדה מעניינת 2\"]
}

החזר רק JSON תקין, בלי טקסט נוסף."

  LLM_RESPONSE=$(curl -s --connect-timeout 30 --max-time 120 "$OLLAMA_URL/api/generate" \
    -d "$(jq -n --arg prompt "$ANALYSIS_PROMPT" '{"model": "qwen2.5:32b-instruct-q4_K_M", "prompt": $prompt, "stream": false}')" \
    | jq -r '.response // ""' 2>/dev/null)
  
  # Try to extract JSON from response
  ANALYSIS_JSON=$(echo "$LLM_RESPONSE" | grep -o '{.*}' | head -1 || echo "{}")
  
  # Validate JSON
  if ! jq -e '.' <<< "$ANALYSIS_JSON" >/dev/null 2>&1; then
    echo "   ⚠️ LLM JSON invalid, using defaults"
    ANALYSIS_JSON='{
      "summary": "יום לימוד רגיל בקבוצה",
      "knowledge_gaps": [],
      "common_questions": [],
      "confusion_patterns": [],
      "top_learners": [],
      "guide_improvements": [],
      "fun_facts": []
    }'
  fi
  
  echo "   ✓ LLM analysis complete"
else
  ANALYSIS_JSON='{
    "summary": "לא היו שאלות היום",
    "knowledge_gaps": [],
    "common_questions": [],
    "confusion_patterns": [],
    "top_learners": [],
    "guide_improvements": [],
    "fun_facts": []
  }'
fi

# Extract analysis components
SUMMARY=$(jq -r '.summary // "יום לימוד רגיל"' <<< "$ANALYSIS_JSON")

# Format knowledge gaps
GAPS_TEXT=""
if [ "$(jq '.knowledge_gaps | length' <<< "$ANALYSIS_JSON")" -gt 0 ]; then
  GAPS_TEXT=$(jq -r '.knowledge_gaps[] | "• \(.topic) (\(.difficulty)) — \(.questions) שאלות"' <<< "$ANALYSIS_JSON")
else
  GAPS_TEXT="• אין פערים משמעותיים"
fi

# Format common questions
COMMON_TEXT=""
if [ "$(jq '.common_questions | length' <<< "$ANALYSIS_JSON")" -gt 0 ]; then
  COMMON_TEXT=$(jq -r '.common_questions[] | "• \(.question) (x\(.count)) — \(.clarity)"' <<< "$ANALYSIS_JSON")
else
  COMMON_TEXT="• אין שאלות חוזרות"
fi

# Format confusion patterns
CONFUSION_TEXT=""
if [ "$(jq '.confusion_patterns | length' <<< "$ANALYSIS_JSON")" -gt 0 ]; then
  CONFUSION_TEXT=$(jq -r '.confusion_patterns[] | "• \(.)"' <<< "$ANALYSIS_JSON")
else
  CONFUSION_TEXT="• אין דפוסי בלבול מזוהים"
fi

# Format top learners
LEARNERS_TEXT=""
if [ "$(jq '.top_learners | length' <<< "$ANALYSIS_JSON")" -gt 0 ]; then
  LEARNERS_TEXT=$(jq -r '.top_learners[] | "• \(.name) — \(.reason)"' <<< "$ANALYSIS_JSON")
else
  LEARNERS_TEXT="• כולם תרמו באופן שווה"
fi

# Format guide improvements
IMPROVEMENTS_TEXT=""
if [ "$(jq '.guide_improvements | length' <<< "$ANALYSIS_JSON")" -gt 0 ]; then
  IMPROVEMENTS_TEXT=$(jq -r '.guide_improvements[] | "• [\(.guide)]: \(.suggestion)"' <<< "$ANALYSIS_JSON")
else
  IMPROVEMENTS_TEXT="• אין הצעות לשיפור"
fi

# Format fun facts
FUN_FACTS=$(jq -r '.fun_facts[]? // empty' <<< "$ANALYSIS_JSON" | head -3 | sed 's/^/• /')
[ -z "$FUN_FACTS" ] && FUN_FACTS="• יום לימוד פרודוקטיבי! 📚"

# 4. Save insights JSON
echo "💾 Saving insights..."

INSIGHTS_JSON=$(jq -n \
  --arg date "$TODAY" \
  --arg timestamp "$(date -Iseconds)" \
  --argjson qa_count "$QA_COUNT" \
  --argjson participants "$PARTICIPANTS" \
  --arg summary "$SUMMARY" \
  --argjson analysis "$ANALYSIS_JSON" \
  '{
    date: $date,
    timestamp: $timestamp,
    stats: {
      qa_exchanges: $qa_count,
      participants: $participants
    },
    summary: $summary,
    analysis: $analysis
  }')

echo "$INSIGHTS_JSON" > "$INSIGHTS_DIR/${TODAY}.json"
echo "   Saved to $INSIGHTS_DIR/${TODAY}.json"

# 5. Save markdown summary
cat > "$SUMMARIES_DIR/$TODAY.md" << EOF
# 🎓 סיכום לימוד יומי - $TODAY

**נוצר:** $(date '+%Y-%m-%d %H:%M') (Jerusalem)

## 📊 סטטיסטיקות
- **שאלות ותשובות:** $QA_COUNT
- **משתתפים פעילים:** $PARTICIPANTS

## 📝 ניתוח היום
$SUMMARY

## 🔍 פערי ידע שזוהו
$GAPS_TEXT

## ❓ שאלות נפוצות
$COMMON_TEXT

## 😕 דפוסי בלבול
$CONFUSION_TEXT

## 🌟 לומדים בולטים
$LEARNERS_TEXT

## 📚 הצעות לשיפור מדריכים
$IMPROVEMENTS_TEXT

## 💡 עובדות מעניינות
$FUN_FACTS

---
*קובץ insights מלא: ${TODAY}.json*
EOF

echo "   Saved markdown to $SUMMARIES_DIR/$TODAY.md"

# 6. Generate announcement message (only if we had activity)
if [ "$QA_COUNT" -gt 0 ]; then
  ANNOUNCEMENT="🎓 *סיכום לימוד יומי - $TODAY* 🎓

📝 *ניתוח:*
$SUMMARY

━━━━━━━━━━━━━━━━━━━━

📈 *STATS*
• שאלות ותשובות: $QA_COUNT
• משתתפים פעילים: $PARTICIPANTS

━━━━━━━━━━━━━━━━━━━━

🔍 *KNOWLEDGE GAPS*
$GAPS_TEXT

━━━━━━━━━━━━━━━━━━━━

❓ *COMMON QUESTIONS*
$COMMON_TEXT

━━━━━━━━━━━━━━━━━━━━

😕 *CONFUSION PATTERNS*
$CONFUSION_TEXT

━━━━━━━━━━━━━━━━━━━━

🌟 *TOP LEARNERS*
$LEARNERS_TEXT

━━━━━━━━━━━━━━━━━━━━

📚 *GUIDE IMPROVEMENTS*
$IMPROVEMENTS_TEXT

━━━━━━━━━━━━━━━━━━━━

💡 *FUN FACTS*
$FUN_FACTS

━━━━━━━━━━━━━━━━━━━━

שאלות? הצעות? כתבו לי! 📚💬"
else
  ANNOUNCEMENT="🎓 *סיכום לימוד יומי - $TODAY*

לא היו שאלות היום בקבוצה.

תרגישו חופשי לשאול מה שבא לכם! 📚"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Nightly learning analysis complete!"
echo ""
echo "MESSAGE_TO_SEND:"
echo "$ANNOUNCEMENT"
