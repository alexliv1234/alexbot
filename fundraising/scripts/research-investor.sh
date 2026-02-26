#!/bin/bash
# Research investor using web search and AI analysis
# Usage: bash research-investor.sh <investor-id>

set -e

INVESTOR_ID="$1"

if [ -z "$INVESTOR_ID" ]; then
  echo "❌ Usage: bash research-investor.sh <investor-id>"
  echo "   Example: bash research-investor.sh alon-lifshitz"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVESTOR_DIR="$SCRIPT_DIR/../investors/$INVESTOR_ID"
PROFILE_FILE="$INVESTOR_DIR/profile.json"
RESEARCH_FILE="$INVESTOR_DIR/research.md"

if [ ! -d "$INVESTOR_DIR" ]; then
  echo "❌ Investor not found: $INVESTOR_ID"
  echo "   Run: bash add-investor.sh first"
  exit 1
fi

echo "🔍 Starting research for: $INVESTOR_ID"
echo ""

# Read profile
if ! command -v jq &> /dev/null; then
  echo "❌ jq is required but not installed"
  exit 1
fi

NAME=$(jq -r '.name' "$PROFILE_FILE")
FUND=$(jq -r '.fund' "$PROFILE_FILE")

echo "👤 Name: $NAME"
echo "🏢 Fund: $FUND"
echo ""

# Create research request file for AlexBot to process
RESEARCH_REQUEST="$INVESTOR_DIR/.research-request.txt"
cat > "$RESEARCH_REQUEST" <<EOF
RESEARCH REQUEST FOR ALEXBOT

Investor: $NAME
Fund: $FUND
ID: $INVESTOR_ID

TASKS:
1. Search LinkedIn for "$NAME $FUND"
2. Search for "$FUND portfolio companies"
3. Search for "$FUND investment thesis"
4. Search for recent news about $NAME or $FUND
5. Find $NAME's Twitter/social media
6. Research recent deals by $FUND

DELIVERABLE:
Update the file: $RESEARCH_FILE
Fill in all sections with detailed findings.
Update profile.json with: linkedin, twitter, focus areas, check size.

START RESEARCH NOW.
EOF

echo "📝 Research request created: $RESEARCH_REQUEST"
echo ""
echo "🤖 This script triggers AlexBot to do the research."
echo "   The bot will:"
echo "   1. Run web searches"
echo "   2. Extract relevant information"
echo "   3. Update research.md with findings"
echo "   4. Update profile.json with discovered data"
echo ""
echo "⏳ Expected time: 20-30 minutes"
echo ""
echo "📊 Status: RESEARCH IN PROGRESS"
echo "   Monitor: $RESEARCH_FILE"
echo ""

# Mark stage in profile
jq '.stage = "research" | .lastUpdated = "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'" | .timeline += [{"date": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'", "action": "research_started", "details": "Automated research initiated", "outcome": "in_progress"}]' "$PROFILE_FILE" > "$PROFILE_FILE.tmp"
mv "$PROFILE_FILE.tmp" "$PROFILE_FILE"

echo "🎯 Next: AlexBot will complete the research and update files."
echo ""
