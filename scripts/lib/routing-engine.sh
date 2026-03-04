#!/bin/bash
# routing-engine.sh - Core message routing decision engine
# Determines HOW to send a message based on context
#
# Usage:
#   source scripts/lib/routing-engine.sh
#   route_decision=$(get_routing_decision "$AGENT" "$SESSION_CONTEXT" "$RECIPIENT" "$PURPOSE")

set -euo pipefail

# Normalize phone number
normalize_phone() {
    local phone="$1"
    # Remove all non-digits
    local digits=$(echo "$phone" | tr -cd '0-9')
    
    # If starts with 972, add +
    if [[ "$digits" =~ ^972 ]]; then
        echo "+$digits"
    # If starts with 0, convert to +972
    elif [[ "$digits" =~ ^0 ]]; then
        echo "+972${digits:1}"
    else
        echo "$phone"
    fi
}

# Extract session type from session context
# Examples:
#   "dm:+972544419002" → "dm"
#   "group:120363405143589138@g.us" → "group"
#   "cron:morning-briefing" → "cron"
get_session_type() {
    local session="$1"
    echo "$session" | cut -d':' -f1
}

# Check if recipient is Alex
is_alex() {
    local recipient="$1"
    local normalized=$(normalize_phone "$recipient")
    
    if [[ "$normalized" == "+972544419002" ]] || [[ "$recipient" == "Alex" ]] || [[ "$recipient" == "alex" ]]; then
        return 0
    fi
    return 1
}

# Check if recipient is a group
is_group() {
    local recipient="$1"
    if [[ "$recipient" =~ @g\.us$ ]]; then
        return 0
    fi
    return 1
}

# Get routing decision
# Returns: "reply" | "message_tool:<target>" | "BLOCK:<reason>"
get_routing_decision() {
    local agent="${1:-unknown}"
    local session_context="${2:-unknown}"
    local recipient="${3:-unknown}"
    local purpose="${4:-unknown}"
    
    local session_type=$(get_session_type "$session_context")
    local normalized_recipient=$(normalize_phone "$recipient")
    
    # RULE 1: Fast agent CANNOT message Alex
    if [[ "$agent" == "fast" ]] && is_alex "$recipient"; then
        echo "BLOCK:fast_agent_cannot_message_alex"
        return 1
    fi
    
    # RULE 2: Bot-handler CANNOT message Alex
    if [[ "$agent" == "bot-handler" ]] && is_alex "$recipient"; then
        echo "BLOCK:bot_handler_cannot_message_alex"
        return 1
    fi
    
    # RULE 3: Cron jobs ALWAYS use message tool to Alex
    if [[ "$session_type" == "cron" ]] && is_alex "$recipient"; then
        echo "message_tool:+972544419002"
        return 0
    fi
    
    # RULE 4: From group session, messaging Alex requires message tool
    if [[ "$session_type" == "group" ]] && is_alex "$recipient"; then
        echo "message_tool:+972544419002"
        return 0
    fi
    
    # RULE 5: From DM session with Alex, can use reply
    if [[ "$session_type" == "dm" ]] && [[ "$session_context" =~ \+972544419002 ]] && is_alex "$recipient"; then
        echo "reply"
        return 0
    fi
    
    # RULE 6: From main session DM with someone else, messaging Alex requires message tool
    if [[ "$session_type" == "dm" ]] && ! [[ "$session_context" =~ \+972544419002 ]] && is_alex "$recipient"; then
        echo "message_tool:+972544419002"
        return 0
    fi
    
    # RULE 7: Messaging a group always uses message tool with group ID
    if is_group "$recipient"; then
        echo "message_tool:$recipient"
        return 0
    fi
    
    # RULE 8: Investor messages require protocol validation (handled separately)
    # Just return message tool decision here
    if [[ "$purpose" == "investor" ]]; then
        echo "message_tool:$normalized_recipient"
        return 0
    fi
    
    # DEFAULT: Use message tool with explicit target (safest)
    echo "message_tool:$normalized_recipient"
    return 0
}

# Validate routing decision
# Returns 0 if valid, 1 if invalid
validate_routing() {
    local decision="$1"
    local agent="$2"
    local recipient="$3"
    
    # Check for BLOCK
    if [[ "$decision" =~ ^BLOCK: ]]; then
        return 1
    fi
    
    # Extract method and target
    if [[ "$decision" =~ ^message_tool:(.+)$ ]]; then
        local target="${BASH_REMATCH[1]}"
        
        # Validate Alex's phone number
        if is_alex "$recipient" && [[ "$target" != "+972544419002" ]]; then
            echo "ERROR: Routing to Alex but target is not +972544419002 (got: $target)" >&2
            return 1
        fi
    fi
    
    return 0
}

# Log routing decision
log_routing_decision() {
    local agent="$1"
    local session="$2"
    local recipient="$3"
    local decision="$4"
    local purpose="${5:-unknown}"
    
    local workspace="${OPENCLAW_WORKSPACE:-/home/alexliv/.openclaw/workspace}"
    local log_file="$workspace/memory/routing-log.jsonl"
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Extract method and target
    local method=""
    local target=""
    if [[ "$decision" =~ ^BLOCK:(.+)$ ]]; then
        method="BLOCK"
        target="${BASH_REMATCH[1]}"
    elif [[ "$decision" =~ ^message_tool:(.+)$ ]]; then
        method="message_tool"
        target="${BASH_REMATCH[1]}"
    elif [[ "$decision" == "reply" ]]; then
        method="reply"
        target="$recipient"
    fi
    
    # Create log entry
    echo "{\"timestamp\":\"$timestamp\",\"agent\":\"$agent\",\"session\":\"$session\",\"recipient\":\"$recipient\",\"method\":\"$method\",\"target\":\"$target\",\"purpose\":\"$purpose\",\"decision\":\"$decision\"}" >> "$log_file"
}

# Example usage (when sourced):
# decision=$(get_routing_decision "main" "cron:morning-briefing" "Alex" "daily_update")
# if validate_routing "$decision" "main" "Alex"; then
#     log_routing_decision "main" "cron:morning-briefing" "Alex" "$decision" "daily_update"
#     echo "Route: $decision"
# else
#     echo "Invalid routing!"
# fi
