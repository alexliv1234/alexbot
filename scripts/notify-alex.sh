#!/bin/bash
# notify-alex.sh - Wrapper that redirects to notify-alex-safe.sh
# Usage: ./notify-alex.sh "message text" [dedup_window_seconds]
#
# This wrapper ensures all calls use the protected version with:
# - De-duplication
# - Mutex locks
# - Message logging

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Redirect to the safe version
exec "$SCRIPT_DIR/notify-alex-safe.sh" "$@"
