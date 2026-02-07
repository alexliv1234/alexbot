#!/bin/bash
# Install a skill from ClawHub
# Usage: install.sh <slug>

SLUG="$1"

if [ -z "$SLUG" ]; then
    echo "Usage: $0 <skill-slug>"
    exit 1
fi

echo "=== Fetching skill: $SLUG ==="

# Get skill info
SKILL_INFO=$(curl -s "https://clawhub.com/api/v1/skills/$SLUG")

if echo "$SKILL_INFO" | jq -e '.error' > /dev/null 2>&1; then
    echo "Error: Skill not found"
    exit 1
fi

echo "$SKILL_INFO" | jq -r '"Name: \(.displayName)\nVersion: \(.version)\nSummary: \(.summary)"'

# Check if there's an install URL or package
INSTALL_URL=$(echo "$SKILL_INFO" | jq -r '.installUrl // .repositoryUrl // empty')

if [ -n "$INSTALL_URL" ]; then
    echo ""
    echo "Install URL: $INSTALL_URL"
    echo ""
    echo "To install, run:"
    echo "  openclaw skill install $SLUG"
    echo "  # or manually clone/download from the URL above"
fi

echo ""
echo "=== Full skill info ==="
echo "$SKILL_INFO" | jq .
