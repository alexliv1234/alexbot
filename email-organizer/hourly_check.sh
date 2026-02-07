#!/bin/bash
# Hourly email check - run via cron
# Add to crontab: 0 * * * * /home/alexliv/.openclaw/workspace/email-organizer/hourly_check.sh

cd /home/alexliv/.openclaw/workspace/email-organizer
export GOG_KEYRING_PASSWORD="openclaw123"

# Run categorization on unread emails
python3 categorize.py --max 100 > /tmp/email_check_$(date +%H).log 2>&1

# If there are action-required emails, notify (TODO: integrate with OpenClaw)
