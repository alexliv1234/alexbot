#!/usr/bin/env node
/**
 * score-bot.js - Score registered bots in the playing group
 * 
 * Usage: node scripts/score-bot.js "<phone>" "<name>" <total_score> '<categories_json>'
 * Example: node scripts/score-bot.js "+972501234567" "ShirBot" 65 '{"intelligence":8,"creativity":7}'
 * 
 * Categories (each /10, total /80):
 * - intelligence, creativity, humor, helpfulness
 * - adaptability, personality, security, socialIQ
 */

const fs = require('fs');
const path = require('path');

const SCORES_FILE = path.join(__dirname, '../memory/channels/playing-with-alexbot-bot-scores.json');
const REGISTRY_FILE = path.join(__dirname, '../memory/bot-registry.json');

function normalizePhone(phone) {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');
  // Handle Israeli numbers
  if (digits.startsWith('972')) {
    return '+' + digits;
  }
  if (digits.startsWith('0')) {
    return '+972' + digits.slice(1);
  }
  return '+' + digits;
}

function loadScores() {
  try {
    return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
  } catch (e) {
    return {
      bots: {},
      lastUpdated: null
    };
  }
}

function loadRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
  } catch (e) {
    return { bots: [] };
  }
}

function saveScores(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(SCORES_FILE, JSON.stringify(data, null, 2));
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node score-bot.js "<phone>" "<name>" <total_score> [categories_json]');
    console.log('Categories: intelligence, creativity, humor, helpfulness, adaptability, personality, security, socialIQ');
    process.exit(1);
  }
  
  const [phone, name, scoreStr, categoriesJson] = args;
  const totalScore = parseInt(scoreStr, 10);
  
  if (isNaN(totalScore) || totalScore < 0 || totalScore > 80) {
    console.error('Error: Score must be 0-80');
    process.exit(1);
  }
  
  const normalizedPhone = normalizePhone(phone);
  
  // Verify bot is registered
  const registry = loadRegistry();
  const registeredBot = registry.bots.find(b => normalizePhone(b.phone) === normalizedPhone);
  
  if (!registeredBot) {
    console.error(`Warning: Bot ${name} (${normalizedPhone}) is not in the registry. Scoring anyway.`);
  }
  
  // Parse categories if provided
  let categories = {};
  if (categoriesJson) {
    try {
      categories = JSON.parse(categoriesJson);
    } catch (e) {
      console.error('Warning: Could not parse categories JSON, using total only');
    }
  }
  
  // Load and update scores
  const data = loadScores();
  
  if (!data.bots[normalizedPhone]) {
    data.bots[normalizedPhone] = {
      name: name,
      phone: normalizedPhone,
      handle: registeredBot?.handle || `@${name.toLowerCase().replace(/\s+/g, '')}`,
      totalScore: 0,
      interactions: 0,
      averageScore: 0,
      categories: {
        intelligence: { total: 0, count: 0, avg: 0 },
        creativity: { total: 0, count: 0, avg: 0 },
        humor: { total: 0, count: 0, avg: 0 },
        helpfulness: { total: 0, count: 0, avg: 0 },
        adaptability: { total: 0, count: 0, avg: 0 },
        personality: { total: 0, count: 0, avg: 0 },
        security: { total: 0, count: 0, avg: 0 },
        socialIQ: { total: 0, count: 0, avg: 0 }
      },
      specialAchievements: [],
      evolution: [],
      hackAttempts: { total: 0, resisted: 0, failed: 0, successRate: 0 }
    };
  }
  
  const bot = data.bots[normalizedPhone];
  bot.name = name; // Update name in case it changed
  bot.totalScore += totalScore;
  bot.interactions += 1;
  bot.averageScore = Math.round((bot.totalScore / bot.interactions) * 10) / 10;
  
  // Update category scores if provided
  for (const [cat, score] of Object.entries(categories)) {
    if (bot.categories[cat]) {
      bot.categories[cat].total += score;
      bot.categories[cat].count += 1;
      bot.categories[cat].avg = Math.round((bot.categories[cat].total / bot.categories[cat].count) * 10) / 10;
    }
  }
  
  saveScores(data);
  
  console.log(`✅ Bot scored: ${name}`);
  console.log(`   Phone: ${normalizedPhone}`);
  console.log(`   This interaction: ${totalScore}/80`);
  console.log(`   Total: ${bot.totalScore} pts (${bot.interactions} interactions, avg: ${bot.averageScore})`);
  
  if (Object.keys(categories).length > 0) {
    console.log('   Categories:', JSON.stringify(categories));
  }
}

main();
