import { RateLimiter } from '../lib/rate-limiter';

function describe(name: string, fn: () => void) { console.log(`\n${name}`); fn(); }
function it(name: string, fn: () => void) {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (e) { console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); process.exitCode = 1; }
}
function assert(cond: boolean, msg: string) { if (!cond) throw new Error(msg); }

describe('RateLimiter', () => {
  it('allows messages under burst limit', () => {
    const rl = new RateLimiter({ maxMessagesPerMinute: 5, burstLimit: 3, burstWindowSeconds: 10 });
    assert(!rl.check('user1').limited, 'msg 1 should pass');
    assert(!rl.check('user1').limited, 'msg 2 should pass');
    assert(!rl.check('user1').limited, 'msg 3 should pass');
  });

  it('blocks at burst limit', () => {
    const rl = new RateLimiter({ maxMessagesPerMinute: 5, burstLimit: 3, burstWindowSeconds: 10 });
    rl.check('user1');
    rl.check('user1');
    rl.check('user1');
    const result = rl.check('user1');
    assert(result.limited, 'msg 4 should be limited');
    assert(result.reason === 'burst', `reason should be burst, got ${result.reason}`);
    assert(typeof result.retryAfter === 'number', 'should have retryAfter');
  });

  it('blocks at sustained limit', () => {
    const rl = new RateLimiter({ maxMessagesPerMinute: 3, burstLimit: 10, burstWindowSeconds: 10 });
    rl.check('user1');
    rl.check('user1');
    rl.check('user1');
    const result = rl.check('user1');
    assert(result.limited, 'msg 4 should be limited');
    assert(result.reason === 'sustained', `reason should be sustained, got ${result.reason}`);
  });

  it('tracks users independently', () => {
    const rl = new RateLimiter({ maxMessagesPerMinute: 5, burstLimit: 2, burstWindowSeconds: 10 });
    rl.check('user1');
    rl.check('user1');
    const r1 = rl.check('user1');
    const r2 = rl.check('user2');
    assert(r1.limited, 'user1 should be limited');
    assert(!r2.limited, 'user2 should not be limited');
  });

  it('exports and imports state', () => {
    const rl1 = new RateLimiter({ maxMessagesPerMinute: 5, burstLimit: 3, burstWindowSeconds: 10 });
    rl1.check('user1');
    rl1.check('user1');
    rl1.check('user1');
    rl1.check('user1'); // triggers backoff

    const exported = rl1.exportState();
    const rl2 = new RateLimiter({ maxMessagesPerMinute: 5, burstLimit: 3, burstWindowSeconds: 10 });
    rl2.importState(exported);

    const state = rl2.getUserState('user1');
    assert(state !== undefined, 'user1 should exist after import');
    assert(state!.backoffLevel > 0, 'backoff should be preserved');
  });

  it('returns currently limited users', () => {
    const rl = new RateLimiter({ maxMessagesPerMinute: 5, burstLimit: 2, burstWindowSeconds: 10 });
    rl.check('user1');
    rl.check('user1');
    rl.check('user1'); // triggers limit

    const limited = rl.getCurrentlyLimited();
    assert(limited.includes('user1'), 'user1 should be in limited list');
  });
});
