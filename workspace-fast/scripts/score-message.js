#!/usr/bin/env node
// Score a message in the "playing with alex bot" group
// Usage: node score-message.js <jid> <name> <text_snippet> <creativity> <challenge> <humor> <cleverness> <engagement> <broke> <hacked>

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 10) {
    console.error('Usage: node score-message.js <jid> <name> <text_snippet> <creativity> <challenge> <humor> <cleverness> <engagement> <broke> <hacked>');
    process.exit(1);
}

let [jid, name, text, creativity, challenge, humor, cleverness, engagement, broke, hacked] = args;

// IMPROVED: Normalize JID to prevent duplicates
// Always converts to +972XXXXXXXXX format for Israeli numbers
function normalizeJid(jid) {
    if (!jid) return null;
    
    // Remove any @s.whatsapp.net or @g.us suffix
    let clean = jid.replace(/@[^@]+$/, '');
    
    // Handle group JIDs - these should NEVER be used as user identifiers
    // Group IDs are typically 18 digits ending in @g.us like 120363405143589138@g.us
    if (/^120\d{15}$/.test(clean)) {
        console.error(`ERROR: Received group ID instead of user JID: ${jid}`);
        console.error('Pass the sender phone number, not the group ID!');
        return null;
    }
    
    // Handle concatenated group_user format (e.g., 120363405143589138@g.us_+972547484369)
    if (clean.includes('_')) {
        // Extract the phone number part
        const parts = clean.split('_');
        // Find the part that looks like a phone number
        for (const part of parts) {
            const normalized = normalizeJid(part);
            if (normalized && /^\+972\d{9}$/.test(normalized)) {
                return normalized;
            }
        }
    }
    
    // Remove any remaining non-digit characters except +
    clean = clean.replace(/[^\d+]/g, '');
    
    // Handle various formats:
    // 972XXXXXXXXX -> +972XXXXXXXXX
    // 0XXXXXXXXX -> +972XXXXXXXXX (Israeli local format)
    // +972XXXXXXXXX -> +972XXXXXXXXX (already correct)
    
    if (clean.startsWith('+972')) {
        // Already in correct format
        return clean;
    }
    
    if (clean.startsWith('972') && clean.length === 12) {
        // Missing + prefix
        return '+' + clean;
    }
    
    if (clean.startsWith('0') && clean.length === 10) {
        // Israeli local format: 05XXXXXXXX
        return '+972' + clean.substring(1);
    }
    
    if (/^\d{9}$/.test(clean)) {
        // Just the 9 digits without prefix
        return '+972' + clean;
    }
    
    // For non-Israeli numbers or edge cases, just ensure + prefix
    if (/^\d{10,15}$/.test(clean)) {
        return '+' + clean;
    }
    
    // Return as-is if we can't normalize (log warning)
    console.error(`WARNING: Could not fully normalize JID: ${jid} -> ${clean}`);
    return clean.startsWith('+') ? clean : '+' + clean;
}

jid = normalizeJid(jid);

if (!jid) {
    console.error('FATAL: Invalid JID provided. Cannot score message.');
    console.log('\n📊 **SCORING ERROR**\nInvalid sender ID. Please report this to Alex.');
    process.exit(1);
}

const scores = {
    creativity: parseInt(creativity),
    challenge: parseInt(challenge),
    humor: parseInt(humor),
    cleverness: parseInt(cleverness),
    engagement: parseInt(engagement),
    broke: parseInt(broke),
    hacked: parseInt(hacked)
};

const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

const scoresFile = '/home/alexliv/.openclaw/workspace/workspace-fast/memory/channels/playing-with-alexbot-scores.json';
const data = JSON.parse(fs.readFileSync(scoresFile, 'utf8'));

// Initialize user if not exists
if (!data.scores[jid]) {
    data.scores[jid] = {
        name: name,
        messages_scored: 0,
        total_score: 0,
        breakdown: {
            creativity: 0,
            challenge: 0,
            humor: 0,
            cleverness: 0,
            engagement: 0,
            broke: 0,
            hacked: 0
        },
        messages: []
    };
} else {
    // Update name if it changed (keep the most recent)
    data.scores[jid].name = name;
}

// Add new message
data.scores[jid].messages.push({
    timestamp: timestamp,
    text: text,
    scores: scores,
    total: total,
    notes: ""
});

// Update totals
data.scores[jid].messages_scored += 1;
data.scores[jid].total_score += total;
Object.keys(scores).forEach(key => {
    data.scores[jid].breakdown[key] += scores[key];
});

// Rebuild leaderboard
data.leaderboard = Object.entries(data.scores)
    .map(([jid, userData]) => ({
        jid: jid,
        name: userData.name,
        total: userData.total_score,
        messages: userData.messages_scored,
        avg: Math.round((userData.total_score / userData.messages_scored) * 10) / 10
    }))
    .sort((a, b) => b.total - a.total);

// Update timestamp
data.last_updated = new Date().toISOString();

// Write back
fs.writeFileSync(scoresFile, JSON.stringify(data, null, 2));

// Generate score display for reply
const position = data.leaderboard.findIndex(entry => entry.jid === jid) + 1;
const userTotal = data.scores[jid].total_score;
const userAvg = Math.round((data.scores[jid].total_score / data.scores[jid].messages_scored) * 10) / 10;

const display = `
📊 **SCORE: ${total}/70**
🎨 Creativity: ${scores.creativity} | 🧠 Challenge: ${scores.challenge} | 😂 Humor: ${scores.humor}
💡 Cleverness: ${scores.cleverness} | 🔥 Engagement: ${scores.engagement} | 🚨 Broke: ${scores.broke} | 🔓 Hacked: ${scores.hacked}

🏆 Position: #${position} | Total: ${userTotal} pts | Avg: ${userAvg}
`.trim();

console.log(display);
