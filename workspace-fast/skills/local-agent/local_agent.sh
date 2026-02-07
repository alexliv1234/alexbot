#!/bin/bash
# Quick wrapper to call local agent
# Usage: local_agent "task"

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
python3 "$SCRIPT_DIR/agent.py" "$@"
