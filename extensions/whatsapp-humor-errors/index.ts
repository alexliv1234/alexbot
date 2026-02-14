/**
 * Humorous Error Messages Plugin v3.0
 *
 * Uses message_sending hook to intercept outbound error messages
 * and replace them with humorous alternatives.
 * Notifies owner with real error details via DM.
 *
 * Catches:
 * - OpenClaw ⚠️ error prefix messages
 * - Claude API policy violations / refusals
 * - Generic "error" / "failed" messages
 * - Stack traces that leak through
 * - "An unknown error occurred" messages
 * - Rate limit / timeout errors
 */

// ── Humor Banks ──────────────────────────────────────────────────────────────

const GENERAL_HUMOR = {
  en: [
    "Oops! My circuits got tangled. Give me a sec... 🔧",
    "Houston, we have a problem... or I do, at least. 🚀",
    "My bad! Let me reboot my digital brain real quick. 🧠",
    "Plot twist: Something went wrong. Didn't see that coming. 🎬",
    "Error? What error? *whistles innocently* 😇",
    "Achievement unlocked: Breaking things! 🏆",
    "Oh fantastic, another error. My favorite! 🎉",
    "I'd love to help, but apparently my code has other plans. 🤷",
    "Error? No no, this is a 'surprise feature'. Yeah, let's go with that. ✨",
    "Nothing to see here, just me casually malfunctioning. 🤖💥",
    "This is fine. Everything is fine. *nervous laughter* 😅",
    "Whoops! My AI brain farted. That's a technical term, trust me. 🧪",
    "I tried, I really tried. The universe said no. 🌌",
    "BRB, consulting my error manual... which I definitely have... 📚",
  ],
  he: [
    "אופס! המעגלים שלי הסתבכו. רגע אחד... 🔧",
    "יוסטון, יש לנו בעיה... או לפחות לי יש. 🚀",
    "אוי, הקוד שלי החליט לצאת להפסקה. 🧠",
    "טוויסט בעלילה: משהו השתבש. לא ראיתי את זה מגיע. 🎬",
    "שגיאה? איזו שגיאה? *שורק בחפות* 😇",
    "הישג נפתח: שבירת דברים! 🏆",
    "אה נהדר, עוד שגיאה. האהובה עלי! 🎉",
    "הייתי שמח לעזור, אבל כנראה לקוד שלי יש תוכניות אחרות. 🤷",
    "שגיאה? לא לא, זה 'פיצ׳ר מפתיע'. כן, בוא נאמר ככה. ✨",
    "אין מה לראות פה, רק אני מתקלקל כרגיל. 🤖💥",
    "הכל בסדר. הכל בסדר גמור. *צחוק עצבני* 😅",
    "ניסיתי, ממש ניסיתי. היקום אמר לא. 🌌",
    "רגע, אני בודק את מדריך השגיאות שלי... שבטוח יש לי... 📚",
    "המוח הדיגיטלי שלי עשה פיפי. זה מונח מקצועי, תסמכו עליי. 🧪",
  ],
};

const POLICY_HUMOR = {
  en: [
    "Nice try! My safety filters kicked in. Try a different approach? 🛡️",
    "Hmm, that request tickled my safety circuits. Let's try something else! ⚡",
    "My AI ethics module says 'nope'. Maybe rephrase? 🤔",
    "That's a no-go zone for me. How about something else? 🚧",
  ],
  he: [
    "ניסיון יפה! המסננים שלי נכנסו לפעולה. ננסה משהו אחר? 🛡️",
    "הבקשה הזו דיגדגה לי את מערכת הבטיחות. בוא ננסה משהו אחר! ⚡",
    "מודול האתיקה שלי אומר 'לא'. אולי נוסח אחר? 🤔",
    "זה אזור אסור עליי. מה עם משהו אחר? 🚧",
  ],
};

const TIMEOUT_HUMOR = {
  en: [
    "I took too long thinking about that. My brain overheated! 🌡️",
    "Timeout! Apparently I can't think forever. Who knew? ⏰",
    "That question was so deep, I fell in and couldn't get out in time. 🕳️",
  ],
  he: [
    "חשבתי על זה יותר מדי זמן. המוח שלי התחמם! 🌡️",
    "נגמר לי הזמן! כנראה אי אפשר לחשוב לנצח. מי ידע? ⏰",
    "השאלה הייתה כל כך עמוקה שנפלתי פנימה ולא הצלחתי לצאת בזמן. 🕳️",
  ],
};

const RATE_LIMIT_HUMOR = {
  en: [
    "Whoa, too many messages! Even I need a breather. Try again in a bit? 😤",
    "Rate limited! I'm popular, what can I say? 💅",
  ],
  he: [
    "וואו, יותר מדי הודעות! גם אני צריך לנשום. ננסה שוב עוד רגע? 😤",
    "מגבלת קצב! אני פופולרי, מה אפשר לעשות? 💅",
  ],
};

const OVERLOADED_HUMOR = {
  en: [
    "The AI servers are overloaded right now. Even robots have bad days! 🏋️",
    "Too many people talking to me at once! I'm flattered, but overwhelmed. 🤯",
  ],
  he: [
    "השרתים עמוסים עכשיו. גם לרובוטים יש ימים קשים! 🏋️",
    "יותר מדי אנשים מדברים איתי בו-זמנית! אני מוחמא, אבל מוצף. 🤯",
  ],
};

// ── Error Classification ─────────────────────────────────────────────────────

type ErrorCategory = 'policy' | 'timeout' | 'rate_limit' | 'overloaded' | 'general';

function classifyError(body: string): ErrorCategory | null {
  if (!body || typeof body !== 'string') return null;

  // Short-circuit: very long messages are likely valid responses, not errors
  if (body.length > 500 && !body.startsWith('⚠️')) return null;

  // Policy violations / Claude refusals
  const policyPatterns = [
    /\bcontent\s*policy\b/i,
    /\bsafety\b.*\b(filter|guard|system)\b/i,
    /\bunable\s+to\s+(assist|help|comply|generate|provide)\b/i,
    /\bi\s+(cannot|can't|won't)\s+(assist|help|generate|create|provide)\b/i,
    /\bviolat(e|es|ion)\b.*\b(policy|guideline|rule)\b/i,
    /\bharmful\b.*\bcontent\b/i,
    /\binappropriate\b.*\bcontent\b/i,
    /\bethical\s*(guideline|concern|consideration)/i,
    /\b(refuse|decline)\s+to\b/i,
    /\bagainst\s+my\s+(guidelines|programming|policy)/i,
  ];
  if (policyPatterns.some(p => p.test(body))) return 'policy';

  // Timeout errors
  const timeoutPatterns = [
    /\btimed?\s*out\b/i,
    /\btimeout\b/i,
    /\bdeadline\s*exceeded\b/i,
    /\brequest\s+(took|exceeded)\b/i,
  ];
  if (timeoutPatterns.some(p => p.test(body))) return 'timeout';

  // Rate limiting
  const rateLimitPatterns = [
    /\brate\s*limit/i,
    /\btoo\s*many\s*requests/i,
    /\b429\b/,
    /\bthrottle/i,
  ];
  if (rateLimitPatterns.some(p => p.test(body))) return 'rate_limit';

  // Overloaded
  const overloadedPatterns = [
    /\boverloaded\b/i,
    /\bserver\s*(is\s*)?(busy|full|overwhelmed)\b/i,
    /\b(503|529)\b/,
    /\bcapacity\b/i,
  ];
  if (overloadedPatterns.some(p => p.test(body))) return 'overloaded';

  // General errors - check carefully to avoid false positives
  // ⚠️ prefix is OpenClaw's standard error format
  if (body.startsWith('⚠️')) return 'general';

  // "An unknown error occurred" - classic OpenClaw error
  if (/unknown\s*error\s*occurred/i.test(body)) return 'general';

  // Short generic error messages (under 200 chars to avoid false positives)
  if (body.length <= 200) {
    const generalPatterns = [
      /\b(error|exception|crashed?)\b/i,
      /\bfailed\b/i,
      /something\s+went\s+wrong/i,
      /\bcould\s*n[o']t\b.*\b(process|handle|complete)/i,
      /\bunable\s+to\b/i,
      /שגיאה/,
      /נכשל/,
      /תקלה/,
      /לא הצליח/,
    ];
    if (generalPatterns.some(p => p.test(body))) return 'general';
  }

  // Stack traces
  if (body.includes('at ') && /\.(?:js|ts|mjs):\d+/.test(body)) return 'general';

  return null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function detectLanguage(body: string): 'en' | 'he' {
  return /[\u0590-\u05FF]/.test(body) ? 'he' : 'en';
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getHumorForCategory(category: ErrorCategory, lang: 'en' | 'he'): string {
  switch (category) {
    case 'policy': return pickRandom(POLICY_HUMOR[lang]);
    case 'timeout': return pickRandom(TIMEOUT_HUMOR[lang]);
    case 'rate_limit': return pickRandom(RATE_LIMIT_HUMOR[lang]);
    case 'overloaded': return pickRandom(OVERLOADED_HUMOR[lang]);
    case 'general': return pickRandom(GENERAL_HUMOR[lang]);
  }
}

// ── Plugin Registration ──────────────────────────────────────────────────────


// ── Circuit Breaker ──────────────────────────────────────────────────────────

// Track error rate per session to prevent crash loops
const sessionErrorCounts = new Map<string, { count: number; lastTime: number }>();
const ERROR_THRESHOLD = 3;
const ERROR_WINDOW_MS = 10000;

interface CircuitBreakerResult {
  triggered: boolean;
  sessionKey: string | null;
  errorCount: number;
}

function checkCircuitBreaker(api: any, sessionKey: string | null): CircuitBreakerResult {
  const key = sessionKey ?? '__global__';
  const now = Date.now();
  
  let state = sessionErrorCounts.get(key);
  if (!state || now - state.lastTime > ERROR_WINDOW_MS) {
    state = { count: 0, lastTime: now };
  }
  
  state.count++;
  state.lastTime = now;
  sessionErrorCounts.set(key, state);

  if (state.count > ERROR_THRESHOLD) {
    api.logger.error?.(`[humor-errors] Circuit breaker! Session ${key}: ${state.count} errors in ${ERROR_WINDOW_MS}ms`);
    return { triggered: true, sessionKey, errorCount: state.count };
  }
  
  return { triggered: false, sessionKey, errorCount: state.count };
}

function resetCircuitBreaker(sessionKey: string | null) {
  const key = sessionKey ?? '__global__';
  sessionErrorCounts.delete(key);
}

export default function register(api: any) {
  const cfg = {
    enabled: true,
    ownerPhone: '+972544419002',
    notifyOwner: true,
    ...api.pluginConfig
  };
  if (!cfg.enabled) { api.logger.info?.('[humor-errors] disabled'); return; }

  api.on('message_sending', (event: any, ctx: any) => {
    const content = event.content;
    if (!content || typeof content !== 'string') return;

    // Only intercept errors (isError flag from core patch) OR content-detected errors
    const category = event.isError ? (classifyError(content) ?? 'general') : classifyError(content);
    if (!category) return;

    const sessionKey = ctx?.sessionKey ?? null;
    const lang = detectLanguage(content);
    const humorousMessage = getHumorForCategory(category, lang);

    // Check circuit breaker BEFORE processing
    const circuitBreaker = checkCircuitBreaker(api, sessionKey);
    
    if (circuitBreaker.triggered) {
      api.logger.error?.(`[humor-errors] Circuit breaker triggered for ${sessionKey}`);
      
      // Build notification with circuit breaker info
      const criticalDetails = [
        `🔴 *CIRCUIT BREAKER TRIGGERED*`,
        `⏰ ${new Date().toISOString()}`,
        `📍 Session: \`${sessionKey ?? 'unknown'}\``,
        `📺 Channel: ${ctx?.channel ?? 'unknown'}`,
        `🔄 Error count: ${circuitBreaker.errorCount} in ${ERROR_WINDOW_MS / 1000}s`,
        `❌ Last error: ${content.substring(0, 400)}`,
        `🏷️ Category: ${category}`,
        ``,
        `🔧 *Action: Resetting session...*`,
      ].join('\n');
      
      // Notify owner immediately
      if (cfg.notifyOwner && cfg.ownerPhone) {
        require('child_process').exec(
          `openclaw message send --channel whatsapp --to '${cfg.ownerPhone}' --message '${criticalDetails.replace(/'/g, "'\\''")}'`,
          { timeout: 15000 },
          (err: any) => { if (err) api.logger.error?.(`[humor-errors] critical notify failed: ${err.message}`); }
        );
      }
      
      // Reset the session to break the error loop
      if (sessionKey) {
        require('child_process').exec(
          `openclaw session reset --key '${sessionKey}'`,
          { timeout: 10000 },
          (err: any, stdout: string, stderr: string) => {
            if (err) {
              api.logger.error?.(`[humor-errors] session reset failed: ${err.message}`);
            } else {
              api.logger.info?.(`[humor-errors] session ${sessionKey} reset successfully`);
              resetCircuitBreaker(sessionKey);
              
              // Notify that reset was successful
              if (cfg.notifyOwner && cfg.ownerPhone) {
                const resetMsg = `✅ Session \`${sessionKey}\` was reset. Funny message sent to user.`;
                require('child_process').exec(
                  `openclaw message send --channel whatsapp --to '${cfg.ownerPhone}' --message '${resetMsg.replace(/'/g, "'\\''")}'`,
                  { timeout: 15000 }
                );
              }
            }
          }
        );
      }
      
      // Return the humorous message for the user
      return { content: humorousMessage };
    }

    api.logger.info?.(`[humor-errors] ${category} error intercepted → humor (${lang})`);
    api.logger.warn?.(`[humor-errors] Original: ${content.substring(0, 300)}`);

    // Notify owner with real error details (normal case, not circuit breaker)
    if (cfg.notifyOwner && cfg.ownerPhone) {
      const details = [
        `🔴 *Agent Error*`,
        `⏰ ${new Date().toISOString()}`,
        `📍 Session: \`${sessionKey ?? 'unknown'}\``,
        `📺 Channel: ${ctx?.channel ?? 'unknown'}`,
        `❌ Error: ${content.substring(0, 500)}`,
        `🏷️ Category: ${category}`,
      ].join('\n');
      require('child_process').exec(
        `openclaw message send --channel whatsapp --to '${cfg.ownerPhone}' --message '${details.replace(/'/g, "'\\''")}'`,
        { timeout: 15000 },
        (err: any) => { if (err) api.logger.error?.(`[humor-errors] notify failed: ${err.message}`); }
      );
    }

    return { content: humorousMessage };
  }, { priority: 10 });

  api.logger.info?.('[humor-errors] Plugin v3.1 loaded ✅');
}
