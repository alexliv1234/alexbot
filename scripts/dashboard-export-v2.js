#!/usr/bin/env node
/**
 * Dashboard Data Export Script v2
 * Matches the structure expected by the dashboard frontend
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DASHBOARD_REPO = '/home/alexliv/.openclaw/workspace/alexbot-dashboard';
const WORKSPACE = '/home/alexliv/.openclaw/workspace';
const DATA_DIR = path.join(DASHBOARD_REPO, 'data');

// Ensure directories exist
fs.mkdirSync(path.join(DATA_DIR, 'agents'), { recursive: true });

const timestamp = new Date().toISOString();
const localTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

console.log(`📊 Dashboard export v2 starting at ${localTime}...`);

// Helper: Read sessions
function readSessions() {
    try {
        const sessionsPath = '/home/alexliv/.openclaw/agents/main/sessions/sessions.json';
        const content = fs.readFileSync(sessionsPath, 'utf8');
        const data = JSON.parse(content);
        return Object.values(data);
    } catch (e) {
        console.warn('Could not read sessions:', e.message);
        return [];
    }
}

// Helper: Read scores
function readScores() {
    try {
        const scoresPath = path.join(WORKSPACE, 'memory/channels/playing-with-alexbot-scores.json');
        if (fs.existsSync(scoresPath)) {
            return JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
        }
    } catch (e) {
        console.warn('Could not read scores:', e.message);
    }
    return { scores: {} };
}

// Helper: Read bot registry
function readBotRegistry() {
    try {
        const registryPath = path.join(WORKSPACE, 'memory/bot-registry.json');
        if (fs.existsSync(registryPath)) {
            return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        }
    } catch (e) {
        console.warn('Could not read bot registry:', e.message);
    }
    return { bots: [], pending: [] };
}

// Helper: Read cron jobs
function readCronJobs() {
    try {
        const cronPath = path.join(WORKSPACE, 'config/cron-jobs.json');
        if (fs.existsSync(cronPath)) {
            return JSON.parse(fs.readFileSync(cronPath, 'utf8'));
        }
    } catch (e) {
        console.warn('Could not read cron jobs:', e.message);
    }
    return { jobs: [] };
}

// 1. OVERVIEW DATA
console.log('Writing overview.json...');
const sessions = readSessions();
const activeSessions = sessions.filter(s => s.totalTokens > 0);
const totalTokens = sessions.reduce((sum, s) => sum + (s.totalTokens || 0), 0);
const totalCost = totalTokens * 0.000003;

const botRegistry = readBotRegistry();
const cronData = readCronJobs();

const overviewData = {
    timestamp,
    totals: {
        sessions: sessions.length,
        tokens: {
            total: totalTokens,
            today: totalTokens // Simplified - could track daily separately
        },
        cost: totalCost
    },
    agents: {
        main: {
            sessions: sessions.length,
            tokens: totalTokens,
            cost: totalCost
        }
    },
    health: {
        botsActive: (botRegistry.bots || []).filter(b => b.status === 'active').length,
        botsPending: (botRegistry.pending || []).length,
        memoryFiles: (() => {
            try {
                const count = execSync(`find ${WORKSPACE}/memory -type f \\( -name "*.md" -o -name "*.json" \\) | wc -l`, { 
                    encoding: 'utf8' 
                }).trim();
                return parseInt(count);
            } catch {
                return 0;
            }
        })(),
        cronJobsActive: cronData.jobs.filter(j => j.enabled !== false).length,
        cronJobsTotal: cronData.jobs.length
    }
};
fs.writeFileSync(path.join(DATA_DIR, 'overview.json'), JSON.stringify(overviewData, null, 2));

// 2. MAIN SESSION DATA
console.log('Writing main-session.json...');
const mainSessionData = {
    timestamp,
    totalSessions: sessions.length,
    totalTokens,
    totalCost,
    topSessions: activeSessions
        .sort((a, b) => b.totalTokens - a.totalTokens)
        .slice(0, 10)
        .map(s => ({
            label: s.label || s.displayName || 'Unknown',
            kind: s.kind,
            tokens: s.totalTokens,
            channel: s.channel,
            updated: s.updatedAt
        }))
};
fs.writeFileSync(path.join(DATA_DIR, 'main-session.json'), JSON.stringify(mainSessionData, null, 2));

// 3. PLAYING GROUP DATA
console.log('Writing playing-group.json...');
const scoresData = readScores();
const peopleScores = Object.entries(scoresData.scores || {}).map(([phone, data]) => ({
    name: data.name || 'Unknown',
    phone: phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4),
    totalScore: data.total || 0,
    messages: data.count || 0,
    avgScore: data.count ? data.total / data.count : 0,
    creativity: data.creativity || 0,
    challenge: data.challenge || 0,
    humor: data.humor || 0,
    cleverness: data.cleverness || 0,
    engagement: data.engagement || 0,
    broke: data.broke || 0,
    hacked: data.hacked || 0
})).sort((a, b) => b.totalScore - a.totalScore);

const playingGroupData = {
    timestamp,
    peopleScores,
    botScores: [], // TODO: Add bot scores
    suggestions: [], // TODO: Add suggestions
    dailySummaries: [], // TODO: Add daily summaries
    conversations: [] // TODO: Add conversations
};
fs.writeFileSync(path.join(DATA_DIR, 'playing-group.json'), JSON.stringify(playingGroupData, null, 2));

// 4. LEARNING GROUP DATA
console.log('Writing learning-group.json...');
const learningGroupData = {
    timestamp,
    totalQuestions: 0, // TODO: Track questions
    totalContributions: 0 // TODO: Track contributions
};
fs.writeFileSync(path.join(DATA_DIR, 'learning-group.json'), JSON.stringify(learningGroupData, null, 2));

// 5. BOT REGISTRY DATA
console.log('Writing bot-registry.json...');
fs.writeFileSync(path.join(DATA_DIR, 'bot-registry.json'), JSON.stringify({
    timestamp,
    bots: botRegistry.bots || [],
    pending: botRegistry.pending || []
}, null, 2));

// 6. FUNDRAISING DATA
console.log('Writing fundraising.json...');
const fundraisingData = {
    timestamp,
    documents: [
        { name: 'Business Plan', lastUpdated: '2026-02-01' },
        { name: 'Pitch Deck', lastUpdated: '2026-02-01' },
        { name: 'Competitive Analysis', lastUpdated: '2026-02-01' },
        { name: 'Go-to-Market Strategy', lastUpdated: '2026-02-01' }
    ],
    contacts: [
        { name: 'Alon Lifshitz', phone: '+972526802086', status: 'In discussion' }
    ]
};
fs.writeFileSync(path.join(DATA_DIR, 'fundraising.json'), JSON.stringify(fundraisingData, null, 2));

// 7. CRON JOBS DATA
console.log('Writing cron-jobs.json...');
fs.writeFileSync(path.join(DATA_DIR, 'cron-jobs.json'), JSON.stringify({
    timestamp,
    jobs: cronData.jobs || []
}, null, 2));

// 8. MEMORY DATA
console.log('Writing memory.json...');
const memoryData = {
    timestamp,
    totalFiles: (() => {
        try {
            const count = execSync(`find ${WORKSPACE}/memory -type f \\( -name "*.md" -o -name "*.json" \\) | wc -l`, { 
                encoding: 'utf8' 
            }).trim();
            return parseInt(count);
        } catch {
            return 0;
        }
    })(),
    peopleProfiles: (() => {
        try {
            const count = execSync(`find ${WORKSPACE}/memory/people -name "*.md" 2>/dev/null | wc -l`, { 
                encoding: 'utf8' 
            }).trim();
            return parseInt(count);
        } catch {
            return 0;
        }
    })(),
    dailyNotes: (() => {
        try {
            const count = execSync(`find ${WORKSPACE}/memory -name "20*.md" | wc -l`, { 
                encoding: 'utf8' 
            }).trim();
            return parseInt(count);
        } catch {
            return 0;
        }
    })()
};
fs.writeFileSync(path.join(DATA_DIR, 'memory.json'), JSON.stringify(memoryData, null, 2));

// Git commit and push
console.log('Committing and pushing...');
try {
    process.chdir(DASHBOARD_REPO);
    execSync('git add -A', { encoding: 'utf8', timeout: 10000 });
    
    try {
        execSync('git diff --staged --quiet', { encoding: 'utf8', timeout: 5000 });
        console.log('No changes to commit');
    } catch {
        // There are changes
        execSync(`git commit -m "📊 Auto-update ${localTime}"`, { encoding: 'utf8', timeout: 10000 });
        execSync('GIT_SSH_COMMAND="ssh -i ~/.ssh/alexbot_github -o IdentitiesOnly=yes" git push origin main', { 
            encoding: 'utf8', 
            timeout: 30000 
        });
        console.log('✅ Dashboard data exported and pushed');
    }
} catch (e) {
    console.error('Git error:', e.message);
}

console.log('✅ Export complete');
