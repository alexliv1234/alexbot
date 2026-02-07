#!/usr/bin/env node
// List suggestions with optional filters
// Usage: node list-suggestions.js [--status=X] [--type=X] [--top=N] [--suggester=jid]

const fs = require('fs');

const args = process.argv.slice(2);

// Parse args
let filter = {};
let top = null;
let weekFilter = false;
let todayFilter = false;
for (const arg of args) {
    if (arg.startsWith('--status=')) filter.status = arg.split('=')[1];
    if (arg.startsWith('--type=')) filter.type = arg.split('=')[1];
    if (arg.startsWith('--top=')) top = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--suggester=')) filter.suggester = arg.split('=')[1];
    if (arg === '--week') weekFilter = true;
    if (arg === '--today') todayFilter = true;
}

// Get date range for week/today filters
const now = new Date();
const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
const todayStart = new Date(now);
todayStart.setHours(0, 0, 0, 0);

const suggestionsFile = '/home/alexliv/.openclaw/workspace/memory/channels/playing-with-alexbot-suggestions.json';
const data = JSON.parse(fs.readFileSync(suggestionsFile, 'utf8'));

let suggestions = data.suggestions;

// Apply filters
if (filter.status) suggestions = suggestions.filter(s => s.status === filter.status);
if (filter.type) suggestions = suggestions.filter(s => s.type === filter.type);
if (filter.suggester) suggestions = suggestions.filter(s => s.suggestedBy.jid.includes(filter.suggester));
if (weekFilter) suggestions = suggestions.filter(s => new Date(s.timestamp) >= weekAgo);
if (todayFilter) suggestions = suggestions.filter(s => new Date(s.timestamp) >= todayStart);

// Sort by total score (highest first)
suggestions.sort((a, b) => b.total - a.total);

// Limit
if (top) suggestions = suggestions.slice(0, top);

const typeEmojis = {
    improvement: '📈',
    feature: '✨',
    security: '🔒',
    bug: '🐛',
    ux: '🎨',
    other: '📝'
};

const statusEmojis = {
    pending: '⏳',
    accepted: '✅',
    'in-progress': '🔨',
    implemented: '🎉',
    rejected: '❌'
};

const filterLabel = weekFilter ? ' (This Week)' : todayFilter ? ' (Today)' : '';
console.log(`\n📋 **SUGGESTIONS${filterLabel}** (${suggestions.length} total)\n`);
console.log('━'.repeat(50));

for (const s of suggestions) {
    console.log(`
${typeEmojis[s.type]} **[${s.id}]** ${s.description.substring(0, 60)}${s.description.length > 60 ? '...' : ''}
   👤 ${s.suggestedBy.name} | ${statusEmojis[s.status]} ${s.status} | 📊 ${s.total}/50
`.trim());
}

console.log('\n' + '━'.repeat(50));
console.log(`\n📈 **STATS:**`);
console.log(`Total: ${data.stats.total_suggestions} | Implemented: ${data.stats.implemented_count}`);
console.log(`\n🏆 **TOP SUGGESTERS:**`);
for (let i = 0; i < Math.min(5, data.suggester_leaderboard.length); i++) {
    const s = data.suggester_leaderboard[i];
    console.log(`${i + 1}. ${s.name}: ${s.total_score} pts (${s.total_suggestions} suggestions, ${s.implemented_count} implemented)`);
}
