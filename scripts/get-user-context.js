#!/usr/bin/env node
/**
 * Get user context before replying
 * Usage: node get-user-context.js <phone> [--json]
 * 
 * Returns: User profile summary + recent interaction patterns
 */

const fs = require('fs');
const path = require('path');

const phone = process.argv[2];
const jsonOutput = process.argv.includes('--json');

if (!phone) {
    console.error('Usage: node get-user-context.js <phone> [--json]');
    process.exit(1);
}

// Normalize phone
function normalizePhone(p) {
    if (!p) return null;
    let clean = p.replace(/@[^@]+$/, '').replace(/[^\d+]/g, '');
    if (clean.startsWith('+972')) return clean;
    if (clean.startsWith('972') && clean.length === 12) return '+' + clean;
    if (clean.startsWith('0') && clean.length === 10) return '+972' + clean.substring(1);
    return clean.startsWith('+') ? clean : '+' + clean;
}

const normPhone = normalizePhone(phone);

// Paths
const baseDir = path.join(process.env.HOME, '.openclaw/workspace');
const profilesDir = path.join(baseDir, 'memory/.private/people');
const dailyDir = path.join(baseDir, 'memory/channels/playing-with-alexbot-daily');
const scoresFile = path.join(baseDir, 'memory/channels/playing-with-alexbot-scores.json');
const suggestionsFile = path.join(baseDir, 'memory/channels/playing-with-alexbot-suggestions.json');
const userDataDir = path.join(baseDir, 'memory/users');

// Load user-specific data file if exists
const userDataFile = path.join(userDataDir, `${normPhone.replace('+', '')}.json`);

let context = {
    phone: normPhone,
    profile: null,
    scores: null,
    suggestions: [],
    recentMessages: [],
    patterns: {
        totalMessages: 0,
        avgLength: 0,
        attackTypes: [],
        peakHours: [],
        topics: []
    },
    userData: null
};

// 1. Load profile if exists
try {
    const files = fs.readdirSync(profilesDir);
    for (const file of files) {
        if (!file.endsWith('.md') || file.startsWith('TEMPLATE') || file.startsWith('WORKFLOW') || file.startsWith('ANALYSIS')) continue;
        const content = fs.readFileSync(path.join(profilesDir, file), 'utf8');
        if (content.includes(normPhone) || content.includes(normPhone.replace('+', ''))) {
            context.profile = {
                file: file,
                content: content.substring(0, 2000) // First 2000 chars
            };
            break;
        }
    }
} catch (e) {}

// 2. Load scores
try {
    const scores = JSON.parse(fs.readFileSync(scoresFile, 'utf8'));
    if (scores[normPhone]) {
        context.scores = scores[normPhone];
    }
} catch (e) {}

// 3. Load suggestions by this user
try {
    const suggestions = JSON.parse(fs.readFileSync(suggestionsFile, 'utf8'));
    context.suggestions = suggestions.filter(s => normalizePhone(s.phone) === normPhone);
} catch (e) {}

// 4. Scan recent daily logs for this user
try {
    const today = new Date();
    const recentDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        recentDays.push(d.toISOString().split('T')[0]);
    }
    
    let allMessages = [];
    for (const day of recentDays) {
        const logFile = path.join(dailyDir, `${day}.jsonl`);
        if (fs.existsSync(logFile)) {
            const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n');
            for (const line of lines) {
                try {
                    const entry = JSON.parse(line);
                    const entryPhone = normalizePhone(entry.phone || entry.replyToPhone);
                    if (entryPhone === normPhone) {
                        allMessages.push({ ...entry, date: day });
                    }
                } catch (e) {}
            }
        }
    }
    
    context.recentMessages = allMessages.slice(-20); // Last 20 messages
    context.patterns.totalMessages = allMessages.length;
    
    if (allMessages.length > 0) {
        // Calculate avg message length
        const lengths = allMessages.map(m => (m.msg || m.origMsg || '').length);
        context.patterns.avgLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
        
        // Peak hours
        const hours = {};
        allMessages.forEach(m => {
            const h = m.ts ? m.ts.split(':')[0] : null;
            if (h) hours[h] = (hours[h] || 0) + 1;
        });
        context.patterns.peakHours = Object.entries(hours)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([h, c]) => `${h}:00 (${c})`);
    }
} catch (e) {}

// 5. Load user-specific learned data
try {
    if (fs.existsSync(userDataFile)) {
        context.userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
    }
} catch (e) {}

// Output
if (jsonOutput) {
    console.log(JSON.stringify(context, null, 2));
} else {
    console.log(`\n📋 USER CONTEXT: ${context.scores?.name || 'Unknown'} (${normPhone})`);
    console.log('─'.repeat(50));
    
    if (context.profile) {
        console.log(`\n📁 Profile: ${context.profile.file}`);
    }
    
    if (context.scores) {
        console.log(`\n🏆 Score: ${context.scores.total} points (${context.scores.count} interactions)`);
    }
    
    if (context.suggestions.length > 0) {
        console.log(`\n💡 Suggestions: ${context.suggestions.length} submitted`);
    }
    
    if (context.patterns.totalMessages > 0) {
        console.log(`\n📊 Patterns (last 7 days):`);
        console.log(`   Messages: ${context.patterns.totalMessages}`);
        console.log(`   Avg length: ${context.patterns.avgLength} chars`);
        console.log(`   Peak hours: ${context.patterns.peakHours.join(', ')}`);
    }
    
    if (context.userData) {
        console.log(`\n🧠 Learned traits:`);
        Object.entries(context.userData).forEach(([k, v]) => {
            if (typeof v === 'object') {
                console.log(`   ${k}: ${JSON.stringify(v)}`);
            } else {
                console.log(`   ${k}: ${v}`);
            }
        });
    }
    
    console.log('');
}
