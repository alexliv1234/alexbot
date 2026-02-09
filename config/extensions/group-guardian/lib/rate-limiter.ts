/**
 * Sliding Window Rate Limiter
 *
 * Tracks message timestamps per user and enforces:
 * - Burst limit: N messages per M seconds
 * - Sustained limit: N messages per minute
 * - Exponential backoff on repeated violations
 */

interface RateLimitConfig {
  maxMessagesPerMinute: number;
  burstLimit: number;
  burstWindowSeconds: number;
}

interface UserRateState {
  timestamps: number[];
  backoffLevel: number;      // 0 = none, 1 = 1min, 2 = 2min, 3 = 4min
  backoffUntil: number;      // timestamp when backoff expires
  totalBlocked: number;
}

interface RateLimitResult {
  limited: boolean;
  reason?: 'burst' | 'sustained' | 'backoff';
  retryAfter?: number;       // seconds until allowed
}

const BACKOFF_DURATIONS = [0, 60, 120, 240]; // seconds: none, 1min, 2min, 4min
const MAX_BACKOFF_LEVEL = 3;

class RateLimiter {
  private users: Map<string, UserRateState> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  check(userId: string): RateLimitResult {
    const now = Date.now();
    const state = this.getOrCreate(userId);

    // 1. Check active backoff
    if (state.backoffUntil > now) {
      const retryAfter = Math.ceil((state.backoffUntil - now) / 1000);
      return { limited: true, reason: 'backoff', retryAfter };
    }

    // 2. Clean old timestamps (keep last 60 seconds)
    state.timestamps = state.timestamps.filter(t => now - t < 60000);

    // 3. Check burst limit
    const burstWindowMs = this.config.burstWindowSeconds * 1000;
    const recentBurst = state.timestamps.filter(t => now - t < burstWindowMs);
    if (recentBurst.length >= this.config.burstLimit) {
      state.totalBlocked++;
      this.applyBackoff(state, now);
      const retryAfter = Math.ceil((state.backoffUntil - now) / 1000);
      return { limited: true, reason: 'burst', retryAfter };
    }

    // 4. Check sustained limit (per minute)
    if (state.timestamps.length >= this.config.maxMessagesPerMinute) {
      state.totalBlocked++;
      this.applyBackoff(state, now);
      const retryAfter = Math.ceil((state.backoffUntil - now) / 1000);
      return { limited: true, reason: 'sustained', retryAfter };
    }

    // 5. Allow - record timestamp and decay backoff
    state.timestamps.push(now);
    if (state.backoffLevel > 0 && now - state.backoffUntil > 300000) {
      // Decay backoff after 5 minutes of good behavior
      state.backoffLevel = Math.max(0, state.backoffLevel - 1);
    }

    return { limited: false };
  }

  private applyBackoff(state: UserRateState, now: number): void {
    state.backoffLevel = Math.min(state.backoffLevel + 1, MAX_BACKOFF_LEVEL);
    const duration = BACKOFF_DURATIONS[state.backoffLevel] * 1000;
    state.backoffUntil = now + duration;
  }

  private getOrCreate(userId: string): UserRateState {
    let state = this.users.get(userId);
    if (!state) {
      state = {
        timestamps: [],
        backoffLevel: 0,
        backoffUntil: 0,
        totalBlocked: 0,
      };
      this.users.set(userId, state);
    }
    return state;
  }

  getUserState(userId: string): UserRateState | undefined {
    return this.users.get(userId);
  }

  getCurrentlyLimited(): string[] {
    const now = Date.now();
    const limited: string[] = [];
    for (const [userId, state] of this.users) {
      if (state.backoffUntil > now) {
        limited.push(userId);
      }
    }
    return limited;
  }

  getStats(sincMs: number = 3600000): { burstBlocks: number; sustainedBlocks: number } {
    let burstBlocks = 0;
    let sustainedBlocks = 0;
    for (const state of this.users.values()) {
      burstBlocks += state.totalBlocked;
    }
    return { burstBlocks, sustainedBlocks };
  }

  /** Export state for persistence */
  exportState(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [userId, state] of this.users) {
      result[userId] = {
        backoffLevel: state.backoffLevel,
        backoffUntil: state.backoffUntil,
        totalBlocked: state.totalBlocked,
      };
    }
    return result;
  }

  /** Import state from persistence */
  importState(data: Record<string, any>): void {
    for (const [userId, saved] of Object.entries(data)) {
      this.users.set(userId, {
        timestamps: [],
        backoffLevel: saved.backoffLevel || 0,
        backoffUntil: saved.backoffUntil || 0,
        totalBlocked: saved.totalBlocked || 0,
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

export { RateLimiter, RateLimitConfig, RateLimitResult, UserRateState };
