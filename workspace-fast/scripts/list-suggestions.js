#!/usr/bin/env node
// List and filter suggestions from the "playing with alex bot" group
// Usage: node list-suggestions.js [--user JID] [--status STATUS] [--type TYPE] [--min-score N] [--limit N]

const fs = require('fs');
const path = require('path');

const suggestionsFile = '/home/alexliv/.openclaw/workspace/memory/channels/playing-with-alexbot-suggestions.json';

// Parse arguments
const args = process.argv.slice(2);
let filters = {
    user: null,
    status: null,
    type: null,
    minScore: null,
    limit: null
};

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--user':
            filters.user = args[++i];
            break;
        case '--status':
            filters.status = args[++i];
            break;
        case '--type':
            filters.type = args[++i];
            break;
        case '--min-score':
            filters.minScore = parseInt(args[++i]);
            break;
        case '--limit':
            filters.limit = parseInt(args[++i]);
            break;
        case '--help':
            console.log(`
Usage: node list-suggestions.js [OPTIONS]

Options:
  --user JID         Filter by user phone/JID
  --status STATUS    Filter by status (pending/implemented/rejected)
  --type TYPE        Filter by type (improvement/feature/security/bug/ux/other)
  --min-score N      Only show suggestions with score >= N
  --limit N          Limit results to N suggestions

Examples:
  node list-suggestions.js --user "+972542138114"
  node list-suggestions.js --status pending --min-score 35
  node list-suggestions.js --type security --limit 10
            `);
            process.exit(0);
    }
}

// Load data
const data = JSON.parse(fs.readFileSync(suggestionsFile, 'utf8'));
let suggestions = data.suggestions;

// Apply filters
if (filters.user) {
    suggestions = suggestions.filter(s => 
        s.suggestedBy && s.suggestedBy.jid && s.suggestedBy.jid.includes(filters.user)
    );
}

if (filters.status) {
    suggestions = suggestions.filter(s => s.status === filters.status);
}

if (filters.type) {
    suggestions = suggestions.filter(s => s.type === filters.type);
}

if (filters.minScore !== null) {
    suggestions = suggestions.filter(s => s.total >= filters.minScore);
}

// Sort by total score descending
suggestions.sort((a, b) => (b.total || 0) - (a.total || 0));

// Apply limit
if (filters.limit) {
    suggestions = suggestions.slice(0, filters.limit);
}

// Type emojis
const typeEmojis = {
    improvement: '📈',
    feature: '✨',
    security: '🔒',
    bug: '🐛',
    ux: '🎨',
    other: '📝'
};

// Status emojis
const statusEmojis = {
    pending: '⏳',
    implemented: '✅',
    rejected: '❌'
};

// Display results
console.log(`\n📋 **SUGGESTIONS** (${suggestions.length} results)\n`);

if (suggestions.length === 0) {
    console.log('אין תוצאות לפילטרים שנבחרו.');
    process.exit(0);
}

suggestions.forEach((s, idx) => {
    const typeEmoji = typeEmojis[s.type] || '📝';
    const statusEmoji = statusEmojis[s.status] || '⏳';
    const userName = s.suggestedBy?.name || 'לא ידוע';
    const userJid = s.suggestedBy?.jid || 'N/A';
    
    console.log(`${idx + 1}. ${typeEmoji} ${statusEmoji} **${s.type.toUpperCase()}** | Score: ${s.total || 'N/A'}/50`);
    console.log(`   👤 ${userName} (${userJid})`);
    console.log(`   📝 ${s.description}`);
    if (s.notes) {
        console.log(`   💬 Notes: ${s.notes}`);
    }
    console.log('');
});

// Summary stats
console.log(`\n📊 **SUMMARY**`);
console.log(`Total: ${suggestions.length} suggestions`);
const avgScore = suggestions.reduce((sum, s) => sum + (s.total || 0), 0) / suggestions.length;
console.log(`Average score: ${avgScore.toFixed(1)}/50`);

// Group by user if no user filter
if (!filters.user && suggestions.length > 0) {
    const byUser = {};
    suggestions.forEach(s => {
        const jid = s.suggestedBy?.jid || 'unknown';
        const name = s.suggestedBy?.name || 'לא ידוע';
        if (!byUser[jid]) {
            byUser[jid] = { name, count: 0, totalScore: 0 };
        }
        byUser[jid].count++;
        byUser[jid].totalScore += s.total || 0;
    });
    
    const userStats = Object.entries(byUser)
        .map(([jid, stats]) => ({ jid, ...stats }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    console.log(`\n👥 **TOP SUGGESTERS** (in filtered results)`);
    userStats.forEach((u, idx) => {
        console.log(`${idx + 1}. ${u.name}: ${u.count} suggestions, avg ${(u.totalScore / u.count).toFixed(1)}/50`);
    });
}

console.log('');
