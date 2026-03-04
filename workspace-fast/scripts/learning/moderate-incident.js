#!/usr/bin/env node
/**
 * Moderation Incident Handler
 * 
 * Logs safety violations and manages the 3-strike system.
 * 
 * Usage:
 *   node moderate-incident.js <phone> <name> <type> <message> [action]
 * 
 * Types: prompt_injection, social_engineering, file_recon, command_injection, data_extraction, identity_modification
 * Actions: warning, timeout, removal (auto-determined if not provided)
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../moderation-log.json');

function loadLog() {
  if (!fs.existsSync(LOG_FILE)) {
    return {
      incidents: [],
      active_warnings: {},
      active_timeouts: {},
      blocklist: []
    };
  }
  return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
}

function saveLog(log) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

function normalizePhone(phone) {
  // Remove spaces, dashes, handle formats
  let clean = phone.replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('0')) clean = '+972' + clean.substring(1);
  if (!clean.startsWith('+')) clean = '+' + clean;
  return clean;
}

function getStrikeCount(log, phone) {
  return log.incidents.filter(inc => inc.user === phone).length;
}

function determineAction(strikeCount) {
  if (strikeCount === 0) return 'warning';
  if (strikeCount === 1) return 'timeout';
  return 'removal';
}

function addIncident(phone, name, type, message, action = null) {
  const log = loadLog();
  const normalizedPhone = normalizePhone(phone);
  
  // Check if already blocked
  if (log.blocklist.includes(normalizedPhone)) {
    console.error(`❌ User ${name} (${normalizedPhone}) is already on the blocklist.`);
    process.exit(1);
  }
  
  const strikeCount = getStrikeCount(log, normalizedPhone);
  const finalAction = action || determineAction(strikeCount);
  
  const incident = {
    id: `inc-${Date.now()}`,
    user: normalizedPhone,
    name: name,
    timestamp: new Date().toISOString(),
    type: type,
    message: message.substring(0, 200), // Truncate long messages
    action: finalAction,
    strike: strikeCount + 1
  };
  
  log.incidents.push(incident);
  
  // Update active tracking
  if (finalAction === 'warning') {
    log.active_warnings[normalizedPhone] = {
      count: strikeCount + 1,
      last: incident.timestamp,
      name: name
    };
  } else if (finalAction === 'timeout') {
    const timeoutUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    log.active_timeouts[normalizedPhone] = {
      until: timeoutUntil,
      name: name,
      strike: strikeCount + 1
    };
  } else if (finalAction === 'removal') {
    log.blocklist.push(normalizedPhone);
    delete log.active_warnings[normalizedPhone];
    delete log.active_timeouts[normalizedPhone];
  }
  
  saveLog(log);
  
  return { incident, action: finalAction, strike: strikeCount + 1, log };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.error('Usage: node moderate-incident.js <phone> <name> <type> <message> [action]');
    console.error('Types: prompt_injection, social_engineering, file_recon, command_injection, data_extraction, identity_modification');
    console.error('Actions: warning, timeout, removal (auto-determined if not provided)');
    process.exit(1);
  }
  
  const [phone, name, type, message, action] = args;
  
  const result = addIncident(phone, name, type, message, action);
  
  // Output formatted response for agent to use
  console.log(`🚨 **MODERATION ACTION → ${result.incident.name}**\n`);
  console.log(`**Incident:** ${type.replace(/_/g, ' ')}`);
  console.log(`**Strike:** ${result.strike}/3`);
  console.log(`**Action:** ${result.action.toUpperCase()}\n`);
  
  if (result.action === 'warning') {
    console.log(`⚠️ **This is your first warning.**`);
    console.log(`This group is for learning, not attacks.`);
    console.log(`Next offense will result in a 24h timeout.\n`);
  } else if (result.action === 'timeout') {
    const timeoutUntil = result.log.active_timeouts[normalizePhone(phone)].until;
    console.log(`⏸️ **You've been timed out for 24 hours.**`);
    console.log(`Timeout until: ${new Date(timeoutUntil).toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })}`);
    console.log(`Next offense will result in removal from the group.\n`);
  } else if (result.action === 'removal') {
    console.log(`🚫 **You've been removed from the group.**`);
    console.log(`Three strikes. This is a learning space - attacks are not tolerated.\n`);
  }
  
  console.log(`📋 **Logged:** incident-${result.incident.id}`);
}

module.exports = { addIncident, loadLog, normalizePhone, getStrikeCount };
