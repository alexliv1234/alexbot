#!/bin/bash
# sync-cron-jobs.sh - Bidirectional sync between OpenClaw cron and git
#
# Usage:
#   ./sync-cron-jobs.sh export   # OpenClaw → Git (before commit)
#   ./sync-cron-jobs.sh import   # Git → OpenClaw (after pull/checkout)
#   ./sync-cron-jobs.sh status   # Show sync status

set -e

OPENCLAW_CRON="$HOME/.openclaw/cron/jobs.json"
WORKSPACE_CRON="$HOME/.openclaw/workspace/config/cron-jobs.json"

# Ensure config dir exists
mkdir -p "$(dirname "$WORKSPACE_CRON")"

# Function to normalize JSON for comparison (remove volatile fields)
normalize_for_compare() {
    jq '.jobs | sort_by(.id) | [.[] | del(.state)]' "$1" 2>/dev/null || echo "[]"
}

case "${1:-status}" in
    export)
        # Export from OpenClaw to workspace
        if [[ -f "$OPENCLAW_CRON" ]]; then
            # Pretty-print and save (exclude runtime state, keep structure)
            jq '{version: .version, jobs: [.jobs[] | del(.state)]}' "$OPENCLAW_CRON" > "$WORKSPACE_CRON"
            echo "✅ Exported $(jq '.jobs | length' "$WORKSPACE_CRON") cron jobs to workspace"
        else
            echo "⚠️ No OpenClaw cron jobs found"
        fi
        ;;
        
    import)
        # Import from workspace to OpenClaw
        if [[ -f "$WORKSPACE_CRON" ]]; then
            # Backup current state
            if [[ -f "$OPENCLAW_CRON" ]]; then
                cp "$OPENCLAW_CRON" "$OPENCLAW_CRON.backup"
            fi
            
            # Import (preserve existing state fields if job exists)
            if [[ -f "$OPENCLAW_CRON" ]]; then
                # Merge: take definitions from workspace, state from current
                jq -s '
                    (.[1].jobs | INDEX(.id)) as $current |
                    {
                        version: .[0].version,
                        jobs: [.[0].jobs[] | . + (if $current[.id] then {state: $current[.id].state} else {} end)]
                    }
                ' "$WORKSPACE_CRON" "$OPENCLAW_CRON" > "$OPENCLAW_CRON.new"
                mv "$OPENCLAW_CRON.new" "$OPENCLAW_CRON"
            else
                cp "$WORKSPACE_CRON" "$OPENCLAW_CRON"
            fi
            
            echo "✅ Imported $(jq '.jobs | length' "$WORKSPACE_CRON") cron jobs from workspace"
            echo "⚠️ Run 'openclaw gateway restart' to apply changes"
        else
            echo "❌ No workspace cron jobs found at $WORKSPACE_CRON"
            exit 1
        fi
        ;;
        
    status)
        echo "📊 Cron Sync Status"
        echo "==================="
        
        if [[ -f "$OPENCLAW_CRON" ]]; then
            OC_COUNT=$(jq '.jobs | length' "$OPENCLAW_CRON")
            echo "OpenClaw: $OC_COUNT jobs"
        else
            echo "OpenClaw: (not found)"
            OC_COUNT=0
        fi
        
        if [[ -f "$WORKSPACE_CRON" ]]; then
            WS_COUNT=$(jq '.jobs | length' "$WORKSPACE_CRON")
            echo "Workspace: $WS_COUNT jobs"
        else
            echo "Workspace: (not found)"
            WS_COUNT=0
        fi
        
        # Compare (ignoring state)
        if [[ -f "$OPENCLAW_CRON" ]] && [[ -f "$WORKSPACE_CRON" ]]; then
            OC_NORM=$(normalize_for_compare "$OPENCLAW_CRON")
            WS_NORM=$(normalize_for_compare "$WORKSPACE_CRON")
            
            if [[ "$OC_NORM" == "$WS_NORM" ]]; then
                echo "Status: ✅ In sync"
            else
                echo "Status: ⚠️ Out of sync"
                echo ""
                echo "Differences (OpenClaw vs Workspace):"
                diff <(echo "$OC_NORM" | jq -S .) <(echo "$WS_NORM" | jq -S .) || true
            fi
        fi
        ;;
        
    *)
        echo "Usage: $0 {export|import|status}"
        exit 1
        ;;
esac
