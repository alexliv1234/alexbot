#!/bin/bash
# Safe session archival with gateway restart
# Usage: bash archive-sessions-safe.sh [agent-name]

AGENT="${1:-main}"

echo "🛑 Stopping OpenClaw gateway..."
openclaw gateway stop

echo ""
echo "⏳ Waiting for processes to stop..."
sleep 3

echo ""
echo "📦 Running archival for agent: $AGENT..."
node ~/.openclaw/workspace/scripts/archive-sessions.js "$AGENT"

ARCHIVE_EXIT=$?

echo ""
echo "🚀 Starting OpenClaw gateway..."
openclaw gateway start

if [ $ARCHIVE_EXIT -eq 0 ]; then
  echo ""
  echo "✅ Archival complete!"
else
  echo ""
  echo "⚠️  Archival had errors (exit code: $ARCHIVE_EXIT)"
fi
