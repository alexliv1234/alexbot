#!/bin/bash
# Wrapper script to run setup-oauth.py with venv
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
source "$SKILL_DIR/venv/bin/activate"
python3 "$SCRIPT_DIR/setup-oauth.py" "$@"
