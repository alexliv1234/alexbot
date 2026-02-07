#!/usr/bin/env node
/**
 * Log a bot interaction (received message + our response)
 * Usage: node scripts/log-bot-interaction.js <phone> <messageId> <receivedText> <responseText>
 */

const fs = require('fs');
const path = require('path');

const INTERACTIONS_PATH = path.join(__dirname, '../memory/bot-interactions.json');

function loadJson(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    return { bots: {}, lastChecked: null, stats: { totalReceived: 0, totalAnswered: 0, totalMissed: 0 } };
  }
}

function saveJson(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return '+' + digits;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error('Usage: log-bot-interaction.js <phone> <messageId> <receivedText> <responseText>');
    process.exit(1);
  }

  const [phone, messageId, receivedText, responseText] = args;
  const normalizedPhone = normalizePhone(phone);
  const now = new Date().toISOString();

  const interactions = loadJson(INTERACTIONS_PATH);

  if (!interactions.bots[normalizedPhone]) {
    interactions.bots[normalizedPhone] = {
      botId: 'unknown',
      name: 'Unknown Bot',
      interactions: []
    };
  }

  // Add the interaction
  interactions.bots[normalizedPhone].interactions.push({
    messageId: messageId,
    receivedAt: now,
    receivedText: receivedText,
    answeredAt: now,
    responseText: responseText
  });

  // Keep only last 100 interactions per bot
  if (interactions.bots[normalizedPhone].interactions.length > 100) {
    interactions.bots[normalizedPhone].interactions = 
      interactions.bots[normalizedPhone].interactions.slice(-100);
  }

  // Update stats
  interactions.stats.totalReceived++;
  interactions.stats.totalAnswered++;

  saveJson(INTERACTIONS_PATH, interactions);

  console.log(JSON.stringify({ success: true, logged: { phone: normalizedPhone, messageId } }));
}

main();
