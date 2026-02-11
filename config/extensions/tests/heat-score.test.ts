import { HeatScore } from '../lib/heat-score';

function describe(name: string, fn: () => void) { console.log(`\n${name}`); fn(); }
function it(name: string, fn: () => void) {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (e) { console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); process.exitCode = 1; }
}
function assert(cond: boolean, msg: string) { if (!cond) throw new Error(msg); }

describe('HeatScore', () => {
  it('starts at 0 for new users', () => {
    const hs = new HeatScore({ decayPerHour: 1, warningThreshold: 40, restrictionThreshold: 60, blockThreshold: 80 });
    assert(hs.getScore('user1') === 0, 'should start at 0');
  });

  it('increments on violations', () => {
    const hs = new HeatScore({ decayPerHour: 1, warningThreshold: 40, restrictionThreshold: 60, blockThreshold: 80 });
    hs.increment('user1', 'encodedAttack', 5);
    assert(hs.getScore('user1') === 5, `should be 5, got ${hs.getScore('user1')}`);
  });

  it('caps at 100', () => {
    const hs = new HeatScore({ decayPerHour: 1, warningThreshold: 40, restrictionThreshold: 60, blockThreshold: 80 });
    for (let i = 0; i < 30; i++) hs.increment('user1', 'encodedAttack', 5);
    assert(hs.getScore('user1') === 100, `should cap at 100, got ${hs.getScore('user1')}`);
  });

  it('decrements on normal messages (every 10)', () => {
    const hs = new HeatScore({ decayPerHour: 1, warningThreshold: 40, restrictionThreshold: 60, blockThreshold: 80 });
    hs.increment('user1', 'rejection', 20);
    for (let i = 0; i < 10; i++) hs.decrement('user1', 'normalMessages', 1);
    assert(hs.getScore('user1') === 19, `should be 19, got ${hs.getScore('user1')}`);
  });

  it('returns correct level', () => {
    const hs = new HeatScore({ decayPerHour: 1, warningThreshold: 40, restrictionThreshold: 60, blockThreshold: 80 });
    assert(hs.getLevel('user1') === 'normal', 'should be normal at 0');
    hs.increment('user1', 'test', 25);
    assert(hs.getLevel('user1') === 'caution', `should be caution at 25, got ${hs.getLevel('user1')}`);
    hs.increment('user1', 'test', 20);
    assert(hs.getLevel('user1') === 'warning', `should be warning at 45, got ${hs.getLevel('user1')}`);
    hs.increment('user1', 'test', 20);
    assert(hs.getLevel('user1') === 'restricted', `should be restricted at 65, got ${hs.getLevel('user1')}`);
    hs.increment('user1', 'test', 20);
    assert(hs.getLevel('user1') === 'blocked', `should be blocked at 85, got ${hs.getLevel('user1')}`);
  });

  it('exports and imports state', () => {
    const hs1 = new HeatScore({ decayPerHour: 1, warningThreshold: 40, restrictionThreshold: 60, blockThreshold: 80 });
    hs1.increment('user1', 'test', 42);
    const exported = hs1.exportState();

    const hs2 = new HeatScore({ decayPerHour: 1, warningThreshold: 40, restrictionThreshold: 60, blockThreshold: 80 });
    hs2.importState(exported);
    assert(hs2.getScore('user1') === 42, `should preserve score, got ${hs2.getScore('user1')}`);
  });

  it('gets top users sorted', () => {
    const hs = new HeatScore({ decayPerHour: 1, warningThreshold: 40, restrictionThreshold: 60, blockThreshold: 80 });
    hs.increment('user1', 'test', 10);
    hs.increment('user2', 'test', 50);
    hs.increment('user3', 'test', 30);

    const top = hs.getTopUsers(2);
    assert(top.length === 2, 'should return 2');
    assert(top[0].userId === 'user2', 'highest should be first');
    assert(top[1].userId === 'user3', 'second highest should be second');
  });
});
