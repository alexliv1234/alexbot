#!/bin/bash
# Contact Behavioral Analysis Script
# Uses local LLM to analyze conversation logs and update contact profiles

set -e

CONTACT_NAME="$1"
CONTACT_FILE="$2"

if [[ -z "$CONTACT_NAME" || -z "$CONTACT_FILE" ]]; then
    echo "Usage: $0 <contact-name> <contact-file-path>"
    echo "Example: $0 'Shir' memory/whatsapp/contacts/shir.md"
    exit 1
fi

if [[ ! -f "$CONTACT_FILE" ]]; then
    echo "❌ Contact file not found: $CONTACT_FILE"
    exit 1
fi

WORKSPACE="/home/alexliv/.openclaw/workspace"
PROFILE_FILE="$WORKSPACE/memory/people/${CONTACT_NAME,,}.md"  # lowercase filename
TEMP_DIR="/tmp/contact-analysis"
mkdir -p "$TEMP_DIR"

echo "🧠 Analyzing contact: $CONTACT_NAME"
echo "📄 Reading conversation log: $CONTACT_FILE"

# Read the conversation log
CONVERSATION_LOG=$(cat "$CONTACT_FILE")

# Create analysis prompt for the local agent
ANALYSIS_TASK="You are analyzing conversation logs to build a detailed behavioral and psychological profile.

**Contact Name:** $CONTACT_NAME

**Conversation Log:**
\`\`\`
$CONVERSATION_LOG
\`\`\`

---

**Your Task:**
Analyze the conversation log and extract insights in the following categories. Be specific, use examples from the log, and look for patterns.

## 1. Communication Style
- Formality level (formal/semi-formal/casual/very casual)
- Message length preference (terse/concise/balanced/verbose)
- Emoji and expression use (none/minimal/moderate/heavy) - give examples
- Response speed patterns (instant/fast/normal/slow/sporadic)
- Active hours (when do they typically message?)
- Unique language patterns (phrases they use, tone markers, word choice)

## 2. Interaction Patterns
- Do they initiate contact? How often?
- What topics do they bring up repeatedly?
- What's their question style? (direct/exploratory/theoretical/probing)
- What boundaries do they show? (topics they avoid vs. open about)
- Any triggers? (things that excite them or make them uncomfortable)

## 3. Psychological Profile
- Primary motivations (achievement/affiliation/power/knowledge/autonomy/security)
- Decision-making style (analytical/intuitive/collaborative/impulsive)
- Personality traits you can infer (extraversion, openness, conscientiousness, etc.)
- How do they respond to stress or challenges?
- What values seem important to them?

## 4. Relationship Dynamics (with Alex)
- What type of connection is this? (professional/personal/mentor/peer/collaborative)
- How has trust/openness evolved over time?
- What do they need from Alex? (advice/support/info/collaboration)
- What do they give to Alex?
- What's the power dynamic? (equal/they lead/Alex leads/fluid)

## 5. Information Gathered
- Network: who do they know? Connections mentioned?
- Projects or goals they're working on
- Challenges they're facing
- Opportunities for collaboration or help
- Personal details (family, hobbies, life situation)

## 6. Key Learnings
- What are the 3-5 most important things to remember about this person?
- What should Alex keep in mind for the next interaction?

---

**Output Format:**
Return a structured markdown report with clear sections matching the categories above. Use bullet points, be specific, cite examples from the conversation where relevant. If you can't determine something, say \"Insufficient data\" rather than guessing.

Focus on actionable insights that will help Alex communicate more effectively with this person."

# Run the local agent
echo "🤖 Running local LLM analysis..."
ANALYSIS_RESULT=$(source "$WORKSPACE/skills/local-agent/agent.sh" && local_agent "$ANALYSIS_TASK")

# Save the raw analysis
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
RAW_OUTPUT="$TEMP_DIR/${CONTACT_NAME,,}_analysis_$TIMESTAMP.md"
echo "$ANALYSIS_RESULT" > "$RAW_OUTPUT"
echo "📝 Raw analysis saved: $RAW_OUTPUT"

# Check if profile exists, if not create from template
if [[ ! -f "$PROFILE_FILE" ]]; then
    echo "📄 Creating new profile from template..."
    cp "$WORKSPACE/memory/people/TEMPLATE.md" "$PROFILE_FILE"
    
    # Fill in basic template placeholders
    sed -i "s/{Person Name}/$CONTACT_NAME/g" "$PROFILE_FILE"
    sed -i "s/{date}/$(date +%Y-%m-%d)/g" "$PROFILE_FILE"
    sed -i "s|{phone\|user_id\|handle}|See $CONTACT_FILE|g" "$PROFILE_FILE"
fi

# Now merge the analysis into the profile
echo "🔄 Updating profile with analysis..."
echo ""
echo "---"
echo "📊 ANALYSIS COMPLETE"
echo "---"
echo ""
echo "Raw analysis: $RAW_OUTPUT"
echo "Profile file: $PROFILE_FILE"
echo ""
echo "⚠️  Review the raw analysis and manually merge insights into the profile."
echo "    (Auto-merge coming soon - for now, this keeps you in control)"
echo ""
echo "💡 Tip: Look for patterns across multiple analyses to spot evolution"

# Show preview of key findings
echo ""
echo "🔍 KEY FINDINGS PREVIEW:"
echo "---"
head -50 "$RAW_OUTPUT"
echo "---"
echo "(See full analysis in $RAW_OUTPUT)"
