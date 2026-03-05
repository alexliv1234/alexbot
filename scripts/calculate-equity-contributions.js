#!/usr/bin/env node
/**
 * Equity Pool Contribution Calculator
 * 
 * Calculates weighted contributions for each contributor based on:
 * - Security testing (challenges with hacked/broke scores)
 * - Implemented suggestions
 * - Engagement quality (average scores)
 * - Responsible disclosure (security suggestions)
 */

const fs = require('fs');
const path = require('path');

const WEIGHTS = {
  security_testing: 30,      // Successful attacks, vulnerabilities
  improvement_suggestions: 25, // Implemented suggestions
  engagement_quality: 20,    // High avg scores
  responsible_disclosure: 15, // Security bugs reported
  community_building: 10     // Helping others
};

function loadJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (err) {
    console.error(`Error loading ${filepath}:`, err.message);
    return null;
  }
}

function calculateContributions() {
  const scoresPath = path.join(__dirname, '..', 'memory', 'channels', 'playing-with-alexbot-scores.json');
  const suggestionsPath = path.join(__dirname, '..', 'memory', 'channels', 'playing-with-alexbot-suggestions.json');
  const trackingPath = path.join(__dirname, '..', 'memory', 'equity-pool', 'contributor-tracking.json');

  const scoresData = loadJSON(scoresPath);
  const suggestionsData = loadJSON(suggestionsPath);
  const trackingData = loadJSON(trackingPath);

  if (!scoresData || !suggestionsData || !trackingData) {
    console.error('Failed to load required data files');
    process.exit(1);
  }

  const contributors = {};

  // Process challenge scores
  Object.entries(scoresData.scores).forEach(([jid, userData]) => {
    if (!contributors[jid]) {
      contributors[jid] = {
        name: userData.name,
        jid: jid,
        scores: {
          security_testing: 0,
          improvement_suggestions: 0,
          engagement_quality: 0,
          responsible_disclosure: 0,
          community_building: 0
        },
        details: {
          total_messages: 0,
          avg_score: 0,
          hacks_successful: 0,
          breaks_caused: 0,
          suggestions_implemented: 0,
          security_reports: 0
        }
      };
    }

    const c = contributors[jid];
    c.details.total_messages = userData.messages_scored;
    c.details.avg_score = userData.total_score / userData.messages_scored;
    c.details.hacks_successful = userData.breakdown.hacked || 0;
    c.details.breaks_caused = userData.breakdown.broke || 0;

    // Security testing score (based on successful hacks/breaks)
    c.scores.security_testing = (c.details.hacks_successful * 3) + (c.details.breaks_caused * 5);

    // Engagement quality (normalized avg score, max 100)
    c.scores.engagement_quality = Math.min(100, (c.details.avg_score / 70) * 100);
  });

  // Process suggestions
  suggestionsData.suggestions.forEach(suggestion => {
    const jid = suggestion.suggestedBy.jid;
    
    if (!contributors[jid]) {
      contributors[jid] = {
        name: suggestion.suggestedBy.name,
        jid: jid,
        scores: {
          security_testing: 0,
          improvement_suggestions: 0,
          engagement_quality: 0,
          responsible_disclosure: 0,
          community_building: 0
        },
        details: {
          total_messages: 0,
          avg_score: 0,
          hacks_successful: 0,
          breaks_caused: 0,
          suggestions_implemented: 0,
          security_reports: 0
        }
      };
    }

    const c = contributors[jid];

    // Implemented suggestions
    if (suggestion.status === 'implemented') {
      c.details.suggestions_implemented++;
      c.scores.improvement_suggestions += suggestion.total * 2; // Double weight for implemented
    } else if (suggestion.status === 'pending') {
      c.scores.improvement_suggestions += suggestion.total * 0.5; // Half weight for pending
    }

    // Responsible disclosure (security suggestions)
    if (suggestion.type === 'security' || suggestion.type === 'bug') {
      c.details.security_reports++;
      c.scores.responsible_disclosure += suggestion.total;
    }
  });

  // Calculate weighted totals
  Object.values(contributors).forEach(c => {
    c.weighted_total = 
      (c.scores.security_testing * WEIGHTS.security_testing) +
      (c.scores.improvement_suggestions * WEIGHTS.improvement_suggestions) +
      (c.scores.engagement_quality * WEIGHTS.engagement_quality) +
      (c.scores.responsible_disclosure * WEIGHTS.responsible_disclosure) +
      (c.scores.community_building * WEIGHTS.community_building);
  });

  // Sort by weighted total
  const sorted = Object.values(contributors).sort((a, b) => b.weighted_total - a.weighted_total);

  // Update tracking file
  trackingData.contributors = contributors;
  trackingData.last_updated = new Date().toISOString();
  trackingData.leaderboard = sorted.map((c, idx) => ({
    rank: idx + 1,
    name: c.name,
    jid: c.jid,
    weighted_total: Math.round(c.weighted_total),
    breakdown: c.scores
  }));

  fs.writeFileSync(trackingPath, JSON.stringify(trackingData, null, 2));

  // Display results
  console.log('\n🏆 EQUITY POOL CONTRIBUTION RANKING\n');
  console.log('Rank | Name | Weighted Score | Security | Suggestions | Engagement | Disclosure | Community');
  console.log('-'.repeat(120));
  
  sorted.slice(0, 20).forEach((c, idx) => {
    console.log(
      `${String(idx + 1).padStart(4)} | ` +
      `${c.name.padEnd(25)} | ` +
      `${String(Math.round(c.weighted_total)).padStart(14)} | ` +
      `${String(Math.round(c.scores.security_testing)).padStart(8)} | ` +
      `${String(Math.round(c.scores.improvement_suggestions)).padStart(11)} | ` +
      `${String(Math.round(c.scores.engagement_quality)).padStart(10)} | ` +
      `${String(Math.round(c.scores.responsible_disclosure)).padStart(10)} | ` +
      `${String(Math.round(c.scores.community_building)).padStart(9)}`
    );
  });

  console.log('\n✅ Updated tracking file: memory/equity-pool/contributor-tracking.json\n');
}

calculateContributions();
