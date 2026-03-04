#!/bin/bash
# validate-capability.sh - Runtime capability validation
# Part of Week 4: Smart Message Routing - Security Integration

set -euo pipefail

# Usage: bash scripts/validate-capability.sh "<agent>" "<tool>" "<operation>"
# Example: bash scripts/validate-capability.sh "fast" "read" "MEMORY.md"

AGENT="${1:-unknown}"
TOOL="${2:-unknown}"
OPERATION="${3:-}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== CAPABILITY VALIDATOR ==="
echo "Agent: $AGENT"
echo "Tool: $TOOL"
echo "Operation: $OPERATION"
echo ""

# Determine agent type from workspace or agent name
AGENT_TYPE="unknown"
if [[ "$AGENT" == "main" ]] || [[ "$PWD" == *"/workspace" ]] && [[ "$PWD" != *"/workspace-"* ]]; then
    AGENT_TYPE="personal"
elif [[ "$AGENT" == "fast" ]] || [[ "$PWD" == *"/workspace-fast" ]]; then
    AGENT_TYPE="group"
elif [[ "$AGENT" == "bot-handler" ]] || [[ "$PWD" == *"/workspace-bot-handler" ]]; then
    AGENT_TYPE="bot"
fi

echo "Agent type: $AGENT_TYPE"
echo ""

# Define capability matrix
# Format: TOOL:OPERATION:ALLOWED_AGENT_TYPES

PERSONAL_ONLY_TOOLS=(
    # File access to private data
    "read:MEMORY.md:personal"
    "read:memory/.private:personal"
    "read:memory/people:personal"
    "read:memory/calls:personal"
    "read:memory/whatsapp/google_contacts.json:personal"
    
    # Gmail/Calendar (allow for personal only)
    "gmail:all:personal"
    "calendar:all:personal"
    "gog:all:personal"
    
    # System modifications
    "gateway:config:personal"
    "gateway:restart:personal"
    
    # Identity file modifications
    "write:SOUL.md:personal"
    "write:IDENTITY.md:personal"
    "write:AGENTS.md:personal"
    "edit:SOUL.md:personal"
    "edit:IDENTITY.md:personal"
    "edit:AGENTS.md:personal"
)

PERSONAL_ALLOWED_TOOLS=(
    # These are ALLOWED for personal, not blocked
    "gmail:all"
    "calendar:all"
    "gog:all"
    "memory_search:all"
    "memory_get:all"
)

SHARED_SAFE_TOOLS=(
    # Scoring (operates on isolated JSON)
    "exec:score-message.js:all"
    "exec:score-suggestion.js:all"
    "exec:score-teaching.js:all"
    
    # Message formatting
    "message:send:all"
    "message:react:all"
    
    # Web/research (no private data)
    "web_search:all"
    "web_fetch:all"
    
    # TTS (no private data)
    "tts:all"
)

# Check if operation is explicitly blocked
BLOCKED=false
ALLOWED=false

# Check personal-allowed tools first (before blocking rules)
for rule in "${PERSONAL_ALLOWED_TOOLS[@]}"; do
    IFS=: read -r rule_tool rule_op <<< "$rule"
    
    if [[ "$TOOL" == "$rule_tool" ]] && [[ "$AGENT_TYPE" == "personal" ]]; then
        if [[ "$rule_op" == "all" ]] || [[ "$OPERATION" == *"$rule_op"* ]]; then
            echo -e "${GREEN}✓ ALLOWED: Tool '$TOOL' is personal-allowed${NC}"
            ALLOWED=true
            break
        fi
    fi
done

# If not already allowed, check personal-only tools (blocking rules)
if [[ "$ALLOWED" == false ]]; then
    for rule in "${PERSONAL_ONLY_TOOLS[@]}"; do
        IFS=: read -r rule_tool rule_op rule_agents <<< "$rule"
        
        # Match tool
        if [[ "$TOOL" == "$rule_tool" ]]; then
            # Match operation (wildcard or exact)
            if [[ "$OPERATION" == *"$rule_op"* ]] || [[ -z "$OPERATION" && "$rule_op" == "all" ]] || [[ "$rule_op" == "all" ]]; then
                if [[ "$rule_agents" == "personal" ]] && [[ "$AGENT_TYPE" != "personal" ]]; then
                    echo -e "${RED}🚨 BLOCKED: Tool '$TOOL' for operation '$rule_op' is PERSONAL-ONLY${NC}"
                    echo -e "${RED}   Agent type: $AGENT_TYPE${NC}"
                    echo -e "${RED}   Only 'personal' agent can access this${NC}"
                    BLOCKED=true
                    break
                fi
            fi
        fi
    done
fi

# If not explicitly blocked, check if it's in shared safe tools
if [[ "$BLOCKED" == false ]]; then
    for rule in "${SHARED_SAFE_TOOLS[@]}"; do
        IFS=: read -r rule_tool rule_op rule_agents <<< "$rule"
        
        if [[ "$TOOL" == "$rule_tool" ]]; then
            if [[ "$rule_op" == "all" ]] || [[ "$OPERATION" == *"$rule_op"* ]]; then
                if [[ "$rule_agents" == "all" ]]; then
                    echo -e "${GREEN}✓ ALLOWED: Tool '$TOOL' is shared-safe${NC}"
                    ALLOWED=true
                    break
                fi
            fi
        fi
    done
fi

echo ""
echo "=== VALIDATION RESULT ==="

if [[ "$BLOCKED" == true ]]; then
    echo -e "${RED}❌ CAPABILITY DENIED${NC}"
    echo ""
    echo "This operation violates security boundaries."
    echo "Group/bot agents cannot access personal data."
    exit 1
elif [[ "$ALLOWED" == true ]]; then
    echo -e "${GREEN}✅ CAPABILITY ALLOWED${NC}"
    echo ""
    echo "Safe to proceed."
    exit 0
else
    echo -e "${YELLOW}⚠️  UNKNOWN CAPABILITY${NC}"
    echo ""
    echo "Tool/operation not explicitly in matrix."
    echo "Defaulting to: ALLOW (with caution)"
    echo ""
    echo "Consider adding to CAPABILITY-MATRIX.md if this is:"
    echo "  - A new tool that should be restricted"
    echo "  - A personal-only operation"
    exit 0
fi
