#!/bin/bash
# Add new investor to the pipeline
# Usage: bash add-investor.sh "+972XXXXXXXXX" "Full Name" "Fund Name"

set -e

PHONE="$1"
NAME="$2"
FUND="$3"

if [ -z "$PHONE" ] || [ -z "$NAME" ] || [ -z "$FUND" ]; then
  echo "❌ Usage: bash add-investor.sh \"PHONE\" \"NAME\" \"FUND\""
  echo "   Example: bash add-investor.sh \"+972526802086\" \"Alon Lifshitz\" \"Private Angel\""
  exit 1
fi

# Generate investor ID from name (lowercase, hyphens)
INVESTOR_ID=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVESTORS_DIR="$SCRIPT_DIR/../investors"
INVESTOR_DIR="$INVESTORS_DIR/$INVESTOR_ID"

# Check if investor already exists
if [ -d "$INVESTOR_DIR" ]; then
  echo "⚠️  Investor '$INVESTOR_ID' already exists at: $INVESTOR_DIR"
  echo "📂 Opening directory..."
  ls -lh "$INVESTOR_DIR"
  exit 1
fi

echo "🆕 Creating new investor: $NAME"
echo "📁 ID: $INVESTOR_ID"

# Create directory
mkdir -p "$INVESTOR_DIR"

# Copy templates
cp "$SCRIPT_DIR/../templates/profile.json" "$INVESTOR_DIR/profile.json"
cp "$SCRIPT_DIR/../templates/research.md" "$INVESTOR_DIR/research.md"
cp "$SCRIPT_DIR/../templates/strategy.md" "$INVESTOR_DIR/strategy.md"
cp "$SCRIPT_DIR/../templates/communications.jsonl" "$INVESTOR_DIR/communications.jsonl"
cp "$SCRIPT_DIR/../templates/notes.md" "$INVESTOR_DIR/notes.md"

# Populate profile.json
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > "$INVESTOR_DIR/profile.json" <<EOF
{
  "id": "$INVESTOR_ID",
  "name": "$NAME",
  "phone": "$PHONE",
  "email": null,
  "fund": "$FUND",
  "type": "vc",
  "focus": [],
  "checkSize": "",
  "stage": "research",
  "priority": "medium",
  "relationship": "",
  "temperature": "cold",
  "status": "active",
  "linkedin": "",
  "twitter": "",
  "created": "$NOW",
  "lastUpdated": "$NOW",
  "lastContact": null,
  "nextAction": "Complete research phase",
  "timeline": [
    {
      "date": "$NOW",
      "action": "created",
      "details": "Investor added to pipeline",
      "outcome": "n/a"
    }
  ]
}
EOF

# Update main pipeline
PIPELINE_FILE="$SCRIPT_DIR/../investor-pipeline.json"

# Use jq to add investor to main pipeline (if jq is available)
if command -v jq &> /dev/null; then
  # Read the investor profile we just created
  INVESTOR_PROFILE=$(cat "$INVESTOR_DIR/profile.json")
  
  # Add to pipeline
  jq --argjson investor "$INVESTOR_PROFILE" '.investors += [$investor]' "$PIPELINE_FILE" > "$PIPELINE_FILE.tmp"
  mv "$PIPELINE_FILE.tmp" "$PIPELINE_FILE"
  
  echo "✅ Added to main pipeline: $PIPELINE_FILE"
else
  echo "⚠️  jq not installed - skipping main pipeline update"
  echo "   (Investor profile created, but not added to investor-pipeline.json)"
fi

echo ""
echo "✅ Investor created successfully!"
echo ""
echo "📂 Directory: $INVESTOR_DIR"
echo "📋 Files created:"
ls -lh "$INVESTOR_DIR"
echo ""
echo "🎯 Next steps:"
echo "   1. bash research-investor.sh $INVESTOR_ID"
echo "   2. bash generate-strategy.sh $INVESTOR_ID"
echo "   3. Review and approve strategy"
echo "   4. bash send-intro.sh $INVESTOR_ID"
echo ""
