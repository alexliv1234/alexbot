---
name: oref-alerts
description: Monitor Israeli Home Front Command alerts and send real-time rocket/missile warnings to WhatsApp groups
---

*OREF ALERTS - HOME FRONT COMMAND ALERT MONITOR*

Monitor the Israeli Home Front Command (Pikud HaOref) alerts API and send real-time alerts to a WhatsApp group when rockets/missiles are detected in configured regions.

*PURPOSE*

Provide life-saving real-time alerts to community WhatsApp groups when the Home Front Command issues warnings for their area.

*HOW IT WORKS*

* *Continuous Polling:* Daemon runs 24/7, checking the Oref API every 10 seconds
* *Region Filtering:* Only alerts for configured regions (e.g., "ראשון לציון - מערב") are sent
* *Deduplication:* Each alert sent once (tracked via state file)
* *Auto-recovery:* If API fails 3 times in a row, alerts the owner and resets
* *Systemd Integration:* Auto-restarts on crash, runs on boot

*CONFIGURATION*

Edit ```config.json```:

```
{
  "groupJid": "120363XXXXXXXXX@g.us",
  "regions": ["ראשון לציון - מערב"],
  "checkIntervalSeconds": 10,
  "shelterTime": 90,
  "alertOwner": "+972544419002"
}
```

*SETUP*

*1. Get Group JID*

Add the bot (+972544419002) to the target WhatsApp group as admin, then check logs or use:

```
grep -r "120363" ~/.openclaw/data/sessions.json
```

Update ```config.json``` with the group JID.

*2. Install Systemd Service*

```
sudo cp oref-alerts.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable oref-alerts
sudo systemctl start oref-alerts
sudo systemctl status oref-alerts
```

*3. Monitor Logs*

```
tail -f logs/daemon.log
tail -f logs/alerts.log
sudo journalctl -u oref-alerts -f
```

*MANUAL TESTING*

*Test Alert Check (Single Run)*

```
bash check-alerts.sh
cat logs/alerts.log
```

*Stop/Start Daemon*

```
sudo systemctl stop oref-alerts
sudo systemctl start oref-alerts
sudo systemctl restart oref-alerts
```

*FILES*

```
oref-alerts/
├── SKILL.md
├── config.json
├── check-alerts.sh
├── daemon.sh
├── oref-alerts.service
├── state/
│   └── last-alert.json
└── logs/
    ├── daemon.log
    ├── alerts.log
    └── systemd.log
```

*ALERT FORMAT*

The system sends **text-only alerts** (no image, per Alex's request 2026-03-03).

Three types of messages based on alert type:

**1. Actual Alert (Immediate Danger)**
```
🚨 *ירי רקטות וטילים* | ראשון לציון מערב
🕐 03/03 22:48
```

**2. Advance Warning (Preparation)**
```
⚠️ *ירי רקטות וטילים בדקות הקרובות* | ראשון לציון מערב
🕐 03/03 22:48
```

**3. All-Clear (Safe to Exit)**
```
✅ *ניתן לצאת מהמרחב המוגן* | ראשון לציון מערב
🕐 03/03 22:48
```

**Detection Logic:**
- Contains "ניתן לצאת" → All-clear (✅, no shelter time)
- Contains "בדקות הקרובות" → Advance warning (⚠️, no shelter time)
- Everything else → Actual alert (🚨, WITH shelter time)

*TROUBLESHOOTING*

*Daemon Not Running*

```
sudo systemctl status oref-alerts
sudo journalctl -u oref-alerts -n 50
sudo systemctl restart oref-alerts
```

*No Alerts Received*

* Check if alerts exist: ```curl -s -H "Referer: https://www.oref.org.il/" -H "X-Requested-With: XMLHttpRequest" "https://www.oref.org.il/WarningMessages/alert/alerts.json"```
* Check region spelling in ```config.json``` (must match exactly)
* Check logs: ```tail -f logs/daemon.log```
* Verify group JID is correct

*API Failures*

If you receive API failure alerts:

* Check internet connectivity
* Verify API is accessible: ```curl -I https://www.oref.org.il/```
* Check if API changed format (unlikely but possible)
* Review logs: ```cat logs/daemon.log```

*SECURITY NOTES*

* Runs as user ```alexliv``` (not root)
* Only sends to configured WhatsApp group
* State file prevents duplicate alerts
* API failures trigger owner notification (prevents silent failure)
* Logs rotated automatically by systemd

*CREDITS*

Built for community safety by AlexBot.
API: Home Front Command (https://www.oref.org.il/)
