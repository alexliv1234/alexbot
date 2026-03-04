#!/bin/bash
# audit-message-routing.sh - Generate routing audit report
# Analyzes routing-log.jsonl for patterns, errors, and insights
#
# Usage:
#   bash scripts/audit-message-routing.sh [--days 7]

set -euo pipefail

WORKSPACE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$WORKSPACE/memory/routing-log.jsonl"
DAYS=${1:-7}

if [[ ! -f "$LOG_FILE" ]]; then
    echo "📊 No routing log found yet"
    exit 0
fi

echo "📊 Message Routing Audit Report"
echo "================================"
echo ""
echo "Period: Last $DAYS days"
echo "Log: $LOG_FILE"
echo ""

# Calculate date threshold
THRESHOLD=$(date -d "$DAYS days ago" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v-${DAYS}d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "")

# Count total messages
TOTAL=$(cat "$LOG_FILE" | wc -l)
echo "Total Routing Decisions: $TOTAL"
echo ""

# Count by method
echo "📈 By Method:"
echo "-------------"
cat "$LOG_FILE" | jq -r '.method' | sort | uniq -c | sort -rn | while read count method; do
    pct=$(awk "BEGIN {printf \"%.1f\", ($count/$TOTAL)*100}")
    echo "  $method: $count ($pct%)"
done
echo ""

# Count by agent
echo "🤖 By Agent:"
echo "------------"
cat "$LOG_FILE" | jq -r '.agent' | sort | uniq -c | sort -rn | while read count agent; do
    pct=$(awk "BEGIN {printf \"%.1f\", ($count/$TOTAL)*100}")
    echo "  $agent: $count ($pct%)"
done
echo ""

# Count by recipient
echo "👤 Top Recipients:"
echo "------------------"
cat "$LOG_FILE" | jq -r '.recipient' | sort | uniq -c | sort -rn | head -10 | while read count recipient; do
    pct=$(awk "BEGIN {printf \"%.1f\", ($count/$TOTAL)*100}")
    # Truncate long group IDs
    if [[ "$recipient" =~ @g\.us$ ]]; then
        recipient="Group: ${recipient:0:20}..."
    fi
    echo "  $recipient: $count ($pct%)"
done
echo ""

# Count blocks
BLOCKS=$(cat "$LOG_FILE" | jq -r 'select(.method == "BLOCK")' | wc -l)
if [[ $BLOCKS -gt 0 ]]; then
    echo "🚨 Security Blocks: $BLOCKS"
    echo "-------------------"
    cat "$LOG_FILE" | jq -r 'select(.method == "BLOCK") | "\(.timestamp) - \(.agent) tried to message \(.recipient): \(.target)"' | tail -10
    echo ""
fi

# Count invalid routing
INVALID=$(cat "$LOG_FILE" | jq -r 'select(.decision | startswith("INVALID"))' | wc -l)
if [[ $INVALID -gt 0 ]]; then
    echo "❌ Invalid Routing Attempts: $INVALID"
    echo "-----------------------------"
    cat "$LOG_FILE" | jq -r 'select(.decision | startswith("INVALID")) | "\(.timestamp) - \(.agent) in \(.session) to \(.recipient): \(.decision)"' | tail -10
    echo ""
fi

# Success rate
VALID=$(cat "$LOG_FILE" | jq -r 'select(.decision | startswith("VALID") or (.method != "BLOCK" and (.decision | startswith("INVALID") | not)))' | wc -l)
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($VALID/$TOTAL)*100}")

echo "✅ Success Rate: $VALID/$TOTAL ($SUCCESS_RATE%)"
echo ""

# Recent activity (last 24 hours)
echo "📅 Recent Activity (Last 24h):"
echo "-------------------------------"
RECENT_THRESHOLD=$(date -d "24 hours ago" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v-24H +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "")
if [[ -n "$RECENT_THRESHOLD" ]]; then
    RECENT=$(cat "$LOG_FILE" | jq -r "select(.timestamp >= \"$RECENT_THRESHOLD\") | \"\(.timestamp | sub(\"T.*\"; \"\")) \(.method) to \(.recipient)\"" | tail -20)
    if [[ -n "$RECENT" ]]; then
        echo "$RECENT"
    else
        echo "  No recent activity"
    fi
else
    cat "$LOG_FILE" | jq -r '"\(.timestamp | sub("T.*"; "")) \(.method) to \(.recipient)"' | tail -20
fi
echo ""

# Recommendations
echo "💡 Recommendations:"
echo "-------------------"
if [[ $BLOCKS -gt 5 ]]; then
    echo "  ⚠️  High number of security blocks ($BLOCKS) - review agent permissions"
fi
if [[ $INVALID -gt 10 ]]; then
    echo "  ⚠️  Many invalid routing attempts ($INVALID) - agents need better training"
fi
if (( $(echo "$SUCCESS_RATE < 90.0" | bc -l) )); then
    echo "  ⚠️  Success rate below 90% - investigate routing logic"
fi
if [[ $BLOCKS -eq 0 ]] && [[ $INVALID -eq 0 ]] && (( $(echo "$SUCCESS_RATE >= 95.0" | bc -l) )); then
    echo "  ✅ Excellent routing performance - no issues detected"
fi
echo ""

echo "📁 Full log: $LOG_FILE"
