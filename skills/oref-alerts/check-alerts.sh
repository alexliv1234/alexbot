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
    echo '{"lastAlertId": null, "lastAlertTime": null, "lastContent": null, "lastContentTime": null}' > "$STATE_FILE"
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

# Filter for target regions (any area containing "ראשון")
matched_regions=()
while IFS= read -r area; do
    if [[ "$area" =~ ראשון ]]; then
        matched_regions+=("$area")
    fi
done < <(echo "$alert_data" | jq -r '.[]')

# If no matching regions, skip
if [[ ${#matched_regions[@]} -eq 0 ]]; then
    exit 0
fi

# Content-based deduplication (5 minute window)
regions_list=$(printf '%s\n' "${matched_regions[@]}" | sort -u | paste -sd, -)
content_hash=$(echo "${regions_list}|${alert_title}" | md5sum | cut -d' ' -f1)
last_content=$(jq -r '.lastContent // ""' "$STATE_FILE")
last_content_time=$(jq -r '.lastContentTime // ""' "$STATE_FILE")

if [[ "$content_hash" == "$last_content" ]] && [[ -n "$last_content_time" ]]; then
    # Check if within 5 minute window
    last_epoch=$(date -d "$last_content_time" +%s 2>/dev/null || echo 0)
    now_epoch=$(date +%s)
    diff=$((now_epoch - last_epoch))
    
    if [[ $diff -lt 300 ]]; then
        # Same content within 5 minutes - skip duplicate
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] DUPLICATE CONTENT SKIPPED: $alert_id (same as previous alert within 5 min)" >> "$LOG_DIR/alerts.log"
        exit 0
    fi
fi

# Build alert message
timestamp=$(date '+%d/%m/%Y %H:%M:%S')

# Detect if this is an advance warning or actual alert
if [[ "$alert_title" =~ "בדקות הקרובות" ]] || [[ "$alert_desc" =~ "בדקות הקרובות" ]]; then
    # Advance warning - be NEAR the shelter
    message="🚨 *התרעה מפיקוד העורף*

*אזור:* ${regions_list}
*סוג התרעה:* ${alert_title}

⚠️ *התראה מקדימה - היה ליד מרחב מוגן*

📋 *הכנה:*
• סגרו חלונות ותריסים
• קחו טלפון + מטען
• היו ליד המרחב המוגן (לא בפנים)
• המתינו להתראה ממשית

🔄 *חזרה לשיגרה:*
עד שפיקוד העורף מודיע על חזרה לשיגרה

📱 *מומלץ להתחבר לאפליקציה של פיקוד העורף לעדכונים בזמן אמת*

🕐 ${timestamp}"
else
    # Actual alert - get to shelter NOW
    message="🚨 *התרעה מפיקוד העורף*

*אזור:* ${regions_list}
*סוג התרעה:* ${alert_title}

⏱️ *זמן למיגון: ${SHELTER_TIME} שניות*

📋 *היכנסו עכשיו למרחב מוגן:*
• סגרו חלונות ותריסים
• קחו טלפון + מטען
• היכנסו למרחב מוגן
• השאירו דלת פתוחה קלות

🔄 *חזרה לשיגרה:*
עד שפיקוד העורף מודיע על חזרה לשיגרה

📱 *מומלץ להתחבר לאפליקציה של פיקוד העורף לעדכונים בזמן אמת*

🕐 ${timestamp}"
fi

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
jq --arg id "$alert_id" \
   --arg time "$(date -Iseconds)" \
   --arg content "$content_hash" \
   --arg content_time "$(date -Iseconds)" \
   '.lastAlertId = $id | .lastAlertTime = $time | .lastContent = $content | .lastContentTime = $content_time' \
   "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Alert processed: $alert_id" >> "$LOG_DIR/alerts.log"
