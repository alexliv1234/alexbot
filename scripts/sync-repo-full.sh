#!/bin/bash
set -e
export TZ="Asia/Jerusalem"
WORKSPACE="/home/alexliv/.openclaw/workspace"

echo "[sync] Sat Feb 14 11:18:52 IST 2026 Starting full repo sync..."

# 1. Sync extensions
echo "[sync] Syncing extensions..."
mkdir -p "/extensions"
for ext in group-guardian prompt-protection whatsapp-humor-errors; do
  [ -d "/home/alexliv/.openclaw/extensions/" ] &&     rsync -a --delete "/home/alexliv/.openclaw/extensions//" "/extensions//"
done

# 2. Sync ALL agent sessions (main, fast, bot-handler, learning)
echo "[sync] Syncing all agent sessions..."
mkdir -p "/agents"
rsync -a --exclude="agent/" "/home/alexliv/.openclaw/agents/" "/agents/"

# 3. Sync cron data
echo "[sync] Syncing cron..."
mkdir -p "/cron"
cp "/home/alexliv/.openclaw/cron/jobs.json" "/cron/"
rsync -a "/home/alexliv/.openclaw/cron/runs/" "/cron/runs/" 2>/dev/null || true

# 4. Export config (secrets redacted)
echo "[sync] Exporting config..."
cat > /tmp/redact-config.jq << "JQ"
del(.auth.profiles) |
.gateway.auth.token = "[API_TOKEN]" |
.channels.telegram.botToken = "[BOT_TOKEN]" |
.messages.tts.elevenlabs.apiKey = "[API_KEY]" |
walk(if type == "object" and has("apiKey") and (.apiKey | type) == "string" and (.apiKey | startswith("[") | not) then .apiKey = "[API_KEY]" else . end)
JQ
jq -f /tmp/redact-config.jq "/home/alexliv/.openclaw/openclaw.json" > "/openclaw-config.json"

# 5. Copy gateway logs
echo "[sync] Syncing logs..."
mkdir -p "/logs"
cp /tmp/openclaw/openclaw-*.log "/logs/" 2>/dev/null || true

# 6. Update timestamp
echo "Last sync: 2026-02-14 11:18:52 IST" > "/LAST_SYNC.txt"

echo "[sync] Done."
