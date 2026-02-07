#!/usr/bin/env node
/**
 * Add a bot to pending approval
 * Usage: node scripts/add-pending-bot.js '<json>'
 * 
 * JSON format: { phone, name, handle, description, messageId }
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../memory/bot-registry.json');

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
  const digits = phone.replace(/\D/g, '');
  return '+' + digits;
}

function generateId(name) {
  if (!name) return 'bot_' + Date.now();
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);
}

function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: add-pending-bot.js \'<json>\'');
    process.exit(1);
  }
  
  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    console.error('Invalid JSON:', e.message);
    process.exit(1);
  }
  
  const registry = loadJson(REGISTRY_PATH) || {
    bots: [],
    pendingApproval: [],
    blocked: [],
    lastUpdated: null
  };
  
  const phone = normalizePhone(data.phone);
  
  // Check if already exists
  const existsInBots = registry.bots.some(b => normalizePhone(b.phone) === phone);
  const existsInPending = registry.pendingApproval.some(b => normalizePhone(b.phone) === phone);
  const existsInBlocked = registry.blocked.some(b => normalizePhone(b.phone) === phone);
  
  if (existsInBots) {
    console.log(JSON.stringify({ success: false, reason: 'already_registered', phone }));
    return;
  }
  
  if (existsInPending) {
    console.log(JSON.stringify({ success: false, reason: 'already_pending', phone }));
    return;
  }
  
  if (existsInBlocked) {
    console.log(JSON.stringify({ success: false, reason: 'blocked', phone }));
    return;
  }
  
  // Add to pending
  const pendingBot = {
    id: generateId(data.name),
    name: data.name || 'Unknown Bot',
    phone: phone,
    handle: data.handle || null,
    description: data.description || data.raw || '',
    requestedAt: new Date().toISOString(),
    messageId: data.messageId || null,
    status: 'pending'
  };
  
  registry.pendingApproval.push(pendingBot);
  registry.lastUpdated = new Date().toISOString();
  
  saveJson(REGISTRY_PATH, registry);
  
  console.log(JSON.stringify({ 
    success: true, 
    added: pendingBot,
    pendingCount: registry.pendingApproval.length
  }));
}

main();
