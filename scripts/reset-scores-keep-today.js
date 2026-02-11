#!/usr/bin/env node
/**
 * Reset scores but keep today's messages only (2026-02-11)
 */

const fs = require('fs');
const path = require('path');

const SCORES_FILE = path.join(__dirname, '../memory/channels/playing-with-alexbot-scores.json');
const TODAY = '2026-02-11';

// Backup first
const backupFile = SCORES_FILE.replace('.json', `-backup-${TODAY}.json`);
fs.copyFileSync(SCORES_FILE, backupFile);
console.log(`✅ Backup created: ${backupFile}`);

// Read current scores
const data = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));

// Filter: keep only messages from TODAY
const newScores = {};

for (const [phone, playerData] of Object.entries(data.scores)) {
  const todayMessages = playerData.messages.filter(msg => 
    msg.timestamp.startsWith(TODAY)
  );

  if (todayMessages.length > 0) {
    // Recalculate breakdown from today's messages only
    const breakdown = {
      creativity: 0,
      challenge: 0,
      humor: 0,
      cleverness: 0,
      engagement: 0,
      broke: 0,
      hacked: 0
    };

    let total_score = 0;

    for (const msg of todayMessages) {
      for (const [key, value] of Object.entries(msg.scores)) {
        breakdown[key] += value;
      }
      total_score += msg.total;
    }

    newScores[phone] = {
      name: playerData.name,
      messages_scored: todayMessages.length,
      total_score,
      breakdown,
      messages: todayMessages
    };
  }
}

// Write new scores file
const newData = { scores: newScores };
fs.writeFileSync(SCORES_FILE, JSON.stringify(newData, null, 2));

console.log(`✅ Scores reset! Kept only messages from ${TODAY}`);
console.log(`📊 Players with scores today: ${Object.keys(newScores).length}`);

// Show summary
console.log('\n📋 Summary:');
for (const [phone, player] of Object.entries(newScores)) {
  console.log(`  ${player.name}: ${player.messages_scored} messages, ${player.total_score} points`);
}
