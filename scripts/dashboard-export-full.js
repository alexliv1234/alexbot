#!/usr/bin/env node

/**
 * AlexBot Dashboard - Full Data Export
 * 
 * Exports comprehensive data from all agents/systems:
 * - overview.json (cross-agent summary)
 * - main-session.json (personal assistant metrics)
 * - playing-group.json (gaming metrics: people, bots, suggestions)
 * - learning-group.json (education & moderation)
 * - bot-registry.json (bot management)
 * - fundraising.json (investor materials)
 * - cron-jobs.json (automation status)
 * - memory.json (long-term memory stats)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = '/home/alexliv/.openclaw';
const WORKSPACE = path.join(BASE, 'workspace');
const AGENTS = path.join(BASE, 'agents');
const DASHBOARD_REPO = '/home/alexliv/alexbot-dashboard';
const DATA_DIR = path.join(DASHBOARD_REPO, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper: Read JSON file safely
function readJSON(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return fallback;
  }
}

// Helper: Get session stats for an agent
function getAgentSessionStats(agentName) {
  const sessionsPath = path.join(AGENTS, agentName, 'sessions', 'sessions.json');
  const sessions = readJSON(sessionsPath, {});
  
  let totalSessions = 0;
  let totalTokens = 0;
  let totalCost = 0;
  
  for (const [key, session] of Object.entries(sessions)) {
    if (session && typeof session === 'object') {
      totalSessions++;
      totalTokens += session.tokenCount || 0;
      totalCost += session.totalCost || 0;
    }
  }
  
  return { sessions: totalSessions, tokens: totalTokens, cost: totalCost };
}

// Helper: Get recent file updates
function getRecentFiles(dir, limit = 20) {
  try {
    const files = execSync(`find ${dir} -type f -name "*.md" -printf "%T@ %p\\n" | sort -rn | head -${limit}`, { encoding: 'utf8' });
    return files.trim().split('\n').map(line => {
      const [timestamp, filepath] = line.split(' ');
      return {
        path: filepath.replace(WORKSPACE + '/', ''),
        timestamp: new Date(parseFloat(timestamp) * 1000).toISOString(),
        name: path.basename(filepath)
      };
    });
  } catch (error) {
    return [];
  }
}

// Helper: Count files by pattern
function countFiles(dir, pattern) {
  try {
    const result = execSync(`find ${dir} -type f -name "${pattern}" | wc -l`, { encoding: 'utf8' });
    return parseInt(result.trim());
  } catch (error) {
    return 0;
  }
}

console.log('📊 Starting full dashboard export...');

// ============================================================================
// 1. OVERVIEW
// ============================================================================
console.log('1/8 Exporting overview...');

const mainStats = getAgentSessionStats('main');
const fastStats = getAgentSessionStats('fast');
const learningStats = getAgentSessionStats('learning');
const botHandlerStats = getAgentSessionStats('bot-handler');

const cronJobs = readJSON(path.join(WORKSPACE, 'config', 'cron-jobs.json'), { jobs: [] });
const botRegistry = readJSON(path.join(WORKSPACE, 'memory', 'bot-registry.json'), { bots: [] });
const memoryFileCount = countFiles(path.join(WORKSPACE, 'memory'), '*.md');

const overview = {
  timestamp: new Date().toISOString(),
  agents: {
    main: mainStats,
    fast: fastStats,
    learning: learningStats,
    'bot-handler': botHandlerStats
  },
  totals: {
    sessions: mainStats.sessions + fastStats.sessions + learningStats.sessions + botHandlerStats.sessions,
    tokens: {
      total: mainStats.tokens + fastStats.tokens + learningStats.tokens + botHandlerStats.tokens,
      main: mainStats.tokens,
      fast: fastStats.tokens,
      learning: learningStats.tokens,
      'bot-handler': botHandlerStats.tokens
    },
    cost: {
      total: mainStats.cost + fastStats.cost + learningStats.cost + botHandlerStats.cost,
      main: mainStats.cost,
      fast: fastStats.cost,
      learning: learningStats.cost,
      'bot-handler': botHandlerStats.cost
    }
  },
  health: {
    cronJobsActive: cronJobs.jobs ? cronJobs.jobs.filter(j => j.enabled !== false).length : 0,
    cronJobsTotal: cronJobs.jobs ? cronJobs.jobs.length : 0,
    botsActive: botRegistry.bots ? botRegistry.bots.filter(b => b.status === 'active').length : 0,
    botsPending: botRegistry.pendingApproval ? botRegistry.pendingApproval.length : 0,
    botsBlocked: botRegistry.blocked ? botRegistry.blocked.length : 0,
    memoryFiles: memoryFileCount
  }
};

fs.writeFileSync(path.join(DATA_DIR, 'overview.json'), JSON.stringify(overview, null, 2));

// ============================================================================
// 2. MAIN SESSION
// ============================================================================
console.log('2/8 Exporting main session...');

const mainSessions = readJSON(path.join(AGENTS, 'main', 'sessions', 'sessions.json'), {});
const mainSessionArray = Object.entries(mainSessions)
  .map(([key, session]) => ({
    key,
    channel: session.channel || 'unknown',
    tokenCount: session.tokenCount || 0,
    messageCount: session.messageCount || 0,
    totalCost: session.totalCost || 0,
    createdAt: session.createdAt || null,
    lastActive: session.lastActive || null
  }))
  .sort((a, b) => b.tokenCount - a.tokenCount);

const mainSession = {
  timestamp: new Date().toISOString(),
  stats: mainStats,
  sessions: mainSessionArray.slice(0, 100), // Top 100 sessions
  topSessions: mainSessionArray.slice(0, 10),
  recentMemory: getRecentFiles(path.join(WORKSPACE, 'memory'), 20)
};

fs.writeFileSync(path.join(DATA_DIR, 'main-session.json'), JSON.stringify(mainSession, null, 2));

// ============================================================================
// 3. PLAYING GROUP
// ============================================================================
console.log('3/8 Exporting playing group...');

const playingScores = readJSON(path.join(WORKSPACE, 'workspace-fast', 'memory', 'channels', 'playing-with-alexbot-scores.json'), { scores: {} });
const playingBotScores = readJSON(path.join(WORKSPACE, 'workspace-fast', 'memory', 'channels', 'playing-with-alexbot-bot-scores.json'), { scores: {} });
const playingSuggestions = readJSON(path.join(WORKSPACE, 'workspace-fast', 'memory', 'channels', 'playing-with-alexbot-suggestions.json'), { suggestions: [] });
const playingWinners = readJSON(path.join(WORKSPACE, 'memory', 'channels', 'playing-with-alexbot-winners.json'), {});
const playingArtStyle = readJSON(path.join(WORKSPACE, 'memory', 'channels', 'playing-group-art-style-state.json'), {});

// Convert scores object to sorted array
const peopleScoresArray = Object.entries(playingScores.scores || {})
  .map(([phone, data]) => ({
    phone,
    name: data.name,
    messages_scored: data.messages_scored || 0,
    total_score: data.total_score || 0,
    breakdown: data.breakdown || {},
    average: data.messages_scored > 0 ? (data.total_score / data.messages_scored).toFixed(1) : 0,
    recentMessages: (data.messages || []).slice(-5) // Last 5 messages
  }))
  .sort((a, b) => b.total_score - a.total_score);

// Bot scores
const botScoresArray = Object.entries(playingBotScores.scores || {})
  .map(([phone, data]) => ({
    phone,
    name: data.name,
    interactions: data.interactions || 0,
    total_score: data.total_score || 0,
    breakdown: data.breakdown || {},
    average: data.interactions > 0 ? (data.total_score / data.interactions).toFixed(1) : 0
  }))
  .sort((a, b) => b.total_score - a.total_score);

// Suggestion stats
const suggestionStats = {
  total: playingSuggestions.suggestions?.length || 0,
  byStatus: {},
  byType: {},
  topContributors: {}
};

(playingSuggestions.suggestions || []).forEach(s => {
  // By status
  suggestionStats.byStatus[s.status] = (suggestionStats.byStatus[s.status] || 0) + 1;
  
  // By type
  suggestionStats.byType[s.type] = (suggestionStats.byType[s.type] || 0) + 1;
  
  // Top contributors
  const name = s.suggestedBy?.name || 'Unknown';
  suggestionStats.topContributors[name] = (suggestionStats.topContributors[name] || 0) + 1;
});

const playingGroup = {
  timestamp: new Date().toISOString(),
  peopleScores: peopleScoresArray,
  botScores: botScoresArray,
  suggestions: playingSuggestions.suggestions || [],
  suggestionStats,
  winners: playingWinners,
  artStyle: playingArtStyle,
  stats: {
    totalPeople: peopleScoresArray.length,
    totalBots: botScoresArray.length,
    totalSuggestions: suggestionStats.total,
    avgScorePerPerson: peopleScoresArray.length > 0 
      ? (peopleScoresArray.reduce((sum, p) => sum + p.total_score, 0) / peopleScoresArray.length).toFixed(1)
      : 0
  }
};

fs.writeFileSync(path.join(DATA_DIR, 'playing-group.json'), JSON.stringify(playingGroup, null, 2));

// ============================================================================
// 4. LEARNING GROUP
// ============================================================================
console.log('4/8 Exporting learning group...');

const moderationLog = readJSON(path.join(WORKSPACE, 'workspace-learning', 'moderation-log.json'), {});
const contributions = readJSON(path.join(WORKSPACE, 'alexbot', 'knowledge-base', 'community', 'contributions.json'), []);

const learningGroup = {
  timestamp: new Date().toISOString(),
  stats: learningStats,
  moderation: moderationLog,
  contributions: contributions || [],
  stats_summary: {
    totalWarnings: Object.keys(moderationLog).length,
    totalContributions: Array.isArray(contributions) ? contributions.length : 0
  }
};

fs.writeFileSync(path.join(DATA_DIR, 'learning-group.json'), JSON.stringify(learningGroup, null, 2));

// ============================================================================
// 5. BOT REGISTRY
// ============================================================================
console.log('5/8 Exporting bot registry...');

fs.writeFileSync(path.join(DATA_DIR, 'bot-registry.json'), JSON.stringify(botRegistry, null, 2));

// ============================================================================
// 6. FUNDRAISING
// ============================================================================
console.log('6/8 Exporting fundraising...');

const fundraisingDir = path.join(WORKSPACE, 'fundraising');
const fundraisingDocs = [];

if (fs.existsSync(fundraisingDir)) {
  const files = fs.readdirSync(fundraisingDir).filter(f => f.endsWith('.md'));
  files.forEach(file => {
    const filePath = path.join(fundraisingDir, file);
    const stats = fs.statSync(filePath);
    fundraisingDocs.push({
      name: file.replace('.md', ''),
      file: file,
      size: stats.size,
      lastModified: stats.mtime.toISOString()
    });
  });
}

const fundraising = {
  timestamp: new Date().toISOString(),
  documents: fundraisingDocs,
  investors: [
    {
      name: 'Alon Lifshitz',
      phone: '+972526802086',
      status: 'pending',
      notes: 'Discussing $10M raise for scaling AlexLivBot'
    }
  ]
};

fs.writeFileSync(path.join(DATA_DIR, 'fundraising.json'), JSON.stringify(fundraising, null, 2));

// ============================================================================
// 7. CRON JOBS
// ============================================================================
console.log('7/8 Exporting cron jobs...');

const cronJobsData = {
  timestamp: new Date().toISOString(),
  jobs: cronJobs.jobs || [],
  stats: {
    total: cronJobs.jobs?.length || 0,
    enabled: cronJobs.jobs?.filter(j => j.enabled !== false).length || 0,
    disabled: cronJobs.jobs?.filter(j => j.enabled === false).length || 0,
    byTarget: {
      main: cronJobs.jobs?.filter(j => j.sessionTarget === 'main').length || 0,
      isolated: cronJobs.jobs?.filter(j => j.sessionTarget === 'isolated').length || 0
    }
  }
};

fs.writeFileSync(path.join(DATA_DIR, 'cron-jobs.json'), JSON.stringify(cronJobsData, null, 2));

// ============================================================================
// 8. MEMORY
// ============================================================================
console.log('8/8 Exporting memory stats...');

const memoryDir = path.join(WORKSPACE, 'memory');
const memoryStats = {
  timestamp: new Date().toISOString(),
  total_files: countFiles(memoryDir, '*.md'),
  by_category: {
    daily_notes: countFiles(path.join(memoryDir), '????-??-??.md'),
    people: countFiles(path.join(memoryDir, 'people'), '*.md'),
    channels: countFiles(path.join(memoryDir, 'channels'), '*.md'),
    private: countFiles(path.join(memoryDir, '.private'), '*.md'),
    other: 0 // Will calculate
  },
  recent_updates: getRecentFiles(memoryDir, 30),
  size_bytes: parseInt(execSync(`du -sb ${memoryDir} | cut -f1`, { encoding: 'utf8' }).trim())
};

memoryStats.by_category.other = memoryStats.total_files - 
  memoryStats.by_category.daily_notes - 
  memoryStats.by_category.people - 
  memoryStats.by_category.channels - 
  memoryStats.by_category.private;

fs.writeFileSync(path.join(DATA_DIR, 'memory.json'), JSON.stringify(memoryStats, null, 2));

// ============================================================================
// COMMIT & PUSH
// ============================================================================
console.log('\n📁 Writing status.json...');

const status = {
  timestamp: new Date().toISOString(),
  files_exported: 8,
  status: 'success'
};

fs.writeFileSync(path.join(DATA_DIR, 'status.json'), JSON.stringify(status, null, 2));

console.log('\n🔄 Committing and pushing...');

try {
  process.chdir(DASHBOARD_REPO);
  execSync('git add data/*.json', { stdio: 'inherit' });
  execSync(`git commit -m "📊 Dashboard export - ${new Date().toISOString()}"`, { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('\n✅ Dashboard data exported and pushed');
} catch (error) {
  console.error('❌ Error pushing to GitHub:', error.message);
  process.exit(1);
}

console.log('\n✅ Export complete\n');
