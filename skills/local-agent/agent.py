#!/usr/bin/env python3
"""
Local Agent - Full autonomous agent powered by local LLM (qwen2.5:32b)
Usage: python agent.py "task description"
"""

import json
import subprocess
import sys
import re
import os
from urllib.request import urlopen, Request
from urllib.parse import quote_plus

# Configuration
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://10.100.102.8:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:32b-instruct-q4_K_M")
MAX_STEPS = int(os.environ.get("MAX_STEPS", "15"))
WORKSPACE = "/home/alexliv/.openclaw/workspace"
VERBOSE = os.environ.get("VERBOSE", "").lower() == "true"

TOOL_DEFINITIONS = """You have access to these tools. To use a tool, respond with a JSON block:

```json
{"tool": "tool_name", "args": {"arg1": "value1"}}
```

Available tools:

1. **read_file** - Read contents of a file
   Args: {"path": "/path/to/file"}

2. **write_file** - Write content to a file (workspace and /tmp only)
   Args: {"path": "/path/to/file", "content": "file contents"}

3. **append_file** - Append content to a file
   Args: {"path": "/path/to/file", "content": "content to append"}

4. **list_directory** - List files in a directory
   Args: {"path": "/path/to/dir"}

5. **exec_command** - Execute a shell command (safe commands only)
   Args: {"command": "ls -la"}

6. **web_search** - Search the web via Brave
   Args: {"query": "search terms", "count": 5}

7. **web_fetch** - Fetch and extract content from a URL
   Args: {"url": "https://example.com", "max_chars": 5000}

8. **gmail_search** - Search Gmail
   Args: {"query": "from:someone subject:something", "max": 10}

9. **gmail_read** - Read a specific email thread
   Args: {"thread_id": "abc123"}

10. **calendar_list** - List upcoming calendar events
    Args: {"days": 7}

11. **calendar_create** - Create a calendar event
    Args: {"title": "Meeting", "date": "2026-02-05", "time": "14:00", "duration": 60}

12. **think** - Think through a problem step by step (no external action)
    Args: {"thought": "Let me consider..."}

13. **python_eval** - Evaluate Python code for calculations/data processing
    Args: {"code": "print(2+2)"}

When you have completed the task, respond with:
```json
{"tool": "final_answer", "args": {"answer": "Your complete answer here"}}
```

Important:
- Use tools to gather information before answering
- You can use multiple tools in sequence
- Always end with final_answer when done
- Be thorough but efficient
- If a tool fails, try an alternative approach"""


def log(msg):
    if VERBOSE:
        print(f"[AGENT] {msg}", file=sys.stderr)


def call_llm(messages):
    """Call the local LLM via Ollama API"""
    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 2000
        }
    }
    
    req = Request(
        f"{OLLAMA_URL}/api/chat",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
            return result.get("message", {}).get("content", "Error: No response")
    except Exception as e:
        return f"Error calling LLM: {e}"


def extract_tool_call(response):
    """Extract tool call JSON from LLM response"""
    # Try to find JSON in code block
    match = re.search(r'```json\s*(\{.+?\})\s*```', response, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except:
            pass
    
    # Try to find raw JSON
    match = re.search(r'\{"tool":\s*"[^"]+",\s*"args":\s*\{[^}]+\}\}', response)
    if match:
        try:
            return json.loads(match.group(0))
        except:
            pass
    
    # Try to find any JSON object with tool field
    for match in re.finditer(r'\{[^{}]*"tool"[^{}]*\}', response):
        try:
            obj = json.loads(match.group(0))
            if "tool" in obj:
                return obj
        except:
            pass
    
    return None


def execute_tool(tool, args):
    """Execute a tool and return the result"""
    log(f"Executing tool: {tool} with args: {args}")
    
    try:
        if tool == "read_file":
            path = args.get("path", "")
            if os.path.isfile(path):
                with open(path, 'r') as f:
                    content = f.read()
                    return content[:10000] if len(content) > 10000 else content
            return f"Error: File not found: {path}"
        
        elif tool == "write_file":
            path = args.get("path", "")
            content = args.get("content", "")
            if path.startswith(WORKSPACE) or path.startswith("/tmp"):
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, 'w') as f:
                    f.write(content)
                return f"Successfully wrote {len(content)} bytes to {path}"
            return "Error: Can only write to workspace or /tmp"
        
        elif tool == "append_file":
            path = args.get("path", "")
            content = args.get("content", "")
            if path.startswith(WORKSPACE) or path.startswith("/tmp"):
                with open(path, 'a') as f:
                    f.write(content)
                return f"Successfully appended to {path}"
            return "Error: Can only write to workspace or /tmp"
        
        elif tool == "list_directory":
            path = args.get("path", ".")
            try:
                entries = os.listdir(path)
                result = []
                for e in entries[:50]:
                    full = os.path.join(path, e)
                    if os.path.isdir(full):
                        result.append(f"[DIR]  {e}/")
                    else:
                        size = os.path.getsize(full)
                        result.append(f"[FILE] {e} ({size} bytes)")
                return "\n".join(result)
            except Exception as e:
                return f"Error: {e}"
        
        elif tool == "exec_command":
            cmd = args.get("command", "")
            # Safety check
            dangerous = ['rm -rf', 'mkfs', 'dd if=', '> /dev', 'chmod -R 777', ':(){']
            if any(d in cmd.lower() for d in dangerous):
                return "Error: Command blocked for safety"
            
            try:
                result = subprocess.run(
                    cmd, shell=True, capture_output=True, text=True, timeout=30
                )
                output = result.stdout + result.stderr
                return output[:5000] if len(output) > 5000 else output
            except subprocess.TimeoutExpired:
                return "Error: Command timed out"
            except Exception as e:
                return f"Error: {e}"
        
        elif tool == "web_search":
            query = args.get("query", "")
            count = args.get("count", 5)
            # Use a simple search
            try:
                url = f"https://lite.duckduckgo.com/lite/?q={quote_plus(query)}"
                req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urlopen(req, timeout=10) as resp:
                    html = resp.read().decode('utf-8', errors='ignore')
                    # Extract links
                    links = re.findall(r'href="(https?://[^"]+)"', html)
                    unique_links = list(dict.fromkeys(links))[:count]
                    return "\n".join(f"- {l}" for l in unique_links) or "No results found"
            except Exception as e:
                return f"Search error: {e}"
        
        elif tool == "web_fetch":
            url = args.get("url", "")
            max_chars = args.get("max_chars", 5000)
            try:
                req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urlopen(req, timeout=15) as resp:
                    html = resp.read().decode('utf-8', errors='ignore')
                    # Simple HTML to text
                    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
                    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
                    text = re.sub(r'<[^>]+>', ' ', text)
                    text = re.sub(r'\s+', ' ', text).strip()
                    return text[:max_chars]
            except Exception as e:
                return f"Fetch error: {e}"
        
        elif tool == "gmail_search":
            query = args.get("query", "")
            max_results = args.get("max", 10)
            result = subprocess.run(
                f'GOG_KEYRING_PASSWORD="openclaw123" gog gmail search "{query}" --account alexliv@gmail.com --max {max_results}',
                shell=True, capture_output=True, text=True, timeout=30
            )
            return result.stdout or result.stderr or "No results"
        
        elif tool == "gmail_read":
            thread_id = args.get("thread_id", "")
            result = subprocess.run(
                f'GOG_KEYRING_PASSWORD="openclaw123" gog gmail thread get {thread_id} --account alexliv@gmail.com',
                shell=True, capture_output=True, text=True, timeout=30
            )
            return result.stdout or result.stderr or "Could not read email"
        
        elif tool == "calendar_list":
            days = args.get("days", 7)
            result = subprocess.run(
                f'GOG_KEYRING_PASSWORD="openclaw123" gog calendar list --account alexliv@gmail.com --days {days}',
                shell=True, capture_output=True, text=True, timeout=30
            )
            return result.stdout or result.stderr or "No events"
        
        elif tool == "calendar_create":
            title = args.get("title", "Event")
            date = args.get("date", "")
            time = args.get("time", "09:00")
            duration = args.get("duration", 60)
            result = subprocess.run(
                f'GOG_KEYRING_PASSWORD="openclaw123" gog calendar create --account alexliv@gmail.com --title "{title}" --date {date} --time {time} --duration {duration}',
                shell=True, capture_output=True, text=True, timeout=30
            )
            return result.stdout or result.stderr or "Event created"
        
        elif tool == "think":
            thought = args.get("thought", "")
            return f"Thought recorded: {thought}"
        
        elif tool == "python_eval":
            code = args.get("code", "")
            # Safety: no imports of dangerous modules
            if any(m in code for m in ['os.system', 'subprocess', 'eval(', 'exec(', '__import__']):
                return "Error: Code contains blocked operations"
            try:
                # Run in isolated subprocess
                result = subprocess.run(
                    ['python3', '-c', code],
                    capture_output=True, text=True, timeout=10
                )
                return result.stdout or result.stderr or "No output"
            except Exception as e:
                return f"Error: {e}"
        
        elif tool == "final_answer":
            return {"final": True, "answer": args.get("answer", "")}
        
        else:
            return f"Error: Unknown tool: {tool}"
    
    except Exception as e:
        return f"Error executing {tool}: {e}"


def run_agent(task):
    """Main agent loop"""
    system_prompt = f"""You are a helpful AI assistant with access to tools. Complete the user's task using the available tools. Be thorough and efficient.

{TOOL_DEFINITIONS}"""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": task}
    ]
    
    for step in range(MAX_STEPS):
        log(f"Step {step + 1}/{MAX_STEPS}")
        
        # Call LLM
        response = call_llm(messages)
        log(f"LLM response: {response[:200]}...")
        
        # Extract tool call
        tool_call = extract_tool_call(response)
        
        if tool_call:
            tool = tool_call.get("tool", "")
            args = tool_call.get("args", {})
            
            log(f"Tool call: {tool}")
            
            # Execute tool
            result = execute_tool(tool, args)
            
            # Check for final answer
            if isinstance(result, dict) and result.get("final"):
                return result["answer"]
            
            # Add to conversation
            messages.append({"role": "assistant", "content": response})
            messages.append({"role": "user", "content": f"Tool result for {tool}:\n{result}"})
        
        else:
            # No tool call - treat response as final answer
            return response
    
    return "Error: Max steps reached without final answer"


def main():
    if len(sys.argv) < 2:
        print("Usage: python agent.py 'task description'")
        print("       VERBOSE=true python agent.py 'task'  # for debug output")
        sys.exit(1)
    
    task = sys.argv[1]
    result = run_agent(task)
    print(result)


if __name__ == "__main__":
    main()
