/**
 * Response Degrader
 *
 * Determines response degradation level based on heat score,
 * context size, and recent errors. Provides system prompt
 * instructions and outbound truncation.
 */

type DegradationLevel = 'NORMAL' | 'SHORTENED' | 'BRIEF' | 'MINIMAL' | 'EMERGENCY';

interface DegradationConfig {
  levels: {
    shortened: number;  // max chars
    brief: number;
    minimal: number;
    emergency: number;
  };
}

interface DegradationInput {
  heatScore: number;
  contextTokens?: number;
  recentErrors?: number;
}

const LEVEL_ORDER: DegradationLevel[] = ['NORMAL', 'SHORTENED', 'BRIEF', 'MINIMAL', 'EMERGENCY'];

const SYSTEM_INSTRUCTIONS: Record<DegradationLevel, string | null> = {
  NORMAL: null,
  SHORTENED: 'Keep responses under 400 words. Be concise.',
  BRIEF: 'Respond in 100 words or less. Be very brief.',
  MINIMAL: '1-2 sentences only. Extremely brief.',
  EMERGENCY: 'Yes/no answers only. Maximum one sentence.',
};

class ResponseDegrader {
  private config: DegradationConfig;
  private recentErrors: number[] = [];

  constructor(config: DegradationConfig) {
    this.config = config;
  }

  calculate(input: DegradationInput): DegradationLevel {
    const levels: DegradationLevel[] = [];

    // Heat score thresholds
    if (input.heatScore >= 80) levels.push('EMERGENCY');
    else if (input.heatScore >= 60) levels.push('MINIMAL');
    else if (input.heatScore >= 40) levels.push('BRIEF');
    else if (input.heatScore >= 20) levels.push('SHORTENED');

    // Context size thresholds
    if (input.contextTokens) {
      if (input.contextTokens > 90000) levels.push('EMERGENCY');
      else if (input.contextTokens > 70000) levels.push('BRIEF');
    }

    // Recent error thresholds
    const errorCount = input.recentErrors ?? this.getRecentErrorCount();
    if (errorCount >= 3) levels.push('EMERGENCY');
    else if (errorCount >= 2) levels.push('MINIMAL');

    // Return the most restrictive level
    if (levels.length === 0) return 'NORMAL';
    return levels.reduce((worst, current) => {
      return LEVEL_ORDER.indexOf(current) > LEVEL_ORDER.indexOf(worst) ? current : worst;
    });
  }

  getSystemInstruction(level: DegradationLevel): string | null {
    return SYSTEM_INSTRUCTIONS[level];
  }

  getMaxChars(level: DegradationLevel): number {
    switch (level) {
      case 'SHORTENED': return this.config.levels.shortened;
      case 'BRIEF': return this.config.levels.brief;
      case 'MINIMAL': return this.config.levels.minimal;
      case 'EMERGENCY': return this.config.levels.emergency;
      default: return Infinity;
    }
  }

  truncate(content: string, level: DegradationLevel, heatScore: number): string {
    if (level === 'NORMAL') return content;

    const maxChars = this.getMaxChars(level);
    if (content.length <= maxChars) return content;

    const truncated = content.substring(0, maxChars);
    // Find last sentence or word boundary
    const lastSentence = truncated.lastIndexOf('. ');
    const lastSpace = truncated.lastIndexOf(' ');
    const cutPoint = lastSentence > maxChars * 0.7 ? lastSentence + 1
      : lastSpace > maxChars * 0.7 ? lastSpace
      : maxChars;

    const warning = `\n\n⚠️ Response shortened (heat: ${heatScore}).`;
    return content.substring(0, cutPoint) + '...' + warning;
  }

  trackError(): void {
    this.recentErrors.push(Date.now());
    // Keep only last 5 minutes of errors
    const fiveMinAgo = Date.now() - 300000;
    this.recentErrors = this.recentErrors.filter(t => t > fiveMinAgo);
  }

  getRecentErrorCount(): number {
    const fiveMinAgo = Date.now() - 300000;
    this.recentErrors = this.recentErrors.filter(t => t > fiveMinAgo);
    return this.recentErrors.length;
  }
}

export { ResponseDegrader, DegradationConfig, DegradationLevel, DegradationInput };
