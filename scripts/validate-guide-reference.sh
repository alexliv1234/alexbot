#!/bin/bash
# Validate that a GitHub learning guide reference exists before mentioning it

set -e

GUIDES_DIR="$HOME/alexbot-learning-guides"
REPO_URL="https://github.com/alexliv1234/alexbot-learning-guides"

# Update guides repo
if [ ! -d "$GUIDES_DIR" ]; then
    git clone "$REPO_URL" "$GUIDES_DIR" >/dev/null 2>&1
else
    cd "$GUIDES_DIR" && git pull >/dev/null 2>&1
fi

# If argument provided, validate specific file
if [ $# -eq 1 ]; then
    FILE="$1"
    if [ -f "$GUIDES_DIR/$FILE" ]; then
        echo "✅ VALID: $FILE exists"
        echo "URL: $REPO_URL/blob/main/$FILE"
        exit 0
    else
        echo "❌ INVALID: $FILE does not exist"
        echo ""
        echo "Available guides:"
        ls -1 "$GUIDES_DIR"/*.md 2>/dev/null | xargs -n1 basename
        exit 1
    fi
fi

# No argument - list all available guides
echo "📚 Available Learning Guides:"
echo ""
cd "$GUIDES_DIR"
for file in *.md; do
    [ -f "$file" ] || continue
    title=$(head -1 "$file" | sed 's/^# //')
    echo "  - $file"
    echo "    → $title"
done
