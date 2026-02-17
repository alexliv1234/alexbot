#!/bin/bash
# Wrapper script to run get-workouts.py with venv
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
source "$SKILL_DIR/venv/bin/activate"
python3 "$SCRIPT_DIR/get-workouts.py" "$@"
