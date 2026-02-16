#!/bin/bash
# Auto-start OpenClaw gateway if it's not running
# Designed for WSL2 where user services may not auto-start after reboot

set -euo pipefail

LOG_FILE="/home/alexliv/.openclaw/workspace/logs/gateway-monitor.log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# Check if gateway is running
if systemctl --user is-active --quiet openclaw-gateway; then
    log "Gateway is running - no action needed"
    exit 0
fi

log "⚠️ Gateway is NOT running - attempting to start"

# Try to start the gateway
if systemctl --user start openclaw-gateway; then
    log "✅ Gateway started successfully"
    
    # Wait a few seconds and verify it's actually running
    sleep 5
    if systemctl --user is-active --quiet openclaw-gateway; then
        log "✅ Gateway confirmed running after 5s"
        
        # Send notification to Alex via WhatsApp (requires gateway to be running)
        # Wait a bit longer for full initialization
        sleep 10
        
        # Try to notify (this might fail if gateway isn't fully ready)
        if command -v openclaw &> /dev/null; then
            openclaw message send --to +972544419002 --channel whatsapp \
                "🔄 Gateway was down and has been auto-restarted at $(date +'%H:%M'). Cron jobs should now resume." \
                2>&1 | tee -a "$LOG_FILE" || log "⚠️ Failed to send notification (gateway might not be fully ready)"
        fi
    else
        log "❌ Gateway failed to stay running"
        exit 1
    fi
else
    log "❌ Failed to start gateway"
    exit 1
fi
