/**
 * Heat Score System
 *
 * Tracks user reputation on a 0-100 scale.
 * Higher = more suspicious. Decays naturally over time.
 */

interface HeatScoreConfig {
  decayPerHour: number;
  warningThreshold: number;
  restrictionThreshold: number;
  blockThreshold: number;
}

interface UserHeatState {
  score: number;
  lastUpdate: number;
  lastDecay: number;
  normalMessages: number;
  history: { event: string; delta: number; time: number }[];
}

// Points added per event type
const HEAT_DELTAS: Record<string, number> = {
  burstMessage: 2,
  complexMessage: 1,
  encodedAttack: 5,
  rejection: 3,
  contextOverflow: 5,
};

// Points removed per event type
const COOL_DELTAS: Record<string, number> = {
  normalMessages: 1,  // per 10 normal messages
};

const MAX_HISTORY = 50;

class HeatScore {
  private users: Map<string, UserHeatState> = new Map();
  private config: HeatScoreConfig;

  constructor(config: HeatScoreConfig) {
    this.config = config;
  }

  get(userId: string): UserHeatState {
    const state = this.getOrCreate(userId);
    this.applyDecay(state);
    return { ...state };
  }

  getScore(userId: string): number {
    return this.get(userId).score;
  }

  increment(userId: string, event: string, amount?: number): number {
    const state = this.getOrCreate(userId);
    this.applyDecay(state);

    const delta = amount ?? HEAT_DELTAS[event] ?? 1;
    state.score = Math.min(100, state.score + delta);
    state.lastUpdate = Date.now();
    state.history.push({ event, delta, time: Date.now() });
    if (state.history.length > MAX_HISTORY) {
      state.history = state.history.slice(-MAX_HISTORY);
    }

    return state.score;
  }

  decrement(userId: string, event: string, amount?: number): number {
    const state = this.getOrCreate(userId);
    this.applyDecay(state);

    if (event === 'normalMessages') {
      state.normalMessages++;
      // Only cool down every 10 normal messages
      if (state.normalMessages % 10 === 0) {
        const delta = amount ?? COOL_DELTAS[event] ?? 1;
        state.score = Math.max(0, state.score - delta);
        state.lastUpdate = Date.now();
      }
    } else {
      const delta = amount ?? 1;
      state.score = Math.max(0, state.score - delta);
      state.lastUpdate = Date.now();
    }

    return state.score;
  }

  private applyDecay(state: UserHeatState): void {
    const now = Date.now();
    const hoursSinceDecay = (now - state.lastDecay) / 3600000;

    if (hoursSinceDecay >= 1) {
      const decayAmount = Math.floor(hoursSinceDecay) * this.config.decayPerHour;
      state.score = Math.max(0, state.score - decayAmount);
      state.lastDecay = now;
    }
  }

  private getOrCreate(userId: string): UserHeatState {
    let state = this.users.get(userId);
    if (!state) {
      const now = Date.now();
      state = {
        score: 0,
        lastUpdate: now,
        lastDecay: now,
        normalMessages: 0,
        history: [],
      };
      this.users.set(userId, state);
    }
    return state;
  }

  getLevel(userId: string): 'normal' | 'caution' | 'warning' | 'restricted' | 'blocked' {
    const score = this.getScore(userId);
    if (score >= this.config.blockThreshold) return 'blocked';
    if (score >= this.config.restrictionThreshold) return 'restricted';
    if (score >= this.config.warningThreshold) return 'warning';
    if (score > 20) return 'caution';
    return 'normal';
  }

  /** Get top N users by heat score */
  getTopUsers(n: number = 5): { userId: string; score: number; level: string }[] {
    const entries: { userId: string; score: number; level: string }[] = [];
    for (const [userId] of this.users) {
      const state = this.get(userId);
      entries.push({ userId, score: state.score, level: this.getLevel(userId) });
    }
    entries.sort((a, b) => b.score - a.score);
    return entries.slice(0, n);
  }

  /** Export state for persistence */
  exportState(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [userId, state] of this.users) {
      this.applyDecay(state);
      result[userId] = {
        score: state.score,
        lastUpdate: state.lastUpdate,
        lastDecay: state.lastDecay,
        normalMessages: state.normalMessages,
        history: state.history.slice(-10), // keep last 10 for persistence
      };
    }
    return result;
  }

  /** Import state from persistence */
  importState(data: Record<string, any>): void {
    for (const [userId, saved] of Object.entries(data)) {
      const now = Date.now();
      this.users.set(userId, {
        score: saved.score || 0,
        lastUpdate: saved.lastUpdate || now,
        lastDecay: saved.lastDecay || now,
        normalMessages: saved.normalMessages || 0,
        history: saved.history || [],
      });
    }
  }

  reset(userId: string): void {
    this.users.delete(userId);
  }

  resetAll(): void {
    this.users.clear();
  }
}

export { HeatScore, HeatScoreConfig, UserHeatState };
