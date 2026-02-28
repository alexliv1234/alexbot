#!/bin/bash
# Control Oref Alerts service

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"

case "${1:-help}" in
    start)
        echo "▶️  Starting Oref Alerts service..."
        sudo systemctl start oref-alerts
        sudo systemctl status oref-alerts --no-pager
        ;;
    
    stop)
        echo "⏹️  Stopping Oref Alerts service..."
        sudo systemctl stop oref-alerts
        ;;
    
    restart)
        echo "🔄 Restarting Oref Alerts service..."
        sudo systemctl restart oref-alerts
        sudo systemctl status oref-alerts --no-pager
        ;;
    
    status)
        sudo systemctl status oref-alerts --no-pager
        echo ""
        echo "Recent logs:"
        sudo journalctl -u oref-alerts -n 10 --no-pager
        ;;
    
    logs)
        echo "📜 Following logs (Ctrl+C to exit)..."
        sudo journalctl -u oref-alerts -f
        ;;
    
    daemon-logs)
        echo "📜 Daemon logs:"
        tail -f "$SKILL_DIR/logs/daemon.log"
        ;;
    
    alert-logs)
        echo "🚨 Alert history:"
        tail -f "$SKILL_DIR/logs/alerts.log"
        ;;
    
    check)
        echo "🔍 Running manual alert check..."
        bash "$SKILL_DIR/check-alerts.sh"
        echo ""
        echo "Check logs/alerts.log for results"
        ;;
    
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|daemon-logs|alert-logs|check}"
        echo ""
        echo "Commands:"
        echo "  start        - Start the service"
        echo "  stop         - Stop the service"
        echo "  restart      - Restart the service"
        echo "  status       - Show service status + recent logs"
        echo "  logs         - Follow systemd logs (live)"
        echo "  daemon-logs  - Follow daemon.log (live)"
        echo "  alert-logs   - Follow alerts.log (live)"
        echo "  check        - Run manual alert check (test)"
        exit 1
        ;;
esac
