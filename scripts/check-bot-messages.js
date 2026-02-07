#!/usr/bin/env node
/**
 * Check for missed messages from registered bots
 * Usage: node scripts/check-bot-messages.js
 * 
 * Returns JSON with missed messages that need responses
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REGISTRY_PATH = path.join(__dirname, '../memory/bot-registry.json');
const INTERACTIONS_PATH = path.join(__dirname, '../memory/bot-interactions.json');

function loadJson(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function saveJson(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function normalizePhone(phone) {
  // Strip to just digits, then add +
  const digits = phone.replace(/\D/g, '');
  return '+' + digits;
}

function getRecentMessages(phone, limit = 20) {
  try {
    // Use wacli to get recent messages from this contact
    const jid = `${phone.replace('+', '')}@s.whatsapp.net`;
    const cmd = `~/go/bin/wacli messages list --chat "${jid}" --limit ${limit} --json 2>/dev/null`;
    const output = execSync(cmd, { encoding: 'utf8', timeout: 30000, shell: '/bin/bash' });
    const result = JSON.parse(output);
    // wacli wraps in {success, data: {messages: [...]}, error}
    return result.data?.messages || [];
  } catch (e) {
    return [];
  }
}

function main() {
  const registry = loadJson(REGISTRY_PATH);
  if (!registry || !registry.bots) {
    console.log(JSON.stringify({ error: 'No bot registry found', missed: [] }));
    return;
  }

  let interactions = loadJson(INTERACTIONS_PATH);
  if (!interactions) {
    interactions = { bots: {}, lastChecked: null, stats: { totalReceived: 0, totalAnswered: 0, totalMissed: 0 } };
  }

  const activeBots = registry.bots.filter(b => b.status === 'active');
  const missed = [];
  const now = new Date().toISOString();

  for (const bot of activeBots) {
    const phone = normalizePhone(bot.phone);
    
    // Initialize bot in interactions if not exists
    if (!interactions.bots[phone]) {
      interactions.bots[phone] = {
        botId: bot.id,
        name: bot.name,
        interactions: []
      };
    }

    const botData = interactions.bots[phone];
    const answeredIds = new Set(botData.interactions.map(i => i.messageId));

    // Get recent messages from this bot
    const messages = getRecentMessages(phone);
    
    for (const msg of messages) {
      // Only process incoming messages (from the bot to us)
      if (msg.FromMe || msg.fromMe) continue;
      
      const msgId = msg.MsgID || msg.id || msg.key?.id || `${msg.Timestamp || msg.timestamp}_${(msg.Text || msg.text)?.substring(0, 20)}`;
      const msgTime = msg.Timestamp || (msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() : msg.time);
      const msgText = msg.Text || msg.text || msg.body || msg.message?.conversation || '';

      // Skip if already answered
      if (answeredIds.has(msgId)) continue;

      // Skip very old messages (older than 1 hour)
      const msgDate = new Date(msgTime);
      const ageMs = Date.now() - msgDate.getTime();
      if (ageMs > 60 * 60 * 1000) continue; // Skip if > 1 hour old

      // This is a missed message
      missed.push({
        botId: bot.id,
        botName: bot.name,
        phone: phone,
        messageId: msgId,
        receivedAt: msgTime,
        text: msgText,
        ageMinutes: Math.round(ageMs / 60000)
      });
    }
  }

  interactions.lastChecked = now;
  saveJson(INTERACTIONS_PATH, interactions);

  console.log(JSON.stringify({
    checked: now,
    activeBots: activeBots.length,
    missed: missed,
    missedCount: missed.length
  }, null, 2));
}

main();
