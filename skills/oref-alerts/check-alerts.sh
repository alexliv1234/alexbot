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
    echo '{"lastAlertId": null, "lastAlertTime": null, "lastContent": null, "lastContentTime": null, "lastRegions": null, "lastTitle": null}' > "$STATE_FILE"
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

# Filter for target regions (only "ראשון לציון - מערב")
matched_regions=()
while IFS= read -r area; do
    # Only match if it contains "ראשון" AND "מערב"
    if [[ "$area" =~ ראשון.*מערב ]] || [[ "$area" =~ מערב.*ראשון ]]; then
        # Always use "ראשון לציון - מערב" regardless of how the area is formatted
        matched_regions+=("ראשון לציון - מערב")
    fi
done < <(echo "$alert_data" | jq -r '.[]')

# If no matching regions, skip
if [[ ${#matched_regions[@]} -eq 0 ]]; then
    exit 0
fi

# Content-based deduplication (2 minute window)
regions_list=$(printf '%s\n' "${matched_regions[@]}" | sort -u | paste -sd, -)
content_hash=$(echo "${regions_list}|${alert_title}" | md5sum | cut -d' ' -f1)
last_content=$(jq -r '.lastContent // ""' "$STATE_FILE")
last_content_time=$(jq -r '.lastContentTime // ""' "$STATE_FILE")
last_regions=$(jq -r '.lastRegions // ""' "$STATE_FILE")
last_title=$(jq -r '.lastTitle // ""' "$STATE_FILE")

if [[ -n "$last_content_time" ]]; then
    # Check if within 2 minute window
    last_epoch=$(date -d "$last_content_time" +%s 2>/dev/null || echo 0)
    now_epoch=$(date +%s)
    diff=$((now_epoch - last_epoch))
    
    if [[ $diff -lt 120 ]]; then
        # Within 2 minute window - check for exact match or subset
        if [[ "$content_hash" == "$last_content" ]]; then
            # Exact same content - skip duplicate
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] DUPLICATE SKIPPED: $alert_id | Title: '$alert_title' | Regions: $regions_list | Reason: exact match within 2 min" >> "$LOG_DIR/alerts.log"
            exit 0
        fi
        
        # NEW: If title is different, DON'T skip even if same region
        # This catches progression: "בדקות הקרובות" → actual alert
        if [[ "$alert_title" != "$last_title" ]]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] PROGRESSION DETECTED: Previous: '$last_title' → Current: '$alert_title' | Regions: $regions_list | NOT SKIPPING" >> "$LOG_DIR/alerts.log"
            # Continue to send this alert (don't exit)
        else
            # Same title - check if current regions are subset of previous regions (partial duplicate)
            all_match=true
            for region in "${matched_regions[@]}"; do
                if [[ ! "$last_regions" =~ "$region" ]]; then
                    all_match=false
                    break
                fi
            done
            
            if [[ "$all_match" == true ]]; then
                # Current alert is subset of previous - skip duplicate
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] DUPLICATE SKIPPED: $alert_id | Title: '$alert_title' | Regions: $regions_list | Reason: subset of previous ($regions_list ⊆ $last_regions)" >> "$LOG_DIR/alerts.log"
                exit 0
            fi
        fi
    fi
fi

# Build alert message
timestamp=$(date '+%d/%m %H:%M')

# Detect message type and build appropriate message
if [[ "$alert_title" =~ "ניתן לצאת" ]] || [[ "$alert_desc" =~ "ניתן לצאת" ]] || [[ "$alert_title" =~ "האירוע הסתיים" ]] || [[ "$alert_desc" =~ "האירוע הסתיים" ]]; then
    # All-clear message - NO shelter time needed
    message="✅ *${alert_title}*
*אזור:* ${regions_list}
🕐 ${timestamp}"
elif [[ "$alert_title" =~ "בדקות הקרובות" ]] || [[ "$alert_desc" =~ "בדקות הקרובות" ]]; then
    # Advance warning - be NEAR the shelter
    message="⚠️ *${alert_title}*
*אזור:* ${regions_list}
🕐 ${timestamp}"
else
    # Actual alert - get to shelter NOW
    message="🚨 *${alert_title}*
*אזור:* ${regions_list}
🕐 ${timestamp}"
fi

# Send to WhatsApp group (text-only, no image per Alex's request 2026-03-03)
if [[ "$GROUP_JID" != "PLACEHOLDER_GROUP_JID" ]]; then
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
   --arg regions "$regions_list" \
   --arg title "$alert_title" \
   '.lastAlertId = $id | .lastAlertTime = $time | .lastContent = $content | .lastContentTime = $content_time | .lastRegions = $regions | .lastTitle = $title' \
   "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Alert processed: $alert_id" >> "$LOG_DIR/alerts.log"
