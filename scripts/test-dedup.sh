#!/bin/bash
# test-dedup.sh - Test de-duplication system
# Simulates duplicate sends to verify blocking works

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧪 Testing de-duplication system..."
echo ""

# Test 1: Send message once
echo "Test 1: First send (should succeed)"
bash "$SCRIPT_DIR/notify-alex-safe.sh" "Test message at $(date +%H:%M:%S)" 60
echo ""

# Test 2: Immediate duplicate (should block)
echo "Test 2: Immediate duplicate (should be blocked)"
bash "$SCRIPT_DIR/notify-alex-safe.sh" "Test message at $(date +%H:%M:%S)" 60
echo ""

# Test 3: Different message (should succeed)
echo "Test 3: Different message (should succeed)"
bash "$SCRIPT_DIR/notify-alex-safe.sh" "Different message at $(date +%H:%M:%S)" 60
echo ""

# Test 4: Check log
echo "Test 4: Recent message log"
tail -5 /home/alexliv/.openclaw/workspace/memory/message-sends.log | jq -c .
echo ""

echo "✅ De-duplication test complete"
