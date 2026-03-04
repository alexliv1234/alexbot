#!/bin/bash
# Compliance tracking utility
# Usage: 
#   compliance-track.sh log enforce <context> <reply_id>
#   compliance-track.sh log reply <context> <reply_id> <followed: true|false>
#   compliance-track.sh report [days]

LOG_FILE="$HOME/.openclaw/workspace/memory/compliance-log.jsonl"

log_entry() {
    local action="$1"
    local context="$2"
    local reply_id="$3"
    local followed="${4:-}"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    local entry="{\"timestamp\":\"$timestamp\",\"action\":\"$action\",\"context\":\"$context\",\"replyId\":\"$reply_id\""
    
    if [ -n "$followed" ]; then
        entry="$entry,\"followed\":$followed"
    fi
    
    entry="$entry}"
    
    echo "$entry" >> "$LOG_FILE"
    echo "✅ Logged: $action in $context (reply: $reply_id)"
}

generate_report() {
    local days="${1:-7}"
    local cutoff_date=$(date -u -d "$days days ago" +"%Y-%m-%d")
    
    echo "📊 Compliance Report (Last $days days)"
    echo "========================================="
    echo ""
    
    # Filter entries since cutoff date
    local recent_entries=$(grep -E "^{" "$LOG_FILE" | jq -r "select(.timestamp >= \"$cutoff_date\")")
    
    if [ -z "$recent_entries" ]; then
        echo "⚠️  No entries found in the last $days days"
        return
    fi
    
    # Count by context
    echo "## By Context:"
    echo "$recent_entries" | jq -r '.context' | sort | uniq -c | while read count ctx; do
        echo "  - $ctx: $count actions"
    done
    
    echo ""
    echo "## Enforcement Checks:"
    local enforce_count=$(echo "$recent_entries" | jq -r 'select(.action == "ENFORCE")' | wc -l)
    echo "  - Total: $enforce_count"
    
    echo ""
    echo "## Replies Sent:"
    local reply_count=$(echo "$recent_entries" | jq -r 'select(.action == "REPLY")' | wc -l)
    echo "  - Total: $reply_count"
    
    echo ""
    if [ "$reply_count" -gt 0 ] && [ "$enforce_count" -gt 0 ]; then
        local compliance_rate=$(echo "scale=1; $enforce_count * 100 / $reply_count" | bc)
        echo "## Compliance Rate: ${compliance_rate}%"
        echo "  (ENFORCE / REPLY = $enforce_count / $reply_count)"
    else
        echo "## Compliance Rate: N/A (insufficient data)"
    fi
    
    echo ""
    echo "## Recent Activity:"
    echo "$recent_entries" | jq -r '"\(.timestamp) | \(.action) | \(.context) | \(.replyId)"' | tail -10
}

case "$1" in
    log)
        if [ "$2" == "enforce" ]; then
            log_entry "ENFORCE" "$3" "$4"
        elif [ "$2" == "reply" ]; then
            log_entry "REPLY" "$3" "$4" "$5"
        else
            echo "Usage: $0 log <enforce|reply> <context> <reply_id> [followed]"
            exit 1
        fi
        ;;
    report)
        generate_report "$2"
        ;;
    *)
        echo "Usage:"
        echo "  $0 log enforce <context> <reply_id>"
        echo "  $0 log reply <context> <reply_id> <followed: true|false>"
        echo "  $0 report [days]"
        echo ""
        echo "Contexts: playing_group, investor, teaching, cron"
        exit 1
        ;;
esac
