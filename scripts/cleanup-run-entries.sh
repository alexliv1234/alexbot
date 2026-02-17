#!/bin/bash
# cleanup-run-entries.sh - Purge old :run: entries from sessions.json
# Also cleans orphaned .jsonl files
# Safe to run multiple times (idempotent)

set -e

SESSIONS_DIR="$HOME/.openclaw/agents/main/sessions"
SESSIONS_FILE="$SESSIONS_DIR/sessions.json"
ARCHIVE_DIR="$SESSIONS_DIR/archive/orphaned"
KEEP_PER_JOB=3

if [ ! -f "$SESSIONS_FILE" ]; then
    echo "ERROR: $SESSIONS_FILE not found"
    exit 1
fi

echo "=== sessions.json Cleanup Script ==="
echo ""

# --- Step 1: Backup ---
BACKUP="$SESSIONS_FILE.bak-$(date +%Y%m%d-%H%M%S)"
cp "$SESSIONS_FILE" "$BACKUP"
echo "Backup created: $BACKUP"

# --- Before stats ---
BEFORE_SIZE=$(stat -c%s "$SESSIONS_FILE" 2>/dev/null || stat -f%z "$SESSIONS_FILE")
BEFORE_COUNT=$(jq 'to_entries | length' "$SESSIONS_FILE")
RUN_COUNT=$(jq '[to_entries[] | select(.key | contains(":run:"))] | length' "$SESSIONS_FILE")
echo ""
echo "BEFORE:"
echo "   File size:    $(numfmt --to=iec $BEFORE_SIZE 2>/dev/null || echo "${BEFORE_SIZE} bytes")"
echo "   Total entries: $BEFORE_COUNT"
echo "   :run: entries: $RUN_COUNT"
echo ""

# --- Step 2: Prune :run: entries, keep 3 most recent per parent job ---
echo "Pruning :run: entries (keeping $KEEP_PER_JOB most recent per job)..."

jq --argjson keep "$KEEP_PER_JOB" '
  to_entries
  | group_by(
      if (.key | contains(":run:")) then
        (.key | split(":run:")[0])
      else
        ("__non_run__" + .key)
      end
    )
  | map(
      if (.[0].key | contains(":run:")) then
        sort_by(-(.value.updatedAt // .value.createdAt // 0))
        | .[:$keep]
      else
        .
      end
    )
  | flatten
  | from_entries
' "$SESSIONS_FILE" > "${SESSIONS_FILE}.tmp"

mv "${SESSIONS_FILE}.tmp" "$SESSIONS_FILE"

# --- After stats ---
AFTER_SIZE=$(stat -c%s "$SESSIONS_FILE" 2>/dev/null || stat -f%z "$SESSIONS_FILE")
AFTER_COUNT=$(jq 'to_entries | length' "$SESSIONS_FILE")
AFTER_RUN_COUNT=$(jq '[to_entries[] | select(.key | contains(":run:"))] | length' "$SESSIONS_FILE")
PRUNED=$((BEFORE_COUNT - AFTER_COUNT))

echo ""
echo "AFTER:"
echo "   File size:    $(numfmt --to=iec $AFTER_SIZE 2>/dev/null || echo "${AFTER_SIZE} bytes")"
echo "   Total entries: $AFTER_COUNT"
echo "   :run: entries: $AFTER_RUN_COUNT"
echo "   Pruned:        $PRUNED entries removed"
echo ""

# --- Step 3: Clean orphaned .jsonl files ---
echo "Checking for orphaned .jsonl files..."

mkdir -p "$ARCHIVE_DIR"

# Get all referenced session files from sessions.json
REFERENCED_FILES=$(jq -r '
  to_entries[] |
  .value |
  [.sessionFile, .transcriptPath, ((.sessionId // empty) + ".jsonl")] |
  map(select(. != null and . != "null" and . != "")) |
  .[]
' "$SESSIONS_FILE" 2>/dev/null | sort -u)

ARCHIVED=0

# Check each .jsonl file
for jsonl_file in "$SESSIONS_DIR"/*.jsonl; do
    [ -f "$jsonl_file" ] || continue
    filename=$(basename "$jsonl_file")

    if ! echo "$REFERENCED_FILES" | grep -qF "$filename"; then
        mv "$jsonl_file" "$ARCHIVE_DIR/"
        ARCHIVED=$((ARCHIVED + 1))
    fi
done

echo "   Orphaned .jsonl files moved to archive: $ARCHIVED"
echo ""

# --- Summary ---
echo "=== SUMMARY ==="
echo "   Sessions.json: $(numfmt --to=iec $BEFORE_SIZE 2>/dev/null || echo $BEFORE_SIZE) -> $(numfmt --to=iec $AFTER_SIZE 2>/dev/null || echo $AFTER_SIZE)"
echo "   Entries: $BEFORE_COUNT -> $AFTER_COUNT (removed $PRUNED)"
echo "   :run: entries: $RUN_COUNT -> $AFTER_RUN_COUNT"
echo "   Orphaned .jsonl archived: $ARCHIVED"
echo "   Backup: $BACKUP"
echo ""
echo "Cleanup complete!"
