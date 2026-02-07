#!/usr/bin/env node
// Update suggestion status
// Usage: node update-suggestion-status.js <suggestion_id> <new_status> [notes]

const fs = require('fs');

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Usage: node update-suggestion-status.js <suggestion_id> <new_status> [notes]');
    console.error('Statuses: pending | accepted | in-progress | implemented | rejected');
    process.exit(1);
}

const [suggestionId, newStatus, ...notesArr] = args;
const notes = notesArr.join(' ');

const validStatuses = ['pending', 'accepted', 'in-progress', 'implemented', 'rejected'];
if (!validStatuses.includes(newStatus)) {
    console.error(`Invalid status: ${newStatus}. Valid: ${validStatuses.join(', ')}`);
    process.exit(1);
}

const suggestionsFile = '/home/alexliv/.openclaw/workspace/memory/channels/playing-with-alexbot-suggestions.json';
const data = JSON.parse(fs.readFileSync(suggestionsFile, 'utf8'));

const suggestion = data.suggestions.find(s => s.id === suggestionId);
if (!suggestion) {
    console.error(`Suggestion not found: ${suggestionId}`);
    process.exit(1);
}

const oldStatus = suggestion.status;

// Update status counts
data.stats.by_status[oldStatus] = Math.max(0, (data.stats.by_status[oldStatus] || 1) - 1);
data.stats.by_status[newStatus] = (data.stats.by_status[newStatus] || 0) + 1;

// Update suggestion
suggestion.status = newStatus;
if (notes) {
    suggestion.notes = (suggestion.notes ? suggestion.notes + ' | ' : '') + notes;
}

// Handle implementation
if (newStatus === 'implemented') {
    suggestion.implementedAt = new Date().toISOString();
    data.stats.implemented_count += 1;
    
    // Update suggester's implemented count
    const suggester = data.suggester_leaderboard.find(s => s.jid === suggestion.suggestedBy.jid);
    if (suggester) {
        suggester.implemented_count += 1;
    }
}

data.last_updated = new Date().toISOString();
fs.writeFileSync(suggestionsFile, JSON.stringify(data, null, 2));

const statusEmojis = {
    pending: '⏳',
    accepted: '✅',
    'in-progress': '🔨',
    implemented: '🎉',
    rejected: '❌'
};

console.log(`${statusEmojis[newStatus]} Suggestion ${suggestionId} updated: ${oldStatus} → ${newStatus}`);
if (newStatus === 'implemented') {
    console.log(`🎉 Congrats to ${suggestion.suggestedBy.name}! Their suggestion was implemented!`);
}
