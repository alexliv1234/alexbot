#!/bin/bash
# Backup all WhatsApp data

set -e

BACKUP_DIR="$HOME/.openclaw/workspace/memory/whatsapp/backups/$(date +%Y-%m-%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "💾 Starting full WhatsApp backup..." >&2
echo "   Backup dir: $BACKUP_DIR" >&2

# Sync contacts and groups first
$(dirname "$0")/sync-contacts.sh > /dev/null 2>&1
$(dirname "$0")/sync-groups.sh > /dev/null 2>&1

# Copy current state
cp -r ~/.wacli "$BACKUP_DIR/wacli_store"
cp -r ~/.openclaw/workspace/memory/whatsapp/*.json "$BACKUP_DIR/" 2>/dev/null || true

# Compress
cd "$(dirname "$BACKUP_DIR")"
tar -czf "$(basename "$BACKUP_DIR").tar.gz" "$(basename "$BACKUP_DIR")"
rm -rf "$BACKUP_DIR"

echo "✅ Backup complete: ${BACKUP_DIR}.tar.gz" >&2
