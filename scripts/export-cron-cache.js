#!/usr/bin/env node
// export-cron-cache.js - Export cron jobs for dashboard consumption
// This is meant to be called FROM a cron job that has access to the cron tool

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const OUTPUT_FILE = path.join(WORKSPACE, '.cron-cache.json');

// This script expects cron job data to be passed via stdin in JSON format
// The calling cron job should pipe the output of `cron action=list` to this script

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    
    if (!data.jobs || !Array.isArray(data.jobs)) {
      console.error('Invalid cron data format');
      process.exit(1);
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
    
    const jobs = data.jobs
      .filter(j => j.enabled !== false)
      .map(j => ({
        name: j.name || 'Unnamed',
        agent: j.agentId || 'unknown',
        schedule: formatSchedule(j.schedule),
        nextRun: j.state?.nextRunAtMs ? new Date(j.state.nextRunAtMs) : null,
        lastStatus: j.state?.lastStatus || 'never',
        lastRun: j.state?.lastRunAtMs ? new Date(j.state.lastRunAtMs) : null,
      }))
      .sort((a, b) => (a.nextRun?.getTime() || Infinity) - (b.nextRun?.getTime() || Infinity));
    
    const cache = {
      timestamp: new Date().toISOString(),
      jobs: jobs,
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cache, null, 2));
    console.log(`✅ Exported ${jobs.length} cron jobs to cache`);
  } catch (e) {
    console.error('Failed to export cron cache:', e.message);
    process.exit(1);
  }
});

// If no stdin, show usage
setTimeout(() => {
  if (!input) {
    console.error('Usage: cron action=list | node export-cron-cache.js');
    process.exit(1);
  }
}, 100);
