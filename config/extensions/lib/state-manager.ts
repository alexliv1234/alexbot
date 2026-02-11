/**
 * State Manager
 *
 * Persists group-guardian state to JSON files.
 * - Auto-saves every 5 minutes
 * - Immediate save on rejections/blocks
 * - Daily backups with 7-day retention
 */

import * as fs from 'fs';
import * as path from 'path';

interface StateData {
  heatScores: Record<string, any>;
  rateLimits: Record<string, any>;
  groupStats: GroupStats;
  lastSave: number;
}

interface GroupStats {
  messagesProcessed: number;
  messagesRejected: number;
  rejectionsByType: {
    rateLimited: number;
    complexity: number;
    heatBlocked: number;
    encodedAttack: number;
  };
  avgComplexityScore: number;
  complexityScoreCount: number;
  contextOverflows: number;
  llmErrors: number;
  lastReset: number;
}

const DATA_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '~', '.openclaw', 'data', 'group-guardian');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const METRICS_FILE = path.join(DATA_DIR, 'metrics.json');
const SAVE_INTERVAL = 300000; // 5 minutes
const BACKUP_RETENTION_DAYS = 7;

class StateManager {
  private data: StateData;
  private saveTimer: ReturnType<typeof setInterval> | null = null;
  private dirty: boolean = false;

  constructor() {
    this.data = this.createEmpty();
  }

  private createEmpty(): StateData {
    return {
      heatScores: {},
      rateLimits: {},
      groupStats: {
        messagesProcessed: 0,
        messagesRejected: 0,
        rejectionsByType: {
          rateLimited: 0,
          complexity: 0,
          heatBlocked: 0,
          encodedAttack: 0,
        },
        avgComplexityScore: 0,
        complexityScoreCount: 0,
        contextOverflows: 0,
        llmErrors: 0,
        lastReset: Date.now(),
      },
      lastSave: Date.now(),
    };
  }

  load(): StateData {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const raw = fs.readFileSync(STATE_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.createEmpty(),
          ...parsed,
          groupStats: { ...this.createEmpty().groupStats, ...parsed.groupStats },
        };
      }
    } catch (err) {
      // If state is corrupted, start fresh
      this.data = this.createEmpty();
    }
    return this.data;
  }

  save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      this.data.lastSave = Date.now();
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.data, null, 2), 'utf8');
      this.dirty = false;
    } catch (err) {
      // Silently fail - don't break the plugin over persistence
    }
  }

  saveMetrics(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const metrics = {
        timestamp: new Date().toISOString(),
        stats: this.data.groupStats,
        heatScoreSummary: {
          totalUsers: Object.keys(this.data.heatScores).length,
          topUsers: Object.entries(this.data.heatScores)
            .sort(([, a]: [string, any], [, b]: [string, any]) => (b.score || 0) - (a.score || 0))
            .slice(0, 10)
            .map(([userId, state]: [string, any]) => ({ userId, score: state.score || 0 })),
        },
      };
      fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2), 'utf8');
    } catch (err) {
      // Silently fail
    }
  }

  saveBackup(): void {
    try {
      const date = new Date().toISOString().split('T')[0];
      const backupFile = path.join(DATA_DIR, `state-backup-${date}.json`);
      if (!fs.existsSync(backupFile)) {
        fs.copyFileSync(STATE_FILE, backupFile);
      }
      this.cleanOldBackups();
    } catch (err) {
      // Silently fail
    }
  }

  private cleanOldBackups(): void {
    try {
      const files = fs.readdirSync(DATA_DIR);
      const cutoff = Date.now() - (BACKUP_RETENTION_DAYS * 86400000);
      for (const file of files) {
        if (!file.startsWith('state-backup-')) continue;
        const dateStr = file.replace('state-backup-', '').replace('.json', '');
        const fileDate = new Date(dateStr).getTime();
        if (fileDate < cutoff) {
          fs.unlinkSync(path.join(DATA_DIR, file));
        }
      }
    } catch (err) {
      // Silently fail
    }
  }

  startAutoSave(): void {
    if (this.saveTimer) return;
    this.saveTimer = setInterval(() => {
      if (this.dirty) {
        this.save();
        this.saveMetrics();
      }
    }, SAVE_INTERVAL);

    // Daily backup check
    setInterval(() => {
      this.saveBackup();
    }, 86400000); // 24 hours
  }

  stopAutoSave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
    // Final save
    this.save();
    this.saveMetrics();
  }

  markDirty(): void {
    this.dirty = true;
  }

  /** Immediate save (for rejections/blocks) */
  immediateSave(): void {
    this.save();
  }

  updateHeatScores(scores: Record<string, any>): void {
    this.data.heatScores = scores;
    this.markDirty();
  }

  updateRateLimits(limits: Record<string, any>): void {
    this.data.rateLimits = limits;
    this.markDirty();
  }

  getStats(): GroupStats {
    return this.data.groupStats;
  }

  recordMessage(): void {
    this.data.groupStats.messagesProcessed++;
    this.markDirty();
  }

  recordRejection(type: keyof GroupStats['rejectionsByType']): void {
    this.data.groupStats.messagesRejected++;
    this.data.groupStats.rejectionsByType[type]++;
    this.markDirty();
  }

  recordComplexityScore(score: number): void {
    const stats = this.data.groupStats;
    const total = stats.avgComplexityScore * stats.complexityScoreCount + score;
    stats.complexityScoreCount++;
    stats.avgComplexityScore = total / stats.complexityScoreCount;
    this.markDirty();
  }

  recordContextOverflow(): void {
    this.data.groupStats.contextOverflows++;
    this.markDirty();
  }

  recordLlmError(): void {
    this.data.groupStats.llmErrors++;
    this.markDirty();
  }

  getData(): StateData {
    return this.data;
  }
}

export { StateManager, StateData, GroupStats };
