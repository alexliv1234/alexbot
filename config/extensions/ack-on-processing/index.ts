/**
 * Ack on Processing Plugin - FIXED VERSION
 *
 * Uses a hybrid approach:
 * 1. Raw WhatsApp listener captures message IDs when messages arrive
 * 2. Stores message metadata in a short-lived map
 * 3. Hook fires AFTER filtering, looks up ID, sends reaction
 * 4. Only messages that pass filters get reactions
 */

interface PluginApi {
  id: string;
  config: any;
  pluginConfig?: any;
  logger: any;
  registerHook: (events: string[], handler: Function, options?: any) => void;
  getWhatsAppListener?: () => any; // Access to raw WhatsApp listener
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

// Store message IDs temporarily (sender + contentHash => messageId)
const messageIdMap = new Map<string, { id: string; jid: string; timestamp: number }>();

// Cleanup old entries every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of messageIdMap.entries()) {
    if (now - value.timestamp > 60000) { // Remove entries older than 60s
      messageIdMap.delete(key);
    }
  }
}, 30000);

// Create a simple hash of message content
function hashMessage(from: string, content: string): string {
  return `${from}:${content.substring(0, 100)}`;
}

export default function register(api: PluginApi) {
  const userConfig = api.pluginConfig ?? api.config.plugins?.entries?.['ack-on-processing']?.config ?? {};
  const config: AckOnProcessingConfig = { ...DEFAULT_CONFIG, ...userConfig };

  if (!config.enabled) {
    api.logger.info?.('[ack-on-processing] Plugin disabled');
    return;
  }

  api.logger.info?.('[ack-on-processing] Plugin loaded - emoji: ' + config.emoji);

  // Step 1: Listen to raw WhatsApp messages to capture IDs
  try {
    const whatsappListener = api.getWhatsAppListener?.();
    if (whatsappListener) {
      whatsappListener.on('message', (msg: any) => {
        if (msg.id && msg.body && msg.from) {
          const key = hashMessage(msg.from, msg.body);
          messageIdMap.set(key, {
            id: msg.id,
            jid: msg.conversationId,
            timestamp: Date.now(),
          });
          api.logger.debug?.(`[ack-on-processing] Stored message ID: ${msg.id} from ${msg.from}`);
        }
      });
      api.logger.info?.('[ack-on-processing] Registered WhatsApp message listener');
    } else {
      api.logger.warn?.('[ack-on-processing] WhatsApp listener not available, falling back to hook-only mode');
    }
  } catch (err) {
    api.logger.error?.(`[ack-on-processing] Failed to register WhatsApp listener: ${err}`);
  }

  // Step 2: Hook into before_message_processing (AFTER filters)
  api.registerHook(
    ['before_message_processing'],
    async (event: any, ctx: any) => {
      // DEBUG: Log that hook fired (outside fire-and-forget to ensure it's logged)
      api.logger.info?.(`[ack-on-processing] Hook fired! Channel: ${ctx?.channel || 'unknown'}`);

      // Fire and forget
      Promise.resolve().then(async () => {
        try {
          // DEBUG: Log full event and context structure
          api.logger.info?.(`[ack-on-processing] DEBUG event keys: ${Object.keys(event || {}).join(', ')}`);
          api.logger.info?.(`[ack-on-processing] DEBUG ctx keys: ${Object.keys(ctx || {}).join(', ')}`);
          api.logger.info?.(`[ack-on-processing] DEBUG event: ${JSON.stringify(event).substring(0, 500)}`);
          api.logger.info?.(`[ack-on-processing] DEBUG ctx: ${JSON.stringify(ctx).substring(0, 500)}`);

          // Check if WhatsApp message
          if (ctx?.channel !== 'whatsapp') {
            api.logger.info?.(`[ack-on-processing] Skipping - not WhatsApp (channel: ${ctx?.channel})`);
            return;
          }

          // Parse chat type
          const chatType = event.chatType; // "dm" or "group"
          const from = event.from;
          const content = event.content;

          // Check if we should react based on config
          if (chatType === 'dm' && !config.directMessages) {
            return;
          }

          if (chatType === 'group') {
            if (config.groupMessages === false) {
              return;
            }

            if (config.groupMessages === 'mentions') {
              // Check if bot was mentioned (simple check for @ mention)
              const wasMentioned = content?.includes('@');
              if (!wasMentioned) {
                return;
              }
            }
          }

          // Lookup message ID from our map
          const key = hashMessage(from, content || '');
          const messageData = messageIdMap.get(key);

          if (!messageData) {
            api.logger.debug?.('[ack-on-processing] Message ID not found in map');
            return;
          }

          const { id: messageId, jid: chatJid } = messageData;

          // Send reaction
          api.logger.info?.(`[ack-on-processing] Sending ${config.emoji} to ${chatType} ${chatJid} message ${messageId}`);

          const { sendReactionWhatsApp } = await import('../../web/outbound.js');

          await Promise.race([
            sendReactionWhatsApp(
              chatJid,
              messageId,
              config.emoji,
              {
                verbose: false,
                fromMe: false,
                participant: from, // Sender JID for groups
              }
            ),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('reaction timeout')), config.timeoutMs)
            ),
          ]);

          api.logger.debug?.('[ack-on-processing] Reaction sent successfully');

          // Clean up this entry
          messageIdMap.delete(key);
        } catch (err) {
          api.logger.error?.(
            `[ack-on-processing] Failed to send reaction: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      });

      // Return immediately - don't block message processing
      return {};
    },
    { name: 'ack-on-processing-reaction', priority: 200 }
  );

  api.logger.info?.('[ack-on-processing] Hook registered on before_message_processing (priority 200)');
}
