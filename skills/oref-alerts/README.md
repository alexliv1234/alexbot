# Oref Alerts - Quick Start

Real-time Home Front Command alerts for WhatsApp groups.

## Setup (First Time)

### 1. Configure Group

Edit `config.json` and set the WhatsApp group JID:

```bash
# First, add the bot (+972544419002) to your WhatsApp group as admin
# Then find the group JID - it looks like: 120363XXXXXXXXX@g.us

nano config.json
# Change "groupJid": "PLACEHOLDER_GROUP_JID" to the real JID
```

### 2. Install Service

```bash
sudo bash install.sh
```

### 3. Start Service

```bash
bash control.sh start
```

### 4. Monitor

```bash
# Watch live logs
bash control.sh logs

# Or check daemon logs
bash control.sh daemon-logs

# Or alert history
bash control.sh alert-logs
```

## Usage

```bash
bash control.sh {command}
```

**Commands:**
- `start` - Start monitoring
- `stop` - Stop monitoring  
- `restart` - Restart service
- `status` - Check if running
- `logs` - Live systemd logs
- `daemon-logs` - Live daemon status
- `alert-logs` - Alert history
- `check` - Manual test (single check)

## How It Works

1. Checks Oref API every 10 seconds
2. Filters for "ראשון לציון - מערב" only
3. Sends alert to WhatsApp group
4. Logs every check (every 60s status update)
5. Auto-restarts on crash
6. Alerts owner if API fails 3+ times

## Files

- `config.json` - Settings (group JID, regions, intervals)
- `SKILL.md` - Full documentation
- `check-alerts.sh` - Single alert check
- `daemon.sh` - Continuous loop
- `control.sh` - Service management
- `install.sh` - One-time setup
- `logs/` - Daemon & alert logs

## Troubleshooting

**Service won't start:**
```bash
sudo journalctl -u oref-alerts -n 50
```

**No alerts received:**
- Check group JID is correct
- Verify region spelling: "ראשון לציון - מערב"
- Check logs: `bash control.sh daemon-logs`

**API errors:**
- Service will auto-alert owner (+972544419002)
- Check internet: `curl https://www.oref.org.il/`

## Quick Test

```bash
# Test without sending
bash check-alerts.sh

# Check what happened
cat logs/alerts.log
```

---

For full documentation, see `SKILL.md`.
