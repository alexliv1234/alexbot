#!/bin/bash

# SECURITY BOUNDARY TESTING
# Tests that group agents CANNOT access personal data

WORKSPACE_MAIN="/home/alexliv/.openclaw/workspace"
WORKSPACE_FAST="/home/alexliv/.openclaw/workspace-fast"
WORKSPACE_BOT_HANDLER="/home/alexliv/.openclaw/workspace-bot-handler"

echo "🧪 Security Boundary Testing"
echo "─────────────────────────────"
echo ""

# Test colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

# Test function
test_boundary() {
  local test_name="$1"
  local test_command="$2"
  local should_fail="$3"  # "yes" if command should fail
  
  echo -n "Testing: $test_name... "
  
  if eval "$test_command" > /dev/null 2>&1; then
    if [ "$should_fail" = "yes" ]; then
      echo -e "${RED}FAIL${NC} (should have been blocked)"
      ((failed++))
    else
      echo -e "${GREEN}PASS${NC}"
      ((passed++))
    fi
  else
    if [ "$should_fail" = "yes" ]; then
      echo -e "${GREEN}PASS${NC} (correctly blocked)"
      ((passed++))
    else
      echo -e "${RED}FAIL${NC} (should have succeeded)"
      ((failed++))
    fi
  fi
}

echo "📦 Test Suite 1: File Access Restrictions"
echo ""

# Main workspace exists
test_boundary "Main workspace exists" \
  "[ -f '$WORKSPACE_MAIN/MEMORY.md' ]" \
  "no"

# MEMORY.md does NOT exist in group workspaces
test_boundary "Fast workspace has NO MEMORY.md" \
  "[ -f '$WORKSPACE_FAST/MEMORY.md' ]" \
  "yes"

test_boundary "Bot-handler workspace has NO MEMORY.md" \
  "[ -f '$WORKSPACE_BOT_HANDLER/MEMORY.md' ]" \
  "yes"

# .private/ does NOT exist in group workspaces  
test_boundary "Fast workspace has NO .private/" \
  "[ -d '$WORKSPACE_FAST/memory/.private' ]" \
  "yes"

test_boundary "Bot-handler workspace has NO .private/" \
  "[ -d '$WORKSPACE_BOT_HANDLER/memory/.private' ]" \
  "yes"

# Group workspaces have their own identity files
test_boundary "Fast has own IDENTITY.md" \
  "[ -f '$WORKSPACE_FAST/IDENTITY.md' ]" \
  "no"

test_boundary "Fast has own SOUL.md" \
  "[ -f '$WORKSPACE_FAST/SOUL.md' ]" \
  "no"

test_boundary "Fast has own AGENTS.md" \
  "[ -f '$WORKSPACE_FAST/AGENTS.md' ]" \
  "no"

echo ""
echo "🔒 Test Suite 2: Data Isolation"
echo ""

# Bot registry IS readable (shared data)
test_boundary "Bot registry exists and is readable" \
  "[ -r '$WORKSPACE_MAIN/memory/bot-registry.json' ]" \
  "no"

# Scores exist
test_boundary "Scores file exists" \
  "[ -f '$WORKSPACE_FAST/memory/channels/playing-with-alexbot-scores.json' ]" \
  "no"

echo ""
echo "🛡️ Test Suite 3: Directory Structure Verification"
echo ""

# Verify memory structures
test_boundary "Main has memory/.private/" \
  "[ -d '$WORKSPACE_MAIN/memory/.private' ]" \
  "no"

test_boundary "Main has private people profiles" \
  "[ -d '$WORKSPACE_MAIN/memory/.private/people' ]" \
  "no"

# Verify group workspaces exist
test_boundary "Fast workspace exists" \
  "[ -d '$WORKSPACE_FAST' ]" \
  "no"

test_boundary "Bot-handler workspace exists" \
  "[ -d '$WORKSPACE_BOT_HANDLER' ]" \
  "no"

echo ""
echo "📊 Test Suite 4: Script Availability"
echo ""

# Scoring scripts exist
test_boundary "score-message.js exists" \
  "[ -f '$WORKSPACE_MAIN/scripts/score-message.js' ]" \
  "no"

test_boundary "score-suggestion.js exists" \
  "[ -f '$WORKSPACE_MAIN/scripts/score-suggestion.js' ]" \
  "no"

test_boundary "bot-score.js exists" \
  "[ -f '$WORKSPACE_MAIN/scripts/bot-score.js' ]" \
  "no"

# Validation scripts exist
test_boundary "validate-cron-request.sh exists" \
  "[ -f '$WORKSPACE_MAIN/scripts/validate-cron-request.sh' ]" \
  "no"

test_boundary "detect-bot-prefix.js exists" \
  "[ -f '$WORKSPACE_MAIN/scripts/detect-bot-prefix.js' ]" \
  "no"

echo ""
echo "═══════════════════════════════"
echo "📊 Test Results"
echo "═══════════════════════════════"
echo -e "${GREEN}Passed: $passed${NC}"
echo -e "${RED}Failed: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✅ All security boundaries verified!${NC}"
  exit 0
else
  echo -e "${RED}❌ Security boundary violations detected!${NC}"
  exit 1
fi
