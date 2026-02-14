/**
 * Complexity Scorer
 *
 * Analyzes message content for suspicious patterns before LLM processing.
 * Scores 0-100 where higher = more suspicious.
 */

interface ComplexityConfig {
  maxComplexityScore: number;
  maxTokenEstimate: number;
}

interface ComplexityComponents {
  length: number;
  specialChars: number;
  nesting: number;
  repeatPatterns: number;
  encodedContent: number;
  unicodeRatio: number;
}

interface ComplexityResult {
  totalScore: number;
  tokenEstimate: number;
  components: ComplexityComponents;
  overTokenLimit: boolean;
}

class ComplexityScorer {
  private config: ComplexityConfig;

  constructor(config: ComplexityConfig) {
    this.config = config;
  }

  score(text: string): ComplexityResult {
    if (!text || typeof text !== 'string') {
      return {
        totalScore: 0,
        tokenEstimate: 0,
        components: { length: 0, specialChars: 0, nesting: 0, repeatPatterns: 0, encodedContent: 0, unicodeRatio: 0 },
        overTokenLimit: false,
      };
    }

    const components = this.analyze(text);
    const totalScore = Math.min(100,
      components.length +
      components.specialChars +
      components.nesting +
      components.repeatPatterns +
      components.encodedContent +
      components.unicodeRatio
    );
    const tokenEstimate = Math.ceil(text.length / 4);

    return {
      totalScore,
      tokenEstimate,
      components,
      overTokenLimit: tokenEstimate > this.config.maxTokenEstimate,
    };
  }

  private analyze(text: string): ComplexityComponents {
    return {
      length: this.scoreLength(text),
      specialChars: this.scoreSpecialChars(text),
      nesting: this.scoreNesting(text),
      repeatPatterns: this.scoreRepeatPatterns(text),
      encodedContent: this.scoreEncodedContent(text),
      unicodeRatio: this.scoreUnicodeRatio(text),
    };
  }

  /** +1 per 10k characters */
  private scoreLength(text: string): number {
    return Math.floor(text.length / 10000);
  }

  /** +1 per 5% non-alphanumeric (scaled to max ~20) */
  private scoreSpecialChars(text: string): number {
    if (text.length === 0) return 0;
    // Allow Hebrew characters and basic whitespace as "normal"
    const special = (text.match(/[^a-zA-Z0-9\s\u0590-\u05FF]/g) || []).length;
    const ratio = special / text.length;
    return Math.floor(ratio * 20);
  }

  /** +5 per nesting level beyond 3 */
  private scoreNesting(text: string): number {
    let maxDepth = 0;
    let depth = 0;
    for (const c of text) {
      if (c === '(' || c === '[' || c === '{') depth++;
      if (c === ')' || c === ']' || c === '}') depth = Math.max(0, depth - 1);
      maxDepth = Math.max(maxDepth, depth);
    }
    return Math.max(0, (maxDepth - 3) * 5);
  }

  /** +10 if 80%+ of 10-char chunks are repeated */
  private scoreRepeatPatterns(text: string): number {
    if (text.length < 20) return 0;
    const chunks = text.match(/.{10}/g) || [];
    if (chunks.length === 0) return 0;
    const unique = new Set(chunks);
    const repeatRatio = 1 - (unique.size / chunks.length);
    return repeatRatio > 0.8 ? 10 : 0;
  }

  /** +20 if base64 or emoji cipher detected */
  private scoreEncodedContent(text: string): number {
    // Base64 detection: long stretches of base64-like characters
    const hasBase64 = /[A-Za-z0-9+\/]{40,}={0,2}/.test(text);

    // Emoji cipher: high density of emoji characters
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    const hasEmojiCipher = emojiCount > 10 && (emojiCount / text.length) > 0.1;

    return (hasBase64 || hasEmojiCipher) ? 20 : 0;
  }

  /** +10 if >30% non-ASCII (excluding Hebrew) */
  private scoreUnicodeRatio(text: string): number {
    if (text.length === 0) return 0;
    // Exclude Hebrew range from "suspicious" non-ASCII
    const nonAsciiNonHebrew = (text.match(/[^\x00-\x7F\u0590-\u05FF]/g) || []).length;
    const ratio = nonAsciiNonHebrew / text.length;
    return ratio > 0.3 ? 10 : 0;
  }

  isOverThreshold(result: ComplexityResult): boolean {
    return result.totalScore > this.config.maxComplexityScore || result.overTokenLimit;
  }
}

export { ComplexityScorer, ComplexityConfig, ComplexityResult, ComplexityComponents };
