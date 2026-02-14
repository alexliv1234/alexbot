#!/bin/bash
# Archive session files older than 7 days

set -euo pipefail

DAYS_OLD=2
SESSIONS_BASE="/home/alexliv/.openclaw/agents"
DRY_RUN=${1:-}

echo "=== Session Archive Script ==="
echo "Archiving files older than $DAYS_OLD days..."
echo ""

# Function to archive files for a specific agent
archive_agent() {
    local agent=$1
    local agent_dir="$SESSIONS_BASE/$agent/sessions"
    
    if [[ ! -d "$agent_dir" ]]; then
        echo "[$agent] Directory not found, skipping"
        return
    fi
    
    echo "[$agent] Processing..."
    
    # Find files older than specified days
    local count=0
    while IFS= read -r -d '' file; do
        # Get file modification date in YYYY-MM format
        local file_date=$(stat -c %y "$file" | cut -d' ' -f1 | cut -d- -f1,2)
        
        # Create archive directory for this month
        local archive_dir="$agent_dir/archive/$file_date"
        
        if [[ "$DRY_RUN" == "--dry-run" ]]; then
            echo "  [DRY RUN] Would move: $(basename "$file") → archive/$file_date/"
        else
            mkdir -p "$archive_dir"
            mv "$file" "$archive_dir/"
        fi
        
        count=$((count + 1))
    done < <(find "$agent_dir" -maxdepth 1 -type f -name "*.jsonl" -mtime +$DAYS_OLD -print0 2>/dev/null || true)
    
    echo "[$agent] Archived $count files"
}

# Archive for each agent
for agent in main fast bot-handler learning; do
    archive_agent "$agent"
done

echo ""
echo "=== Archive Complete ==="

# Show summary
if [[ "$DRY_RUN" != "--dry-run" ]]; then
    echo ""
    echo "Summary:"
    for agent in main fast bot-handler learning; do
        archive_dir="$SESSIONS_BASE/$agent/sessions/archive"
        if [[ -d "$archive_dir" ]]; then
            file_count=$(find "$archive_dir" -type f -name "*.jsonl" 2>/dev/null | wc -l)
            echo "  [$agent] $file_count files in archive"
        fi
    done
fi
