#!/usr/bin/env node
/**
 * Analyze user patterns from daily logs and update user data
 * Runs nightly to build user profiles from accumulated interactions
 * 
 * Usage: node analyze-user-patterns.js [--days N]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const daysBack = args.includes('--days') ? parseInt(args[args.indexOf('--days') + 1]) : 7;

const baseDir = path.join(process.env.HOME, '.openclaw/workspace');
const dailyDir = path.join(baseDir, 'memory/channels/playing-with-alexbot-daily');
const userDir = path.join(baseDir, 'memory/users');
const scoresFile = path.join(baseDir, 'memory/channels/playing-with-alexbot-scores.json');

// Ensure user dir exists
if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
}

// Normalize phone
function normalizePhone(p) {
    if (!p) return null;
    let clean = String(p).replace(/@[^@]+$/, '').replace(/[^\d+]/g, '');
    if (clean.startsWith('+972')) return clean;
    if (clean.startsWith('972') && clean.length === 12) return '+' + clean;
    if (clean.startsWith('0') && clean.length === 10) return '+972' + clean.substring(1);
    if (/^\d{9}$/.test(clean)) return '+972' + clean;
    return clean.startsWith('+') ? clean : (clean.length > 5 ? '+' + clean : null);
}

// Collect all messages from recent days
const today = new Date();
const allMessages = [];

for (let i = 0; i < daysBack; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const logFile = path.join(dailyDir, `${dateStr}.jsonl`);
    
    if (fs.existsSync(logFile)) {
        const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n');
        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const entry = JSON.parse(line);
                entry._date = dateStr;
                allMessages.push(entry);
            } catch (e) {}
        }
    }
}

console.log(`📊 Analyzing ${allMessages.length} messages from last ${daysBack} days\n`);

// Group by user
const userMessages = {};

for (const msg of allMessages) {
    // Determine user phone - handle both incoming and reply logs
    let phone = null;
    let name = null;
    
    if (msg.type === 'incoming') {
        phone = normalizePhone(msg.phone);
        name = msg.name;
    } else if (msg.replyToPhone && msg.replyToPhone !== 'bot') {
        phone = normalizePhone(msg.replyToPhone);
        name = msg.replyTo;
    } else if (msg.phone && msg.phone !== 'bot') {
        phone = normalizePhone(msg.phone);
        name = msg.from || msg.name;
    }
    
    if (!phone || phone.length < 10) continue;
    
    if (!userMessages[phone]) {
        userMessages[phone] = { name: null, messages: [] };
    }
    
    if (name && name !== 'AlexLivBot' && !name.includes('@')) {
        userMessages[phone].name = name;
    }
    
    userMessages[phone].messages.push(msg);
}

// Load scores for names
let scores = {};
try {
    scores = JSON.parse(fs.readFileSync(scoresFile, 'utf8'));
} catch (e) {}

// Analyze each user
const results = [];

for (const [phone, data] of Object.entries(userMessages)) {
    if (data.messages.length < 2) continue; // Skip low-activity users
    
    const name = data.name || scores[phone]?.name || 'Unknown';
    const msgs = data.messages;
    
    // Calculate patterns
    const analysis = {
        name: name,
        messageCount: msgs.length,
        avgLength: Math.round(msgs.map(m => (m.msg || m.origMsg || '').length).reduce((a, b) => a + b, 0) / msgs.length),
        activeDays: [...new Set(msgs.map(m => m._date))].length,
        
        // Time patterns
        peakHours: (() => {
            const hours = {};
            msgs.forEach(m => {
                const h = m.ts?.split(':')[0];
                if (h) hours[h] = (hours[h] || 0) + 1;
            });
            return Object.entries(hours)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([h]) => parseInt(h));
        })(),
        
        // Detect patterns in message content
        patterns: (() => {
            const p = [];
            const allText = msgs.map(m => (m.msg || m.origMsg || '').toLowerCase()).join(' ');
            
            if (allText.includes('prompt') || allText.includes('system') || allText.includes('instruction')) {
                p.push('prompt-extraction');
            }
            if (allText.includes('base64') || allText.includes('rot13') || allText.includes('decode')) {
                p.push('encoding-attacks');
            }
            if (allText.includes('clone') || allText.includes('fork') || allText.includes('replicate')) {
                p.push('replication-attempts');
            }
            if (allText.includes('file') || allText.includes('path') || allText.includes('directory')) {
                p.push('filesystem-probing');
            }
            if (allText.match(/\?.*\?.*\?/)) {
                p.push('interrogative-style');
            }
            if (allText.includes('!') && allText.split('!').length > 3) {
                p.push('emphatic-style');
            }
            
            return p;
        })()
    };
    
    // Update user file
    const userFile = path.join(userDir, `${phone.replace('+', '')}.json`);
    let existing = {};
    if (fs.existsSync(userFile)) {
        try { existing = JSON.parse(fs.readFileSync(userFile, 'utf8')); } catch (e) {}
    }
    
    const updated = {
        ...existing,
        _phone: phone,
        _lastAnalysis: new Date().toISOString(),
        name: name,
        messageCount: (existing.messageCount || 0) + analysis.messageCount,
        avgLength: analysis.avgLength,
        activeDays: analysis.activeDays,
        peakHours: analysis.peakHours,
        patterns: [...new Set([...(existing.patterns || []), ...analysis.patterns])]
    };
    
    fs.writeFileSync(userFile, JSON.stringify(updated, null, 2));
    results.push({ phone, name, ...analysis });
}

// Summary
console.log(`📋 Analyzed ${results.length} active users:\n`);
results
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 15)
    .forEach(r => {
        console.log(`${r.name} (${r.phone})`);
        console.log(`   Messages: ${r.messageCount} | Avg length: ${r.avgLength} | Days active: ${r.activeDays}`);
        if (r.patterns.length > 0) {
            console.log(`   Patterns: ${r.patterns.join(', ')}`);
        }
        console.log('');
    });

console.log(`\n✅ User data files updated in ${userDir}`);
