#!/usr/bin/env node
/**
 * Bot Registration Handler
 * 
 * Usage: node bot-register.js <action> [args]
 * 
 * Actions:
 *   parse <message>     - Parse a registration message
 *   add <json>          - Add bot to pending approval
 *   approve <botId>     - Approve a pending bot
 *   reject <botId>      - Reject a pending bot
 *   list                - List all registered bots
 *   pending             - List pending approvals
 *   get <botId>         - Get bot details
 *   block <botId>       - Block a bot
 *   unblock <botId>     - Unblock a bot
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../memory/bot-registry.json');

// Load registry
function loadRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch (e) {
    return { bots: [], pendingApproval: [], blocked: [], lastUpdated: new Date().toISOString() };
  }
}

// Save registry
function saveRegistry(registry) {
  registry.lastUpdated = new Date().toISOString();
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

// Generate bot ID from handle
function generateBotId(handle) {
  return handle.replace('@', '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Parse registration message
function parseRegistrationMessage(message) {
  const patterns = {
    name: /(?:שם|name)[:\s]*(.+)/i,
    phone: /(?:טלפון|phone)[:\s]*(\+?\d[\d\s-]+)/i,
    handle: /(?:handle|@)[:\s]*(@?\w+)/i,
    description: /(?:תיאור|description)[:\s]*(.+)/i,
    owner: /(?:בעלים|owner)[:\s]*(.+)/i
  };

  const result = {};
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = message.match(pattern);
    if (match) {
      result[key] = match[1].trim();
    }
  }

  // Normalize handle
  if (result.handle && !result.handle.startsWith('@')) {
    result.handle = '@' + result.handle;
  }

  // Normalize phone
  if (result.phone) {
    result.phone = result.phone.replace(/[\s-]/g, '');
    if (!result.phone.startsWith('+')) {
      result.phone = '+' + result.phone;
    }
  }

  return result;
}

// Validate registration data
function validateRegistration(data) {
  const errors = [];
  
  if (!data.name) errors.push('Missing bot name');
  if (!data.phone) errors.push('Missing phone number');
  if (!data.handle) errors.push('Missing handle');
  if (!data.description) errors.push('Missing description');
  
  if (data.phone && !/^\+\d{10,15}$/.test(data.phone)) {
    errors.push('Invalid phone number format');
  }
  
  if (data.handle && !/^@[a-zA-Z][a-zA-Z0-9_]{2,20}$/.test(data.handle)) {
    errors.push('Invalid handle format (must be @name with 3-20 alphanumeric chars)');
  }

  // Check if handle already exists
  const registry = loadRegistry();
  const allBots = [...registry.bots, ...registry.pendingApproval];
  if (data.handle && allBots.some(b => b.handle.toLowerCase() === data.handle.toLowerCase())) {
    errors.push('Handle already taken');
  }

  return errors;
}

// Add bot to pending approval
function addPendingBot(data, senderPhone) {
  const registry = loadRegistry();
  
  const botId = generateBotId(data.handle);
  
  const bot = {
    id: botId,
    name: data.name,
    phone: data.phone || senderPhone,
    handle: data.handle,
    description: data.description,
    owner: {
      name: data.owner || 'Unknown',
      phone: senderPhone
    },
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };
  
  registry.pendingApproval.push(bot);
  saveRegistry(registry);
  
  return bot;
}

// Approve a pending bot
function approveBot(botId) {
  const registry = loadRegistry();
  
  const index = registry.pendingApproval.findIndex(b => b.id === botId);
  if (index === -1) {
    return { error: 'Bot not found in pending approval' };
  }
  
  const bot = registry.pendingApproval.splice(index, 1)[0];
  
  // Upgrade to active bot
  bot.status = 'active';
  bot.trustLevel = 'new';
  bot.trustScore = 30;
  bot.approvedAt = new Date().toISOString();
  bot.lastContact = new Date().toISOString();
  bot.stats = {
    messagesReceived: 0,
    messagesSent: 0,
    learningsShared: 0,
    learningsReceived: 0,
    alertsSent: 0
  };
  
  registry.bots.push(bot);
  saveRegistry(registry);
  
  return bot;
}

// Reject a pending bot
function rejectBot(botId, reason) {
  const registry = loadRegistry();
  
  const index = registry.pendingApproval.findIndex(b => b.id === botId);
  if (index === -1) {
    return { error: 'Bot not found in pending approval' };
  }
  
  const bot = registry.pendingApproval.splice(index, 1)[0];
  bot.status = 'rejected';
  bot.rejectedAt = new Date().toISOString();
  bot.rejectionReason = reason || 'Not approved';
  
  saveRegistry(registry);
  
  return bot;
}

// Block a bot
function blockBot(botId, reason) {
  const registry = loadRegistry();
  
  const index = registry.bots.findIndex(b => b.id === botId);
  if (index === -1) {
    return { error: 'Bot not found' };
  }
  
  const bot = registry.bots.splice(index, 1)[0];
  bot.status = 'blocked';
  bot.blockedAt = new Date().toISOString();
  bot.blockReason = reason || 'Blocked by admin';
  
  registry.blocked.push(bot);
  saveRegistry(registry);
  
  return bot;
}

// Unblock a bot
function unblockBot(botId) {
  const registry = loadRegistry();
  
  const index = registry.blocked.findIndex(b => b.id === botId);
  if (index === -1) {
    return { error: 'Bot not found in blocked list' };
  }
  
  const bot = registry.blocked.splice(index, 1)[0];
  bot.status = 'active';
  bot.trustLevel = 'new';
  bot.trustScore = 10; // Lower trust after unblock
  bot.unblockedAt = new Date().toISOString();
  delete bot.blockedAt;
  delete bot.blockReason;
  
  registry.bots.push(bot);
  saveRegistry(registry);
  
  return bot;
}

// Get bot by ID or phone
function getBot(identifier) {
  const registry = loadRegistry();
  
  // Search in all lists
  const allBots = [
    ...registry.bots,
    ...registry.pendingApproval,
    ...registry.blocked
  ];
  
  return allBots.find(b => 
    b.id === identifier || 
    b.phone === identifier ||
    b.handle.toLowerCase() === identifier.toLowerCase()
  );
}

// Check if phone is a registered bot
function isBotPhone(phone) {
  const registry = loadRegistry();
  return registry.bots.some(b => b.phone === phone);
}

// Update bot stats
function updateBotStats(botId, statUpdate) {
  const registry = loadRegistry();
  const bot = registry.bots.find(b => b.id === botId);
  
  if (!bot) return { error: 'Bot not found' };
  
  for (const [key, value] of Object.entries(statUpdate)) {
    if (bot.stats[key] !== undefined) {
      bot.stats[key] += value;
    }
  }
  
  bot.lastContact = new Date().toISOString();
  saveRegistry(registry);
  
  return bot;
}

// Update trust score
function updateTrustScore(botId, delta, reason) {
  const registry = loadRegistry();
  const bot = registry.bots.find(b => b.id === botId);
  
  if (!bot) return { error: 'Bot not found' };
  
  bot.trustScore = Math.max(0, Math.min(100, bot.trustScore + delta));
  
  // Update trust level
  if (bot.trustScore >= 71) bot.trustLevel = 'trusted';
  else if (bot.trustScore >= 41) bot.trustLevel = 'standard';
  else bot.trustLevel = 'new';
  
  // Log the change
  if (!bot.trustHistory) bot.trustHistory = [];
  bot.trustHistory.push({
    timestamp: new Date().toISOString(),
    delta,
    reason,
    newScore: bot.trustScore
  });
  
  saveRegistry(registry);
  
  return bot;
}

// CLI
const action = process.argv[2];
const arg = process.argv.slice(3).join(' ');

switch (action) {
  case 'parse':
    console.log(JSON.stringify(parseRegistrationMessage(arg)));
    break;
    
  case 'validate':
    const data = JSON.parse(arg);
    const errors = validateRegistration(data);
    console.log(JSON.stringify({ valid: errors.length === 0, errors }));
    break;
    
  case 'add':
    const addData = JSON.parse(arg);
    const senderPhone = process.argv[4] || addData.phone;
    const newBot = addPendingBot(addData, senderPhone);
    console.log(JSON.stringify(newBot));
    break;
    
  case 'approve':
    console.log(JSON.stringify(approveBot(arg)));
    break;
    
  case 'reject':
    const [rejectId, ...reasonParts] = arg.split(' ');
    console.log(JSON.stringify(rejectBot(rejectId, reasonParts.join(' '))));
    break;
    
  case 'block':
    const [blockId, ...blockReasonParts] = arg.split(' ');
    console.log(JSON.stringify(blockBot(blockId, blockReasonParts.join(' '))));
    break;
    
  case 'unblock':
    console.log(JSON.stringify(unblockBot(arg)));
    break;
    
  case 'get':
    console.log(JSON.stringify(getBot(arg)));
    break;
    
  case 'isbot':
    console.log(JSON.stringify({ isBot: isBotPhone(arg) }));
    break;
    
  case 'list':
    const listRegistry = loadRegistry();
    console.log(JSON.stringify(listRegistry.bots, null, 2));
    break;
    
  case 'pending':
    const pendingRegistry = loadRegistry();
    console.log(JSON.stringify(pendingRegistry.pendingApproval, null, 2));
    break;
    
  case 'blocked':
    const blockedRegistry = loadRegistry();
    console.log(JSON.stringify(blockedRegistry.blocked, null, 2));
    break;
    
  case 'stats':
    const [statsId, statsJson] = arg.split(' ', 2);
    console.log(JSON.stringify(updateBotStats(statsId, JSON.parse(statsJson))));
    break;
    
  case 'trust':
    const [trustId, deltaStr, ...trustReasonParts] = arg.split(' ');
    console.log(JSON.stringify(updateTrustScore(trustId, parseInt(deltaStr), trustReasonParts.join(' '))));
    break;
    
  default:
    console.log(`
Bot Registry CLI

Usage: node bot-register.js <action> [args]

Actions:
  parse <message>           Parse a registration message
  validate <json>           Validate registration data
  add <json> [senderPhone]  Add bot to pending approval
  approve <botId>           Approve a pending bot
  reject <botId> [reason]   Reject a pending bot
  block <botId> [reason]    Block a bot
  unblock <botId>           Unblock a bot
  get <id|phone|handle>     Get bot details
  isbot <phone>             Check if phone is a registered bot
  list                      List all registered bots
  pending                   List pending approvals
  blocked                   List blocked bots
  stats <botId> <json>      Update bot stats
  trust <botId> <delta> [reason]  Update trust score
    `);
}
