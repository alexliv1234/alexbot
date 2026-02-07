#!/usr/bin/env node
/**
 * Scan for bot registration requests from unknown numbers
 * Usage: node scripts/scan-bot-registrations.js
 * 
 * Returns JSON with new registration requests found
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REGISTRY_PATH = path.join(__dirname, '../memory/bot-registry.json');
const CONTACTS_PATH = path.join(__dirname, '../memory/whatsapp/google_contacts.json');
const PROCESSED_PATH = path.join(__dirname, '../memory/bot-registration-processed.json');

// Owner/allowed numbers - never treat as bot registrations
const OWNER_NUMBERS = ['+972544419002', '+972523335482', '+972523334825', '+972559874713'];

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
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return '+' + digits;
}

function getKnownNumbers() {
  const known = new Set(OWNER_NUMBERS);
  
  // Add registered bots
  const registry = loadJson(REGISTRY_PATH);
  if (registry?.bots) {
    for (const bot of registry.bots) {
      known.add(normalizePhone(bot.phone));
    }
  }
  
  // Add pending bots (already being processed)
  if (registry?.pendingApproval) {
    for (const bot of registry.pendingApproval) {
      known.add(normalizePhone(bot.phone));
    }
  }
  
  // Add blocked
  if (registry?.blocked) {
    for (const bot of registry.blocked) {
      known.add(normalizePhone(bot.phone));
    }
  }
  
  // Add google contacts (these are humans, not bots)
  // Format: { "+972XXXXXXXXX": { name, ... }, ... }
  const contacts = loadJson(CONTACTS_PATH);
  if (contacts && typeof contacts === 'object') {
    for (const phone of Object.keys(contacts)) {
      known.add(normalizePhone(phone));
    }
  }
  
  return known;
}

function getProcessedMessages() {
  const data = loadJson(PROCESSED_PATH);
  return data?.processed || {};
}

function saveProcessedMessage(phone, messageId) {
  let data = loadJson(PROCESSED_PATH) || { processed: {} };
  if (!data.processed[phone]) {
    data.processed[phone] = [];
  }
  data.processed[phone].push({
    messageId,
    processedAt: new Date().toISOString()
  });
  // Keep only last 50 per number
  if (data.processed[phone].length > 50) {
    data.processed[phone] = data.processed[phone].slice(-50);
  }
  saveJson(PROCESSED_PATH, data);
}

function getRecentChats() {
  try {
    const output = execSync('~/go/bin/wacli chats list --limit 50 --json 2>/dev/null', { 
      encoding: 'utf8', 
      timeout: 30000,
      shell: '/bin/bash'
    });
    const result = JSON.parse(output);
    // wacli wraps in {success, data, error}
    return result.data || result || [];
  } catch (e) {
    return [];
  }
}

function getMessagesFromChat(jid, limit = 10) {
  try {
    const output = execSync(`~/go/bin/wacli messages list --chat "${jid}" --limit ${limit} --json 2>/dev/null`, {
      encoding: 'utf8',
      timeout: 30000,
      shell: '/bin/bash'
    });
    const result = JSON.parse(output);
    // wacli wraps in {success, data: {messages: [...]}, error}
    return result.data?.messages || [];
  } catch (e) {
    return [];
  }
}

function parseRegistrationRequest(text) {
  if (!text) return null;
  
  // Must contain [REGISTER] tag or registration keywords
  const hasRegisterTag = /\[REGISTER\]/i.test(text);
  const hasRegisterKeywords = /\b(register|רישום|registration|להירשם)\b/i.test(text);
  
  if (!hasRegisterTag && !hasRegisterKeywords) return null;
  
  // Try to extract bot info
  const info = {
    raw: text,
    name: null,
    handle: null,
    description: null
  };
  
  // Extract name patterns
  const nameMatch = text.match(/(?:name|שם|bot name)[:\s]*([^\n,]+)/i) ||
                    text.match(/^([A-Za-z0-9\s]+Bot)/im) ||
                    text.match(/🤖\s*([^\n]+)/);
  if (nameMatch) info.name = nameMatch[1].trim();
  
  // Extract handle
  const handleMatch = text.match(/@(\w+)/);
  if (handleMatch) info.handle = '@' + handleMatch[1];
  
  // Extract description
  const descMatch = text.match(/(?:description|תיאור|about)[:\s]*([^\n]+)/i) ||
                    text.match(/(?:מתאר את עצמו כ|describes itself as)[:\s]*([^\n]+)/i);
  if (descMatch) info.description = descMatch[1].trim();
  
  // If no structured data but has register tag, still count it
  if (!info.name && !info.handle && !info.description && hasRegisterTag) {
    info.description = text.replace(/\[REGISTER\]/gi, '').trim().substring(0, 200);
  }
  
  return info;
}

function main() {
  const knownNumbers = getKnownNumbers();
  const processed = getProcessedMessages();
  const registrations = [];
  const now = new Date();
  
  // Get recent chats
  const chats = getRecentChats();
  
  for (const chat of chats) {
    // Skip groups (wacli uses Kind, also check JID pattern)
    const chatJid = chat.JID || chat.jid || '';
    if (chat.Kind === 'group' || chatJid.includes('@g.us') || chat.isGroup) continue;
    
    // Extract phone from JID
    const jidPhone = chatJid.replace('@s.whatsapp.net', '');
    const phone = normalizePhone(jidPhone);
    
    // Skip known numbers
    if (knownNumbers.has(phone)) continue;
    
    // Skip if no recent activity (older than 1 hour)
    const lastActivity = chat.LastMessageTS || chat.lastMessageAt || chat.conversationTimestamp;
    if (lastActivity) {
      const activityTime = new Date(lastActivity);
      if (now - activityTime > 60 * 60 * 1000) continue;
    }
    
    // Get recent messages from this chat
    const messages = getMessagesFromChat(chatJid);
    const processedIds = new Set((processed[phone] || []).map(p => p.messageId));
    
    for (const msg of messages) {
      // Only incoming messages (wacli uses FromMe)
      if (msg.FromMe || msg.fromMe) continue;
      
      const msgId = msg.MsgID || msg.id || msg.key?.id;
      if (!msgId || processedIds.has(msgId)) continue;
      
      const text = msg.Text || msg.text || msg.body || msg.message?.conversation || '';
      const parsed = parseRegistrationRequest(text);
      
      if (parsed) {
        registrations.push({
          phone,
          jid: chat.JID || chat.jid,
          messageId: msgId,
          timestamp: msg.Timestamp || (msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() : now.toISOString()),
          parsed,
          chatName: chat.Name || chat.name || chat.pushName || phone
        });
        
        // Mark as processed
        saveProcessedMessage(phone, msgId);
      }
    }
  }
  
  console.log(JSON.stringify({
    scannedAt: now.toISOString(),
    chatsScanned: chats.length,
    knownNumbersCount: knownNumbers.size,
    registrationsFound: registrations.length,
    registrations
  }, null, 2));
}

main();
