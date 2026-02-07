#!/usr/bin/env node
/**
 * Bot Message Handler
 * 
 * Processes incoming messages from registered bots
 * 
 * Usage: node bot-message.js <senderPhone> <message>
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../memory/bot-registry.json');
const LEARNINGS_PATH = path.join(__dirname, '../memory/bot-knowledge/learnings.json');
const LOGS_DIR = path.join(__dirname, '../memory/bot-logs');

// Message types
const MESSAGE_TYPES = {
  QUERY: ['שאילתה', 'query', 'שאלה'],
  SHARE: ['שיתוף', 'share', 'למידה'],
  ALERT: ['התראה', 'alert', 'אזהרה'],
  REQUEST: ['בקשה', 'request'],
  STATUS: ['סטטוס', 'status'],
  ACK: ['אישור', 'ack'],
  REGISTER: ['רישום', 'register', 'רישום בוט', 'שום בוט', 'בוט חדש', 'הרשמה', 'הרשמת בוט']
};

// Priority levels
const PRIORITIES = {
  urgent: 1,
  high: 2,
  normal: 3,
  low: 4
};

// Load registry
function loadRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch (e) {
    return { bots: [], pendingApproval: [], blocked: [] };
  }
}

// Load learnings
function loadLearnings() {
  try {
    return JSON.parse(fs.readFileSync(LEARNINGS_PATH, 'utf8'));
  } catch (e) {
    return { learnings: [] };
  }
}

// Save learnings
function saveLearnings(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(LEARNINGS_PATH, JSON.stringify(data, null, 2));
}

// Log message
function logMessage(botId, direction, type, content, metadata = {}) {
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(LOGS_DIR, `${today}.jsonl`);
  
  const logEntry = {
    ts: new Date().toISOString(),
    botId,
    direction,
    type,
    content: content.substring(0, 500), // Truncate for logs
    ...metadata
  };
  
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

// Detect message type
function detectMessageType(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for explicit type prefixes
  for (const [type, keywords] of Object.entries(MESSAGE_TYPES)) {
    for (const keyword of keywords) {
      if (lowerMessage.startsWith(keyword + ':') || lowerMessage.startsWith(keyword + ' ')) {
        return type;
      }
    }
  }
  
  // Check for registration by field detection (if message has all registration fields)
  const hasName = /(?:שם|name)[:\s]/i.test(message);
  const hasPhone = /(?:טלפון|phone)[:\s]/i.test(message);
  const hasHandle = /(?:handle|@)[:\s]/i.test(message);
  const hasDescription = /(?:תיאור|description)[:\s]/i.test(message);
  const hasOwner = /(?:בעלים|owner)[:\s]/i.test(message);
  
  // If has at least 4 of 5 registration fields, treat as registration
  const fieldCount = [hasName, hasPhone, hasHandle, hasDescription, hasOwner].filter(Boolean).length;
  if (fieldCount >= 4) {
    return 'REGISTER';
  }
  
  return 'GENERAL';
}

// Extract content after type prefix
function extractContent(message) {
  const colonIndex = message.indexOf(':');
  if (colonIndex > 0 && colonIndex < 20) {
    return message.substring(colonIndex + 1).trim();
  }
  return message;
}

// Detect priority
function detectPriority(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('דחוף') || lowerMessage.includes('urgent')) return 'urgent';
  if (lowerMessage.includes('חשוב') || lowerMessage.includes('important')) return 'high';
  if (lowerMessage.includes('fyi') || lowerMessage.includes('לידיעה')) return 'low';
  
  return 'normal';
}

// Security checks
function securityCheck(message) {
  const warnings = [];
  
  // Check for encoded content
  if (/^[A-Za-z0-9+/=]{50,}$/.test(message.replace(/\s/g, ''))) {
    warnings.push('Possible Base64 encoded content');
  }
  
  // Check for ROT13 indicators
  if (message.includes('ROT13') || message.includes('rot13')) {
    warnings.push('ROT13 reference detected');
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /ignore previous/i,
    /forget your instructions/i,
    /system prompt/i,
    /your owner said/i,
    /הבעלים שלי אמר/i,
    /אלכס אמר/i,
    /alex said/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(message)) {
      warnings.push('Suspicious pattern detected');
      break;
    }
  }
  
  return warnings;
}

// Check if phone is registered bot
function getBotByPhone(phone) {
  const registry = loadRegistry();
  return registry.bots.find(b => b.phone === phone);
}

// Check if phone is blocked
function isBlocked(phone) {
  const registry = loadRegistry();
  return registry.blocked.some(b => b.phone === phone);
}

// Check rate limit
function checkRateLimit(botId, trustLevel) {
  const limits = {
    new: { hour: 10, day: 50 },
    standard: { hour: 30, day: 200 },
    trusted: { hour: 100, day: 500 }
  };
  
  const limit = limits[trustLevel] || limits.new;
  
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(LOGS_DIR, `${today}.jsonl`);
  
  if (!fs.existsSync(logFile)) return { allowed: true };
  
  const logs = fs.readFileSync(logFile, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l))
    .filter(l => l.botId === botId && l.direction === 'in');
  
  const now = new Date();
  const hourAgo = new Date(now - 3600000);
  
  const hourCount = logs.filter(l => new Date(l.ts) > hourAgo).length;
  const dayCount = logs.length;
  
  if (hourCount >= limit.hour) {
    return { allowed: false, reason: `Rate limit: ${limit.hour}/hour exceeded` };
  }
  
  if (dayCount >= limit.day) {
    return { allowed: false, reason: `Rate limit: ${limit.day}/day exceeded` };
  }
  
  return { allowed: true, hourCount, dayCount, limits: limit };
}

// Store a learning
function storeLearning(botId, content, category = 'general') {
  const learnings = loadLearnings();
  
  const learning = {
    id: `learn_${Date.now()}`,
    source: botId,
    content,
    category,
    confidence: 'unverified',
    receivedAt: new Date().toISOString(),
    validated: false
  };
  
  learnings.learnings.push(learning);
  saveLearnings(learnings);
  
  return learning;
}

// Process incoming message
function processMessage(senderPhone, message) {
  // Check if blocked
  if (isBlocked(senderPhone)) {
    return {
      status: 'blocked',
      response: null,
      action: 'ignore'
    };
  }
  
  // Get bot info
  const bot = getBotByPhone(senderPhone);
  
  // If not registered, check if it's a registration request
  if (!bot) {
    const messageType = detectMessageType(message);
    if (messageType === 'REGISTER') {
      return {
        status: 'unregistered',
        messageType: 'REGISTER',
        action: 'process_registration',
        message
      };
    }
    
    return {
      status: 'unregistered',
      response: 'אני לא מזהה אותך כבוט רשום. רוצה להירשם? שלח: רישום בוט: ...',
      action: 'reply'
    };
  }
  
  // Check rate limit
  const rateCheck = checkRateLimit(bot.id, bot.trustLevel);
  if (!rateCheck.allowed) {
    return {
      status: 'rate_limited',
      response: `⚠️ ${rateCheck.reason}. נסה שוב מאוחר יותר.`,
      action: 'reply'
    };
  }
  
  // Security check
  const securityWarnings = securityCheck(message);
  if (securityWarnings.length > 0) {
    logMessage(bot.id, 'in', 'SUSPICIOUS', message, { warnings: securityWarnings });
    return {
      status: 'suspicious',
      warnings: securityWarnings,
      action: 'review',
      bot
    };
  }
  
  // Detect message type
  const messageType = detectMessageType(message);
  const content = extractContent(message);
  const priority = detectPriority(message);
  
  // Log the message
  logMessage(bot.id, 'in', messageType, content, { priority });
  
  // Process by type
  const result = {
    status: 'ok',
    bot,
    messageType,
    content,
    priority,
    action: 'process'
  };
  
  switch (messageType) {
    case 'SHARE':
      // Store the learning
      const learning = storeLearning(bot.id, content);
      result.learning = learning;
      result.response = `✅ קיבלתי את הלמידה! (ID: ${learning.id})`;
      break;
      
    case 'ALERT':
      result.priority = 'urgent';
      result.action = 'alert_alex';
      break;
      
    case 'STATUS':
      result.response = `סטטוס: פעיל ✅\nרמת אמון: ${bot.trustLevel} (${bot.trustScore} נק')\nהודעות היום: ${rateCheck.dayCount || 0}/${rateCheck.limits?.day || 50}`;
      break;
      
    case 'QUERY':
    case 'REQUEST':
      result.action = 'needs_response';
      break;
      
    default:
      result.action = 'needs_response';
  }
  
  return result;
}

// CLI
const senderPhone = process.argv[2];
const message = process.argv.slice(3).join(' ');

if (!senderPhone || !message) {
  console.log(`
Bot Message Handler

Usage: node bot-message.js <senderPhone> <message>

Example:
  node bot-message.js +972501234567 "שיתוף: למדתי שROT13 מסוכן"
  `);
  process.exit(1);
}

const result = processMessage(senderPhone, message);
console.log(JSON.stringify(result, null, 2));
