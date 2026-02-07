#!/bin/bash
# sync-openclaw-config.sh - Sync OpenClaw config files to/from git
#
# Syncs:
# - openclaw.json (main config)
# - agents/*/agent/models.json (model definitions)
# - extensions/* (custom plugins)
# - cron/jobs.json (handled by sync-cron-jobs.sh)
#
# Does NOT sync (secrets/device-specific):
# - credentials/, identity/, exec-approvals.json
#
# Usage:
#   ./sync-openclaw-config.sh export   # OpenClaw → Git
#   ./sync-openclaw-config.sh import   # Git → OpenClaw
#   ./sync-openclaw-config.sh status   # Show sync status

set -e

OPENCLAW_DIR="$HOME/.openclaw"
WORKSPACE="$HOME/.openclaw/workspace"
CONFIG_DIR="$WORKSPACE/config"

# Ensure config dir exists
mkdir -p "$CONFIG_DIR"
mkdir -p "$CONFIG_DIR/extensions"
mkdir -p "$CONFIG_DIR/agents"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_ok() { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_err() { echo -e "${RED}❌ $1${NC}"; }

case "${1:-status}" in
    export)
        echo "📤 Exporting OpenClaw config to workspace..."
        echo ""
        
        # 1. Main config (openclaw.json)
        if [[ -f "$OPENCLAW_DIR/openclaw.json" ]]; then
            cp "$OPENCLAW_DIR/openclaw.json" "$CONFIG_DIR/openclaw.json"
            log_ok "openclaw.json exported"
        fi
        
        # 2. Agent model configs
        for agent_dir in "$OPENCLAW_DIR/agents"/*/; do
            agent_name=$(basename "$agent_dir")
            if [[ -f "$agent_dir/agent/models.json" ]]; then
                mkdir -p "$CONFIG_DIR/agents/$agent_name"
                cp "$agent_dir/agent/models.json" "$CONFIG_DIR/agents/$agent_name/models.json"
                log_ok "agents/$agent_name/models.json exported"
            fi
        done
        
        # 3. Extensions (full directories)
        if [[ -d "$OPENCLAW_DIR/extensions" ]]; then
            for ext_dir in "$OPENCLAW_DIR/extensions"/*/; do
                if [[ -d "$ext_dir" ]]; then
                    ext_name=$(basename "$ext_dir")
                    target_dir="$CONFIG_DIR/extensions/$ext_name"
                    rm -rf "$target_dir"
                    mkdir -p "$target_dir"
                    # Copy everything except node_modules (note: no trailing slash = copy into)
                    cp -r "$ext_dir"* "$target_dir/" 2>/dev/null || true
                    log_ok "extensions/$ext_name exported"
                fi
            done
        fi
        
        # 4. Cron jobs (delegate to existing script)
        if [[ -f "$WORKSPACE/scripts/sync-cron-jobs.sh" ]]; then
            "$WORKSPACE/scripts/sync-cron-jobs.sh" export 2>/dev/null || true
        fi
        
        echo ""
        log_ok "Export complete!"
        ;;
        
    import)
        echo "📥 Importing config from workspace to OpenClaw..."
        echo ""
        
        # Backup first
        BACKUP_DIR="$OPENCLAW_DIR/config-backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # 1. Main config
        if [[ -f "$CONFIG_DIR/openclaw.json" ]]; then
            if [[ -f "$OPENCLAW_DIR/openclaw.json" ]]; then
                cp "$OPENCLAW_DIR/openclaw.json" "$BACKUP_DIR/openclaw.json"
            fi
            cp "$CONFIG_DIR/openclaw.json" "$OPENCLAW_DIR/openclaw.json"
            log_ok "openclaw.json imported"
        fi
        
        # 2. Agent model configs
        for agent_config in "$CONFIG_DIR/agents"/*/models.json; do
            if [[ -f "$agent_config" ]]; then
                agent_name=$(basename "$(dirname "$agent_config")")
                target_dir="$OPENCLAW_DIR/agents/$agent_name/agent"
                mkdir -p "$target_dir"
                if [[ -f "$target_dir/models.json" ]]; then
                    cp "$target_dir/models.json" "$BACKUP_DIR/${agent_name}-models.json"
                fi
                cp "$agent_config" "$target_dir/models.json"
                log_ok "agents/$agent_name/models.json imported"
            fi
        done
        
        # 3. Extensions
        if [[ -d "$CONFIG_DIR/extensions" ]]; then
            for ext_dir in "$CONFIG_DIR/extensions"/*/; do
                if [[ -d "$ext_dir" ]]; then
                    ext_name=$(basename "$ext_dir")
                    if [[ -d "$OPENCLAW_DIR/extensions/$ext_name" ]]; then
                        cp -r "$OPENCLAW_DIR/extensions/$ext_name" "$BACKUP_DIR/"
                    fi
                    mkdir -p "$OPENCLAW_DIR/extensions"
                    rsync -a --exclude 'node_modules' "$ext_dir" "$OPENCLAW_DIR/extensions/"
                    log_ok "extensions/$ext_name imported"
                fi
            done
        fi
        
        # 4. Cron jobs
        if [[ -f "$WORKSPACE/scripts/sync-cron-jobs.sh" ]]; then
            "$WORKSPACE/scripts/sync-cron-jobs.sh" import 2>/dev/null || true
        fi
        
        echo ""
        log_ok "Import complete! Backup saved to: $BACKUP_DIR"
        log_warn "Run 'openclaw gateway restart' to apply changes"
        ;;
        
    status)
        echo "📊 OpenClaw Config Sync Status"
        echo "==============================="
        echo ""
        
        # Check each component
        echo "📁 Main Config (openclaw.json):"
        if [[ -f "$OPENCLAW_DIR/openclaw.json" ]] && [[ -f "$CONFIG_DIR/openclaw.json" ]]; then
            if diff -q "$OPENCLAW_DIR/openclaw.json" "$CONFIG_DIR/openclaw.json" > /dev/null 2>&1; then
                log_ok "In sync"
            else
                log_warn "Out of sync (files differ)"
            fi
        elif [[ -f "$OPENCLAW_DIR/openclaw.json" ]]; then
            log_warn "Not exported to git"
        else
            log_err "Missing from OpenClaw"
        fi
        echo ""
        
        echo "🤖 Agent Models:"
        for agent_dir in "$OPENCLAW_DIR/agents"/*/; do
            agent_name=$(basename "$agent_dir")
            oc_file="$agent_dir/agent/models.json"
            ws_file="$CONFIG_DIR/agents/$agent_name/models.json"
            if [[ -f "$oc_file" ]]; then
                if [[ -f "$ws_file" ]]; then
                    if diff -q "$oc_file" "$ws_file" > /dev/null 2>&1; then
                        log_ok "$agent_name: In sync"
                    else
                        log_warn "$agent_name: Out of sync"
                    fi
                else
                    log_warn "$agent_name: Not exported"
                fi
            fi
        done
        echo ""
        
        echo "🔌 Extensions:"
        for ext_dir in "$OPENCLAW_DIR/extensions"/*/; do
            if [[ -d "$ext_dir" ]]; then
                ext_name=$(basename "$ext_dir")
                if [[ -d "$CONFIG_DIR/extensions/$ext_name" ]]; then
                    # Compare plugin.json
                    if diff -q "$ext_dir/openclaw.plugin.json" "$CONFIG_DIR/extensions/$ext_name/openclaw.plugin.json" > /dev/null 2>&1; then
                        log_ok "$ext_name: In sync"
                    else
                        log_warn "$ext_name: Out of sync"
                    fi
                else
                    log_warn "$ext_name: Not exported"
                fi
            fi
        done
        echo ""
        
        echo "⏰ Cron Jobs:"
        if [[ -f "$WORKSPACE/scripts/sync-cron-jobs.sh" ]]; then
            "$WORKSPACE/scripts/sync-cron-jobs.sh" status 2>/dev/null | tail -1
        fi
        ;;
        
    *)
        echo "Usage: $0 {export|import|status}"
        echo ""
        echo "  export  - Copy OpenClaw config to workspace (for git)"
        echo "  import  - Copy workspace config to OpenClaw (after git pull)"
        echo "  status  - Show sync status"
        exit 1
        ;;
esac
