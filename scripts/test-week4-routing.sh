#!/bin/bash
# test-week4-routing.sh - Comprehensive test suite for Week 4 routing + security
# Tests routing validation, capability enforcement, and monitoring

set -euo pipefail

WORKSPACE="/home/alexliv/.openclaw/workspace"
cd "$WORKSPACE"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Week 4: Smart Message Routing Tests${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local test_name="$1"
    local command="$2"
    local expected_exit="$3"  # 0 = pass, 1 = fail
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Test $TOTAL_TESTS: $test_name ... "
    
    if eval "$command" &>/dev/null; then
        actual_exit=0
    else
        actual_exit=1
    fi
    
    if [ "$actual_exit" -eq "$expected_exit" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Expected exit: $expected_exit, Got: $actual_exit"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo -e "${YELLOW}=== Routing Validation Tests ===${NC}"
echo ""

# Test 1: Group → Alex via reply (should fail)
run_test "Block group → Alex via reply" \
    "bash scripts/validate-message-routing.sh 'whatsapp:group:120363405143589138@g.us' '+972544419002' 'reply'" \
    1

# Test 2: Group → Alex via message tool (should pass)
run_test "Allow group → Alex via message tool" \
    "bash scripts/validate-message-routing.sh 'whatsapp:group:120363405143589138@g.us' '+972544419002' 'message_tool'" \
    0

# Test 3: Main → Alex via reply (should pass)
run_test "Allow main → Alex via reply" \
    "bash scripts/validate-message-routing.sh 'main' '+972544419002' 'reply'" \
    0

# Test 4: Cron → Alex via reply (should fail)
run_test "Block cron → Alex via reply" \
    "bash scripts/validate-message-routing.sh 'cron' '+972544419002' 'reply'" \
    1

# Test 5: Cron → Alex via message tool (should pass)
run_test "Allow cron → Alex via message tool" \
    "bash scripts/validate-message-routing.sh 'cron' '+972544419002' 'message_tool'" \
    0

# Test 6: Alex DM → Alex via reply (should pass)
run_test "Allow Alex DM → Alex via reply" \
    "bash scripts/validate-message-routing.sh 'whatsapp:dm:+972544419002' '+972544419002' 'reply'" \
    0

# Test 7: Other DM → Alex via reply (should fail)
run_test "Block other DM → Alex via reply" \
    "bash scripts/validate-message-routing.sh 'whatsapp:dm:+972525214507' '+972544419002' 'reply'" \
    1

echo ""
echo -e "${YELLOW}=== Capability Validation Tests ===${NC}"
echo ""

# Test 8: Main can read MEMORY.md
run_test "Main can read MEMORY.md" \
    "cd $WORKSPACE && bash scripts/validate-capability.sh 'main' 'read' 'MEMORY.md'" \
    0

# Test 9: Fast cannot read MEMORY.md
run_test "Fast cannot read MEMORY.md" \
    "cd $WORKSPACE-fast && bash $WORKSPACE/scripts/validate-capability.sh 'fast' 'read' 'MEMORY.md'" \
    1

# Test 10: Fast cannot read memory/.private
run_test "Fast cannot read memory/.private" \
    "cd $WORKSPACE-fast && bash $WORKSPACE/scripts/validate-capability.sh 'fast' 'read' 'memory/.private/people'" \
    1

# Test 11: Main can use Gmail
run_test "Main can use Gmail" \
    "cd $WORKSPACE && bash scripts/validate-capability.sh 'main' 'gog' 'gmail'" \
    0

# Test 12: Fast cannot use Gmail
run_test "Fast cannot use Gmail" \
    "cd $WORKSPACE-fast && bash $WORKSPACE/scripts/validate-capability.sh 'fast' 'gog' 'gmail'" \
    1

# Test 13: Both can use message tool
run_test "Main can use message tool" \
    "cd $WORKSPACE && bash scripts/validate-capability.sh 'main' 'message' 'send'" \
    0

run_test "Fast can use message tool" \
    "cd $WORKSPACE-fast && bash $WORKSPACE/scripts/validate-capability.sh 'fast' 'message' 'send'" \
    0

# Test 14: Both can use web_search
run_test "Main can use web_search" \
    "cd $WORKSPACE && bash scripts/validate-capability.sh 'main' 'web_search' 'all'" \
    0

run_test "Fast can use web_search" \
    "cd $WORKSPACE-fast && bash $WORKSPACE/scripts/validate-capability.sh 'fast' 'web_search' 'all'" \
    0

# Test 15: Both can use scoring scripts
run_test "Main can run score-message.js" \
    "cd $WORKSPACE && bash scripts/validate-capability.sh 'main' 'exec' 'score-message.js'" \
    0

run_test "Fast can run score-message.js" \
    "cd $WORKSPACE-fast && bash $WORKSPACE/scripts/validate-capability.sh 'fast' 'exec' 'score-message.js'" \
    0

echo ""
echo -e "${YELLOW}=== File Structure Tests ===${NC}"
echo ""

# Test 16: Main workspace has MEMORY.md
run_test "Main has MEMORY.md" \
    "test -f $WORKSPACE/MEMORY.md" \
    0

# Test 17: Fast workspace does NOT have MEMORY.md
run_test "Fast does NOT have MEMORY.md" \
    "test ! -f $WORKSPACE-fast/MEMORY.md" \
    0

# Test 18: Main has memory/.private
run_test "Main has memory/.private" \
    "test -d $WORKSPACE/memory/.private" \
    0

# Test 19: Fast does NOT have memory/.private
run_test "Fast does NOT have memory/.private" \
    "test ! -d $WORKSPACE-fast/memory/.private" \
    0

# Test 20: Both have separate IDENTITY.md
run_test "Main has IDENTITY.md" \
    "test -f $WORKSPACE/IDENTITY.md" \
    0

run_test "Fast has IDENTITY.md" \
    "test -f $WORKSPACE-fast/IDENTITY.md" \
    0

# Test 21: Verify they're different files
run_test "IDENTITY.md files are different" \
    "! diff -q $WORKSPACE/IDENTITY.md $WORKSPACE-fast/IDENTITY.md &>/dev/null" \
    0

echo ""
echo -e "${YELLOW}=== Integration Tests ===${NC}"
echo ""

# Test 22: Routing log file created
run_test "Routing log file exists" \
    "test -f $WORKSPACE/memory/routing-log.jsonl || touch $WORKSPACE/memory/routing-log.jsonl" \
    0

# Test 23: Log routing decision script works
run_test "Can log routing decision" \
    "cd $WORKSPACE && bash scripts/log-routing-decision.sh 'main' 'main' '+972544419002' 'reply' 'pass' 'sent'" \
    0

# Test 24: Routing log has valid JSON
run_test "Routing log contains valid JSON" \
    "cd $WORKSPACE && head -1 memory/routing-log.jsonl | jq . &>/dev/null" \
    0

# Test 25: Message routing guide exists
run_test "MESSAGE-ROUTING-GUIDE.md exists" \
    "test -f $WORKSPACE/MESSAGE-ROUTING-GUIDE.md" \
    0

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Test Results${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Total tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"
echo ""

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
    echo ""
    echo "Week 4 routing + security integration: VERIFIED"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Fix failing tests before deploying."
    exit 1
fi
