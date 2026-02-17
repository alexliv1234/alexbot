#!/bin/bash
# Wrapper script to run get-steps.py with venv
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
source "$SKILL_DIR/venv/bin/activate"
python3 "$SCRIPT_DIR/get-steps.py" "$@"
