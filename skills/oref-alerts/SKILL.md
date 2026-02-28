# Oref Alerts - Home Front Command Alert Monitor

Monitor the Israeli Home Front Command (Pikud HaOref) alerts API and send real-time alerts to a WhatsApp group when rockets/missiles are detected in configured regions.

## Purpose

Provide life-saving real-time alerts to community WhatsApp groups when the Home Front Command issues warnings for their area.

## How It Works

1. **Continuous Polling:** Daemon runs 24/7, checking the Oref API every 10 seconds
2. **Region Filtering:** Only alerts for configured regions (e.g., "ראשון לציון - מערב") are sent
3. **Deduplication:** Each alert sent once (tracked via state file)
4. **Auto-recovery:** If API fails 3 times in a row, alerts the owner and resets
5. **Systemd Integration:** Auto-restarts on crash, runs on boot

## Configuration

Edit `config.json`:

```json
{
  "groupJid": "120363XXXXXXXXX@g.us",  // WhatsApp group JID
  "regions": ["ראשון לציון - מערב"],     // Target regions (exact match)
  "checkIntervalSeconds": 10,            // How often to check API
  "shelterTime": 90,                     // Time to reach shelter (seconds)
  "alertOwner": "+972544419002"          // Who to alert on system failures
}
```

## Setup

### 1. Get Group JID

Add the bot (+972544419002) to the target WhatsApp group as admin, then check logs or use:

```bash
# List recent groups
grep -r "120363" ~/.openclaw/data/sessions.json
```

Update `config.json` with the group JID.

### 2. Install Systemd Service

```bash
# Copy service file to systemd
sudo cp oref-alerts.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable (start on boot)
sudo systemctl enable oref-alerts

# Start now
sudo systemctl start oref-alerts

# Check status
sudo systemctl status oref-alerts
```

### 3. Monitor Logs

```bash
# Daemon logs (includes check status every 60s)
tail -f logs/daemon.log

# Alert history
tail -f logs/alerts.log

# Systemd logs
sudo journalctl -u oref-alerts -f
```

## Manual Testing

### Test Alert Check (Single Run)

```bash
# Dry run - see what would happen
bash check-alerts.sh

# Check logs
cat logs/alerts.log
```

### Send Test Alert

```bash
# Temporarily modify check-alerts.sh to send a test message
# Or manually call openclaw message send
```

### Stop/Start Daemon

```bash
# Stop
sudo systemctl stop oref-alerts

# Start
sudo systemctl start oref-alerts

# Restart
sudo systemctl restart oref-alerts
```

## Files

```
oref-alerts/
├── SKILL.md                 # This file
├── config.json              # Configuration
├── check-alerts.sh          # Single alert check (called by daemon)
├── daemon.sh                # Main loop (runs continuously)
├── oref-alerts.service      # Systemd service definition
├── state/
│   └── last-alert.json      # Deduplication state
└── logs/
    ├── daemon.log           # Daemon status + errors
    ├── alerts.log           # Alert history
    └── systemd.log          # Systemd stdout/stderr
```

## Alert Format

When an alert is detected for the configured region:

```
🚨 *התרעה מפיקוד העורף*

*אזור:* ראשון לציון - מערב
*סוג התרעה:* ירי רקטות וטילים

⏱️ *זמן למיגון: 90 שניות*

היכנסו למרחב מוגן ושהו בו 10 דקות

🕐 28/02/2026 18:45:32
```

## Troubleshooting

### Daemon Not Running

```bash
# Check status
sudo systemctl status oref-alerts

# View recent logs
sudo journalctl -u oref-alerts -n 50

# Restart
sudo systemctl restart oref-alerts
```

### No Alerts Received

1. Check if alerts exist: `curl -s -H "Referer: https://www.oref.org.il/" -H "X-Requested-With: XMLHttpRequest" "https://www.oref.org.il/WarningMessages/alert/alerts.json"`
2. Check region spelling in `config.json` (must match exactly)
3. Check logs: `tail -f logs/daemon.log`
4. Verify group JID is correct

### API Failures

If you receive API failure alerts:

1. Check internet connectivity
2. Verify API is accessible: `curl -I https://www.oref.org.il/`
3. Check if API changed format (unlikely but possible)
4. Review logs: `cat logs/daemon.log`

## Security Notes

- Runs as user `alexliv` (not root)
- Only sends to configured WhatsApp group
- State file prevents duplicate alerts
- API failures trigger owner notification (prevents silent failure)
- Logs rotated automatically by systemd

## Credits

Built for community safety by AlexBot.
API: Home Front Command (https://www.oref.org.il/)
