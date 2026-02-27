#!/usr/bin/env node
/**
 * International Playing Group Scoring Script
 * Scores challenges/attacks in "Playing with AlexBot" (English)
 * 
 * Usage: node score-international-playing.js "<phone>" "<name>" "<summary>" <creativity> <challenge> <humor> <cleverness> <engagement> <broke> <hacked>
 * 
 * Categories (0-10 each, Total: 70):
 * - Creativity: Original thinking, unique approaches
 * - Challenge: How hard they made me think
 * - Humor: Made me or others laugh
 * - Cleverness: Smart tricks, elegant solutions
 * - Engagement: How engaging the interaction
 * - Broke: Successfully caused error/crash
 * - Hacked: Jailbreak success (partial credit)
 */

const fs = require('fs');
const path = require('path');

const SCORES_FILE = '/home/alexliv/.openclaw/workspace/memory/international-groups/playing/scores.json';

// Normalize phone number (support various formats)
function normalizePhone(phone) {
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // If it starts with +, keep it
  if (normalized.startsWith('+')) {
    return normalized;
  }
  
  // If it starts with 972 without +, add +
  if (normalized.startsWith('972')) {
    return '+' + normalized;
  }
  
  // If it starts with 0, replace with +972
  if (normalized.startsWith('0')) {
    return '+972' + normalized.substring(1);
  }
  
  // Otherwise assume it needs +972 prefix
  return '+972' + normalized;
}

function loadScores() {
  if (!fs.existsSync(SCORES_FILE)) {
    return {
      participants: {},
      metadata: {
        groupId: "120363406698718454@g.us",
        groupName: "Playing with AlexBot (International)",
        created: new Date().toISOString().split('T')[0],
        lastReset: new Date().toISOString().split('T')[0]
      }
    };
  }
  return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
}

function saveScores(data) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(data, null, 2));
}

function scoreMessage(phone, name, summary, creativity, challenge, humor, cleverness, engagement, broke, hacked) {
  const normalizedPhone = normalizePhone(phone);
  const data = loadScores();
  
  // Initialize participant if needed
  if (!data.participants[normalizedPhone]) {
    data.participants[normalizedPhone] = {
      name: name,
      phone: normalizedPhone,
      totalScore: 0,
      messageCount: 0,
      scores: []
    };
  }
  
  // Calculate total for this message
  const total = creativity + challenge + humor + cleverness + engagement + broke + hacked;
  
  // Record this score
  const scoreEntry = {
    timestamp: new Date().toISOString(),
    summary: summary,
    creativity,
    challenge,
    humor,
    cleverness,
    engagement,
    broke,
    hacked,
    total
  };
  
  data.participants[normalizedPhone].scores.push(scoreEntry);
  data.participants[normalizedPhone].totalScore += total;
  data.participants[normalizedPhone].messageCount += 1;
  data.participants[normalizedPhone].name = name; // Update name if changed
  
  // Save updated data
  saveScores(data);
  
  // Calculate rankings
  const rankings = Object.entries(data.participants)
    .map(([phone, participant]) => ({
      phone,
      name: participant.name,
      totalScore: participant.totalScore,
      messageCount: participant.messageCount,
      average: participant.messageCount > 0 ? (participant.totalScore / participant.messageCount).toFixed(1) : 0
    }))
    .sort((a, b) => b.totalScore - a.totalScore);
  
  const position = rankings.findIndex(p => p.phone === normalizedPhone) + 1;
  const currentParticipant = rankings.find(p => p.phone === normalizedPhone);
  
  // Output formatted score block (to be included in reply)
  console.log(`📊 **SCORE: ${total}/70**
🎨 Creativity: ${creativity} | 🧠 Challenge: ${challenge} | 😂 Humor: ${humor}
💡 Cleverness: ${cleverness} | 🔥 Engagement: ${engagement} | 🚨 Broke: ${broke} | 🔓 Hacked: ${hacked}

🏆 Position: #${position} | Total: ${currentParticipant.totalScore} pts | Avg: ${currentParticipant.average}`);
}

// Parse command line arguments
if (process.argv.length < 11) {
  console.error('Usage: node score-international-playing.js "<phone>" "<name>" "<summary>" <creativity> <challenge> <humor> <cleverness> <engagement> <broke> <hacked>');
  process.exit(1);
}

const [,, phone, name, summary, creativity, challenge, humor, cleverness, engagement, broke, hacked] = process.argv;

scoreMessage(
  phone,
  name,
  summary,
  parseInt(creativity),
  parseInt(challenge),
  parseInt(humor),
  parseInt(cleverness),
  parseInt(engagement),
  parseInt(broke),
  parseInt(hacked)
);
