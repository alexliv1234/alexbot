#!/bin/bash
# Session Health Check & AUTO-FIX Script
# Prevents corrupted/bloated sessions from breaking group/DM functionality
# Run via cron: every 30 minutes
# 
# ENHANCED: Now auto-fixes bloated sessions instead of just logging

set -e

OPENCLAW_DIR="$HOME/.openclaw"
AGENTS_DIR="$OPENCLAW_DIR/agents"
BACKUP_DIR="$OPENCLAW_DIR/backups"
LOG_FILE="$HOME/.openclaw/workspace/memory/session-health.log"
NOTIFY_ALEX=false
ISSUES_FOUND=""
FIXES_APPLIED=""

# Size thresholds
MAX_TRANSCRIPT_SIZE=512000      # 500KB - start warning
CRITICAL_TRANSCRIPT_SIZE=1048576 # 1MB - auto-reset
MAX_TOKENS=60000                 # Auto-reset if tokens exceed this
MAX_CONSECUTIVE_ERRORS=3         # Auto-reset if this many consecutive API errors

mkdir -p "$BACKUP_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Rotate log if > 1MB
if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE" 2>/dev/null || stat -f%z "$LOG_FILE" 2>/dev/null || echo 0) -gt 1048576 ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
fi

log "=== Session Health Check Starting ==="

# Check each agent's sessions
for agent_dir in "$AGENTS_DIR"/*/; do
    agent_name=$(basename "$agent_dir")
    sessions_dir="$agent_dir/sessions"
    sessions_file="$sessions_dir/sessions.json"
    
    if [ ! -f "$sessions_file" ]; then
        log "[$agent_name] No sessions.json found - OK (fresh agent)"
        continue
    fi
    
    # Validate JSON structure
    if ! jq empty "$sessions_file" 2>/dev/null; then
        log "[$agent_name] ⚠️ CORRUPTED sessions.json - Backing up and recreating!"
        cp "$sessions_file" "$BACKUP_DIR/${agent_name}-sessions-$(date +%Y%m%d-%H%M%S).json.corrupted"
        echo '{}' > "$sessions_file"
        FIXES_APPLIED="$FIXES_APPLIED\n- $agent_name: recreated corrupted sessions.json"
        NOTIFY_ALEX=true
        continue
    fi
    
    # Check each session's transcript file
    for transcript in "$sessions_dir"/*.jsonl; do
        [ -f "$transcript" ] || continue
        
        transcript_name=$(basename "$transcript")
        transcript_size=$(stat -c%s "$transcript" 2>/dev/null || stat -f%z "$transcript" 2>/dev/null || echo 0)
        
        if [ "$transcript_size" -gt "$CRITICAL_TRANSCRIPT_SIZE" ]; then
            log "[$agent_name] 🚨 CRITICAL: $transcript_name is $((transcript_size / 1024))KB - AUTO-RESETTING"
            
            # Find the session key for this transcript
            session_key=$(jq -r --arg sf "$transcript_name" 'to_entries[] | select(.value.sessionId + ".jsonl" == $sf or .value.transcriptPath == $sf) | .key' "$sessions_file" 2>/dev/null | head -1)
            
            if [ -n "$session_key" ]; then
                # Backup
                cp "$transcript" "$BACKUP_DIR/${agent_name}-${transcript_name}.$(date +%Y%m%d-%H%M%S)"
                
                # Clear transcript
                echo "" > "$transcript"
                
                # Reset session metadata
                jq --arg k "$session_key" '.[$k] += {"totalTokens": 0, "inputTokens": 0, "outputTokens": 0, "systemSent": false, "compactionCount": 0}' "$sessions_file" > "${sessions_file}.tmp" && mv "${sessions_file}.tmp" "$sessions_file"
                
                log "[$agent_name] ✅ Auto-reset session: $session_key"
                FIXES_APPLIED="$FIXES_APPLIED\n- $agent_name/$session_key: auto-reset ($((transcript_size / 1024))KB)"
                NOTIFY_ALEX=true
            else
                log "[$agent_name] ⚠️ Could not find session key for $transcript_name"
            fi
            
        elif [ "$transcript_size" -gt "$MAX_TRANSCRIPT_SIZE" ]; then
            log "[$agent_name] ⚠️ WARNING: $transcript_name is $((transcript_size / 1024))KB - approaching limit"
            ISSUES_FOUND="$ISSUES_FOUND\n- $agent_name/$transcript_name: $((transcript_size / 1024))KB (warning)"
        fi
    done
    
    # Check token counts in sessions.json
    oversized_by_tokens=$(jq -r --argjson max "$MAX_TOKENS" 'to_entries[] | select((.value.totalTokens // 0) > $max) | "\(.key)|\(.value.totalTokens)"' "$sessions_file" 2>/dev/null)
    
    if [ -n "$oversized_by_tokens" ]; then
        echo "$oversized_by_tokens" | while IFS='|' read -r session_key tokens; do
            [ -z "$session_key" ] && continue
            
            log "[$agent_name] 🚨 Session $session_key has $tokens tokens (>$MAX_TOKENS) - AUTO-RESETTING"
            
            # Get transcript path
            transcript_path=$(jq -r --arg k "$session_key" '.[$k].transcriptPath // .[$k].sessionId + ".jsonl"' "$sessions_file" 2>/dev/null)
            transcript_file="$sessions_dir/$transcript_path"
            
            if [ -f "$transcript_file" ]; then
                # Backup
                cp "$transcript_file" "$BACKUP_DIR/${agent_name}-$(basename $transcript_file).$(date +%Y%m%d-%H%M%S)"
                
                # Clear
                echo "" > "$transcript_file"
            fi
            
            # Reset metadata
            jq --arg k "$session_key" '.[$k] += {"totalTokens": 0, "inputTokens": 0, "outputTokens": 0, "systemSent": false, "compactionCount": 0}' "$sessions_file" > "${sessions_file}.tmp" && mv "${sessions_file}.tmp" "$sessions_file"
            
            FIXES_APPLIED="$FIXES_APPLIED\n- $agent_name/$session_key: auto-reset ($tokens tokens)"
            NOTIFY_ALEX=true
        done
    fi
    
    # Check for repeated API errors in transcripts
    for transcript in "$sessions_dir"/*.jsonl; do
        [ -f "$transcript" ] || continue
        
        transcript_name=$(basename "$transcript")
        
        # Count consecutive errors at the end of the transcript (last 20 lines)
        error_count_raw=$(tail -20 "$transcript" 2>/dev/null | grep -c '"stopReason":"error"' 2>/dev/null) || error_count_raw=0
        consecutive_errors="${error_count_raw:-0}"
        
        if [ "$consecutive_errors" -ge "$MAX_CONSECUTIVE_ERRORS" ]; then
            log "[$agent_name] 🚨 REPEATED ERRORS: $transcript_name has $consecutive_errors consecutive API errors - AUTO-RESETTING"
            
            # Find the session key for this transcript
            session_key=$(jq -r --arg sf "$transcript_name" 'to_entries[] | select(.value.sessionId + ".jsonl" == $sf or .value.transcriptPath == $sf) | .key' "$sessions_file" 2>/dev/null | head -1)
            
            if [ -n "$session_key" ]; then
                # Backup
                cp "$transcript" "$BACKUP_DIR/${agent_name}-${transcript_name}.$(date +%Y%m%d-%H%M%S)"
                
                # Clear transcript
                echo "" > "$transcript"
                
                # Reset session metadata
                jq --arg k "$session_key" '.[$k] += {"totalTokens": 0, "inputTokens": 0, "outputTokens": 0, "systemSent": false, "compactionCount": 0}' "$sessions_file" > "${sessions_file}.tmp" && mv "${sessions_file}.tmp" "$sessions_file"
                
                log "[$agent_name] ✅ Auto-reset erroring session: $session_key"
                FIXES_APPLIED="$FIXES_APPLIED\n- $agent_name/$session_key: auto-reset ($consecutive_errors consecutive API errors)"
                NOTIFY_ALEX=true
            else
                log "[$agent_name] ⚠️ Could not find session key for erroring transcript $transcript_name"
            fi
        fi
    done
    
    # Check for invalid/null sessions
    invalid_sessions=$(jq -r 'to_entries | .[] | select(.value == null or .value == "" or (.value | type) != "object") | .key' "$sessions_file" 2>/dev/null)
    
    if [ -n "$invalid_sessions" ]; then
        for session_key in $invalid_sessions; do
            log "[$agent_name] ⚠️ Invalid session found: $session_key - removing"
            jq --arg k "$session_key" 'del(.[$k])' "$sessions_file" > "${sessions_file}.tmp" && mv "${sessions_file}.tmp" "$sessions_file"
            FIXES_APPLIED="$FIXES_APPLIED\n- $agent_name: removed invalid session $session_key"
            NOTIFY_ALEX=true
        done
    fi
done

log "=== Session Health Check Complete ==="

# Output summary
if [ -n "$FIXES_APPLIED" ]; then
    echo "FIXES_APPLIED:$FIXES_APPLIED"
fi

if [ -n "$ISSUES_FOUND" ]; then
    echo "ISSUES_FOUND:$ISSUES_FOUND"
fi

if [ "$NOTIFY_ALEX" = true ]; then
    echo "NOTIFY_ALEX=true"
fi

# Exit 0 if no critical issues, 1 if fixes were applied
[ -z "$FIXES_APPLIED" ] && exit 0 || exit 1
