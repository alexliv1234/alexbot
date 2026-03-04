#!/bin/bash

# Week 5 Test Suite: Value Proposition Enforcer
# Tests investor message validation and scoring

# Note: NOT using 'set -e' so all tests run even if some fail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"

echo "🧪 Week 5 Test Suite: Value Proposition Enforcer"
echo "================================================"
echo

# Test counters
PASSED=0
FAILED=0

# Helper function
run_test() {
  local test_name="$1"
  local command="$2"
  local expected_result="$3"  # "pass" or "fail"
  
  echo -n "  Testing: $test_name ... "
  
  eval "$command" > /dev/null 2>&1
  exit_code=$?
  
  # Validator exit codes: 0 = pass, 1 = critical fail, 2 = warnings
  # For "should pass" tests: accept 0 or 2 (pass or warnings)
  # For "should fail" tests: require exit 1 (critical failure)
  if [ "$expected_result" = "pass" ]; then
    if [ $exit_code -eq 0 ] || [ $exit_code -eq 2 ]; then
      actual_result="pass"
    else
      actual_result="fail"
    fi
  else
    if [ $exit_code -eq 1 ]; then
      actual_result="fail"
    else
      actual_result="pass"
    fi
  fi
  
  if [ "$actual_result" = "$expected_result" ]; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL (expected $expected_result, got $actual_result, exit=$exit_code)"
    ((FAILED++))
  fi
}

# ============================================================================
# 1. INVESTOR MESSAGE VALIDATOR TESTS
# ============================================================================

echo "1️⃣ Investor Message Validator Tests"
echo "-----------------------------------"

# Good messages (should pass)
run_test "Message with trained intelligence" \
  "echo 'We have 742 teaching interactions showing continuous learning' | bash '$SCRIPT_DIR/validate-investor-message.sh' --investor 'Test Investor' --check-only" \
  "pass"

run_test "Message with learning loops" \
  "echo 'Our learning loop captures every interaction and improves' | bash '$SCRIPT_DIR/validate-investor-message.sh' --investor 'Test' --check-only" \
  "pass"

run_test "Message with portable moat" \
  "echo 'You cannot fork accumulated intelligence and experience' | bash '$SCRIPT_DIR/validate-investor-message.sh' --investor 'Test' --check-only" \
  "pass"

# Bad messages (should fail)
run_test "BLOCKS platform-first message" \
  "echo 'We built a platform for AI agents with infrastructure' | bash '$SCRIPT_DIR/validate-investor-message.sh' --investor 'Test' --check-only" \
  "fail"

run_test "BLOCKS infrastructure-first message" \
  "echo 'Our infrastructure layer provides model-agnostic access' | bash '$SCRIPT_DIR/validate-investor-message.sh' --investor 'Test' --check-only" \
  "fail"

run_test "BLOCKS message missing core value prop" \
  "echo 'We have great features and nice UI' | bash '$SCRIPT_DIR/validate-investor-message.sh' --investor 'Test' --check-only" \
  "fail"

echo

# ============================================================================
# 2. MESSAGE SCORING TESTS
# ============================================================================

echo "2️⃣ Message Scoring Tests"
echo "------------------------"

run_test "Scoring script exists and is executable" \
  "test -x '$SCRIPT_DIR/score-investor-message.js'" \
  "pass"

run_test "Accepts valid score (0-10)" \
  "node '$SCRIPT_DIR/score-investor-message.js' 'Test' 'Message' 8 7 9 8 7" \
  "pass"

run_test "Rejects invalid score (<0)" \
  "node '$SCRIPT_DIR/score-investor-message.js' 'Test' 'Message' -1 7 9 8 7" \
  "fail"

run_test "Rejects invalid score (>10)" \
  "node '$SCRIPT_DIR/score-investor-message.js' 'Test' 'Message' 8 11 9 8 7" \
  "fail"

run_test "Creates scores log file" \
  "test -f '$WORKSPACE_DIR/memory/investor-interactions/message-scores.jsonl'" \
  "pass"

echo

# ============================================================================
# 3. INVESTOR PROFILE SYSTEM TESTS
# ============================================================================

echo "3️⃣ Investor Profile System Tests"
echo "---------------------------------"

run_test "Investor interactions directory exists" \
  "test -d '$WORKSPACE_DIR/memory/investor-interactions'" \
  "pass"

run_test "README.md exists with structure docs" \
  "test -f '$WORKSPACE_DIR/memory/investor-interactions/README.md'" \
  "pass"

run_test "README contains scoring categories" \
  "grep -q 'Intelligence-First' '$WORKSPACE_DIR/memory/investor-interactions/README.md'" \
  "pass"

run_test "README contains ONE MESSAGE RULE" \
  "grep -q 'ONE MESSAGE RULE' '$WORKSPACE_DIR/memory/investor-interactions/README.md'" \
  "pass"

echo

# ============================================================================
# 4. INTEGRATION TESTS
# ============================================================================

echo "4️⃣ Integration Tests"
echo "--------------------"

# Test full workflow: validate → score → log
TEST_MSG="We've accumulated 742 teaching interactions and 100+ security lessons. This trained intelligence creates a portable moat that infrastructure platforms cannot replicate."

run_test "Full workflow: validate good message" \
  "echo '$TEST_MSG' | bash '$SCRIPT_DIR/validate-investor-message.sh' --investor 'Integration Test' --check-only" \
  "pass"

run_test "Full workflow: score the message" \
  "node '$SCRIPT_DIR/score-investor-message.js' 'Integration Test' '$TEST_MSG' 9 8 9 9 8" \
  "pass"

run_test "Scores are logged in JSONL" \
  "test -s '$WORKSPACE_DIR/memory/investor-interactions/message-scores.jsonl'" \
  "pass"

run_test "Latest score is properly formatted JSON" \
  "tail -1 '$WORKSPACE_DIR/memory/investor-interactions/message-scores.jsonl' | jq -e '.scores.total' > /dev/null" \
  "pass"

echo

# ============================================================================
# SUMMARY
# ============================================================================

echo "================================================"
echo "📊 Test Results"
echo "================================================"
echo "  ✅ Passed: $PASSED"
echo "  ❌ Failed: $FAILED"
echo "  📈 Total:  $((PASSED + FAILED))"
echo

if [ $FAILED -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
else
  echo "⚠️  Some tests failed"
  exit 1
fi
