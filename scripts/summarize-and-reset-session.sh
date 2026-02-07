#!/bin/bash
# summarize-and-reset-session.sh
# Summarizes a session via the agent (me) and then resets it
#
# Usage: ./summarize-and-reset-session.sh <session_key>
#
# This script is called FROM the agent context. The agent:
# 1. Uses sessions_history to get session content
# 2. Summarizes key points
# 3. Saves to memory/channels/{session-name}-session-summary-{date}.md
# 4. Resets the session via openclaw CLI
#
# The new session will automatically load the channel memory on startup.

set -e

SESSION_KEY="${1:?Usage: $0 <session_key>}"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H%M)

# Extract a readable name from the session key
# e.g., agent:main:whatsapp:group:120363405143589138@g.us -> playing-group
SESSION_NAME=$(echo "$SESSION_KEY" | sed 's/.*whatsapp:group://' | sed 's/@.*//')

# If it's the playing group, use a friendlier name
if [[ "$SESSION_KEY" == *"120363405143589138"* ]]; then
    SESSION_NAME="playing-with-alexbot"
fi

SUMMARY_FILE="memory/channels/${SESSION_NAME}-session-summary-${DATE}-${TIME}.md"

echo "📋 Session: $SESSION_KEY"
echo "📁 Summary will be saved to: $SUMMARY_FILE"
echo "🔄 After summary is saved (by agent), run:"
echo "   openclaw session delete '$SESSION_KEY'"
echo ""
echo "Note: The summarization happens in the agent context using sessions_history."
echo "This script just provides the paths and coordinates the process."
