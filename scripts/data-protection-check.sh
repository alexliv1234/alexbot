#!/bin/bash
# Data Protection Check
# Use this to verify if a file path contains sensitive personal data
# Returns: 0 = SAFE, 1 = PROTECTED (do not share)

FILE_PATH="$1"

if [ -z "$FILE_PATH" ]; then
    echo "Usage: $0 <file_path>"
    exit 2
fi

# Protected files - NEVER share these
PROTECTED_FILES=(
    "memory/esh_employees.json"
    "memory/whatsapp/google_contacts.json"
    "memory/whatsapp/directory.json"
    ".openclaw/config.yaml"
)

# Protected patterns
PROTECTED_PATTERNS=(
    "employee"
    "contact"
    "directory"
    "password"
    "secret"
    "credential"
    "api_key"
    "token"
)

# Check exact matches
for protected in "${PROTECTED_FILES[@]}"; do
    if [[ "$FILE_PATH" == *"$protected"* ]]; then
        echo "🚨 PROTECTED FILE: $protected"
        echo "NEVER share this file - contains personal/sensitive data"
        exit 1
    fi
done

# Check patterns
for pattern in "${PROTECTED_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" == *"$pattern"* ]]; then
        echo "⚠️  WARNING: File name contains sensitive pattern: $pattern"
        echo "Review carefully before sharing"
        exit 1
    fi
done

echo "✅ File appears safe"
exit 0
