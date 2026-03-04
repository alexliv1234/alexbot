#!/usr/bin/env node
// dashboard-export.js - Export dashboard data for static consumption
// Run periodically via cron to keep data fresh

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const OUTPUT_FILE = path.join(WORKSPACE, '.dashboard-data.json');

async function exportDashboardData() {
  const data = {
    timestamp: new Date().toISOString(),
    activeJobs: [],
    groupActivity: [],
    investorPipeline: {},
    systemHealth: {},
    alexContext: {},
  };

  // Cron jobs - would need to be populated by actual cron calls
  // For now, we'll leave empty as the dashboard server will handle it
  
  // Group activity
  const groups = [
    {
      id: '120363405143589138@g.us',
      name: 'משחקים עם אלכס הבוט',
      scoresFile: `${WORKSPACE}-fast/memory/channels/playing-with-alexbot-scores.json`,
      dailyDir: `${WORKSPACE}-fast/memory/channels/playing-with-alexbot-daily`,
    },
    {
      id: '120363405089976@g.us',
      name: 'לומדים עם אלכס הבוט',
      scoresFile: `${WORKSPACE}-learning/memory/teaching-scores.json`,
      dailyDir: `${WORKSPACE}-learning/memory/channels/learning-with-alexbot-daily`,
    },
    {
      id: '120363407645823343@g.us',
      name: 'Fundraising with AlexBot',
      scoresFile: null,
      dailyDir: null,
    },
  ];

  data.groupActivity = groups.map(g => {
    const activity = {
      name: g.name,
      id: g.id,
      todayMessages: 0,
      topScorer: null,
      totalScore: 0,
    };

    const today = new Date().toISOString().split('T')[0];
    const dailyFile = g.dailyDir ? `${g.dailyDir}/${today}.jsonl` : null;
    
    if (dailyFile && fs.existsSync(dailyFile)) {
      const lines = fs.readFileSync(dailyFile, 'utf-8').split('\n').filter(Boolean);
      activity.todayMessages = lines.length;
    }

    if (g.scoresFile && fs.existsSync(g.scoresFile)) {
      try {
        const scores = JSON.parse(fs.readFileSync(g.scoresFile, 'utf-8'));
        if (Array.isArray(scores) && scores.length > 0) {
          const sorted = scores
            .filter(s => s.total || s.score)
            .sort((a, b) => (b.total || b.score || 0) - (a.total || a.score || 0));
          
          if (sorted[0]) {
            activity.topScorer = sorted[0].name || 'Unknown';
            activity.totalScore = sorted[0].total || sorted[0].score || 0;
          }
        }
      } catch (e) {
        console.error(`Failed to read scores for ${g.name}:`, e.message);
      }
    }

    return activity;
  });

  // Investor pipeline
  const investorsFile = `${WORKSPACE}/fundraising/memory/investors.json`;
  if (fs.existsSync(investorsFile)) {
    try {
      const investors = JSON.parse(fs.readFileSync(investorsFile, 'utf-8'));
      data.investorPipeline = {
        total: investors.length,
        contacted: investors.filter(i => i.status !== 'identified').length,
        responded: investors.filter(i => ['interested', 'meeting_scheduled', 'due_diligence', 'term_sheet', 'committed'].includes(i.status)).length,
        meetings: investors.filter(i => ['meeting_scheduled', 'due_diligence', 'term_sheet', 'committed'].includes(i.status)).length,
        committed: investors.filter(i => i.status === 'committed').length,
        recent: investors
          .filter(i => i.lastContact)
          .sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact))
          .slice(0, 5)
          .map(i => ({
            name: i.name,
            status: i.status,
            lastContact: i.lastContact,
            nextFollowup: i.nextFollowup,
          })),
      };
    } catch (e) {
      console.error('Failed to read investors:', e.message);
    }
  }

  // System health
  try {
    const df = execSync('df -h $HOME/.openclaw', { encoding: 'utf-8' });
    const match = df.match(/(\d+)%/);
    if (match) data.systemHealth.diskUsage = parseInt(match[1]);
  } catch (e) {
    console.error('Failed to get disk usage:', e.message);
  }

  try {
    const sessionsDir = `${process.env.HOME}/.openclaw/agents/main/sessions`;
    if (fs.existsSync(sessionsDir)) {
      const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl'));
      data.systemHealth.sessionCount = files.length;

      let largest = { file: null, size: 0 };
      files.forEach(f => {
        const stats = fs.statSync(path.join(sessionsDir, f));
        if (stats.size > largest.size) {
          largest = { file: f, size: stats.size };
        }
      });

      if (largest.file) {
        data.systemHealth.largestSession = {
          file: largest.file,
          size: (largest.size / 1024).toFixed(0) + ' KB',
        };
      }
    }
  } catch (e) {
    console.error('Failed to get session info:', e.message);
  }

  try {
    const log = execSync('git -C $HOME/.openclaw/workspace log -1 --format="%h - %s (%cr)"', { encoding: 'utf-8' }).trim();
    data.systemHealth.lastGitCommit = log;
  } catch (e) {
    console.error('Failed to get git log:', e.message);
  }

  try {
    const uptime = execSync('uptime -p', { encoding: 'utf-8' }).trim();
    data.systemHealth.uptime = uptime;
  } catch (e) {
    data.systemHealth.uptime = 'unknown';
  }

  // Alex context
  data.alexContext = {
    currentTime: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
    timezone: 'Asia/Jerusalem',
    calendarEvents: [],
    availability: 'unknown',
    todayTodos: [],
  };

  try {
    const todosFile = `${WORKSPACE}/memory/todos.json`;
    if (fs.existsSync(todosFile)) {
      const todosData = JSON.parse(fs.readFileSync(todosFile, 'utf-8'));
      const todos = todosData.tasks || [];
      const today = new Date().toISOString().split('T')[0];
      
      data.alexContext.todayTodos = todos
        .filter(t => t.status !== 'completed' && t.status !== 'done' && (!t.due || t.due <= today))
        .slice(0, 5)
        .map(t => ({
          text: t.title,
          priority: t.priority,
          dueDate: t.due,
        }));
    }
  } catch (e) {
    console.error('Failed to get todos:', e.message);
  }

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Dashboard data exported to ${OUTPUT_FILE}`);
}

exportDashboardData().catch(e => {
  console.error('Export failed:', e);
  process.exit(1);
});
