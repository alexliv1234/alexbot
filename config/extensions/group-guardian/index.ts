/**
 * Group Guardian Plugin
 *
 * Protects the playing group against context explosion and LLM errors
 * through rate limiting, complexity screening, heat scoring, and
 * graceful degradation.
 *
 * Hooks used:
 * - before_message_processing (PATCHED) - Inbound filter: rate limit, complexity, heat
 * - before_agent_start (NATIVE) - System prompt injection for degradation
 * - message_sending (PATCHED) - Outbound truncation when degraded
 * - agent_error (NATIVE) - Error tracking for heat + degradation
 */

import { RateLimiter, RateLimitConfig } from './lib/rate-limiter';
import { HeatScore, HeatScoreConfig } from './lib/heat-score';
import { ComplexityScorer, ComplexityConfig } from './lib/complexity-scorer';
import { ResponseDegrader, DegradationConfig, DegradationLevel } from './lib/response-degrader';
import { StateManager } from './lib/state-manager';

interface PluginApi {
  id: string;
  config: any;
  pluginConfig?: any;
  logger: {
    info?: (msg: string) => void;
    warn?: (msg: string) => void;
    error?: (msg: string) => void;
    debug?: (msg: string) => void;
  };
  registerHook: (events: string[], handler: (event: any, ctx?: any) => Promise<any>, options?: any) => void;
  on: (hookName: string, handler: (event: any, ctx?: any) => any, options?: any) => void;
}

interface GroupGuardianConfig {
  enabled: boolean;
  targetGroupId: string;
  ownerPhone: string;

  rateLimiting: {
    enabled: boolean;
    maxMessagesPerMinute: number;
    burstLimit: number;
    burstWindowSeconds: number;
  };

  heatScore: {
    enabled: boolean;
    decayPerHour: number;
    warningThreshold: number;
    restrictionThreshold: number;
    blockThreshold: number;
  };

  complexity: {
    enabled: boolean;
    maxComplexityScore: number;
    maxTokenEstimate: number;
  };

  degradation: {
    enabled: boolean;
    levels: {
      shortened: number;
      brief: number;
      minimal: number;
      emergency: number;
    };
  };

  notifications: {
    notifyOwnerOnBlock: boolean;
    notifyOwnerOnHighHeat: boolean;
    highHeatThreshold: number;
  };
}

const DEFAULT_CONFIG: GroupGuardianConfig = {
  enabled: true,
  targetGroupId: '120363405143589138@g.us',
  ownerPhone: '+972544419002',

  rateLimiting: {
    enabled: true,
    maxMessagesPerMinute: 5,
    burstLimit: 3,
    burstWindowSeconds: 10,
  },

  heatScore: {
    enabled: true,
    decayPerHour: 1,
    warningThreshold: 40,
    restrictionThreshold: 60,
    blockThreshold: 80,
  },

  complexity: {
    enabled: true,
    maxComplexityScore: 70,
    maxTokenEstimate: 80000,
  },

  degradation: {
    enabled: true,
    levels: {
      shortened: 3200,
      brief: 2048,
      minimal: 800,
      emergency: 200,
    },
  },

  notifications: {
    notifyOwnerOnBlock: true,
    notifyOwnerOnHighHeat: true,
    highHeatThreshold: 70,
  },
};

// Track last notification time to avoid spam
let lastOwnerNotification = 0;
const NOTIFICATION_COOLDOWN = 300000; // 5 minutes

async function notifyOwner(
  api: PluginApi,
  config: GroupGuardianConfig,
  event: string,
  details: Record<string, any>
): Promise<void> {
  const now = Date.now();
  if (now - lastOwnerNotification < NOTIFICATION_COOLDOWN) return;
  lastOwnerNotification = now;

  try {
    const { sendMessageWhatsApp } = await import('../../web/outbound.js');

    const message = `
🚨 Group Guardian Alert

Event: ${event}
User: ${details.userId || 'unknown'}
Heat Score: ${details.heatScore ?? 'N/A'}/100
Action: ${details.action || 'N/A'}

${details.extra || ''}

Time: ${new Date().toISOString()}
    `.trim();

    await Promise.race([
      sendMessageWhatsApp(config.ownerPhone, message, { verbose: false }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('notification timeout')), 10000)),
    ]);

    api.logger.info?.('[group-guardian] Owner notified');
  } catch (err) {
    api.logger.error?.(`[group-guardian] Failed to notify owner: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function extractUserId(eventOrCtx: any): string {
  // Try various shapes OpenClaw might provide
  return eventOrCtx?.from
    || eventOrCtx?.context?.from
    || eventOrCtx?.conversationId?.replace?.('whatsapp:', '')
    || eventOrCtx?.context?.conversationId?.replace?.('whatsapp:', '')
    || 'unknown';
}

// Plugin registration
export default function register(api: PluginApi) {
  // Merge config (api.pluginConfig is pre-resolved by OpenClaw)
  const userConfig = api.pluginConfig ?? api.config.plugins?.entries?.['group-guardian']?.config ?? {};
  const config: GroupGuardianConfig = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    rateLimiting: { ...DEFAULT_CONFIG.rateLimiting, ...userConfig.rateLimiting },
    heatScore: { ...DEFAULT_CONFIG.heatScore, ...userConfig.heatScore },
    complexity: { ...DEFAULT_CONFIG.complexity, ...userConfig.complexity },
    degradation: {
      ...DEFAULT_CONFIG.degradation,
      ...userConfig.degradation,
      levels: { ...DEFAULT_CONFIG.degradation.levels, ...userConfig.degradation?.levels },
    },
    notifications: { ...DEFAULT_CONFIG.notifications, ...userConfig.notifications },
  };

  if (!config.enabled) {
    api.logger.info?.('[group-guardian] Plugin disabled');
    return;
  }

  // Initialize components
  const rateLimiter = new RateLimiter(config.rateLimiting);
  const heatScore = new HeatScore(config.heatScore);
  const complexityScorer = new ComplexityScorer(config.complexity);
  const responseDegrader = new ResponseDegrader(config.degradation);
  const stateManager = new StateManager();

  // Load persisted state
  const savedState = stateManager.load();
  if (savedState.heatScores) heatScore.importState(savedState.heatScores);
  if (savedState.rateLimits) rateLimiter.importState(savedState.rateLimits);

  // Start auto-save
  stateManager.startAutoSave();

  // Persist state on exit
  const shutdown = () => {
    stateManager.updateHeatScores(heatScore.exportState());
    stateManager.updateRateLimits(rateLimiter.exportState());
    stateManager.stopAutoSave();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  api.logger.info?.(`[group-guardian] Plugin loaded - protecting group ${config.targetGroupId}`);

  // ── Hook 1: before_message_processing (Inbound Filter) ──────────
  // Priority 50: runs BEFORE prompt-protection (priority 100)
  api.registerHook(
    ['before_message_processing'],
    async (event: any) => {
      try {
        const userId = event.from || 'unknown';
        const groupId = event.conversationId || event.context?.conversationId || '';

        // Skip if not target group
        if (!groupId.includes(config.targetGroupId)) {
          return {};
        }

        // Skip owner
        if (userId.includes(config.ownerPhone.replace('+', ''))) {
          return {};
        }

        const content = event.content;
        if (!content || typeof content !== 'string') {
          return {};
        }

        stateManager.recordMessage();

        // 1. Rate limiting
        if (config.rateLimiting.enabled) {
          const rateLimitResult = rateLimiter.check(userId);
          if (rateLimitResult.limited) {
            heatScore.increment(userId, 'rejection', 3);
            stateManager.recordRejection('rateLimited');
            stateManager.updateHeatScores(heatScore.exportState());
            stateManager.updateRateLimits(rateLimiter.exportState());
            stateManager.immediateSave();

            api.logger.warn?.(`[group-guardian] Rate limited ${userId} (${rateLimitResult.reason}, retry: ${rateLimitResult.retryAfter}s)`);

            return {
              cancel: true,
              reply: `⏱️ Slow down! Wait ${rateLimitResult.retryAfter}s before sending another message.`,
              reason: 'rate_limited',
            };
          }
        }

        // 2. Complexity check
        if (config.complexity.enabled) {
          const complexity = complexityScorer.score(content);
          stateManager.recordComplexityScore(complexity.totalScore);

          if (complexity.overTokenLimit) {
            heatScore.increment(userId, 'complexMessage', 3);
            stateManager.recordRejection('complexity');
            stateManager.updateHeatScores(heatScore.exportState());
            stateManager.immediateSave();

            api.logger.warn?.(`[group-guardian] Token limit exceeded for ${userId}: ~${complexity.tokenEstimate} tokens`);

            return {
              cancel: true,
              reply: `⚠️ Message too long (~${Math.round(complexity.tokenEstimate / 1000)}k tokens). Please shorten it.`,
              reason: 'token_limit',
            };
          }

          if (complexity.totalScore > config.complexity.maxComplexityScore) {
            heatScore.increment(userId, 'complexMessage', 5);
            stateManager.recordRejection('complexity');
            stateManager.updateHeatScores(heatScore.exportState());
            stateManager.immediateSave();

            api.logger.warn?.(`[group-guardian] Complexity rejected for ${userId}: score ${complexity.totalScore}`);

            // Notify owner if heat is getting high
            const currentHeat = heatScore.getScore(userId);
            if (config.notifications.notifyOwnerOnHighHeat && currentHeat >= config.notifications.highHeatThreshold) {
              notifyOwner(api, config, 'High Heat + Complex Message', {
                userId,
                heatScore: currentHeat,
                action: 'Complexity rejection',
                extra: `Complexity score: ${complexity.totalScore}\nComponents: ${JSON.stringify(complexity.components)}`,
              });
            }

            return {
              cancel: true,
              reply: '⚠️ Message too complex. Please simplify.',
              reason: 'complexity_limit',
            };
          }
        }

        // 3. Heat score check
        if (config.heatScore.enabled) {
          const heat = heatScore.getScore(userId);

          if (heat >= config.heatScore.blockThreshold) {
            stateManager.recordRejection('heatBlocked');
            stateManager.immediateSave();

            api.logger.warn?.(`[group-guardian] Heat blocked ${userId}: score ${heat}`);

            if (config.notifications.notifyOwnerOnBlock) {
              notifyOwner(api, config, 'User Blocked', {
                userId,
                heatScore: heat,
                action: 'Heat threshold exceeded',
                extra: `Cooldown: 10 minutes\nLevel: ${heatScore.getLevel(userId)}`,
              });
            }

            return {
              cancel: true,
              reply: '🛑 Too many suspicious requests. Wait 10 minutes.',
              reason: 'heat_blocked',
            };
          }
        }

        // 4. Track normal messages (cool down heat)
        if (config.heatScore.enabled) {
          const complexity = complexityScorer.score(content);
          if (complexity.totalScore < 30) {
            heatScore.decrement(userId, 'normalMessages', 1);
          }
        }

        // Periodic state save
        stateManager.updateHeatScores(heatScore.exportState());
        stateManager.updateRateLimits(rateLimiter.exportState());

        return {}; // Allow message
      } catch (err) {
        api.logger.error?.(`[group-guardian] before_message_processing error: ${err instanceof Error ? err.message : String(err)}`);
        return {}; // Fail open
      }
    },
    { name: 'group-guardian-inbound', priority: 50 }
  );

  // ── Hook 2: before_agent_start (System Prompt Injection) ──────────
  api.registerHook(
    ['before_agent_start'],
    async (event: any) => {
      try {
        if (!config.degradation.enabled) return {};

        const userId = extractUserId(event);
        if (userId === 'unknown') return {};

        // Skip owner
        if (userId.includes(config.ownerPhone.replace('+', ''))) {
          return {};
        }

        const heat = heatScore.getScore(userId);
        const level = responseDegrader.calculate({
          heatScore: heat,
          recentErrors: responseDegrader.getRecentErrorCount(),
        });

        if (level === 'NORMAL') return {};

        const instruction = responseDegrader.getSystemInstruction(level);
        if (!instruction) return {};

        api.logger.info?.(`[group-guardian] Degradation ${level} for ${userId} (heat: ${heat})`);

        return {
          prependContext: `[SYSTEM INSTRUCTION: ${instruction}]`,
        };
      } catch (err) {
        api.logger.error?.(`[group-guardian] before_agent_start error: ${err instanceof Error ? err.message : String(err)}`);
        return {};
      }
    },
    { name: 'group-guardian-degradation', priority: 100 }
  );

  // ── Hook 3: message_sending (Outbound Truncation) ──────────
  api.registerHook(
    ['message_sending'],
    async (event: any) => {
      try {
        if (!config.degradation.enabled) return {};

        const userId = extractUserId(event);
        if (userId === 'unknown') return {};

        // Skip owner
        if (userId.includes(config.ownerPhone.replace('+', ''))) {
          return {};
        }

        const heat = heatScore.getScore(userId);
        const level = responseDegrader.calculate({
          heatScore: heat,
          recentErrors: responseDegrader.getRecentErrorCount(),
        });

        if (level === 'NORMAL') return {};

        const content = event.content;
        if (!content || typeof content !== 'string') return {};

        const truncated = responseDegrader.truncate(content, level, heat);
        if (truncated === content) return {};

        api.logger.info?.(`[group-guardian] Truncated response for ${userId} (level: ${level}, heat: ${heat})`);

        return { content: truncated };
      } catch (err) {
        api.logger.error?.(`[group-guardian] message_sending error: ${err instanceof Error ? err.message : String(err)}`);
        return {};
      }
    },
    { name: 'group-guardian-truncation', priority: 100 }
  );

  // ── Hook 4: agent_error (Error Tracking) ──────────
  api.registerHook(
    ['agent_error'],
    async (event: any) => {
      try {
        const userId = extractUserId(event);
        const error = event.error;

        responseDegrader.trackError();
        stateManager.recordLlmError();

        // Check for context overflow
        const errorMsg = error?.message || String(error);
        if (errorMsg.includes('context') || errorMsg.includes('token') || errorMsg.includes('too long') || errorMsg.includes('maximum')) {
          heatScore.increment(userId, 'contextOverflow', 5);
          stateManager.recordContextOverflow();
          api.logger.warn?.(`[group-guardian] Context overflow for ${userId}`);
        } else {
          heatScore.increment(userId, 'complexMessage', 1);
        }

        stateManager.updateHeatScores(heatScore.exportState());
        stateManager.immediateSave();

        return {};
      } catch (err) {
        api.logger.error?.(`[group-guardian] agent_error handler error: ${err instanceof Error ? err.message : String(err)}`);
        return {};
      }
    },
    { name: 'group-guardian-error-tracker', priority: 50 }
  );

  api.logger.info?.('[group-guardian] All 4 hooks registered (inbound, degradation, truncation, error-tracker)');
}
