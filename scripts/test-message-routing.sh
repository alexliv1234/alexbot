#!/bin/bash
# test-message-routing.sh - Test suite for message routing system
# Validates routing-engine.sh and validate-message-routing.sh

set -euo pipefail

WORKSPACE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$WORKSPACE/scripts/lib/routing-engine.sh"

TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test helper
test_routing() {
    local test_name="$1"
    local agent="$2"
    local session="$3"
    local recipient="$4"
    local expected="$5"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    local result=$(get_routing_decision "$agent" "$session" "$recipient" "test")
    
    if [[ "$result" == "$expected" ]]; then
        echo "  ✅ $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "  ❌ $test_name"
        echo "     Expected: $expected"
        echo "     Got: $result"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

echo "🧪 Testing Message Routing System"
echo "=================================="
echo ""

# Test 1: Fast agent cannot message Alex
echo "Test Group 1: Security Blocks"
echo "------------------------------"
test_routing \
    "Fast agent blocked from messaging Alex" \
    "fast" \
    "group:120363405143589138@g.us" \
    "+972544419002" \
    "BLOCK:fast_agent_cannot_message_alex"

test_routing \
    "Bot-handler blocked from messaging Alex" \
    "bot-handler" \
    "dm:+972559874713" \
    "Alex" \
    "BLOCK:bot_handler_cannot_message_alex"

echo ""

# Test 2: Cron jobs use message tool
echo "Test Group 2: Cron Job Routing"
echo "-------------------------------"
test_routing \
    "Cron to Alex uses message tool" \
    "main" \
    "cron:morning-briefing" \
    "Alex" \
    "message_tool:+972544419002"

test_routing \
    "Cron with phone uses message tool" \
    "main" \
    "cron:reminder" \
    "+972544419002" \
    "message_tool:+972544419002"

echo ""

# Test 3: Group session routing
echo "Test Group 3: Group Session Routing"
echo "------------------------------------"
test_routing \
    "From group to Alex uses message tool" \
    "main" \
    "group:120363405143589138@g.us" \
    "Alex" \
    "message_tool:+972544419002"

test_routing \
    "Fast in group to group uses message tool" \
    "fast" \
    "group:120363405143589138@g.us" \
    "120363405143589138@g.us" \
    "message_tool:120363405143589138@g.us"

echo ""

# Test 4: DM session routing
echo "Test Group 4: DM Session Routing"
echo "---------------------------------"
test_routing \
    "DM with Alex, reply to Alex uses reply" \
    "main" \
    "dm:+972544419002" \
    "Alex" \
    "reply"

test_routing \
    "DM with other, message Alex uses message tool" \
    "main" \
    "dm:+972528897849" \
    "+972544419002" \
    "message_tool:+972544419002"

echo ""

# Test 5: Phone normalization
echo "Test Group 5: Phone Normalization"
echo "----------------------------------"
test_routing \
    "Alex as 'Alex' normalized" \
    "main" \
    "cron:test" \
    "Alex" \
    "message_tool:+972544419002"

test_routing \
    "Alex as 'alex' normalized" \
    "main" \
    "dm:+972528897849" \
    "alex" \
    "message_tool:+972544419002"

echo ""

# Test 6: Investor routing
echo "Test Group 6: Investor Routing"
echo "-------------------------------"
test_routing \
    "Investor message uses message tool" \
    "main" \
    "dm:+972544419002" \
    "+972526802086" \
    "message_tool:+972526802086"

echo ""

# Test 7: Group ID routing
echo "Test Group 7: Group ID Routing"
echo "-------------------------------"
test_routing \
    "Group ID uses message tool" \
    "main" \
    "dm:+972544419002" \
    "120363405143589138@g.us" \
    "message_tool:120363405143589138@g.us"

echo ""

# Summary
echo "=================================="
echo "📊 Test Results"
echo "=================================="
echo ""
echo "Total Tests: $TESTS_RUN"
echo "✅ Passed: $TESTS_PASSED"
echo "❌ Failed: $TESTS_FAILED"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "💥 Some tests failed"
    exit 1
fi
