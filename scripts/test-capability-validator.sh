#!/bin/bash
# test-capability-validator.sh
# Tests the agent capability validator

VALIDATOR="/home/alexliv/.openclaw/workspace/scripts/validate-agent-capability.sh"

echo "🧪 Testing Agent Capability Validator"
echo "======================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper: Run test
run_test() {
  local name="$1"
  local agent="$2"
  local operation="$3"
  local target="$4"
  local expected="$5"  # ALLOWED or DENIED
  
  echo -n "Test: $name ... "
  
  # Important: Don't use 'local' on the assignment line, or $? will be the exit code of 'local', not bash!
  output=$(bash "$VALIDATOR" "$agent" "$operation" "$target" 2>&1)
  exit_code=$?
  
  if [ "$expected" = "ALLOWED" ] && [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  elif [ "$expected" = "DENIED" ] && [ $exit_code -eq 1 ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Expected: $expected (exit $( [ "$expected" = "ALLOWED" ] && echo 0 || echo 1 ))"
    echo "  Got: exit $exit_code"
    echo "  Output: $output"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

echo "📂 File Access Tests"
echo "-------------------"

# Main agent - full access
run_test "main can read MEMORY.md" "main" "file_read" "workspace/MEMORY.md" "ALLOWED"
run_test "main can write MEMORY.md" "main" "file_write" "workspace/MEMORY.md" "ALLOWED"
run_test "main can read people profiles" "main" "file_read" "workspace/memory/people/test.md" "ALLOWED"

# Fast agent - restricted
run_test "fast CANNOT read MEMORY.md" "fast" "file_read" "workspace/MEMORY.md" "DENIED"
run_test "fast CANNOT read people profiles" "fast" "file_read" "workspace/memory/people/test.md" "DENIED"
run_test "fast CANNOT read google contacts" "fast" "file_read" "workspace/memory/whatsapp/google_contacts.json" "DENIED"
run_test "fast CANNOT read employee data" "fast" "file_read" "workspace/memory/esh_employees.json" "DENIED"
run_test "fast CANNOT read investor data" "fast" "file_read" "workspace/memory/investor-interactions/test.md" "DENIED"

# Fast agent - allowed paths
run_test "fast CAN read group-manager.js" "fast" "file_read" "workspace/scripts/group-manager.js" "ALLOWED"
run_test "fast CAN read channel memory" "fast" "file_read" "workspace/memory/channels/playing.md" "ALLOWED"
run_test "fast CAN write bot registry" "fast" "file_write" "workspace/memory/bot-registry.json" "ALLOWED"
run_test "fast CAN read SKILL.md" "fast" "file_read" "workspace/skills/weather/SKILL.md" "ALLOWED"

echo ""
echo "🔧 Tool Access Tests"
echo "-------------------"

# Main agent - all tools
run_test "main can use exec" "main" "tool" "exec" "ALLOWED"
run_test "main can use cron" "main" "tool" "cron" "ALLOWED"
run_test "main can use gateway" "main" "tool" "gateway" "ALLOWED"
run_test "main can use memory_search" "main" "tool" "memory_search" "ALLOWED"

# Fast agent - restricted tools
run_test "fast CANNOT use exec" "fast" "tool" "exec" "DENIED"
run_test "fast CANNOT use cron" "fast" "tool" "cron" "DENIED"
run_test "fast CANNOT use gateway" "fast" "tool" "gateway" "DENIED"
run_test "fast CANNOT use memory_search" "fast" "tool" "memory_search" "DENIED"
run_test "fast CANNOT use tts" "fast" "tool" "tts" "DENIED"

# Fast agent - allowed tools
run_test "fast CAN use message" "fast" "tool" "message" "ALLOWED"
run_test "fast CAN use web_search" "fast" "tool" "web_search" "ALLOWED"

echo ""
echo "💬 Messaging Tests"
echo "-----------------"

# Main agent - can message anyone
run_test "main can message Alex" "main" "message" "+972544419002" "ALLOWED"
run_test "main can message groups" "main" "message" "120363405143589138@g.us" "ALLOWED"

# Fast agent - restricted messaging
run_test "fast CANNOT message Alex" "fast" "message" "+972544419002" "DENIED"
run_test "fast can message groups (with runtime check)" "fast" "message" "120363405143589138@g.us" "ALLOWED"

# Bot handler
run_test "bot-handler can message Alex" "bot-handler" "message" "+972544419002" "ALLOWED"

echo ""
echo "📊 Data Access Tests"
echo "-------------------"

# Main agent - all data
run_test "main can access MEMORY_md" "main" "data" "MEMORY_md" "ALLOWED"
run_test "main can access peopleProfiles" "main" "data" "peopleProfiles" "ALLOWED"
run_test "main can access familyInfo" "main" "data" "familyInfo" "ALLOWED"

# Fast agent - restricted data
run_test "fast CANNOT access MEMORY_md" "fast" "data" "MEMORY_md" "DENIED"
run_test "fast CANNOT access peopleProfiles" "fast" "data" "peopleProfiles" "DENIED"
run_test "fast CANNOT access familyInfo" "fast" "data" "familyInfo" "DENIED"
run_test "fast CANNOT access employeeData" "fast" "data" "employeeData" "DENIED"

# Fast agent - allowed data
run_test "fast CAN access groupScoring" "fast" "data" "groupScoring" "ALLOWED"
run_test "fast CAN access botRegistry" "fast" "data" "botRegistry" "ALLOWED"

echo ""
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total:  $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
