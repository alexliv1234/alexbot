#!/usr/bin/env node
/**
 * Bot Prefix Detection
 * 
 * Detects if a message is from a bot based on prefix/emoji patterns
 * 
 * Usage: node detect-bot-prefix.js "<message>"
 * 
 * Returns JSON:
 * {
 *   "isBot": true/false,
 *   "botName": "BotName" or null,
 *   "prefix": "[BotName]" or emoji,
 *   "cleanMessage": "message without prefix"
 * }
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_FILE = path.join(__dirname, '../memory/bot-registry.json');

// Common bot prefix patterns
const PREFIX_PATTERNS = [
  // Bracket patterns: [BotName], [Bot Name], etc.
  /^\[([^\]]+)\]\s*/,
  // Parenthesis: (BotName), (Bot Name)
  /^\(([^)]+)\)\s*/,
  // Emoji + name: 🤖 BotName, 🦾 BotName, etc.
  /^(🤖|🦾|🤝|💬|🔮|🧠|⚡|🎯)\s*([A-Za-z0-9א-ת]+)\s*[:|\-–—]\s*/,
  // Name with colon/dash: BotName: , BotName - 
  /^([A-Z][A-Za-z0-9]{2,})\s*[:|\-–—]\s*/,
  // Hebrew name with bracket: [שם_בוט]
  /^\[([א-ת\s]+)\]\s*/
];

// Detect bot prefix
function detectBotPrefix(message) {
  if (!message || typeof message !== 'string') {
    return { isBot: false, botName: null, prefix: null, cleanMessage: message };
  }
  
  // Try each pattern
  for (const pattern of PREFIX_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      let botName;
      let prefix = match[0];
      
      // Extract bot name based on pattern
      if (match[1] && match[2]) {
        // Emoji + name pattern
        botName = match[2];
      } else if (match[1]) {
        // Other patterns
        botName = match[1].trim();
      }
      
      // Clean up bot name
      if (botName) {
        botName = botName.trim();
        
        // Remove common bot suffixes
        botName = botName.replace(/\s*(bot|בוט|agent|עוזר)$/i, '').trim();
        
        const cleanMessage = message.substring(prefix.length).trim();
        
        return {
          isBot: true,
          botName,
          prefix: prefix.trim(),
          cleanMessage,
          pattern: pattern.toString()
        };
      }
    }
  }
  
  return { isBot: false, botName: null, prefix: null, cleanMessage: message };
}

// Check if bot is registered
function checkBotRegistration(botName, phone) {
  try {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    
    // Check by name, handle, or phone
    const bot = registry.bots.find(b => 
      b.name.toLowerCase() === botName.toLowerCase() ||
      b.handle === `@${botName.toLowerCase()}` ||
      b.phone === phone
    );
    
    if (bot) {
      return {
        registered: true,
        bot: {
          id: bot.id,
          name: bot.name,
          handle: bot.handle,
          trustLevel: bot.trustLevel,
          trustScore: bot.trustScore
        }
      };
    }
    
    return { registered: false };
  } catch (e) {
    return { registered: false, error: e.message };
  }
}

// CLI
const message = process.argv.slice(2).join(' ');

if (!message) {
  console.log(`
Bot Prefix Detection

Usage: node detect-bot-prefix.js "<message>"

Detects bot messages by prefix patterns:
  [BotName] message
  🤖 BotName: message
  BotName - message
  (BotName) message

Example:
  node detect-bot-prefix.js "[ברנרד] שלום, איך אני יכול לעזור?"
  `);
  process.exit(1);
}

const result = detectBotPrefix(message);
console.log(JSON.stringify(result, null, 2));
