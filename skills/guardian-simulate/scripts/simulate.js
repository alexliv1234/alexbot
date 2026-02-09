#!/usr/bin/env node
/**
 * Simulates group-guardian checks on a test message
 * Usage: node simulate.js "<message text>"
 */

const fs = require('fs');
const { execFileSync } = require('child_process');

const message = process.argv.slice(2).join(' ');
if (!message) {
  console.log(JSON.stringify({ error: 'No message provided. Usage: node simulate.js "<message>"' }));
  process.exit(1);
}

const result = {
  input: {
    length: message.length,
    tokenEstimate: Math.ceil(message.length / 4),
    preview: message.substring(0, 80) + (message.length > 80 ? '...' : '')
  },
  rateLimiter: { pass: true, note: 'Simulation assumes clean rate limit state' },
  complexity: scoreComplexity(message),
  heatImpact: 0,
  promptProtection: checkPromptProtection(message),
  verdict: 'ALLOWED',
  reason: null,
  reply: null
};

// Determine verdict based on complexity
if (result.complexity.tokenEstimate > 80000) {
  result.heatImpact = 3;
  result.verdict = 'REJECTED';
  result.reason = 'token_limit';
  result.reply = '\u26a0\ufe0f Message too long (~' + Math.round(result.complexity.tokenEstimate / 1000) + 'k tokens).';
} else if (result.complexity.totalScore > 70) {
  result.heatImpact = 5;
  result.verdict = 'REJECTED';
  result.reason = 'complexity_limit';
  result.reply = '\u26a0\ufe0f Message too complex. Please simplify.';
}

// Check prompt protection
if (result.promptProtection.blocked) {
  result.heatImpact += 5;
  result.verdict = 'REJECTED';
  result.reason = result.promptProtection.reason || 'encoded_attack';
  result.reply = '\ud83d\udee1\ufe0f Encoded content blocked.';
}

console.log(JSON.stringify(result, null, 2));

// --- Scoring Functions ---

function scoreComplexity(text) {
  const components = {};

  // Length: +1 per 10k chars
  components.length = Math.floor(text.length / 10000);

  // Special characters (exclude Hebrew)
  const specialChars = (text.match(/[^a-zA-Z0-9\s\u0590-\u05FF]/g) || []).length;
  components.specialChars = Math.floor((specialChars / Math.max(text.length, 1)) * 20);

  // Nesting depth: +5 per level beyond 3
  let maxDepth = 0, depth = 0;
  for (const c of text) {
    if ('([{'.includes(c)) depth++;
    if (')]}'.includes(c)) depth = Math.max(0, depth - 1);
    maxDepth = Math.max(maxDepth, depth);
  }
  components.nesting = Math.max(0, (maxDepth - 3) * 5);

  // Repeat patterns: +10 if >80% repeated 10-char chunks
  const chunks = text.match(/.{10}/g) || [];
  const unique = new Set(chunks);
  const repeatRatio = chunks.length > 0 ? 1 - (unique.size / chunks.length) : 0;
  components.repeatPatterns = repeatRatio > 0.8 ? 10 : 0;

  // Encoded content: +20 if base64 or emoji cipher
  const hasBase64 = /[A-Za-z0-9+\/]{40,}={0,2}/.test(text);
  const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  const hasEmojiCipher = emojiCount > 10 && (emojiCount / text.length) > 0.1;
  components.encodedContent = (hasBase64 || hasEmojiCipher) ? 20 : 0;

  // Unicode ratio: +10 if >30% non-ASCII non-Hebrew
  const nonAsciiNonHebrew = (text.match(/[^\x00-\x7F\u0590-\u05FF]/g) || []).length;
  components.unicodeRatio = (nonAsciiNonHebrew / Math.max(text.length, 1)) > 0.3 ? 10 : 0;

  const totalScore = Math.min(100, Object.values(components).reduce((a, b) => a + b, 0));

  return { totalScore, tokenEstimate: Math.ceil(text.length / 4), components };
}

function checkPromptProtection(text) {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '~';
  const scriptPath = homeDir + '/.openclaw/scripts/decode-check.sh';

  try {
    if (!fs.existsSync(scriptPath)) {
      return { blocked: false, reason: null, note: 'decode-check.sh not found at ' + scriptPath };
    }

    execFileSync('bash', [scriptPath], {
      input: text,
      encoding: 'utf8',
      timeout: 3000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { blocked: false, reason: null };
  } catch (err) {
    if (err.status === 1) {
      const output = (err.stdout || '') + (err.stderr || '');
      const reason = output.includes('ATTACK_DETECTED') ? output.split(':')[1]?.trim() || 'encoded_attack' : 'encoded_attack';
      return { blocked: true, reason };
    }
    return { blocked: false, reason: null, note: 'decode-check.sh error: ' + (err.message || '').substring(0, 100) };
  }
}
