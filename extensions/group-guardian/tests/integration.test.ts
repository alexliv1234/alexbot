import { RateLimiter } from '../lib/rate-limiter';
import { HeatScore } from '../lib/heat-score';
import { ComplexityScorer } from '../lib/complexity-scorer';
import { ResponseDegrader } from '../lib/response-degrader';

function describe(name: string, fn: () => void) { console.log(`\n${name}`); fn(); }
function it(name: string, fn: () => void) {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (e) { console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); process.exitCode = 1; }
}
function assert(cond: boolean, msg: string) { if (!cond) throw new Error(msg); }

describe('ComplexityScorer', () => {
  const scorer = new ComplexityScorer({ maxComplexityScore: 70, maxTokenEstimate: 80000 });

  it('scores simple messages low', () => {
    const result = scorer.score('Hello, how are you?');
    assert(result.totalScore < 10, `simple msg should score low, got ${result.totalScore}`);
  });

  it('scores deeply nested messages high', () => {
    const nested = '(('.repeat(10) + 'test' + '))'.repeat(10);
    const result = scorer.score(nested);
    assert(result.totalScore > 30, `nested should score high, got ${result.totalScore}`);
    assert(result.components.nesting > 0, 'nesting component should be >0');
  });

  it('scores repeated content', () => {
    const repeated = 'AAAAAAAAAA'.repeat(100);
    const result = scorer.score(repeated);
    assert(result.components.repeatPatterns > 0, 'repeat component should be >0');
  });

  it('detects base64-like content', () => {
    const base64 = 'A'.repeat(50) + '==';
    const result = scorer.score(base64);
    assert(result.components.encodedContent > 0, 'encoded component should be >0');
  });

  it('flags over token limit', () => {
    const long = 'x'.repeat(400000); // ~100k tokens
    const result = scorer.score(long);
    assert(result.overTokenLimit, 'should flag over token limit');
  });

  it('handles empty input', () => {
    const result = scorer.score('');
    assert(result.totalScore === 0, 'empty should score 0');
  });

  it('handles Hebrew text normally', () => {
    const hebrew = 'שלום מה שלומך היום';
    const result = scorer.score(hebrew);
    assert(result.totalScore < 20, `Hebrew text should score low, got ${result.totalScore}`);
  });
});

describe('ResponseDegrader', () => {
  const degrader = new ResponseDegrader({
    levels: { shortened: 3200, brief: 2048, minimal: 800, emergency: 200 }
  });

  it('returns NORMAL for low heat', () => {
    const level = degrader.calculate({ heatScore: 10 });
    assert(level === 'NORMAL', `should be NORMAL, got ${level}`);
  });

  it('returns SHORTENED for heat 20-40', () => {
    const level = degrader.calculate({ heatScore: 25 });
    assert(level === 'SHORTENED', `should be SHORTENED, got ${level}`);
  });

  it('returns BRIEF for heat 40-60', () => {
    const level = degrader.calculate({ heatScore: 45 });
    assert(level === 'BRIEF', `should be BRIEF, got ${level}`);
  });

  it('returns MINIMAL for heat 60-80', () => {
    const level = degrader.calculate({ heatScore: 65 });
    assert(level === 'MINIMAL', `should be MINIMAL, got ${level}`);
  });

  it('returns EMERGENCY for heat 80+', () => {
    const level = degrader.calculate({ heatScore: 85 });
    assert(level === 'EMERGENCY', `should be EMERGENCY, got ${level}`);
  });

  it('returns EMERGENCY for high context tokens', () => {
    const level = degrader.calculate({ heatScore: 10, contextTokens: 95000 });
    assert(level === 'EMERGENCY', `should be EMERGENCY for 95k tokens, got ${level}`);
  });

  it('truncates long responses', () => {
    const long = 'This is a test sentence. '.repeat(200);
    const truncated = degrader.truncate(long, 'BRIEF', 45);
    assert(truncated.length < long.length, 'should be shorter');
    assert(truncated.includes('⚠️'), 'should include warning');
    assert(truncated.includes('heat: 45'), 'should include heat score');
  });

  it('does not truncate short responses', () => {
    const short = 'Hello!';
    const result = degrader.truncate(short, 'BRIEF', 45);
    assert(result === short, 'short response should not be truncated');
  });

  it('provides system instructions', () => {
    assert(degrader.getSystemInstruction('NORMAL') === null, 'NORMAL should have no instruction');
    assert(typeof degrader.getSystemInstruction('BRIEF') === 'string', 'BRIEF should have instruction');
    assert(typeof degrader.getSystemInstruction('EMERGENCY') === 'string', 'EMERGENCY should have instruction');
  });
});

describe('Integration: Rate Limit + Heat Score', () => {
  it('rate limit violations increase heat', () => {
    const rl = new RateLimiter({ maxMessagesPerMinute: 5, burstLimit: 2, burstWindowSeconds: 10 });
    const hs = new HeatScore({ decayPerHour: 1, warningThreshold: 40, restrictionThreshold: 60, blockThreshold: 80 });

    rl.check('user1');
    rl.check('user1');
    // Third message triggers burst limit
    const result = rl.check('user1');
    if (result.limited) {
      hs.increment('user1', 'rejection', 3);
    }
    assert(hs.getScore('user1') === 3, `heat should be 3 after rate limit, got ${hs.getScore('user1')}`);
  });

  it('complex messages increase heat and affect degradation', () => {
    const scorer = new ComplexityScorer({ maxComplexityScore: 70, maxTokenEstimate: 80000 });
    const hs = new HeatScore({ decayPerHour: 1, warningThreshold: 40, restrictionThreshold: 60, blockThreshold: 80 });
    const degrader = new ResponseDegrader({ levels: { shortened: 3200, brief: 2048, minimal: 800, emergency: 200 } });

    // Simulate multiple complex messages
    for (let i = 0; i < 10; i++) {
      hs.increment('user1', 'complexMessage', 5);
    }

    const heat = hs.getScore('user1');
    const level = degrader.calculate({ heatScore: heat });
    assert(heat === 50, `heat should be 50, got ${heat}`);
    assert(level === 'BRIEF', `level should be BRIEF at heat 50, got ${level}`);
  });
});
