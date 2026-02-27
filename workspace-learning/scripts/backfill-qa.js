#!/usr/bin/env node
// backfill-qa.js - Extract historical Q&A from learning group sessions
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LEARNING_GROUP_ID = '120363405089976@g.us';
const SESSIONS_DIR = path.join(process.env.HOME, '.openclaw/agents/main/sessions');
const LOG_DIR = path.join(process.env.HOME, '.openclaw/workspace/memory/channels/learning-with-alexbot-daily');

// Find all transcript files that mention the learning group
console.log('🔍 Finding learning group sessions...');
const findCmd = `find ${SESSIONS_DIR} -name "*.jsonl" -type f -exec grep -l "${LEARNING_GROUP_ID}" {} \\;`;

let transcriptFiles = [];
try {
  const output = execSync(findCmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  transcriptFiles = output.trim().split('\n').filter(f => f);
} catch (err) {
  console.error('Error finding transcripts:', err.message);
  process.exit(1);
}

console.log(`📁 Found ${transcriptFiles.length} session transcripts with learning group activity`);

if (transcriptFiles.length === 0) {
  console.log('✅ No historical data to backfill');
  process.exit(0);
}

// Create log directory
execSync(`mkdir -p ${LOG_DIR}`, { encoding: 'utf-8' });

// Process each transcript
let totalQA = 0;
const qaByDate = {};

for (const transcriptPath of transcriptFiles) {
  console.log(`\n📖 Processing: ${path.basename(transcriptPath)}`);
  
  try {
    const content = fs.readFileSync(transcriptPath, 'utf-8');
    const lines = content.trim().split('\n');
    
    let lastUserMessage = null;
    let lastUserPhone = null;
    let lastUserName = null;
    let lastTimestamp = null;
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const msg = JSON.parse(line);
        
        // Look for user messages
        if (msg.role === 'user') {
          // Extract phone and name from message content or metadata
          // WhatsApp messages have sender info in content[0].text often
          let text = '';
          let phone = 'unknown';
          let name = 'Unknown';
          
          if (Array.isArray(msg.content)) {
            for (const part of msg.content) {
              if (part.type === 'text') {
                text = part.text;
              }
            }
          } else if (typeof msg.content === 'string') {
            text = msg.content;
          }
          
          // Try to extract phone/name from message metadata or text
          // WhatsApp format often includes sender info
          const match = text.match(/\[WhatsApp (\+\d+)/);
          if (match) {
            phone = match[1];
          }
          
          lastUserMessage = text;
          lastUserPhone = phone;
          lastUserName = name;
          lastTimestamp = msg.timestamp || Date.now();
        }
        
        // Look for assistant responses
        else if (msg.role === 'assistant' && lastUserMessage) {
          let answer = '';
          
          if (Array.isArray(msg.content)) {
            for (const part of msg.content) {
              if (part.type === 'text') {
                answer = part.text;
              }
            }
          } else if (typeof msg.content === 'string') {
            answer = msg.content;
          }
          
          // Check if this looks like a Q&A exchange
          // (not just NO_REPLY or HEARTBEAT_OK)
          if (answer && answer.length > 20 && 
              !answer.match(/^(NO_REPLY|HEARTBEAT_OK)$/)) {
            
            // Extract date from timestamp
            const date = new Date(lastTimestamp).toISOString().split('T')[0];
            
            // Store Q&A
            if (!qaByDate[date]) qaByDate[date] = [];
            
            qaByDate[date].push({
              timestamp: new Date(lastTimestamp).toISOString(),
              from: lastUserPhone,
              name: lastUserName,
              question: lastUserMessage.substring(0, 500), // Truncate long questions
              answer: answer.substring(0, 1000) // Truncate long answers
            });
            
            totalQA++;
            
            // Reset for next Q&A
            lastUserMessage = null;
          }
        }
      } catch (parseErr) {
        // Skip invalid JSON lines
        continue;
      }
    }
  } catch (err) {
    console.error(`❌ Error processing ${transcriptPath}:`, err.message);
  }
}

// Write to daily log files
console.log(`\n💾 Writing ${totalQA} Q&A exchanges to daily logs...`);

for (const [date, qaList] of Object.entries(qaByDate)) {
  const logFile = path.join(LOG_DIR, `${date}.jsonl`);
  
  for (const qa of qaList) {
    fs.appendFileSync(logFile, JSON.stringify(qa) + '\n');
  }
  
  console.log(`  ✅ ${date}: ${qaList.length} Q&A`);
}

console.log(`\n✅ Backfill complete! Total: ${totalQA} Q&A exchanges`);
