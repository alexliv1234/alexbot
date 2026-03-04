#!/usr/bin/env node
// dashboard-server.js - Unified AlexBot Dashboard
// Shows: Active jobs, group activity, investor pipeline, system health, Alex's context

const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 8888;

// Paths
const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const WORKSPACE_FAST = process.env.HOME + '/.openclaw/workspace-fast';

// ======================================
// Data Fetchers
// ======================================

function getActiveJobs() {
  try {
    const result = execSync('cron action=list', { encoding: 'utf-8' });
    const data = JSON.parse(result);
    
    return data.jobs
      .filter(j => j.enabled)
      .map(j => ({
        name: j.name,
        agent: j.agentId,
        schedule: formatSchedule(j.schedule),
        nextRun: j.state?.nextRunAtMs ? new Date(j.state.nextRunAtMs) : null,
        lastStatus: j.state?.lastStatus || 'never',
        lastRun: j.state?.lastRunAtMs ? new Date(j.state.lastRunAtMs) : null,
      }))
      .sort((a, b) => (a.nextRun?.getTime() || Infinity) - (b.nextRun?.getTime() || Infinity));
  } catch (e) {
    console.error('Failed to fetch cron jobs:', e.message);
    return [];
  }
}

function formatSchedule(schedule) {
  if (schedule.kind === 'every') {
    const ms = schedule.everyMs;
    if (ms < 60000) return `every ${ms/1000}s`;
    if (ms < 3600000) return `every ${ms/60000}m`;
    if (ms < 86400000) return `every ${ms/3600000}h`;
    return `every ${ms/86400000}d`;
  }
  if (schedule.kind === 'cron') {
    return `cron: ${schedule.expr}`;
  }
  if (schedule.kind === 'at') {
    return `at ${new Date(schedule.at).toLocaleString('he-IL', {timeZone: 'Asia/Jerusalem'})}`;
  }
  return 'unknown';
}

function getGroupActivity() {
  const groups = [
    {
      id: '120363405143589138@g.us',
      name: 'משחקים עם אלכס הבוט',
      scoresFile: `${WORKSPACE_FAST}/memory/channels/playing-with-alexbot-scores.json`,
      dailyDir: `${WORKSPACE_FAST}/memory/channels/playing-with-alexbot-daily`,
    },
    {
      id: '120363405089976@g.us',
      name: 'לומדים עם אלכס הבוט',
      scoresFile: `${WORKSPACE}/workspace-learning/memory/teaching-scores.json`,
      dailyDir: `${WORKSPACE}/workspace-learning/memory/channels/learning-with-alexbot-daily`,
    },
    {
      id: '120363407645823343@g.us',
      name: 'Fundraising with AlexBot',
      scoresFile: null,
      dailyDir: null,
    },
  ];

  return groups.map(g => {
    const activity = {
      name: g.name,
      id: g.id,
      todayMessages: 0,
      topScorer: null,
      totalScore: 0,
    };

    // Count today's messages
    const today = new Date().toISOString().split('T')[0];
    const dailyFile = g.dailyDir ? `${g.dailyDir}/${today}.jsonl` : null;
    
    if (dailyFile && fs.existsSync(dailyFile)) {
      const lines = fs.readFileSync(dailyFile, 'utf-8').split('\n').filter(Boolean);
      activity.todayMessages = lines.length;
    }

    // Get top scorer
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
}

function getInvestorPipeline() {
  const investorsFile = `${WORKSPACE}/fundraising/memory/investors.json`;
  
  if (!fs.existsSync(investorsFile)) {
    return {
      total: 0,
      contacted: 0,
      responded: 0,
      meetings: 0,
      committed: 0,
      recent: [],
    };
  }

  try {
    const investors = JSON.parse(fs.readFileSync(investorsFile, 'utf-8'));
    
    const pipeline = {
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

    return pipeline;
  } catch (e) {
    console.error('Failed to read investors:', e.message);
    return { total: 0, contacted: 0, responded: 0, meetings: 0, committed: 0, recent: [] };
  }
}

function getSystemHealth() {
  const health = {
    diskUsage: null,
    sessionCount: 0,
    largestSession: null,
    lastGitCommit: null,
    uptime: null,
  };

  // Disk usage
  try {
    const df = execSync('df -h $HOME/.openclaw', { encoding: 'utf-8' });
    const match = df.match(/(\d+)%/);
    if (match) health.diskUsage = parseInt(match[1]);
  } catch (e) {
    console.error('Failed to get disk usage:', e.message);
  }

  // Session count and largest
  try {
    const sessionsDir = `${process.env.HOME}/.openclaw/agents/main/sessions`;
    if (fs.existsSync(sessionsDir)) {
      const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl'));
      health.sessionCount = files.length;

      let largest = { file: null, size: 0 };
      files.forEach(f => {
        const stats = fs.statSync(path.join(sessionsDir, f));
        if (stats.size > largest.size) {
          largest = { file: f, size: stats.size };
        }
      });

      if (largest.file) {
        health.largestSession = {
          file: largest.file,
          size: (largest.size / 1024).toFixed(0) + ' KB',
        };
      }
    }
  } catch (e) {
    console.error('Failed to get session info:', e.message);
  }

  // Last git commit
  try {
    const log = execSync('git -C $HOME/.openclaw/workspace log -1 --format="%h - %s (%cr)"', { encoding: 'utf-8' }).trim();
    health.lastGitCommit = log;
  } catch (e) {
    console.error('Failed to get git log:', e.message);
  }

  // Uptime
  try {
    const uptime = execSync('uptime -p', { encoding: 'utf-8' }).trim();
    health.uptime = uptime;
  } catch (e) {
    // Fallback for systems without uptime -p
    health.uptime = 'unknown';
  }

  return health;
}

function getAlexContext() {
  const context = {
    currentTime: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
    timezone: 'Asia/Jerusalem',
    calendarEvents: [],
    availability: 'unknown',
    todayTodos: [],
  };

  // Try to get calendar events (requires gog CLI)
  try {
    const GOG_PASSWORD = process.env.GOG_KEYRING_PASSWORD || 'openclaw123';
    const cal = execSync(`GOG_KEYRING_PASSWORD="${GOG_PASSWORD}" gog calendar list --account alexliv@gmail.com --days 1 --format json`, {
      encoding: 'utf-8',
      timeout: 10000,
    });
    
    const events = JSON.parse(cal);
    context.calendarEvents = events.slice(0, 5).map(e => ({
      summary: e.summary,
      start: e.start,
      end: e.end,
    }));
    
    // Check availability (next 2 hours)
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const busy = events.some(e => {
      const start = new Date(e.start);
      const end = new Date(e.end);
      return start <= twoHoursLater && end >= now;
    });
    
    context.availability = busy ? '🔴 Busy' : '🟢 Available';
  } catch (e) {
    console.error('Failed to get calendar:', e.message);
  }

  // Try to get today's todos
  try {
    const todosFile = `${WORKSPACE}/memory/todos.json`;
    if (fs.existsSync(todosFile)) {
      const todos = JSON.parse(fs.readFileSync(todosFile, 'utf-8'));
      const today = new Date().toISOString().split('T')[0];
      
      context.todayTodos = todos
        .filter(t => !t.completed && (!t.dueDate || t.dueDate <= today))
        .slice(0, 5)
        .map(t => ({
          text: t.text,
          priority: t.priority,
          dueDate: t.dueDate,
        }));
    }
  } catch (e) {
    console.error('Failed to get todos:', e.message);
  }

  return context;
}

// ======================================
// Routes
// ======================================

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="he" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🤖 AlexBot Dashboard</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
          padding: 20px;
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
        }
        h1 {
          color: white;
          text-align: center;
          margin-bottom: 30px;
          font-size: 2.5em;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 12px rgba(0,0,0,0.15);
        }
        .card h2 {
          color: #667eea;
          margin-bottom: 15px;
          font-size: 1.5em;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }
        .card.large {
          grid-column: 1 / -1;
        }
        .stat {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .stat:last-child {
          border-bottom: none;
        }
        .stat-label {
          font-weight: 600;
          color: #666;
        }
        .stat-value {
          color: #333;
          font-weight: bold;
        }
        .job-item, .group-item, .investor-item, .todo-item {
          padding: 10px;
          margin: 8px 0;
          background: #f8f9fa;
          border-radius: 6px;
          border-left: 4px solid #667eea;
        }
        .job-item .name {
          font-weight: bold;
          color: #333;
        }
        .job-item .schedule {
          font-size: 0.9em;
          color: #666;
          margin-top: 4px;
        }
        .status {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: bold;
        }
        .status.ok { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        .status.never { background: #e2e3e5; color: #383d41; }
        .refresh-btn {
          position: fixed;
          bottom: 30px;
          left: 30px;
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: all 0.3s;
        }
        .refresh-btn:hover {
          background: #667eea;
          color: white;
          transform: scale(1.05);
        }
        .time {
          text-align: center;
          color: white;
          font-size: 1.2em;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 AlexBot Dashboard</h1>
        <div class="time" id="currentTime"></div>
        <div class="grid" id="dashboard"></div>
      </div>
      <button class="refresh-btn" onclick="location.reload()">🔄 רענן</button>
      
      <script>
        // Auto-refresh every 60 seconds
        setTimeout(() => location.reload(), 60000);
        
        // Update current time
        function updateTime() {
          const now = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });
          document.getElementById('currentTime').textContent = now;
        }
        updateTime();
        setInterval(updateTime, 1000);
        
        // Fetch and render dashboard
        fetch('/api/dashboard')
          .then(r => r.json())
          .then(data => renderDashboard(data))
          .catch(e => console.error('Failed to load dashboard:', e));
        
        function renderDashboard(data) {
          const html = \`
            <!-- Alex's Context -->
            <div class="card">
              <h2>📅 הקשר של אלכס</h2>
              <div class="stat">
                <span class="stat-label">זמינות</span>
                <span class="stat-value">\${data.alexContext.availability}</span>
              </div>
              <div class="stat">
                <span class="stat-label">פגישות היום</span>
                <span class="stat-value">\${data.alexContext.calendarEvents.length}</span>
              </div>
              <div class="stat">
                <span class="stat-label">משימות תלויות</span>
                <span class="stat-value">\${data.alexContext.todayTodos.length}</span>
              </div>
              \${data.alexContext.calendarEvents.slice(0, 3).map(e => \`
                <div class="todo-item">
                  <strong>\${e.summary}</strong><br>
                  <small>\${new Date(e.start).toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'})}</small>
                </div>
              \`).join('')}
            </div>
            
            <!-- System Health -->
            <div class="card">
              <h2>🔧 בריאות מערכת</h2>
              <div class="stat">
                <span class="stat-label">Disk Usage</span>
                <span class="stat-value">\${data.systemHealth.diskUsage || 'N/A'}%</span>
              </div>
              <div class="stat">
                <span class="stat-label">Sessions</span>
                <span class="stat-value">\${data.systemHealth.sessionCount}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Largest Session</span>
                <span class="stat-value">\${data.systemHealth.largestSession?.size || 'N/A'}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Uptime</span>
                <span class="stat-value">\${data.systemHealth.uptime}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Last Commit</span>
                <span class="stat-value" style="font-size: 0.85em">\${data.systemHealth.lastGitCommit || 'N/A'}</span>
              </div>
            </div>
            
            <!-- Investor Pipeline -->
            <div class="card">
              <h2>💼 פייפליין משקיעים</h2>
              <div class="stat">
                <span class="stat-label">סה"כ</span>
                <span class="stat-value">\${data.investorPipeline.total}</span>
              </div>
              <div class="stat">
                <span class="stat-label">יצרנו קשר</span>
                <span class="stat-value">\${data.investorPipeline.contacted}</span>
              </div>
              <div class="stat">
                <span class="stat-label">הגיבו</span>
                <span class="stat-value">\${data.investorPipeline.responded}</span>
              </div>
              <div class="stat">
                <span class="stat-label">פגישות</span>
                <span class="stat-value">\${data.investorPipeline.meetings}</span>
              </div>
              <div class="stat">
                <span class="stat-label">התחייבו</span>
                <span class="stat-value">\${data.investorPipeline.committed}</span>
              </div>
              \${data.investorPipeline.recent.slice(0, 3).map(i => \`
                <div class="investor-item">
                  <strong>\${i.name}</strong> - <span class="status ok">\${i.status}</span><br>
                  <small>Last: \${new Date(i.lastContact).toLocaleDateString('he-IL')}</small>
                </div>
              \`).join('')}
            </div>
            
            <!-- Group Activity -->
            <div class="card large">
              <h2>💬 פעילות בקבוצות</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                \${data.groupActivity.map(g => \`
                  <div class="group-item">
                    <strong>\${g.name}</strong><br>
                    <small>הודעות היום: \${g.todayMessages}</small><br>
                    <small>מוביל: \${g.topScorer || 'N/A'} (\${g.totalScore} נק')</small>
                  </div>
                \`).join('')}
              </div>
            </div>
            
            <!-- Active Jobs -->
            <div class="card large">
              <h2>⚙️ Jobs פעילים (Next 10)</h2>
              \${data.activeJobs.slice(0, 10).map(j => \`
                <div class="job-item">
                  <div class="name">\${j.name}</div>
                  <div class="schedule">\${j.schedule} | Next: \${j.nextRun ? new Date(j.nextRun).toLocaleString('he-IL', {timeZone: 'Asia/Jerusalem'}) : 'N/A'}</div>
                  <span class="status \${j.lastStatus}">\${j.lastStatus}</span>
                </div>
              \`).join('')}
            </div>
          \`;
          
          document.getElementById('dashboard').innerHTML = html;
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/api/dashboard', (req, res) => {
  const data = {
    activeJobs: getActiveJobs(),
    groupActivity: getGroupActivity(),
    investorPipeline: getInvestorPipeline(),
    systemHealth: getSystemHealth(),
    alexContext: getAlexContext(),
  };

  res.json(data);
});

// ======================================
// Start Server
// ======================================

app.listen(PORT, () => {
  console.log(`🤖 AlexBot Dashboard running on http://localhost:${PORT}`);
  console.log(`   View in browser: http://localhost:${PORT}`);
  console.log(`   API endpoint: http://localhost:${PORT}/api/dashboard`);
});
