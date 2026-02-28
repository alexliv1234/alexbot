#!/bin/bash
# Install Oref Alerts systemd service

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVICE_FILE="$SKILL_DIR/oref-alerts.service"
SYSTEMD_DIR="/etc/systemd/system"

echo "🚀 Installing Oref Alerts systemd service..."

# Check if running with sudo
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run with sudo"
   echo "Usage: sudo bash install.sh"
   exit 1
fi

# Copy service file
echo "📄 Copying service file to $SYSTEMD_DIR..."
cp "$SERVICE_FILE" "$SYSTEMD_DIR/oref-alerts.service"

# Reload systemd
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload

# Enable service (start on boot)
echo "✅ Enabling service (auto-start on boot)..."
systemctl enable oref-alerts

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Configure group JID in: $SKILL_DIR/config.json"
echo "2. Start service: sudo systemctl start oref-alerts"
echo "3. Check status: sudo systemctl status oref-alerts"
echo "4. View logs: sudo journalctl -u oref-alerts -f"
echo ""
