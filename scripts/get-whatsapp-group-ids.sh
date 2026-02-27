#!/bin/bash
# Extract recent WhatsApp group IDs from OpenClaw data

echo "🔍 Looking for WhatsApp group IDs..."
echo ""

# Check if we have any WhatsApp data
DATA_DIR="/home/alexliv/.openclaw/data/whatsapp"

if [ -d "$DATA_DIR" ]; then
    echo "📂 Checking WhatsApp data directory..."
    
    # Look for any files with group IDs (@g.us)
    find "$DATA_DIR" -type f -exec grep -l "@g.us" {} \; 2>/dev/null | while read file; do
        echo "Found groups in: $file"
        grep -oE "[0-9]{15,}@g\.us" "$file" | sort -u
    done
else
    echo "❌ No WhatsApp data directory found"
fi

echo ""
echo "📱 Alternative method to get Group IDs:"
echo ""
echo "1. Open WhatsApp Web (web.whatsapp.com)"
echo "2. Click on each group"
echo "3. Look at the URL - it contains the group ID"
echo "   Example: https://web.whatsapp.com/.../{GROUP_ID}"
echo ""
echo "OR"
echo ""
echo "1. In WhatsApp, open each group"
echo "2. Tap group name at top"
echo "3. Scroll down, tap 'Invite via link'"
echo "4. The link contains the group ID"
echo ""
echo "Group ID format: 120363XXXXXXXXXX@g.us"
