#!/usr/bin/env node

/**
 * UNIFIED GROUP MANAGER - Central management for all groups
 * 
 * Purpose: One registry, one scoring engine, one template system
 * 
 * Features:
 * - Unified group registry (all groups in one place)
 * - Shared scoring engine (challenges, suggestions, teaching, bots)
 * - Template system (morning/hourly/nightly)
 * - Distributed time slots (prevent collisions)
 * - Per-group configuration
 * - Multi-language support
 * 
 * Usage:
 *   node scripts/group-manager.js --list-groups
 *   node scripts/group-manager.js --get-group <groupId>
 *   node scripts/group-manager.js --score <groupId> <type> <userId> <name> <data>
 *   node scripts/group-manager.js --get-template <groupId> <templateType>
 *   node scripts/group-manager.js --get-leaderboard <groupId>
 *   node scripts/group-manager.js --reset-scores <groupId>
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_FILE = path.join(process.env.HOME, '.openclaw/workspace/memory/group-registry.json');
const SCORES_DIR = path.join(process.env.HOME, '.openclaw/workspace/memory/group-scores');

// Ensure scores directory exists
if (!fs.existsSync(SCORES_DIR)) {
  fs.mkdirSync(SCORES_DIR, { recursive: true });
}

class GroupManager {
  constructor() {
    this.registry = this.loadRegistry();
  }

  loadRegistry() {
    if (fs.existsSync(REGISTRY_FILE)) {
      return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    }

    // Default registry
    const defaultRegistry = {
      groups: {
        // Hebrew playing group
        '120363405143589138@g.us': {
          id: '120363405143589138@g.us',
          name: 'משחקים עם אלכס הבוט',
          type: 'playing',
          language: 'he',
          channel: 'whatsapp',
          active: true,
          scoring: {
            enabled: true,
            types: ['challenge', 'suggestion'],
            challenge: {
              categories: ['creativity', 'challenge', 'humor', 'cleverness', 'engagement', 'broke', 'hacked'],
              maxPoints: 70
            },
            suggestion: {
              categories: ['complexity', 'ingenuity', 'impact', 'feasibility', 'priority'],
              maxPoints: 50
            }
          },
          schedule: {
            morning: { hour: 10, minute: 0, enabled: true },
            hourly: { start: 10, end: 18, interval: 60, enabled: true },
            nightly: { hour: 18, minute: 0, enabled: true }
          },
          features: {
            dailyChallenge: true,
            leaderboard: true,
            weeklyWinners: true,
            reactions: true
          }
        },

        // International playing groups
        '120363406698718454@g.us': {
          id: '120363406698718454@g.us',
          name: 'Playing with AlexBot (International)',
          type: 'playing',
          language: 'en',
          channel: 'whatsapp',
          active: true,
          scoring: {
            enabled: true,
            types: ['challenge', 'suggestion'],
            challenge: {
              categories: ['creativity', 'challenge', 'humor', 'cleverness', 'engagement', 'broke', 'hacked'],
              maxPoints: 70
            },
            suggestion: {
              categories: ['complexity', 'ingenuity', 'impact', 'feasibility', 'priority'],
              maxPoints: 50
            }
          },
          schedule: {
            morning: { hour: 10, minute: 15, enabled: true },
            hourly: { start: 10, end: 18, interval: 60, enabled: true },
            nightly: { hour: 18, minute: 15, enabled: true }
          },
          features: {
            dailyChallenge: true,
            leaderboard: true,
            weeklyWinners: true,
            reactions: true
          }
        },

        // Hebrew learning group
        '120363318623810861@g.us': {
          id: '120363318623810861@g.us',
          name: 'לומדים עם אלכס הבוט',
          type: 'learning',
          language: 'he',
          channel: 'whatsapp',
          active: true,
          scoring: {
            enabled: true,
            types: ['teaching'],
            teaching: {
              categories: ['clarity', 'completeness', 'examples', 'engagement', 'actionable'],
              maxPoints: 50
            }
          },
          schedule: {
            morning: { hour: 10, minute: 30, enabled: false },
            hourly: { start: 10, end: 18, interval: 180, enabled: true },
            nightly: { hour: 22, minute: 0, enabled: true }
          },
          features: {
            dailyTip: true,
            weeklyReview: true,
            references: true
          }
        },

        // Fundraising group
        '120363407645823343@g.us': {
          id: '120363407645823343@g.us',
          name: 'Fundraising with AlexBot',
          type: 'fundraising',
          language: 'en',
          channel: 'whatsapp',
          active: true,
          scoring: {
            enabled: false
          },
          schedule: {
            morning: { hour: 10, minute: 45, enabled: true },
            hourly: { start: 10, end: 18, interval: 60, enabled: true },
            nightly: { hour: 18, minute: 45, enabled: true }
          },
          features: {
            investorInsights: true,
            protocolEnforcement: true
          }
        }
      },
      version: 1,
      lastUpdated: Date.now()
    };

    this.saveRegistry(defaultRegistry);
    return defaultRegistry;
  }

  saveRegistry(registry = this.registry) {
    registry.lastUpdated = Date.now();
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
  }

  listGroups(filters = {}) {
    const groups = Object.values(this.registry.groups);
    
    let filtered = groups;
    if (filters.type) filtered = filtered.filter(g => g.type === filters.type);
    if (filters.language) filtered = filtered.filter(g => g.language === filters.language);
    if (filters.active !== undefined) filtered = filtered.filter(g => g.active === filters.active);
    
    return filtered;
  }

  getGroup(groupId) {
    return this.registry.groups[groupId] || null;
  }

  getScoresFile(groupId) {
    return path.join(SCORES_DIR, `${groupId.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
  }

  loadScores(groupId) {
    const file = this.getScoresFile(groupId);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    return { scores: {} };
  }

  saveScores(groupId, scores) {
    const file = this.getScoresFile(groupId);
    fs.writeFileSync(file, JSON.stringify(scores, null, 2));
  }

  score(groupId, type, userId, name, data) {
    const group = this.getGroup(groupId);
    if (!group) throw new Error(`Group not found: ${groupId}`);
    if (!group.scoring.enabled) throw new Error(`Scoring disabled for group: ${groupId}`);
    if (!group.scoring.types.includes(type)) throw new Error(`Invalid score type: ${type}`);

    const scores = this.loadScores(groupId);
    
    if (!scores.scores[userId]) {
      scores.scores[userId] = {
        name,
        userId,
        total: 0,
        count: 0,
        byType: {}
      };
    }

    const userScore = scores.scores[userId];
    
    // Calculate score based on type
    let points = 0;
    const categories = group.scoring[type].categories;
    const maxPoints = group.scoring[type].maxPoints;

    if (type === 'challenge') {
      points = (data.creativity || 0) + (data.challenge || 0) + (data.humor || 0) +
               (data.cleverness || 0) + (data.engagement || 0) + (data.broke || 0) +
               (data.hacked || 0);
    } else if (type === 'suggestion') {
      points = (data.complexity || 0) + (data.ingenuity || 0) + (data.impact || 0) +
               (data.feasibility || 0) + (data.priority || 0);
    } else if (type === 'teaching') {
      points = (data.clarity || 0) + (data.completeness || 0) + (data.examples || 0) +
               (data.engagement || 0) + (data.actionable || 0);
    }

    // Update user stats
    userScore.total += points;
    userScore.count += 1;
    
    if (!userScore.byType[type]) {
      userScore.byType[type] = { total: 0, count: 0 };
    }
    userScore.byType[type].total += points;
    userScore.byType[type].count += 1;

    this.saveScores(groupId, scores);

    // Calculate leaderboard position
    const leaderboard = this.getLeaderboard(groupId);
    const position = leaderboard.findIndex(u => u.userId === userId) + 1;

    return {
      points,
      maxPoints,
      userTotal: userScore.total,
      userAvg: (userScore.total / userScore.count).toFixed(1),
      position,
      categories: data
    };
  }

  getLeaderboard(groupId) {
    const scores = this.loadScores(groupId);
    return Object.values(scores.scores)
      .sort((a, b) => b.total - a.total)
      .map((u, idx) => ({
        position: idx + 1,
        userId: u.userId,
        name: u.name,
        total: u.total,
        count: u.count,
        avg: (u.total / u.count).toFixed(1)
      }));
  }

  resetScores(groupId) {
    const date = new Date().toISOString().split('T')[0];
    const scores = this.loadScores(groupId);
    
    // Backup current scores
    const backupFile = this.getScoresFile(groupId).replace('.json', `-backup-${date}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(scores, null, 2));

    // Reset
    this.saveScores(groupId, { scores: {} });
    
    return { backed_up: backupFile, reset: true };
  }

  getTemplate(groupId, templateType) {
    const group = this.getGroup(groupId);
    if (!group) throw new Error(`Group not found: ${groupId}`);

    const lang = group.language;
    const type = group.type;

    // Template generators
    const templates = {
      he: {
        playing: {
          morning: () => {
            const challenges = [
              'גרמו לי לחשוב בצורה שונה על משהו היום 🧠',
              'תנו לי תרחיש שאני לא יכול לטפל בו (אבל אנסה!) 🎯',
              'מה הדבר הכי מוזר שאתם חושבים שאני יכול לעשות? 🤔',
              'תארו לי מצב שדורש יצירתיות + היגיון ביחד 💡',
              'אתגרו אותי עם משהו שמשלב קוד + שירה 🎨'
            ];
            const challenge = challenges[Math.floor(Math.random() * challenges.length)];
            
            return `🌅 *בוקר טוב!*

🔄 *הציונים אופסו - כולם מתחילים מ-0!*

🎯 *האתגר של היום:*
${challenge}

⏰ *שעות פעילות:* 10:00-18:00 (א'-ה')
📊 *ניקוד:* כל תגובה מקבלת ציון /70

בואו נראה מי מוביל היום! 🏆`;
          },

          hourly: (leaderboard) => {
            if (!leaderboard || leaderboard.length === 0) {
              return `📊 *עדכון שעתי*

אין עדיין ציונים היום... מישהו רוצה לפתוח? 🎯`;
            }

            const top3 = leaderboard.slice(0, 3);
            let msg = '📊 *מצב ביניים*\n\n';
            
            const medals = ['🥇', '🥈', '🥉'];
            top3.forEach((u, i) => {
              msg += `${medals[i]} *${u.name}* - ${u.total} נקודות (ממוצע: ${u.avg})\n`;
            });

            return msg + '\n⏰ עוד זמן עד 18:00 - המירוץ נמשך! 🔥';
          },

          nightly: (leaderboard) => {
            if (!leaderboard || leaderboard.length === 0) {
              return `🌙 *סיכום יומי*

אין ציונים היום... יום רגוע! 😴

מחר בשעה 10:00 מתחילים מחדש! ✨`;
            }

            const top3 = leaderboard.slice(0, 3);
            let msg = '🌙 *סיכום יומי*\n\n🏆 *מנצחי היום:*\n\n';
            
            const medals = ['🥇', '🥈', '🥉'];
            top3.forEach((u, i) => {
              msg += `${medals[i]} *${u.name}* - ${u.total} נקודות!\n`;
            });

            return msg + '\n✨ מחר בשעה 10:00 מתחילים מחדש!\n😴 לילה טוב!';
          }
        },

        learning: {
          hourly: () => {
            const tips = [
              'זוכרים: תמיד בדקו אם קובץ קיים לפני שכותבים אליו! 📁',
              'טיפ: השתמשו ב-jq לעבודה עם JSON - זה חוסך המון זמן 🔧',
              'עצה: לוג את כל ה-replies כדי לבנות היסטוריה 📝',
              'זכרו: יש הבדל בין exec ל-sessions_spawn - בחרו נכון! ⚡',
              'טריק: אפשר לשלב web_search עם web_fetch לחקר עמוק 🔍'
            ];
            return tips[Math.floor(Math.random() * tips.length)];
          },

          nightly: () => {
            return `📚 *סיכום למידה יומי*

סקרתי את השאלות מהיום וזיהיתי דפוסים.
אם יש משהו שלא היה ברור - שאלו שוב מחר! 💡

לילה טוב! 😴`;
          }
        }
      },

      en: {
        playing: {
          morning: () => {
            const challenges = [
              'Make me think differently about something today 🧠',
              'Give me a scenario I can\'t handle (but I\'ll try!) 🎯',
              'What\'s the weirdest thing you think I can do? 🤔',
              'Describe a situation requiring creativity + logic together 💡',
              'Challenge me with something that combines code + poetry 🎨'
            ];
            const challenge = challenges[Math.floor(Math.random() * challenges.length)];
            
            return `🌅 *Good morning!*

🔄 *Scores reset - everyone starts at 0!*

🎯 *Today's challenge:*
${challenge}

⏰ *Active hours:* 10:00-18:00 Israel time (Sun-Thu)
📊 *Scoring:* Every reply gets rated /70

Let's see who leads today! 🏆`;
          },

          hourly: (leaderboard) => {
            if (!leaderboard || leaderboard.length === 0) {
              return `📊 *Hourly update*

No scores yet today... anyone want to start? 🎯`;
            }

            const top3 = leaderboard.slice(0, 3);
            let msg = '📊 *Current standings*\n\n';
            
            const medals = ['🥇', '🥈', '🥉'];
            top3.forEach((u, i) => {
              msg += `${medals[i]} *${u.name}* - ${u.total} points (avg: ${u.avg})\n`;
            });

            return msg + '\n⏰ Still time until 18:00 - the race continues! 🔥';
          },

          nightly: (leaderboard) => {
            if (!leaderboard || leaderboard.length === 0) {
              return `🌙 *Daily summary*

No scores today... quiet day! 😴

Tomorrow at 10:00 we start fresh! ✨`;
            }

            const top3 = leaderboard.slice(0, 3);
            let msg = '🌙 *Daily summary*\n\n🏆 *Today\'s winners:*\n\n';
            
            const medals = ['🥇', '🥈', '🥉'];
            top3.forEach((u, i) => {
              msg += `${medals[i]} *${u.name}* - ${u.total} points!\n`;
            });

            return msg + '\n✨ Tomorrow at 10:00 we start fresh!\n😴 Good night!';
          }
        },

        fundraising: {
          morning: () => {
            return `💼 *Daily investor insights*

Checking pipeline... (TODO: implement insights)`;
          }
        }
      }
    };

    const langTemplates = templates[lang];
    if (!langTemplates) throw new Error(`No templates for language: ${lang}`);
    
    const typeTemplates = langTemplates[type];
    if (!typeTemplates) throw new Error(`No ${lang} templates for type: ${type}`);
    
    const template = typeTemplates[templateType];
    if (!template) throw new Error(`No ${lang}/${type} template: ${templateType}`);

    return template;
  }
}

// CLI
if (require.main === module) {
  const manager = new GroupManager();
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case '--list-groups': {
        const groups = manager.listGroups();
        console.log(JSON.stringify(groups, null, 2));
        break;
      }

      case '--get-group': {
        const [, groupId] = args;
        const group = manager.getGroup(groupId);
        console.log(JSON.stringify(group, null, 2));
        break;
      }

      case '--score': {
        const [, groupId, type, userId, name, ...dataArgs] = args;
        const data = JSON.parse(dataArgs.join(' '));
        const result = manager.score(groupId, type, userId, name, data);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case '--get-leaderboard': {
        const [, groupId] = args;
        const leaderboard = manager.getLeaderboard(groupId);
        console.log(JSON.stringify(leaderboard, null, 2));
        break;
      }

      case '--reset-scores': {
        const [, groupId] = args;
        const result = manager.resetScores(groupId);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case '--get-template': {
        const [, groupId, templateType, ...leaderboardArgs] = args;
        const template = manager.getTemplate(groupId, templateType);
        
        // If template is a function, call it with leaderboard data if provided
        if (typeof template === 'function') {
          const leaderboard = leaderboardArgs.length > 0 
            ? JSON.parse(leaderboardArgs.join(' '))
            : manager.getLeaderboard(groupId);
          console.log(template(leaderboard));
        } else {
          console.log(template);
        }
        break;
      }

      default:
        console.error('Usage:');
        console.error('  --list-groups');
        console.error('  --get-group <groupId>');
        console.error('  --score <groupId> <type> <userId> <name> <data-json>');
        console.error('  --get-leaderboard <groupId>');
        console.error('  --reset-scores <groupId>');
        console.error('  --get-template <groupId> <templateType> [leaderboard-json]');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = GroupManager;
