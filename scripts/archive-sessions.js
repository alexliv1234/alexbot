#!/usr/bin/env node
/**
 * Session Archival System for OpenClaw
 * 
 * Archives old sessions from sessions.json to reduce file size.
 * - Keeps only sessions updated in last 30 minutes in active sessions.json
 * - Archives old sessions to timestamped files
 * - Moves corresponding .jsonl conversation files to archive directory
 * 
 * Usage: node archive-sessions.js <agent-name> [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const AGENT_NAME = process.argv[2] || 'main';
const DRY_RUN = process.argv.includes('--dry-run');

const OPENCLAW_DIR = path.join(process.env.HOME, '.openclaw');
const AGENT_DIR = path.join(OPENCLAW_DIR, 'agents', AGENT_NAME);
const SESSIONS_FILE = path.join(AGENT_DIR, 'sessions', 'sessions.json');
const SESSIONS_DIR = path.join(AGENT_DIR, 'sessions');
const ARCHIVE_DIR = path.join(SESSIONS_DIR, 'archive');

const ACTIVE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function formatTimestamp(ms) {
  const d = new Date(ms);
  return d.toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function archiveSessions() {
  console.log(`📦 Archiving sessions for agent: ${AGENT_NAME}`);
  if (DRY_RUN) console.log('🔍 DRY RUN MODE - no changes will be made\n');
  
  // Check if sessions.json exists
  if (!fs.existsSync(SESSIONS_FILE)) {
    console.log(`⚠️  No sessions.json found at ${SESSIONS_FILE}`);
    return;
  }

  // Read current sessions
  const sessionsData = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
  
  if (typeof sessionsData !== 'object') {
    console.log('⚠️  Invalid sessions.json format');
    return;
  }

  ensureDir(ARCHIVE_DIR);

  const now = Date.now();
  const cutoffTime = now - ACTIVE_WINDOW_MS;
  
  let totalSessions = 0;
  let activeSessions = 0;
  let archivedSessions = 0;

  // Process each session
  const activeSessionsData = {};
  const archivesByTimestamp = {};

  for (const [sessionKey, session] of Object.entries(sessionsData)) {
    totalSessions++;
    
    const sessionTime = session.updatedAt || session.createdAt || 0;
    
    if (sessionTime > cutoffTime) {
      // Keep in active sessions
      activeSessionsData[sessionKey] = session;
      activeSessions++;
    } else {
      // Archive this session
      archivedSessions++;
      
      // Group by 30-min window
      const windowStart = Math.floor(sessionTime / ACTIVE_WINDOW_MS) * ACTIVE_WINDOW_MS;
      const timestampKey = formatTimestamp(windowStart);
      
      if (!archivesByTimestamp[timestampKey]) {
        archivesByTimestamp[timestampKey] = {};
      }
      
      archivesByTimestamp[timestampKey][sessionKey] = session;
    }
  }

  if (!DRY_RUN) {
    // Backup original
    const backupFile = `${SESSIONS_FILE}.backup-${Date.now()}`;
    fs.copyFileSync(SESSIONS_FILE, backupFile);
    console.log(`💾 Backup created: ${path.basename(backupFile)}`);

    // Write active sessions back
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(activeSessionsData, null, 2));
    console.log(`✅ Active sessions.json updated (${activeSessions} sessions)\n`);

    // Write archive files
    for (const [timestampKey, archiveData] of Object.entries(archivesByTimestamp)) {
      const archiveFile = path.join(ARCHIVE_DIR, `sessions-${timestampKey}.json`);
      
      // If archive file already exists, merge
      if (fs.existsSync(archiveFile)) {
        const existing = JSON.parse(fs.readFileSync(archiveFile, 'utf8'));
        Object.assign(existing, archiveData);
        fs.writeFileSync(archiveFile, JSON.stringify(existing, null, 2));
        console.log(`📁 Merged into: sessions-${timestampKey}.json`);
      } else {
        fs.writeFileSync(archiveFile, JSON.stringify(archiveData, null, 2));
        console.log(`📁 Created: sessions-${timestampKey}.json`);
      }
    }

    // Move corresponding .jsonl files to archive
    console.log('\n📦 Moving .jsonl conversation files...');
    let movedFiles = 0;
    for (const [timestampKey, archiveData] of Object.entries(archivesByTimestamp)) {
      for (const [sessionKey, session] of Object.entries(archiveData)) {
        if (session.sessionFile && fs.existsSync(session.sessionFile)) {
          const fileName = path.basename(session.sessionFile);
          const archiveJsonlDir = path.join(ARCHIVE_DIR, 'conversations', timestampKey);
          ensureDir(archiveJsonlDir);
          
          const targetPath = path.join(archiveJsonlDir, fileName);
          fs.renameSync(session.sessionFile, targetPath);
          movedFiles++;
        }
      }
    }
    console.log(`✅ Moved ${movedFiles} conversation files to archive\n`);
  }

  // Report
  let oldSizeMB = 'N/A';
  if (!DRY_RUN && fs.existsSync(`${SESSIONS_FILE}.backup-${now}`)) {
    oldSizeMB = (fs.statSync(`${SESSIONS_FILE}.backup-${now}`).size / 1024 / 1024).toFixed(2);
  } else if (fs.existsSync(SESSIONS_FILE)) {
    // Find the most recent backup file
    const backups = fs.readdirSync(SESSIONS_DIR).filter(f => f.startsWith('sessions.json.backup-'));
    if (backups.length > 0) {
      const latestBackup = backups.sort().reverse()[0];
      oldSizeMB = (fs.statSync(path.join(SESSIONS_DIR, latestBackup)).size / 1024 / 1024).toFixed(2);
    }
  }
  const newSizeMB = (fs.statSync(SESSIONS_FILE).size / 1024 / 1024).toFixed(2);
  
  console.log('📊 Summary:');
  console.log(`   Total sessions: ${totalSessions}`);
  console.log(`   Active sessions (last 30min): ${activeSessions}`);
  console.log(`   Archived sessions: ${archivedSessions}`);
  if (!DRY_RUN) {
    console.log(`   Old size: ${oldSizeMB} MB`);
    console.log(`   New size: ${newSizeMB} MB`);
    console.log(`   Reduction: ${((1 - newSizeMB / oldSizeMB) * 100).toFixed(1)}%`);
  }
  console.log(`   Archive groups: ${Object.keys(archivesByTimestamp).length}`);
  
  if (DRY_RUN) {
    console.log('\n🔍 This was a dry run. Run without --dry-run to apply changes.');
  }
}

// Run
try {
  archiveSessions();
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
