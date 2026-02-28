#!/bin/bash
# Oref Alert Checker - Single check execution
# Called repeatedly by daemon.sh

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$SKILL_DIR/config.json"
STATE_FILE="$SKILL_DIR/state/last-alert.json"
LOG_DIR="$SKILL_DIR/logs"

# Read config
API_URL=$(jq -r '.apiUrl' "$CONFIG")
REGIONS=$(jq -r '.regions[]' "$CONFIG")
GROUP_JID=$(jq -r '.groupJid' "$CONFIG")
SHELTER_TIME=$(jq -r '.shelterTime' "$CONFIG")
ALERT_OWNER=$(jq -r '.alertOwner' "$CONFIG")

# Initialize state file if missing
if [[ ! -f "$STATE_FILE" ]]; then
    echo '{"lastAlertId": null, "lastAlertTime": null}' > "$STATE_FILE"
fi

# Fetch alerts
response=$(curl -s -H "Referer: https://www.oref.org.il/" \
                  -H "X-Requested-With: XMLHttpRequest" \
                  "$API_URL" || echo "")

# Check if response is empty (no alerts)
if [[ -z "$response" ]] || [[ "$response" == "null" ]] || [[ "$response" == "" ]]; then
    # No alerts - this is normal
    exit 0
fi

# Parse JSON response
alert_id=$(echo "$response" | jq -r '.id // empty')
alert_title=$(echo "$response" | jq -r '.title // "התרעה"')
alert_data=$(echo "$response" | jq -r '.data // []')
alert_desc=$(echo "$response" | jq -r '.desc // ""')

# Check if we have data
if [[ -z "$alert_id" ]] || [[ "$alert_id" == "null" ]]; then
    # No valid alert
    exit 0
fi

# Check if this alert was already sent
last_alert_id=$(jq -r '.lastAlertId // ""' "$STATE_FILE")
if [[ "$alert_id" == "$last_alert_id" ]]; then
    # Already sent this alert
    exit 0
fi

# Filter for target regions
matched_regions=()
while IFS= read -r region; do
    for target_region in $REGIONS; do
        if echo "$alert_data" | jq -e --arg r "$target_region" 'index($r)' > /dev/null 2>&1; then
            matched_regions+=("$target_region")
        fi
    done
done < <(echo "$alert_data" | jq -r '.[]')

# If no matching regions, skip
if [[ ${#matched_regions[@]} -eq 0 ]]; then
    exit 0
fi

# Build alert message
timestamp=$(date '+%d/%m/%Y %H:%M:%S')
regions_list=$(printf '%s\n' "${matched_regions[@]}" | sort -u | paste -sd, -)

message="🚨 *התרעה מפיקוד העורף*

*אזור:* ${regions_list}
*סוג התרעה:* ${alert_title}

⏱️ *זמן למיגון: ${SHELTER_TIME} שניות*

${alert_desc}

🕐 ${timestamp}"

# Send to WhatsApp group
if [[ "$GROUP_JID" != "PLACEHOLDER_GROUP_JID" ]]; then
    # Use wacli to send message
    ~/go/bin/wacli send text \
        --to "$GROUP_JID" \
        --message "$message" \
        >> "$LOG_DIR/alerts.log" 2>&1
    
    if [[ $? -eq 0 ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ALERT SENT: $alert_id to $GROUP_JID for regions: $regions_list" >> "$LOG_DIR/alerts.log"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ALERT SEND FAILED: $alert_id to $GROUP_JID" >> "$LOG_DIR/alerts.log"
        exit 1
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ALERT DETECTED (not sent - group JID not configured): $alert_id for regions: $regions_list" >> "$LOG_DIR/alerts.log"
fi

# Update state
jq --arg id "$alert_id" --arg time "$(date -Iseconds)" \
   '.lastAlertId = $id | .lastAlertTime = $time' \
   "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Alert processed: $alert_id" >> "$LOG_DIR/alerts.log"
