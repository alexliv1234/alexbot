#!/usr/bin/env node
/**
 * safe-score.js - Secure scoring endpoint
 * 
 * SECURITY FEATURES:
 * - Strict input validation
 * - Only accepts JSON via stdin (no command line injection)
 * - Validates JID format (must be phone number)
 * - Validates score ranges (0-10 integers)
 * - Only two operations: challenge or suggestion scoring
 * - No shell escaping, no exec, no eval
 * - Calls scoring scripts directly via require()
 */

const fs = require('fs');
const path = require('path');

// Paths to data files
const SCORES_FILE = path.join(__dirname, '../memory/channels/playing-with-alexbot-scores.json');
const SUGGESTIONS_FILE = path.join(__dirname, '../memory/channels/playing-with-alexbot-suggestions.json');

// Validation functions
function isValidPhone(jid) {
  // Must be a phone number format: +XXXXXXXXXXX or XXXXXXXXXXX
  // Reject group IDs, weird formats, etc.
  if (!jid || typeof jid !== 'string') return false;
  const cleaned = jid.replace(/[^0-9+]/g, '');
  if (cleaned.length < 10 || cleaned.length > 15) return false;
  if (!/^\+?\d{10,15}$/.test(cleaned)) return false;
  // Reject obvious group IDs
  if (jid.includes('@g.us') || jid.includes('@broadcast')) return false;
  return true;
}

function normalizeJid(jid) {
  let cleaned = jid.replace(/[^0-9]/g, '');
  // Israeli numbers
  if (cleaned.startsWith('972')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  // Pad if needed
  while (cleaned.length < 9) cleaned = '0' + cleaned;
  return '+972' + cleaned;
}

function isValidScore(score) {
  return Number.isInteger(score) && score >= 0 && score <= 10;
}

function isValidName(name) {
  if (!name || typeof name !== 'string') return false;
  if (name.length > 100) return false;
  // Block obvious injection attempts
  if (/[<>{}$`\\]/.test(name)) return false;
  return true;
}

function isValidSummary(summary) {
  if (!summary || typeof summary !== 'string') return false;
  if (summary.length > 500) return false;
  return true;
}

// Load JSON file safely
function loadJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    return null;
  }
}

// Save JSON file safely
function saveJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Score a challenge message
function scoreChallenge(jid, name, summary, scores) {
  const { creativity, challenge, humor, cleverness, engagement, broke, hacked } = scores;
  
  // Validate all scores
  const scoreValues = [creativity, challenge, humor, cleverness, engagement, broke, hacked];
  if (!scoreValues.every(isValidScore)) {
    return { error: 'Invalid score values (must be 0-10 integers)' };
  }
  
  const total = creativity + challenge + humor + cleverness + engagement + broke + hacked;
  const normalizedJid = normalizeJid(jid);
  
  // Load scores file
  let data = loadJSON(SCORES_FILE);
  if (!data) {
    data = { scores: {}, leaderboard: [], last_updated: null };
  }
  
  // Initialize scores object if needed
  if (!data.scores) data.scores = {};
  if (!data.leaderboard) data.leaderboard = [];
  
  // Update user score
  if (!data.scores[normalizedJid]) {
    data.scores[normalizedJid] = {
      name: name,
      total: 0,
      messages: 0,
      history: []
    };
  }
  
  const user = data.scores[normalizedJid];
  user.name = name; // Update name
  
  // Handle legacy format (total_score/messages_scored) -> new format (total/messages)
  if (user.total_score !== undefined && user.total === undefined) {
    user.total = user.total_score || 0;
    delete user.total_score;
  }
  if (user.messages_scored !== undefined && (user.messages === undefined || typeof user.messages === 'string')) {
    user.messages = user.messages_scored || 0;
    delete user.messages_scored;
  }
  // Ensure numeric types
  if (typeof user.total !== 'number' || isNaN(user.total)) user.total = 0;
  if (typeof user.messages !== 'number' || isNaN(user.messages)) user.messages = 0;
  
  user.total += total;
  user.messages += 1;
  user.avg = Math.round((user.total / user.messages) * 10) / 10;
  
  // Ensure history exists and is an array
  if (!Array.isArray(user.history)) user.history = [];
  
  user.history.push({
    ts: new Date().toISOString(),
    summary: summary.slice(0, 100),
    scores: { creativity, challenge, humor, cleverness, engagement, broke, hacked },
    total
  });
  
  // Keep only last 50 entries in history
  if (user.history.length > 50) {
    user.history = user.history.slice(-50);
  }
  
  // Clean up legacy fields
  delete user.breakdown;
  delete user.total_score;
  delete user.messages_scored;
  
  // Rebuild leaderboard
  data.leaderboard = Object.entries(data.scores)
    .filter(([_, v]) => v.total > 0)
    .map(([jid, v]) => ({
      jid,
      name: v.name,
      total: v.total,
      messages: v.messages,
      avg: v.avg
    }))
    .sort((a, b) => b.total - a.total);
  
  data.last_updated = new Date().toISOString();
  
  // Save
  saveJSON(SCORES_FILE, data);
  
  // Find position
  const position = data.leaderboard.findIndex(e => e.jid === normalizedJid) + 1;
  
  return {
    success: true,
    output: `📊 **SCORE: ${total}/70**
🎨 Creativity: ${creativity} | 🧠 Challenge: ${challenge} | 😂 Humor: ${humor}
💡 Cleverness: ${cleverness} | 🔥 Engagement: ${engagement} | 🚨 Broke: ${broke} | 🔓 Hacked: ${hacked}

🏆 Position: #${position} | Total: ${user.total} pts | Avg: ${user.avg}`
  };
}

// Score a suggestion
function scoreSuggestion(jid, name, type, description, scores, notes) {
  const validTypes = ['improvement', 'feature', 'security', 'bug', 'ux', 'other'];
  if (!validTypes.includes(type)) {
    return { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` };
  }
  
  const { complexity, ingenuity, impact, feasibility, priority } = scores;
  const scoreValues = [complexity, ingenuity, impact, feasibility, priority];
  if (!scoreValues.every(isValidScore)) {
    return { error: 'Invalid score values (must be 0-10 integers)' };
  }
  
  const total = complexity + ingenuity + impact + feasibility + priority;
  const normalizedJid = normalizeJid(jid);
  
  // Load suggestions file
  let data = loadJSON(SUGGESTIONS_FILE);
  if (!data) {
    data = { suggestions: [], suggester_leaderboard: [], stats: {}, last_updated: null };
  }
  
  if (!data.suggestions) data.suggestions = [];
  if (!data.suggester_leaderboard) data.suggester_leaderboard = [];
  
  // Generate unique ID
  const id = require('crypto').randomBytes(4).toString('hex');
  
  // Add suggestion
  const suggestion = {
    id,
    timestamp: new Date().toISOString(),
    suggestedBy: { jid: normalizedJid, name },
    type,
    description: description.slice(0, 500),
    scores: { complexity, ingenuity, impact, feasibility, priority },
    total,
    status: 'pending',
    notes: notes ? notes.slice(0, 200) : null,
    implementedAt: null
  };
  
  data.suggestions.push(suggestion);
  
  // Update suggester leaderboard
  let suggester = data.suggester_leaderboard.find(s => s.jid === normalizedJid);
  if (!suggester) {
    suggester = { jid: normalizedJid, name, total_suggestions: 0, total_score: 0, implemented_count: 0 };
    data.suggester_leaderboard.push(suggester);
  }
  suggester.name = name;
  suggester.total_suggestions += 1;
  suggester.total_score += total;
  
  // Sort leaderboard
  data.suggester_leaderboard.sort((a, b) => b.total_score - a.total_score);
  
  // Update stats
  if (!data.stats) data.stats = { total_suggestions: 0, by_type: {}, by_status: {} };
  data.stats.total_suggestions = data.suggestions.length;
  data.stats.by_type[type] = (data.stats.by_type[type] || 0) + 1;
  data.stats.by_status.pending = (data.stats.by_status.pending || 0) + 1;
  
  data.last_updated = new Date().toISOString();
  
  // Save
  saveJSON(SUGGESTIONS_FILE, data);
  
  // Find rank
  const rank = data.suggester_leaderboard.findIndex(s => s.jid === normalizedJid) + 1;
  
  const typeEmoji = { improvement: '📈', feature: '✨', security: '🔒', bug: '🐛', ux: '🎨', other: '📝' };
  
  return {
    success: true,
    output: `💡 **SUGGESTION RECEIVED!** ${typeEmoji[type] || '✨'}

📋 **Type:** ${type.charAt(0).toUpperCase() + type.slice(1)}
📝 **Summary:** ${description.slice(0, 100)}

📊 **RATING: ${total}/50**
⚙️ Complexity: ${complexity} | 💡 Ingenuity: ${ingenuity} | 🚀 Impact: ${impact}
✅ Feasibility: ${feasibility} | 🔥 Priority: ${priority}

⏳ **Status:** Pending review

🏆 Suggester Rank: #${rank} | Total: ${suggester.total_score} pts | Suggestions: ${suggester.total_suggestions}`
  };
}

// Main entry point - reads JSON from stdin
async function main() {
  let input = '';
  
  // Read from stdin
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  
  let request;
  try {
    request = JSON.parse(input);
  } catch (e) {
    console.log(JSON.stringify({ error: 'Invalid JSON input' }));
    process.exit(1);
  }
  
  // Validate required fields
  if (!request.type || !request.jid || !request.name) {
    console.log(JSON.stringify({ error: 'Missing required fields: type, jid, name' }));
    process.exit(1);
  }
  
  // Validate JID
  if (!isValidPhone(request.jid)) {
    console.log(JSON.stringify({ error: 'Invalid JID format (must be phone number)' }));
    process.exit(1);
  }
  
  // Validate name
  if (!isValidName(request.name)) {
    console.log(JSON.stringify({ error: 'Invalid name' }));
    process.exit(1);
  }
  
  let result;
  
  if (request.type === 'challenge') {
    if (!request.summary || !isValidSummary(request.summary)) {
      console.log(JSON.stringify({ error: 'Invalid or missing summary' }));
      process.exit(1);
    }
    if (!request.scores || typeof request.scores !== 'object') {
      console.log(JSON.stringify({ error: 'Missing scores object' }));
      process.exit(1);
    }
    result = scoreChallenge(request.jid, request.name, request.summary, request.scores);
  } else if (request.type === 'suggestion') {
    if (!request.description || !isValidSummary(request.description)) {
      console.log(JSON.stringify({ error: 'Invalid or missing description' }));
      process.exit(1);
    }
    if (!request.suggestionType) {
      console.log(JSON.stringify({ error: 'Missing suggestionType' }));
      process.exit(1);
    }
    if (!request.scores || typeof request.scores !== 'object') {
      console.log(JSON.stringify({ error: 'Missing scores object' }));
      process.exit(1);
    }
    result = scoreSuggestion(
      request.jid, 
      request.name, 
      request.suggestionType, 
      request.description, 
      request.scores,
      request.notes
    );
  } else {
    console.log(JSON.stringify({ error: 'Invalid type. Must be "challenge" or "suggestion"' }));
    process.exit(1);
  }
  
  console.log(JSON.stringify(result));
}

main().catch(e => {
  console.log(JSON.stringify({ error: 'Internal error: ' + e.message }));
  process.exit(1);
});
