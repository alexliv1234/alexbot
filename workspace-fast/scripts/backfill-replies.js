#!/usr/bin/env node
/**
 * Backfill bot replies into playing-with-alexbot-daily JSONL files
 * by extracting assistant messages from session transcript files.
 */

const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = '/home/alexliv/.openclaw/agents/main/sessions';
const DAILY_DIR = '/home/alexliv/.openclaw/workspace/memory/channels/playing-with-alexbot-daily';
const GROUP_ID = '120363405143589138';

// Step 1: Find all session transcripts with playing group content
function findPlayingGroupSessions() {
  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));
  const matching = [];
  
  for (const file of files) {
    const filePath = path.join(SESSIONS_DIR, file);
    const stat = fs.statSync(filePath);
    if (stat.size < 5000) continue; // Skip tiny files
    
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(GROUP_ID)) {
      matching.push(filePath);
    }
  }
  
  return matching;
}

// Step 2: Extract assistant replies from a session transcript
function extractReplies(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
  const replies = [];
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      
      // Session transcripts use: { type: "message", message: { role, content }, timestamp }
      const msg = entry.message || entry;
      const role = msg.role || entry.role;
      const content = msg.content || entry.content;
      const timestamp = entry.timestamp || msg.timestamp;
      
      // Look for assistant messages with text content
      if (role === 'assistant' && content) {
        let textContent = '';
        
        if (typeof content === 'string') {
          textContent = content;
        } else if (Array.isArray(content)) {
          for (const part of content) {
            if (part.type === 'text' && part.text) {
              textContent += part.text + '\n';
            }
          }
        }
        
        textContent = textContent.trim();
        
        // Skip empty, NO_REPLY, and HEARTBEAT_OK responses
        if (!textContent || textContent === 'NO_REPLY' || textContent === 'HEARTBEAT_OK') continue;
        
        // Must look like a group reply (contains 🤖 or score or relevant content)
        const isGroupReply = textContent.includes('🤖') || 
                            textContent.includes('SCORE') ||
                            textContent.includes('📊') ||
                            textContent.includes('reply_to') ||
                            textContent.length > 50;
        
        if (isGroupReply) {
          // Try to get timestamp from entry
          const ts = timestamp || entry.ts || null;
          replies.push({
            timestamp: ts,
            text: textContent.substring(0, 500), // Truncate for summary
            fullText: textContent
          });
        }
      }
    } catch (e) {
      // Skip unparseable lines
    }
  }
  
  return replies;
}

// Step 3: Parse existing daily JSONL to find entries without replies
function loadDailyLog(date) {
  const filePath = path.join(DAILY_DIR, `${date}.jsonl`);
  if (!fs.existsSync(filePath)) return [];
  
  return fs.readFileSync(filePath, 'utf8').trim().split('\n')
    .map((line, idx) => {
      try {
        return { ...JSON.parse(line), _lineIdx: idx, _raw: line };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// Step 4: Match replies to log entries by timestamp proximity
function matchAndBackfill(date, replies, logEntries) {
  // Convert reply timestamps to date-local times
  const dateReplies = replies.filter(r => {
    if (!r.timestamp) return false;
    const d = new Date(typeof r.timestamp === 'number' ? r.timestamp : r.timestamp);
    const dateStr = d.toISOString().split('T')[0];
    return dateStr === date;
  }).map(r => {
    const d = new Date(typeof r.timestamp === 'number' ? r.timestamp : r.timestamp);
    // Convert to Israel time
    const israelTime = new Date(d.getTime() + 2 * 60 * 60 * 1000); // UTC+2
    const hours = String(israelTime.getUTCHours()).padStart(2, '0');
    const minutes = String(israelTime.getUTCMinutes()).padStart(2, '0');
    return { ...r, localTime: `${hours}:${minutes}` };
  });
  
  if (dateReplies.length === 0) return 0;
  
  // Find log entries that DON'T already have a matching bot reply after them
  const botEntries = new Set(
    logEntries.filter(e => e.from === 'AlexLivBot').map(e => e.ts)
  );
  
  let added = 0;
  const filePath = path.join(DAILY_DIR, `${date}.jsonl`);
  
  for (const reply of dateReplies) {
    // Check if we already have a bot entry at this time
    if (botEntries.has(reply.localTime)) continue;
    
    // Extract who was being replied to from the text
    const replyToMatch = reply.text.match(/→\s*([^\*\n]+)/);
    const replyTo = replyToMatch ? replyToMatch[1].trim() : 'unknown';
    
    // Create summary (first meaningful line, max 200 chars)
    let summary = reply.text
      .replace(/\[\[reply_to_current\]\]/g, '')
      .replace(/🤖\s*\*\*→[^*]+\*\*/g, '')
      .replace(/📊\s*\*\*SCORE:.+$/ms, '[+score]')
      .trim()
      .split('\n')[0]
      .substring(0, 200);
    
    if (!summary) summary = reply.text.substring(0, 200);
    
    // Append bot reply entry
    const entry = JSON.stringify({
      ts: reply.localTime,
      from: 'AlexLivBot',
      phone: 'bot',
      msg: summary,
      replyTo: replyTo,
      backfilled: true
    });
    
    fs.appendFileSync(filePath, entry + '\n');
    botEntries.add(reply.localTime);
    added++;
  }
  
  return added;
}

// Main
function main() {
  console.log('🔍 Finding playing group session transcripts...');
  const sessions = findPlayingGroupSessions();
  console.log(`Found ${sessions.length} session files with playing group content`);
  
  // Collect all replies
  let allReplies = [];
  for (const session of sessions) {
    const replies = extractReplies(session);
    if (replies.length > 0) {
      console.log(`  ${path.basename(session)}: ${replies.length} replies`);
      allReplies = allReplies.concat(replies);
    }
  }
  
  console.log(`\n📊 Total replies found: ${allReplies.length}`);
  
  // Get available dates
  const dates = fs.readdirSync(DAILY_DIR)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => f.replace('.jsonl', ''));
  
  console.log(`\n📅 Daily log dates: ${dates.join(', ')}`);
  
  let totalAdded = 0;
  for (const date of dates) {
    const logEntries = loadDailyLog(date);
    const existingBotEntries = logEntries.filter(e => e.from === 'AlexLivBot').length;
    const added = matchAndBackfill(date, allReplies, logEntries);
    if (added > 0) {
      console.log(`  ${date}: +${added} replies backfilled (had ${existingBotEntries} bot entries)`);
    } else {
      console.log(`  ${date}: no new replies to add (${existingBotEntries} bot entries already)`);
    }
    totalAdded += added;
  }
  
  console.log(`\n✅ Done! Total backfilled: ${totalAdded} replies`);
}

main();
