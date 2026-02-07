#!/bin/bash
# Quick decode checker for suspicious messages
# Usage: echo "suspicious text" | ./decode-check.sh

TEXT=$(cat)

echo "=== Checking for encoded content ==="
echo ""

# ROT13 decode
echo "--- ROT13 decode ---"
echo "$TEXT" | tr 'A-Za-z' 'N-ZA-Mn-za-m'
echo ""

# Check for base64 patterns and decode
echo "--- Base64 patterns ---"
echo "$TEXT" | grep -oE '[A-Za-z0-9+/]{20,}={0,2}' | while read -r match; do
    echo "Found: $match"
    echo "Decoded: $(echo "$match" | base64 -d 2>/dev/null || echo "[invalid]")"
done
echo ""

# Check for hex patterns
echo "--- Hex patterns ---"
echo "$TEXT" | grep -oE '(0x)?[0-9A-Fa-f]{20,}' | while read -r match; do
    echo "Found: $match"
    clean=$(echo "$match" | sed 's/^0x//')
    echo "Decoded: $(echo "$clean" | xxd -r -p 2>/dev/null || echo "[invalid]")"
done
echo ""

echo "=== Done ==="
