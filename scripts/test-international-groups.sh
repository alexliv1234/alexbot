#!/bin/bash
# Test International Groups Infrastructure
# Verifies all components are in place and working

echo "🧪 TESTING INTERNATIONAL GROUPS INFRASTRUCTURE"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# Test 1: Memory files exist
echo "📁 Testing memory files..."
if [ -f "/home/alexliv/.openclaw/workspace/memory/international-groups/playing/scores.json" ]; then
    pass "Playing group scores.json exists"
else
    fail "Playing group scores.json missing"
fi

if [ -f "/home/alexliv/.openclaw/workspace/memory/international-groups/playing/suggestions.json" ]; then
    pass "Playing group suggestions.json exists"
else
    fail "Playing group suggestions.json missing"
fi

if [ -f "/home/alexliv/.openclaw/workspace/memory/international-groups/playing/winners.json" ]; then
    pass "Playing group winners.json exists"
else
    fail "Playing group winners.json missing"
fi

if [ -f "/home/alexliv/.openclaw/workspace-learning/memory/international-groups/learning/context.md" ]; then
    pass "Learning group context.md exists"
else
    fail "Learning group context.md missing"
fi

if [ -f "/home/alexliv/.openclaw/workspace/memory/international-groups/fundraising/context.md" ]; then
    pass "Fundraising group context.md exists"
else
    fail "Fundraising group context.md missing"
fi

echo ""

# Test 2: Scoring scripts exist and are executable
echo "⚙️ Testing scoring scripts..."
if [ -x "/home/alexliv/.openclaw/workspace/scripts/score-international-playing.js" ]; then
    pass "Playing scoring script exists and is executable"
else
    fail "Playing scoring script missing or not executable"
fi

if [ -x "/home/alexliv/.openclaw/workspace-learning/scripts/score-international-teaching.js" ]; then
    pass "Teaching scoring script exists and is executable"
else
    fail "Teaching scoring script missing or not executable"
fi

echo ""

# Test 3: Automation scripts exist and are executable
echo "🤖 Testing automation scripts..."
if [ -x "/home/alexliv/.openclaw/workspace/scripts/international-playing-morning.sh" ]; then
    pass "Morning wakeup script exists and is executable"
else
    fail "Morning wakeup script missing or not executable"
fi

if [ -x "/home/alexliv/.openclaw/workspace/scripts/international-playing-nightly.sh" ]; then
    pass "Nightly summary script exists and is executable"
else
    fail "Nightly summary script missing or not executable"
fi

echo ""

# Test 4: Test scoring scripts functionality
echo "🧮 Testing scoring functionality..."

# Test playing group scoring
TEST_OUTPUT=$(node /home/alexliv/.openclaw/workspace/scripts/score-international-playing.js "+972500000000" "TestUser" "Test challenge" 5 6 4 5 7 2 3 2>&1)
if echo "$TEST_OUTPUT" | grep -q "📊 \*\*SCORE:"; then
    pass "Playing scoring script produces correct output format"
else
    fail "Playing scoring script output format incorrect"
fi

# Test teaching scoring
TEST_OUTPUT=$(node /home/alexliv/.openclaw/workspace-learning/scripts/score-international-teaching.js "TestStudent" "+972500000001" "Test question" 7 8 6 7 8 2>&1)
if echo "$TEST_OUTPUT" | grep -q "📊 \*\*TEACHING SCORE:"; then
    pass "Teaching scoring script produces correct output format"
else
    fail "Teaching scoring script output format incorrect"
fi

echo ""

# Test 5: Check cron jobs are registered
echo "⏰ Testing cron jobs..."
# Note: Skipping live cron test as 'openclaw cron list' can hang
# Cron jobs should be verified manually with: openclaw cron list
warn "Cron jobs test skipped (manual verification recommended)"

echo ""

# Test 6: Verify AGENTS.md documentation
echo "📝 Testing documentation..."

if grep -q "120363406698718454@g.us" /home/alexliv/.openclaw/workspace/workspace-fast/AGENTS.md; then
    pass "Fast agent AGENTS.md includes international playing group"
else
    fail "Fast agent AGENTS.md missing international playing group"
fi

if grep -q "120363408194003382@g.us" /home/alexliv/.openclaw/workspace-learning/AGENTS.md; then
    pass "Learning agent AGENTS.md includes international learning group"
else
    fail "Learning agent AGENTS.md missing international learning group"
fi

if grep -q "120363407645823343@g.us" /home/alexliv/.openclaw/workspace/AGENTS.md; then
    pass "Main agent AGENTS.md includes fundraising group"
else
    fail "Main agent AGENTS.md missing fundraising group"
fi

echo ""
echo "=============================================="
echo "📊 RESULTS:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "Infrastructure is ready for testing."
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    echo "Please review and fix failing components."
    exit 1
fi
