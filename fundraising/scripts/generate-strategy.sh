#!/bin/bash
# Generate outreach strategy using AI (local LLM)
# Usage: bash generate-strategy.sh <investor-id>

set -e

INVESTOR_ID="$1"

if [ -z "$INVESTOR_ID" ]; then
  echo "❌ Usage: bash generate-strategy.sh <investor-id>"
  echo "   Example: bash generate-strategy.sh alon-lifshitz"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVESTOR_DIR="$SCRIPT_DIR/../investors/$INVESTOR_ID"
PROFILE_FILE="$INVESTOR_DIR/profile.json"
RESEARCH_FILE="$INVESTOR_DIR/research.md"
STRATEGY_FILE="$INVESTOR_DIR/strategy.md"

if [ ! -d "$INVESTOR_DIR" ]; then
  echo "❌ Investor not found: $INVESTOR_ID"
  exit 1
fi

if [ ! -f "$RESEARCH_FILE" ]; then
  echo "❌ Research file not found. Run research-investor.sh first."
  exit 1
fi

echo "🧠 Generating outreach strategy for: $INVESTOR_ID"
echo ""

# Read profile
if ! command -v jq &> /dev/null; then
  echo "❌ jq is required"
  exit 1
fi

NAME=$(jq -r '.name' "$PROFILE_FILE")
FUND=$(jq -r '.fund' "$PROFILE_FILE")

echo "👤 Name: $NAME"
echo "🏢 Fund: $FUND"
echo ""

# Create strategy generation request
STRATEGY_REQUEST="$INVESTOR_DIR/.strategy-request.txt"
cat > "$STRATEGY_REQUEST" <<EOF
STRATEGY GENERATION REQUEST

Investor: $NAME
Fund: $FUND
ID: $INVESTOR_ID

INPUT FILES:
- Profile: $PROFILE_FILE
- Research: $RESEARCH_FILE

FUNDRAISING CONTEXT:
- Project: AlexBot (AI personal assistant)
- Raising: \$10M
- Equity: 20-25%
- Valuation: \$40-50M post-money
- Materials: See fundraising/*.md

TASK:
Generate a personalized outreach strategy in $STRATEGY_FILE

Requirements:
1. Read the research findings
2. Identify why THIS investor is a good fit
3. Create 3 intro message variations (direct/short/technical)
4. Plan follow-up sequence (day 5, 10, 21)
5. Prepare response scenarios
6. Use Local LLM (qwen2.5:32b) for generation

Tone: Professional, cynical, smart (not corporate BS)
Language: Hebrew or English based on investor background

GENERATE NOW.
EOF

echo "📝 Strategy request created"
echo "🤖 AlexBot will use Local LLM to generate personalized strategy"
echo ""
echo "⏳ Expected time: 5-10 minutes"
echo ""

# Mark stage
jq '.stage = "strategy" | .lastUpdated = "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'" | .timeline += [{"date": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'", "action": "strategy_started", "details": "Strategy generation initiated", "outcome": "in_progress"}]' "$PROFILE_FILE" > "$PROFILE_FILE.tmp"
mv "$PROFILE_FILE.tmp" "$PROFILE_FILE"

echo "🎯 Next: Review generated strategy and approve for sending"
echo ""
