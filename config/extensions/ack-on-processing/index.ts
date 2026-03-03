/**
 * Ack on Processing Plugin
 *
 * Sends eyes emoji (👀) reaction to WhatsApp messages when the agent
 * STARTS processing them (not on receipt). Only reacts to messages
 * that pass all filters and reach the agent.
 *
 * Hook: before_agent_start (fires when agent processing begins)
 */

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
  registerHook: (
    events: string[],
    handler: (event: any, ctx?: any) => Promise<any>,
    options?: any
  ) => void;
}

interface AckOnProcessingConfig {
  enabled: boolean;
  emoji: string;
  directMessages: boolean;
  groupMessages: 'always' | 'mentions' | false;
  timeoutMs: number;
}

const DEFAULT_CONFIG: AckOnProcessingConfig = {
  enabled: true,
  emoji: '👀',
  directMessages: true,
  groupMessages: 'mentions',
  timeoutMs: 3000,
};

// Extract WhatsApp conversation info from session key
function parseWhatsAppSession(sessionKey: string): {
  channel: string;
  chatType: 'dm' | 'group' | null;
  jid: string | null;
} {
  // Session key format:
  // DM: agent:main:whatsapp:dm:+15551234567 or agent:main:whatsapp:+15551234567
  // Group: agent:main:whatsapp:group:120363405143589138@g.us

  if (!sessionKey || !sessionKey.includes('whatsapp')) {
    return { channel: 'unknown', chatType: null, jid: null };
  }

  const parts = sessionKey.split(':');

  // Find whatsapp index
  const whatsappIdx = parts.indexOf('whatsapp');
  if (whatsappIdx === -1) {
    return { channel: 'unknown', chatType: null, jid: null };
  }

  // Check if next part is 'dm' or 'group'
  const nextPart = parts[whatsappIdx + 1];

  if (nextPart === 'group') {
    // Format: agent:main:whatsapp:group:120363405143589138@g.us
    const jid = parts[whatsappIdx + 2];
    return { channel: 'whatsapp', chatType: 'group', jid };
  } else if (nextPart === 'dm') {
    // Format: agent:main:whatsapp:dm:+15551234567
    const phone = parts[whatsappIdx + 2];
    return { channel: 'whatsapp', chatType: 'dm', jid: phone };
  } else {
    // Legacy format: agent:main:whatsapp:+15551234567 (DM)
    const phone = parts[whatsappIdx + 1];
    return { channel: 'whatsapp', chatType: 'dm', jid: phone };
  }
}

// Extract the last user message ID from the event's messages array
function extractLastUserMessageId(event: any): string | null {
  const messages = event?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  // Find the last message with role 'user'
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg?.role === 'user' && msg?.metadata?.whatsappMessageId) {
      return msg.metadata.whatsappMessageId;
    }
  }

  return null;
}

// Plugin registration
export default function register(api: PluginApi) {
  // Merge config
  const userConfig = api.pluginConfig ?? api.config.plugins?.entries?.['ack-on-processing']?.config ?? {};
  const config: AckOnProcessingConfig = {
    ...DEFAULT_CONFIG,
    ...userConfig,
  };

  if (!config.enabled) {
    api.logger.info?.('[ack-on-processing] Plugin disabled');
    return;
  }

  api.logger.info?.('[ack-on-processing] Plugin loaded - emoji: ' + config.emoji);

  // Hook into before_agent_start
  api.registerHook(
    ['before_agent_start'],
    async (event: any, ctx: any) => {
      // Fire and forget - use Promise.resolve to avoid blocking
      Promise.resolve().then(async () => {
        try {
          // 1. Parse session key to get conversation info
          const sessionKey = ctx?.sessionKey;
          if (!sessionKey) {
            api.logger.debug?.('[ack-on-processing] No session key in context');
            return;
          }

          const session = parseWhatsAppSession(sessionKey);

          if (session.channel !== 'whatsapp') {
            // Not a WhatsApp message
            return;
          }

          if (!session.jid) {
            api.logger.debug?.('[ack-on-processing] Could not extract JID from session key');
            return;
          }

          // 2. Check if we should react based on chat type and config
          if (session.chatType === 'dm' && !config.directMessages) {
            // DMs disabled
            return;
          }

          if (session.chatType === 'group') {
            if (config.groupMessages === false) {
              // Groups disabled
              return;
            }

            if (config.groupMessages === 'mentions') {
              // Check if bot was mentioned
              const wasMentioned = ctx?.wasMentioned || event?.wasMentioned;
              if (!wasMentioned) {
                // Not mentioned, skip
                return;
              }
            }
          }

          // 3. Extract message ID
          const messageId = extractLastUserMessageId(event);
          if (!messageId) {
            api.logger.debug?.('[ack-on-processing] Could not extract message ID');
            return;
          }

          // 4. Send reaction
          api.logger.info?.(`[ack-on-processing] Sending ${config.emoji} to ${session.chatType} ${session.jid} message ${messageId}`);

          const { sendReactionWhatsApp } = await import('../../web/outbound.js');

          // Race against timeout
          await Promise.race([
            sendReactionWhatsApp(
              session.jid,
              messageId,
              config.emoji,
              {
                verbose: false,
                fromMe: false,
                // For groups, need to specify participant (sender)
                participant: ctx?.msg?.senderJid || undefined,
              }
            ),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('reaction timeout')), config.timeoutMs)
            ),
          ]);

          api.logger.debug?.('[ack-on-processing] Reaction sent successfully');
        } catch (err) {
          // Fail open - log error but don't block agent processing
          api.logger.error?.(
            `[ack-on-processing] Failed to send reaction: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      });

      // Return immediately - don't block agent startup
      return {};
    },
    { name: 'ack-on-processing-reaction', priority: 200 }
  );

  api.logger.info?.('[ack-on-processing] Hook registered on before_agent_start');
}
