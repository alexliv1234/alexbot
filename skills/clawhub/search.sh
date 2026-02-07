#!/bin/bash
# Search ClawHub for skills
# Usage: search.sh "query"

QUERY="$1"

if [ -z "$QUERY" ]; then
    echo "Usage: $0 <search query>"
    exit 1
fi

# URL encode the query
ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$QUERY'))")

echo "=== Searching ClawHub for: $QUERY ==="
echo ""

curl -sL "https://clawhub.com/api/v1/search?q=$ENCODED" | jq -r '.results[:10][] | "• \(.displayName) (\(.slug))\n  \(.summary)\n  Version: \(.version)\n"'

echo "=== Done ==="
