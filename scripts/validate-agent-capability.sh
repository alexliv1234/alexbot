#!/bin/bash
# validate-agent-capability.sh
# Validates if an agent has permission for a specific operation
# Usage: bash scripts/validate-agent-capability.sh <agent> <operation_type> <operation_target>

AGENT="${1:-main}"
OPERATION_TYPE="${2}"  # file_read, file_write, tool, message, data
OPERATION_TARGET="${3}"  # path, tool name, recipient, data type

CONFIG_FILE="/home/alexliv/.openclaw/workspace/config/agent-capabilities.json"

# Exit codes
EXIT_ALLOWED=0
EXIT_DENIED=1
EXIT_ERROR=2

# Validate inputs
if [ -z "$OPERATION_TYPE" ] || [ -z "$OPERATION_TARGET" ]; then
  echo "❌ ERROR: Missing required parameters"
  echo "Usage: $0 <agent> <operation_type> <operation_target>"
  exit $EXIT_ERROR
fi

# Check if config exists
if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ ERROR: Capability config not found: $CONFIG_FILE"
  exit $EXIT_ERROR
fi

# Helper: Check if path matches pattern
path_matches() {
  local path="$1"
  local pattern="$2"
  
  # Convert glob pattern to regex
  # workspace/* becomes workspace/.*
  # workspace/memory/*.json becomes workspace/memory/.*\.json
  local regex=$(echo "$pattern" | sed 's/\*/\.\*/g')
  
  if [[ "$path" =~ $regex ]]; then
    return 0
  else
    return 1
  fi
}

# Helper: Check if path is in blocked list
is_path_blocked() {
  local agent="$1"
  local path="$2"
  
  local blocked_paths=$(jq -r --arg agent "$agent" \
    '.agents[$agent].blockedPaths[]? // empty' "$CONFIG_FILE" 2>/dev/null)
  
  if [ -z "$blocked_paths" ]; then
    return 1  # No blocked paths = not blocked
  fi
  
  while IFS= read -r pattern; do
    if path_matches "$path" "$pattern"; then
      return 0  # Blocked
    fi
  done <<< "$blocked_paths"
  
  return 1  # Not blocked
}

# Check file access (read/write)
check_file_access() {
  local agent="$1"
  local access_type="$2"  # read or write
  local path="$3"
  
  # Normalize path (remove /home/alexliv/.openclaw/ prefix if present)
  local normalized_path="${path#/home/alexliv/.openclaw/}"
  
  # Check if path is explicitly blocked
  if is_path_blocked "$agent" "$normalized_path"; then
    echo "🚫 DENIED: Path is blocked for agent '$agent': $path" >&2
    echo "Reason: Blocked path (contains sensitive data)" >&2
    exit $EXIT_DENIED
  fi
  
  # Get allowed patterns for this agent + access type
  local allowed_patterns=$(jq -r --arg agent "$agent" --arg type "$access_type" \
    '.agents[$agent].capabilities.fileAccess[$type][]? // empty' "$CONFIG_FILE" 2>/dev/null)
  
  if [ -z "$allowed_patterns" ]; then
    echo "🚫 DENIED: No $access_type permissions for agent '$agent'" >&2
    exit $EXIT_DENIED
  fi
  
  # Check if path matches any allowed pattern
  while IFS= read -r pattern; do
    if [ "$pattern" = "*" ]; then
      echo "✅ ALLOWED: Agent '$agent' has full $access_type access"
      exit $EXIT_ALLOWED
    fi
    
    if path_matches "$normalized_path" "$pattern"; then
      echo "✅ ALLOWED: Path matches pattern '$pattern'"
      exit $EXIT_ALLOWED
    fi
  done <<< "$allowed_patterns"
  
  echo "🚫 DENIED: Path not in allowed list for agent '$agent': $path" >&2
  echo "Allowed patterns: $(echo "$allowed_patterns" | tr '\n' ', ' | sed 's/,$//')" >&2
  exit $EXIT_DENIED
}

# Check tool access
check_tool_access() {
  local agent="$1"
  local tool="$2"
  
  local allowed=$(jq -r --arg agent "$agent" --arg tool "$tool" \
    '.agents[$agent].capabilities.tools[$tool] // false' "$CONFIG_FILE")
  
  if [ "$allowed" = "true" ]; then
    echo "✅ ALLOWED: Agent '$agent' can use tool '$tool'"
    exit $EXIT_ALLOWED
  else
    echo "🚫 DENIED: Tool '$tool' not available for agent '$agent'" >&2
    echo "Reason: Tool restricted (capability policy)" >&2
    exit $EXIT_DENIED
  fi
}

# Check messaging permissions
check_message_access() {
  local agent="$1"
  local recipient="$2"
  
  # Detect recipient type
  if [[ "$recipient" =~ ^[+]?[0-9]+$ ]]; then
    # Phone number - could be Alex or someone else
    if [ "$recipient" = "+972544419002" ] || [ "$recipient" = "972544419002" ]; then
      local allowed=$(jq -r --arg agent "$agent" \
        '.agents[$agent].capabilities.messaging.sendToAlex // false' "$CONFIG_FILE")
      
      if [ "$allowed" = "true" ]; then
        echo "✅ ALLOWED: Agent '$agent' can send to Alex"
        exit $EXIT_ALLOWED
      else
        echo "🚫 DENIED: Agent '$agent' cannot send to Alex's DM" >&2
        echo "Reason: Messaging policy (personal isolation)" >&2
        exit $EXIT_DENIED
      fi
    else
      # Other DM
      local allowed=$(jq -r --arg agent "$agent" \
        '.agents[$agent].capabilities.messaging.sendToDMs // false' "$CONFIG_FILE")
      
      if [ "$allowed" = "true" ] || [ "$allowed" = "replyOnly" ]; then
        echo "✅ ALLOWED: Agent '$agent' can send to DMs"
        exit $EXIT_ALLOWED
      else
        echo "🚫 DENIED: Agent '$agent' cannot send to DMs" >&2
        echo "Reason: Messaging policy (DM restrictions)" >&2
        exit $EXIT_DENIED
      fi
    fi
  elif [[ "$recipient" =~ @g\.us$ ]]; then
    # Group ID
    local allowed=$(jq -r --arg agent "$agent" \
      '.agents[$agent].capabilities.messaging.sendToGroups // false' "$CONFIG_FILE")
    
    if [ "$allowed" = "true" ]; then
      echo "✅ ALLOWED: Agent '$agent' can send to groups"
      exit $EXIT_ALLOWED
    elif [ "$allowed" = "ownGroupOnly" ]; then
      echo "⚠️  PARTIAL: Agent '$agent' can only send to triggering group"
      echo "Note: Runtime validation needed to check group ID matches session"
      exit $EXIT_ALLOWED  # Allow, but warn that runtime check needed
    else
      echo "🚫 DENIED: Agent '$agent' cannot send to groups" >&2
      exit $EXIT_DENIED
    fi
  else
    echo "⚠️  UNKNOWN: Cannot determine recipient type: $recipient" >&2
    exit $EXIT_ERROR
  fi
}

# Check data access
check_data_access() {
  local agent="$1"
  local data_type="$2"
  
  local allowed=$(jq -r --arg agent "$agent" --arg type "$data_type" \
    '.agents[$agent].capabilities.dataAccess[$type] // false' "$CONFIG_FILE")
  
  if [ "$allowed" = "true" ]; then
    echo "✅ ALLOWED: Agent '$agent' can access data type '$data_type'"
    exit $EXIT_ALLOWED
  else
    echo "🚫 DENIED: Agent '$agent' cannot access data type '$data_type'" >&2
    echo "Reason: Data access policy (sensitive information)" >&2
    exit $EXIT_DENIED
  fi
}

# Main validation logic
case "$OPERATION_TYPE" in
  file_read)
    check_file_access "$AGENT" "read" "$OPERATION_TARGET"
    exit $?
    ;;
  file_write)
    check_file_access "$AGENT" "write" "$OPERATION_TARGET"
    exit $?
    ;;
  tool)
    check_tool_access "$AGENT" "$OPERATION_TARGET"
    exit $?
    ;;
  message)
    check_message_access "$AGENT" "$OPERATION_TARGET"
    exit $?
    ;;
  data)
    check_data_access "$AGENT" "$OPERATION_TARGET"
    exit $?
    ;;
  *)
    echo "❌ ERROR: Unknown operation type: $OPERATION_TYPE"
    echo "Valid types: file_read, file_write, tool, message, data"
    exit $EXIT_ERROR
    ;;
esac
