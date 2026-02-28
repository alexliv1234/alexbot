#!/bin/bash
# Oref Alert Daemon - Runs continuously and checks every N seconds

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$SKILL_DIR/config.json"
CHECK_SCRIPT="$SKILL_DIR/check-alerts.sh"
LOG_DIR="$SKILL_DIR/logs"
PID_FILE="$SKILL_DIR/daemon.pid"

# Read config
CHECK_INTERVAL=$(jq -r '.checkIntervalSeconds' "$CONFIG")
LOG_CHECK_INTERVAL=$(jq -r '.logCheckIntervalSeconds' "$CONFIG")
ALERT_OWNER=$(jq -r '.alertOwner' "$CONFIG")

# Create logs directory
mkdir -p "$LOG_DIR"

# Write PID
echo $$ > "$PID_FILE"

# Counters
check_count=0
last_log_time=$(date +%s)
api_failure_count=0
MAX_API_FAILURES=3

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Oref Alert Daemon started (PID: $$)" >> "$LOG_DIR/daemon.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Check interval: ${CHECK_INTERVAL}s | Log interval: ${LOG_CHECK_INTERVAL}s" >> "$LOG_DIR/daemon.log"

# Cleanup on exit
cleanup() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Daemon stopping..." >> "$LOG_DIR/daemon.log"
    rm -f "$PID_FILE"
    exit 0
}
trap cleanup SIGTERM SIGINT

# Main loop
while true; do
    current_time=$(date +%s)
    check_count=$((check_count + 1))
    
    # Run alert check
    if bash "$CHECK_SCRIPT" >> "$LOG_DIR/daemon.log" 2>&1; then
        # Success - reset failure counter
        api_failure_count=0
    else
        # Failure
        api_failure_count=$((api_failure_count + 1))
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Alert check failed (attempt $api_failure_count/$MAX_API_FAILURES)" >> "$LOG_DIR/daemon.log"
        
        # Alert owner if too many failures
        if [[ $api_failure_count -ge $MAX_API_FAILURES ]]; then
            alert_msg="⚠️ *Oref Alert System*

API לא עונה $api_failure_count פעמים ברצף.
בדוק את הלוגים: \`$LOG_DIR/daemon.log\`

זמן: $(date '+%d/%m/%Y %H:%M:%S')"
            
            ~/go/bin/wacli send text \
                --to "$ALERT_OWNER" \
                --message "$alert_msg" \
                >> "$LOG_DIR/daemon.log" 2>&1 || true
            
            # Reset counter after alerting
            api_failure_count=0
        fi
    fi
    
    # Log check status every LOG_CHECK_INTERVAL seconds
    time_since_log=$((current_time - last_log_time))
    if [[ $time_since_log -ge $LOG_CHECK_INTERVAL ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Status check: $check_count checks completed, API healthy" >> "$LOG_DIR/daemon.log"
        last_log_time=$current_time
    fi
    
    # Sleep before next check
    sleep "$CHECK_INTERVAL"
done
