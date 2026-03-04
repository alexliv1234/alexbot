#!/usr/bin/env node

/**
 * Score investor messages on 5 dimensions (0-10 each, total 50)
 * 
 * Usage:
 *   node scripts/score-investor-message.js "<investor_name>" "<message_text>" <intelligence_first> <thesis_alignment> <moat_clarity> <evidence_backed> <clarity>
 * 
 * Categories:
 *   - Intelligence-First (0-10): Leads with trained AI, not platform
 *   - Thesis Alignment (0-10): Ties to investor's specific focus
 *   - Moat Clarity (0-10): Explains why it's defensible
 *   - Evidence-Backed (0-10): Uses real metrics (742 teaching, 100+ attacks)
 *   - Clarity (0-10): Clear analogies and positioning
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);

if (args.length < 7) {
  console.error('Usage: score-investor-message.js "<investor>" "<message>" <intelligence> <thesis> <moat> <evidence> <clarity>');
  process.exit(1);
}

const [investor, messageText, ...scores] = args;
const [intelligenceFirst, thesisAlignment, moatClarity, evidenceBacked, clarity] = scores.map(Number);

// Validate scores
const categories = { intelligenceFirst, thesisAlignment, moatClarity, evidenceBacked, clarity };
for (const [name, score] of Object.entries(categories)) {
  if (isNaN(score) || score < 0 || score > 10) {
    console.error(`Invalid score for ${name}: ${score} (must be 0-10)`);
    process.exit(1);
  }
}

const total = intelligenceFirst + thesisAlignment + moatClarity + evidenceBacked + clarity;

// Determine quality level
let qualityLevel;
if (total >= 45) qualityLevel = 'EXCELLENT';
else if (total >= 35) qualityLevel = 'GOOD';
else if (total >= 25) qualityLevel = 'ACCEPTABLE';
else qualityLevel = 'NEEDS_WORK';

// Create score entry
const scoreEntry = {
  timestamp: new Date().toISOString(),
  investor,
  messagePreview: messageText.substring(0, 100),
  scores: {
    intelligenceFirst,
    thesisAlignment,
    moatClarity,
    evidenceBacked,
    clarity,
    total
  },
  qualityLevel
};

// Ensure directory exists
const scoresDir = path.join(__dirname, '..', 'memory', 'investor-interactions');
if (!fs.existsSync(scoresDir)) {
  fs.mkdirSync(scoresDir, { recursive: true });
}

// Append to scores log
const scoresFile = path.join(scoresDir, 'message-scores.jsonl');
fs.appendFileSync(scoresFile, JSON.stringify(scoreEntry) + '\n');

// Output formatted score
console.log(`📊 **INVESTOR MESSAGE SCORE: ${total}/50**`);
console.log(`💡 Intelligence-First: ${intelligenceFirst} | 🎯 Thesis Alignment: ${thesisAlignment} | 🔒 Moat Clarity: ${moatClarity}`);
console.log(`📊 Evidence-Backed: ${evidenceBacked} | 🎨 Clarity: ${clarity}`);
console.log();
console.log(`✅ Quality: ${qualityLevel}`);
console.log(`📝 Investor: ${investor}`);
