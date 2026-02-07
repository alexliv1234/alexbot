#!/bin/bash
# Local Agent - Full autonomous agent powered by local LLM
# Usage: ./agent.sh "task description"
#    or: source agent.sh && local_agent "task"

OLLAMA_URL="${OLLAMA_URL:-http://10.100.102.8:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5:32b-instruct-q4_K_M}"
MAX_STEPS="${MAX_STEPS:-15}"
WORKSPACE="/home/alexliv/.openclaw/workspace"

# Tool definitions for the LLM
TOOL_DEFINITIONS='You have access to these tools. To use a tool, respond with a JSON block:
```json
{"tool": "tool_name", "args": {"arg1": "value1"}}
```

Available tools:

1. **read_file** - Read contents of a file
   Args: {"path": "/path/to/file"}

2. **write_file** - Write content to a file (workspace and /tmp only)
   Args: {"path": "/path/to/file", "content": "file contents"}

3. **list_directory** - List files in a directory
   Args: {"path": "/path/to/dir"}

4. **exec_command** - Execute a shell command (safe commands only)
   Args: {"command": "ls -la"}

5. **web_search** - Search the web
   Args: {"query": "search terms"}

6. **web_fetch** - Fetch and extract content from a URL
   Args: {"url": "https://example.com"}

7. **gmail_search** - Search Gmail
   Args: {"query": "from:someone subject:something"}

8. **gmail_read** - Read a specific email
   Args: {"message_id": "abc123"}

9. **calendar_list** - List upcoming calendar events
   Args: {"days": 7}

10. **think** - Think through a problem step by step (no external action)
    Args: {"thought": "Let me consider..."}

When you have completed the task, respond with:
```json
{"tool": "final_answer", "args": {"answer": "Your complete answer here"}}
```

Important:
- Use tools to gather information before answering
- You can use multiple tools in sequence
- Always end with final_answer when done
- Be thorough but efficient'

# Execute a tool and return result
execute_tool() {
    local tool="$1"
    local args="$2"
    
    case "$tool" in
        "read_file")
            local path=$(echo "$args" | jq -r '.path')
            if [[ -f "$path" ]]; then
                head -500 "$path" 2>&1
            else
                echo "Error: File not found: $path"
            fi
            ;;
            
        "write_file")
            local path=$(echo "$args" | jq -r '.path')
            local content=$(echo "$args" | jq -r '.content')
            # Safety: only allow workspace and /tmp
            if [[ "$path" == "$WORKSPACE"* ]] || [[ "$path" == "/tmp"* ]]; then
                mkdir -p "$(dirname "$path")"
                echo "$content" > "$path"
                echo "Successfully wrote to $path"
            else
                echo "Error: Can only write to workspace or /tmp"
            fi
            ;;
            
        "list_directory")
            local path=$(echo "$args" | jq -r '.path')
            ls -la "$path" 2>&1 | head -50
            ;;
            
        "exec_command")
            local cmd=$(echo "$args" | jq -r '.command')
            # Safety: block dangerous commands
            if echo "$cmd" | grep -qiE '(rm -rf|mkfs|dd if=|>\s*/dev|chmod -R 777|:(){ :|fork bomb)'; then
                echo "Error: Command blocked for safety"
            else
                timeout 30 bash -c "$cmd" 2>&1 | head -200
            fi
            ;;
            
        "web_search")
            local query=$(echo "$args" | jq -r '.query')
            # Use a simple web search via curl (DuckDuckGo lite)
            curl -s "https://lite.duckduckgo.com/lite/?q=$(echo "$query" | sed 's/ /+/g')" 2>/dev/null | \
                grep -oP '(?<=<a rel="nofollow" href=")[^"]+' | head -10 | \
                while read url; do echo "- $url"; done
            ;;
            
        "web_fetch")
            local url=$(echo "$args" | jq -r '.url')
            curl -s -L --max-time 15 "$url" 2>/dev/null | \
                pandoc -f html -t plain 2>/dev/null | \
                head -300 || \
                curl -s -L --max-time 15 "$url" 2>/dev/null | \
                sed 's/<[^>]*>//g' | head -300
            ;;
            
        "gmail_search")
            local query=$(echo "$args" | jq -r '.query')
            GOG_KEYRING_PASSWORD="openclaw123" gog gmail search "$query" \
                --account alexliv@gmail.com --max 10 2>/dev/null
            ;;
            
        "gmail_read")
            local msg_id=$(echo "$args" | jq -r '.message_id')
            GOG_KEYRING_PASSWORD="openclaw123" gog gmail get "$msg_id" \
                --account alexliv@gmail.com 2>/dev/null
            ;;
            
        "calendar_list")
            local days=$(echo "$args" | jq -r '.days // 7')
            GOG_KEYRING_PASSWORD="openclaw123" gog calendar list \
                --account alexliv@gmail.com --days "$days" 2>/dev/null
            ;;
            
        "think")
            local thought=$(echo "$args" | jq -r '.thought')
            echo "Thinking: $thought"
            ;;
            
        "final_answer")
            local answer=$(echo "$args" | jq -r '.answer')
            echo "$answer"
            return 100  # Special return code for final answer
            ;;
            
        *)
            echo "Error: Unknown tool: $tool"
            ;;
    esac
}

# Call local LLM
call_llm() {
    local messages="$1"
    
    curl -s "$OLLAMA_URL/api/chat" \
        -d "{
            \"model\": \"$OLLAMA_MODEL\",
            \"messages\": $messages,
            \"stream\": false,
            \"options\": {
                \"temperature\": 0.7,
                \"num_predict\": 2000
            }
        }" | jq -r '.message.content // .error // "Error calling LLM"'
}

# Main agent loop
local_agent() {
    local task="$1"
    local verbose="${2:-false}"
    
    # Initialize conversation
    local system_prompt="You are a helpful AI assistant with access to tools. Complete the user's task using the available tools. Be thorough and efficient.

$TOOL_DEFINITIONS"

    local messages="[
        {\"role\": \"system\", \"content\": $(echo "$system_prompt" | jq -Rs .)},
        {\"role\": \"user\", \"content\": $(echo "$task" | jq -Rs .)}
    ]"
    
    local step=0
    local final_result=""
    
    while [ $step -lt $MAX_STEPS ]; do
        step=$((step + 1))
        
        [[ "$verbose" == "true" ]] && echo "--- Step $step ---" >&2
        
        # Call LLM
        local response=$(call_llm "$messages")
        
        [[ "$verbose" == "true" ]] && echo "LLM: $response" >&2
        
        # Try to extract tool call from response
        local tool_json=$(echo "$response" | grep -oP '```json\s*\K\{[^`]+\}' | head -1)
        
        if [ -z "$tool_json" ]; then
            # Try without code block
            tool_json=$(echo "$response" | grep -oP '\{"tool":\s*"[^"]+",\s*"args":\s*\{[^}]+\}\}' | head -1)
        fi
        
        if [ -n "$tool_json" ]; then
            local tool=$(echo "$tool_json" | jq -r '.tool')
            local args=$(echo "$tool_json" | jq -c '.args')
            
            [[ "$verbose" == "true" ]] && echo "Tool: $tool, Args: $args" >&2
            
            # Execute tool
            local tool_result=$(execute_tool "$tool" "$args")
            local tool_exit=$?
            
            # Check if this was final_answer
            if [ $tool_exit -eq 100 ]; then
                echo "$tool_result"
                return 0
            fi
            
            [[ "$verbose" == "true" ]] && echo "Result: $tool_result" >&2
            
            # Add assistant response and tool result to messages
            messages=$(echo "$messages" | jq ". + [
                {\"role\": \"assistant\", \"content\": $(echo "$response" | jq -Rs .)},
                {\"role\": \"user\", \"content\": $(echo "Tool result for $tool: $tool_result" | jq -Rs .)}
            ]")
        else
            # No tool call found - treat as final answer
            echo "$response"
            return 0
        fi
    done
    
    echo "Error: Max steps ($MAX_STEPS) reached without final answer"
    return 1
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if [ -z "$1" ]; then
        echo "Usage: $0 \"task description\" [verbose]"
        echo "Example: $0 \"List files in the current directory\""
        exit 1
    fi
    
    local_agent "$1" "${2:-false}"
fi
