#!/usr/bin/env node
// Score a suggestion in the "playing with alex bot" group
// Usage: node score-suggestion.js <jid> <name> <type> <description> <complexity> <ingenuity> <impact> <feasibility> <priority> [notes]

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
if (args.length < 9) {
    console.error('Usage: node score-suggestion.js <jid> <name> <type> <description> <complexity> <ingenuity> <impact> <feasibility> <priority> [notes]');
    console.error('Types: improvement | feature | security | bug | ux | other');
    process.exit(1);
}

let [jid, name, type, description, complexity, ingenuity, impact, feasibility, priority, ...notesArr] = args;
const notes = notesArr.join(' ') || '';

// IMPROVED: Normalize JID to prevent duplicates
// Always converts to +972XXXXXXXXX format for Israeli numbers
function normalizeJid(jid) {
    if (!jid) return null;
    
    // Remove any @s.whatsapp.net or @g.us suffix
    let clean = jid.replace(/@[^@]+$/, '');
    
    // Handle group JIDs - these should NEVER be used as user identifiers
    if (/^120\d{15}$/.test(clean)) {
        console.error(`ERROR: Received group ID instead of user JID: ${jid}`);
        console.error('Pass the sender phone number, not the group ID!');
        return null;
    }
    
    // Handle concatenated group_user format
    if (clean.includes('_')) {
        const parts = clean.split('_');
        for (const part of parts) {
            const normalized = normalizeJid(part);
            if (normalized && /^\+972\d{9}$/.test(normalized)) {
                return normalized;
            }
        }
    }
    
    // Remove any remaining non-digit characters except +
    clean = clean.replace(/[^\d+]/g, '');
    
    // Handle various formats
    if (clean.startsWith('+972')) return clean;
    if (clean.startsWith('972') && clean.length === 12) return '+' + clean;
    if (clean.startsWith('0') && clean.length === 10) return '+972' + clean.substring(1);
    if (/^\d{9}$/.test(clean)) return '+972' + clean;
    if (/^\d{10,15}$/.test(clean)) return '+' + clean;
    
    console.error(`WARNING: Could not fully normalize JID: ${jid} -> ${clean}`);
    return clean.startsWith('+') ? clean : '+' + clean;
}

jid = normalizeJid(jid);
if (!jid) {
    console.error('Invalid JID provided');
    process.exit(1);
}

// Validate type
const validTypes = ['improvement', 'feature', 'security', 'bug', 'ux', 'other'];
if (!validTypes.includes(type)) {
    console.error(`Invalid type: ${type}. Valid types: ${validTypes.join(', ')}`);
    process.exit(1);
}

const scores = {
    complexity: parseInt(complexity),
    ingenuity: parseInt(ingenuity),
    impact: parseInt(impact),
    feasibility: parseInt(feasibility),
    priority: parseInt(priority)
};

const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
const timestamp = new Date().toISOString();
const suggestionId = crypto.randomBytes(4).toString('hex');

const suggestionsFile = '/home/alexliv/.openclaw/workspace/memory/channels/playing-with-alexbot-suggestions.json';
const data = JSON.parse(fs.readFileSync(suggestionsFile, 'utf8'));

// Add new suggestion
const suggestion = {
    id: suggestionId,
    timestamp: timestamp,
    suggestedBy: {
        jid: jid,
        name: name
    },
    type: type,
    description: description,
    scores: scores,
    total: total,
    status: 'pending',
    notes: notes,
    implementedAt: null
};

data.suggestions.push(suggestion);

// Update stats
data.stats.total_suggestions += 1;
data.stats.by_type[type] = (data.stats.by_type[type] || 0) + 1;
data.stats.by_status['pending'] = (data.stats.by_status['pending'] || 0) + 1;

// Update suggester leaderboard
let suggesterEntry = data.suggester_leaderboard.find(s => s.jid === jid);
if (!suggesterEntry) {
    suggesterEntry = {
        jid: jid,
        name: name,
        total_suggestions: 0,
        total_score: 0,
        implemented_count: 0
    };
    data.suggester_leaderboard.push(suggesterEntry);
}
suggesterEntry.total_suggestions += 1;
suggesterEntry.total_score += total;

// Sort leaderboard by total score
data.suggester_leaderboard.sort((a, b) => b.total_score - a.total_score);

// Update timestamp
data.last_updated = timestamp;

// Write back
fs.writeFileSync(suggestionsFile, JSON.stringify(data, null, 2));

// Get type emoji
const typeEmojis = {
    improvement: '📈',
    feature: '✨',
    security: '🔒',
    bug: '🐛',
    ux: '🎨',
    other: '📝'
};

// Generate display for reply
const position = data.suggester_leaderboard.findIndex(entry => entry.jid === jid) + 1;
const userTotal = suggesterEntry.total_score;
const userSuggestions = suggesterEntry.total_suggestions;

const display = `
💡 **SUGGESTION RECEIVED!** ${typeEmojis[type]}

📋 **Type:** ${type.charAt(0).toUpperCase() + type.slice(1)}
📝 **Summary:** ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}

📊 **RATING: ${total}/50**
⚙️ Complexity: ${scores.complexity} | 💡 Ingenuity: ${scores.ingenuity} | 🚀 Impact: ${scores.impact}
✅ Feasibility: ${scores.feasibility} | 🔥 Priority: ${scores.priority}

⏳ **Status:** Pending review

🏆 Suggester Rank: #${position} | Total: ${userTotal} pts | Suggestions: ${userSuggestions}
`.trim();

console.log(display);
