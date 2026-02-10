#!/usr/bin/env node
/**
 * Add Community Contribution
 * 
 * Tracks contributions to the knowledge base.
 * 
 * Usage:
 *   node add-contribution.js <phone> <name> <type> <title> <file> [impact]
 * 
 * Types: idea, tutorial, code, case-study
 * Impact: low, medium, high (default: medium)
 */

const fs = require('fs');
const path = require('path');

const CONTRIB_FILE = '/home/alexliv/.openclaw/alexbot/knowledge-base/community/contributions.json';

function loadContributions() {
  if (!fs.existsSync(CONTRIB_FILE)) {
    return {
      contributors: {},
      total_contributions: 0,
      last_updated: new Date().toISOString()
    };
  }
  return JSON.parse(fs.readFileSync(CONTRIB_FILE, 'utf8'));
}

function saveContributions(data) {
  fs.writeFileSync(CONTRIB_FILE, JSON.stringify(data, null, 2));
}

function normalizePhone(phone) {
  let clean = phone.replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('0')) clean = '+972' + clean.substring(1);
  if (!clean.startsWith('+')) clean = '+' + clean;
  return clean;
}

function addContribution(phone, name, type, title, file, impact = 'medium') {
  const data = loadContributions();
  const normalizedPhone = normalizePhone(phone);
  
  if (!data.contributors[normalizedPhone]) {
    data.contributors[normalizedPhone] = {
      name: name,
      contributions: [],
      total_impact: 'low'
    };
  }
  
  const contribution = {
    id: `contrib-${Date.now()}`,
    type: type,
    title: title,
    file: file,
    date: new Date().toISOString().split('T')[0],
    impact: impact,
    used_by: 0
  };
  
  data.contributors[normalizedPhone].contributions.push(contribution);
  data.total_contributions++;
  data.last_updated = new Date().toISOString();
  
  // Recalculate total impact
  const impacts = data.contributors[normalizedPhone].contributions.map(c => c.impact);
  if (impacts.includes('high')) {
    data.contributors[normalizedPhone].total_impact = 'high';
  } else if (impacts.includes('medium')) {
    data.contributors[normalizedPhone].total_impact = 'medium';
  }
  
  saveContributions(data);
  
  return { contribution, contributor: data.contributors[normalizedPhone] };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 5) {
    console.error('Usage: node add-contribution.js <phone> <name> <type> <title> <file> [impact]');
    console.error('Types: idea, tutorial, code, case-study');
    console.error('Impact: low, medium, high (default: medium)');
    process.exit(1);
  }
  
  const [phone, name, type, title, file, impact] = args;
  
  const result = addContribution(phone, name, type, title, file, impact || 'medium');
  
  // Output formatted response for agent to use
  console.log(`✅ **Contribution Added! → ${result.contributor.name}**\n`);
  console.log(`**Title:** ${result.contribution.title}`);
  console.log(`**Type:** ${type}`);
  console.log(`**File:** ${file}`);
  console.log(`**Impact:** ${result.contribution.impact}\n`);
  console.log(`📊 **Total contributions from ${result.contributor.name}:** ${result.contributor.contributions.length}`);
  console.log(`🏆 **Overall impact:** ${result.contributor.total_impact}\n`);
  console.log(`Thank you for contributing to the community! 🎉`);
}

module.exports = { addContribution, loadContributions, normalizePhone };
