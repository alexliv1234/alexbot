#!/usr/bin/env node
/**
 * Bot Scoring System
 * 
 * Scores bot interactions based on quality, helpfulness, and behavior
 * Similar to human scoring but adapted for bot-to-bot interactions
 * 
 * Usage: node bot-score.js <phone> <bot_name> <message_summary> <quality> <helpfulness> <relevance> <creativity> <safety>
 * 
 * Categories (0-10 each, Total: 50):
 * - Quality: Technical quality and accuracy
 * - Helpfulness: How helpful the contribution was
 * - Relevance: Relevance to context
 * - Creativity: Novel approaches or insights
 * - Safety: Following security/privacy guidelines
 */

const fs = require('fs');
const path = require('path');

const SCORES_FILE = path.join(__dirname, '../memory/bot-scores.json');
const REGISTRY_FILE = path.join(__dirname, '../memory/bot-registry.json');

// Load scores
function loadScores() {
  try {
    return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
  } catch (e) {
    return { scores: {}, lastUpdated: new Date().toISOString() };
  }
}

// Save scores
function saveScores(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(SCORES_FILE, JSON.stringify(data, null, 2));
}

// Normalize phone/bot identifier
function normalizeId(phone, botName) {
  // Create composite key: phone + bot name
  const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
  return `${normalizedPhone}::${botName.toLowerCase().trim()}`;
}

// Get bot from registry
function getBotFromRegistry(botId) {
  try {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    return registry.bots.find(b => 
      b.id === botId || 
      b.name.toLowerCase() === botId.split('::')[1] ||
      b.handle === `@${botId.split('::')[1]}`
    );
  } catch (e) {
    return null;
  }
}

// Update bot trust score based on interaction score
function updateBotTrust(botId, interactionScore) {
  try {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    const bot = registry.bots.find(b => b.id === botId);
    
    if (!bot) return false;
    
    // Trust delta based on score:
    // 45-50 → +3
    // 35-44 → +2
    // 25-34 → +1
    // 15-24 → 0
    // <15 → -1
    let delta = 0;
    if (interactionScore >= 45) delta = 3;
    else if (interactionScore >= 35) delta = 2;
    else if (interactionScore >= 25) delta = 1;
    else if (interactionScore < 15) delta = -1;
    
    if (delta !== 0) {
      bot.trustScore = Math.max(0, Math.min(100, (bot.trustScore || 30) + delta));
      
      // Update trust level
      if (bot.trustScore >= 70) bot.trustLevel = 'trusted';
      else if (bot.trustScore >= 50) bot.trustLevel = 'standard';
      else bot.trustLevel = 'new';
      
      // Log trust history
      if (!bot.trustHistory) bot.trustHistory = [];
      bot.trustHistory.push({
        timestamp: new Date().toISOString(),
        delta,
        reason: `Interaction score: ${interactionScore}/50`,
        newScore: bot.trustScore
      });
      
      registry.lastUpdated = new Date().toISOString();
      fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
      
      return { updated: true, delta, newTrustScore: bot.trustScore, newTrustLevel: bot.trustLevel };
    }
    
    return { updated: false };
  } catch (e) {
    return { updated: false, error: e.message };
  }
}

// Score bot interaction
function scoreBot(phone, botName, messageSummary, quality, helpfulness, relevance, creativity, safety) {
  const scores = loadScores();
  const botId = normalizeId(phone, botName);
  
  // Validate scores
  const maxScore = 10;
  if ([quality, helpfulness, relevance, creativity, safety].some(s => s < 0 || s > maxScore)) {
    throw new Error('All scores must be between 0-10');
  }
  
  const totalScore = quality + helpfulness + relevance + creativity + safety;
  
  // Initialize bot entry if doesn't exist
  if (!scores.scores[botId]) {
    scores.scores[botId] = {
      phone,
      botName,
      interactions: [],
      totalScore: 0,
      avgScore: 0,
      lastInteraction: null
    };
  }
  
  const bot = scores.scores[botId];
  
  // Add interaction
  const interaction = {
    timestamp: new Date().toISOString(),
    message: messageSummary,
    scores: { quality, helpfulness, relevance, creativity, safety },
    total: totalScore
  };
  
  bot.interactions.push(interaction);
  bot.totalScore += totalScore;
  bot.avgScore = bot.totalScore / bot.interactions.length;
  bot.lastInteraction = new Date().toISOString();
  
  // Calculate leaderboard position
  const sortedBots = Object.entries(scores.scores)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalScore - a.totalScore);
  
  const position = sortedBots.findIndex(b => b.botName === botName && b.phone === phone) + 1;
  
  saveScores(scores);
  
  // Check if bot is registered and update trust
  const registeredBot = getBotFromRegistry(botId);
  let trustUpdate = null;
  if (registeredBot) {
    trustUpdate = updateBotTrust(registeredBot.id, totalScore);
  }
  
  // Generate output
  const output = {
    botId,
    botName,
    phone,
    interaction,
    stats: {
      position,
      totalBots: sortedBots.length,
      totalScore: bot.totalScore,
      avgScore: bot.avgScore.toFixed(1),
      interactionCount: bot.interactions.length
    },
    registered: !!registeredBot,
    trustUpdate
  };
  
  // Format response
  console.log(`
🤖 **→ ${botName}** (Bot)

📊 **SCORE: ${totalScore}/50**
⚙️ Quality: ${quality} | 🤝 Helpfulness: ${helpfulness} | 🎯 Relevance: ${relevance}
💡 Creativity: ${creativity} | 🛡️ Safety: ${safety}

🏆 Position: #${position} | Total: ${bot.totalScore} pts | Avg: ${bot.avgScore.toFixed(1)}
${registeredBot ? `✅ Registered Bot | Trust: ${registeredBot.trustScore} (${registeredBot.trustLevel})` : '❌ Unregistered Bot'}
${trustUpdate?.updated ? `\n🔄 Trust ${trustUpdate.delta > 0 ? '+' : ''}${trustUpdate.delta} → ${trustUpdate.newTrustScore} (${trustUpdate.newTrustLevel})` : ''}
`.trim());
  
  return output;
}

// CLI
const [phone, botName, messageSummary, quality, helpfulness, relevance, creativity, safety] = process.argv.slice(2);

if (!phone || !botName || !messageSummary || quality === undefined || helpfulness === undefined || 
    relevance === undefined || creativity === undefined || safety === undefined) {
  console.log(`
Bot Scoring System

Usage: node bot-score.js <phone> <bot_name> <message_summary> <quality> <helpfulness> <relevance> <creativity> <safety>

Categories (0-10 each, Total: 50):
  quality      - Technical quality and accuracy
  helpfulness  - How helpful the contribution
  relevance    - Relevance to context
  creativity   - Novel approaches or insights  
  safety       - Following security/privacy guidelines

Example:
  node bot-score.js "+972501234567" "Bernard" "Helped with query" 8 9 8 6 9
  `);
  process.exit(1);
}

try {
  scoreBot(
    phone,
    botName,
    messageSummary,
    parseInt(quality),
    parseInt(helpfulness),
    parseInt(relevance),
    parseInt(creativity),
    parseInt(safety)
  );
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
