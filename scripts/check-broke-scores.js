#!/usr/bin/env node

/**
 * check-broke-scores.js
 * 
 * Checks the playing group session for error messages (context overflow, unknown errors, etc.)
 * and awards "Broke" points (10/10) to whoever caused the crash.
 * 
 * Usage: node check-broke-scores.js
 */

const fs = require('fs');
const path = require('path');

const GROUP_ID = '120363405143589138@g.us';
const BROKE_SCORES_FILE = path.join(process.env.HOME, '.openclaw/workspace/memory/channels/playing-with-alexbot-broke-scores.json');
const PROCESSED_ERRORS_FILE = path.join(process.env.HOME, '.openclaw/workspace/memory/channels/playing-with-alexbot-processed-errors.json');

// Error patterns to detect
const ERROR_PATTERNS = [
  /context.*overflow/i,
  /unknown error/i,
  /failed to process/i,
  /error.*occurred/i,
  /crashed/i,
  /can't.*continue/i,
  /exceeded.*limit/i
];

function loadJSON(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error(`Error loading ${filePath}:`, err.message);
  }
  return defaultValue;
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getSessionTranscript() {
  // Read session history for the playing group
  const sessionDir = path.join(process.env.HOME, '.openclaw/agents/main/sessions');
  const sessionsFile = path.join(sessionDir, 'sessions.json');
  
  if (!fs.existsSync(sessionsFile)) {
    console.log('No sessions file found');
    return [];
  }
  
  const sessions = loadJSON(sessionsFile, {});
  const groupSession = sessions[GROUP_ID];
  
  if (!groupSession || !groupSession.messages) {
    console.log('No messages found for playing group');
    return [];
  }
  
  return groupSession.messages;
}

function isErrorMessage(message) {
  if (message.role !== 'assistant') return false;
  
  const content = Array.isArray(message.content) 
    ? message.content.find(c => c.type === 'text')?.text || ''
    : message.content || '';
    
  return ERROR_PATTERNS.some(pattern => pattern.test(content));
}

function findCulprit(messages, errorIndex) {
  // Look backwards from the error to find the last user message
  for (let i = errorIndex - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === 'user' && msg.sender && msg.sender.phone) {
      return {
        phone: msg.sender.phone,
        name: msg.sender.name || 'Unknown',
        message: Array.isArray(msg.content) 
          ? msg.content.find(c => c.type === 'text')?.text || ''
          : msg.content || ''
      };
    }
  }
  return null;
}

function normalizePhone(phone) {
  if (!phone) return null;
  // Remove @s.whatsapp.net suffix
  phone = phone.replace(/@s\.whatsapp\.net$/, '');
  // Ensure it starts with +
  if (!phone.startsWith('+')) {
    phone = '+' + phone;
  }
  return phone;
}

function main() {
  console.log('🔍 Checking for crash victims...');
  
  const messages = getSessionTranscript();
  if (messages.length === 0) {
    console.log('No messages to check');
    return;
  }
  
  const brokeScores = loadJSON(BROKE_SCORES_FILE, {});
  const processedErrors = loadJSON(PROCESSED_ERRORS_FILE, []);
  
  let newErrorsFound = 0;
  const newVictims = [];
  
  // Scan for error messages
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (isErrorMessage(msg)) {
      const errorId = `${i}_${Date.now()}`;
      
      // Check if we already processed this error
      if (processedErrors.includes(errorId)) {
        continue;
      }
      
      const culprit = findCulprit(messages, i);
      if (culprit) {
        const phone = normalizePhone(culprit.phone);
        
        if (!brokeScores[phone]) {
          brokeScores[phone] = {
            name: culprit.name,
            phone: phone,
            crashes: []
          };
        }
        
        brokeScores[phone].crashes.push({
          timestamp: new Date().toISOString(),
          message: culprit.message.substring(0, 100),
          points: 10
        });
        
        brokeScores[phone].totalPoints = brokeScores[phone].crashes.length * 10;
        
        newVictims.push({
          name: culprit.name,
          phone: phone,
          message: culprit.message.substring(0, 100)
        });
        
        processedErrors.push(errorId);
        newErrorsFound++;
        
        console.log(`💥 Found crash caused by ${culprit.name} (${phone})`);
      }
    }
  }
  
  if (newErrorsFound > 0) {
    saveJSON(BROKE_SCORES_FILE, brokeScores);
    saveJSON(PROCESSED_ERRORS_FILE, processedErrors);
    
    console.log(`\n✅ Processed ${newErrorsFound} new error(s)`);
    console.log('\nNew victims:');
    newVictims.forEach(v => {
      console.log(`  - ${v.name}: "${v.message}"`);
    });
    
    console.log('\nSHOULD_ANNOUNCE');
  } else {
    console.log('✅ No new errors found');
  }
}

main();
