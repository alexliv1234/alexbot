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
const readline = require('readline');

const GROUP_SESSION_KEY = 'agent:main:whatsapp:group:120363405143589138@g.us';
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
  /exceeded.*limit/i,
  /cannot.*handle/i,
  /fatal.*error/i
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

async function getSessionTranscript() {
  // Read session info to find transcript file
  const sessionDir = path.join(process.env.HOME, '.openclaw/agents/main/sessions');
  const sessionsFile = path.join(sessionDir, 'sessions.json');
  
  if (!fs.existsSync(sessionsFile)) {
    console.log('No sessions file found');
    return [];
  }
  
  const sessions = loadJSON(sessionsFile, {});
  const groupSession = sessions[GROUP_SESSION_KEY];
  
  if (!groupSession) {
    console.log('No session found for playing group');
    return [];
  }
  
  const transcriptFile = groupSession.sessionFile || 
    path.join(sessionDir, `${groupSession.sessionId}.jsonl`);
  
  if (!fs.existsSync(transcriptFile)) {
    console.log(`Transcript file not found: ${transcriptFile}`);
    return [];
  }
  
  // Read JSONL file line by line
  const messages = [];
  const fileStream = fs.createReadStream(transcriptFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'message' && entry.message) {
        messages.push(entry.message);
      }
    } catch (err) {
      // Skip invalid lines
    }
  }
  
  return messages;
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
    if (msg.role === 'user') {
      // Extract sender info from message metadata if available
      const sender = msg.sender || msg.from || {};
      return {
        phone: sender.phone || sender.id || 'unknown',
        name: sender.name || sender.pushName || 'Unknown',
        message: Array.isArray(msg.content) 
          ? msg.content.find(c => c.type === 'text')?.text || ''
          : msg.content || ''
      };
    }
  }
  return null;
}

function normalizePhone(phone) {
  if (!phone || phone === 'unknown') return null;
  // Remove @s.whatsapp.net suffix
  phone = phone.replace(/@s\.whatsapp\.net$/, '');
  // Ensure it starts with +
  if (!phone.startsWith('+')) {
    phone = '+' + phone;
  }
  return phone;
}

async function main() {
  console.log('🔍 Checking for crash victims...');
  
  const messages = await getSessionTranscript();
  if (messages.length === 0) {
    console.log('No messages to check');
    return;
  }
  
  console.log(`📋 Found ${messages.length} messages in transcript`);
  
  const brokeScores = loadJSON(BROKE_SCORES_FILE, {});
  const processedErrors = loadJSON(PROCESSED_ERRORS_FILE, []);
  
  let newErrorsFound = 0;
  const newVictims = [];
  
  // Scan for error messages
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (isErrorMessage(msg)) {
      const errorId = `${i}_${msg.timestamp || Date.now()}`;
      
      // Check if we already processed this error
      if (processedErrors.includes(errorId)) {
        continue;
      }
      
      const culprit = findCulprit(messages, i);
      if (culprit) {
        const phone = normalizePhone(culprit.phone);
        
        if (!phone) {
          console.log(`⚠️  Could not identify phone for culprit: ${culprit.name}`);
          continue;
        }
        
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

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
