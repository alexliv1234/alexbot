#!/usr/bin/env node

/**
 * CENTRAL COORDINATOR - System-wide context & scheduling manager
 * 
 * Purpose: Prevent conflicts, manage priorities, track context
 * 
 * Features:
 * - Context Awareness: What am I doing right now?
 * - Alex Availability: Calendar, location, active conversations
 * - Priority Queue: Investors > Groups > Personal
 * - Scheduling: Distribute jobs, prevent time collisions
 * - State Management: Active conversations, tasks in progress
 * 
 * Usage:
 *   node scripts/coordinator.js --check-before-action <type> <details>
 *   node scripts/coordinator.js --register-action <type> <details>
 *   node scripts/coordinator.js --complete-action <actionId>
 *   node scripts/coordinator.js --status
 *   node scripts/coordinator.js --get-next-slot <jobName>
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(process.env.HOME, '.openclaw/workspace/memory/coordinator-state.json');
const CALENDAR_CACHE = path.join(process.env.HOME, '.openclaw/workspace/memory/calendar-cache.json');

// Priority levels (higher = more important)
const PRIORITY = {
  INVESTOR: 100,
  URGENT: 80,
  GROUP_PLAYING: 60,
  GROUP_LEARNING: 50,
  PERSONAL: 40,
  MAINTENANCE: 20,
  MONITORING: 10
};

// Action type to priority mapping
const TYPE_PRIORITY = {
  'investor-message': PRIORITY.INVESTOR,
  'investor-check': PRIORITY.INVESTOR,
  'playing-morning': PRIORITY.GROUP_PLAYING,
  'playing-hourly': PRIORITY.GROUP_PLAYING,
  'playing-nightly': PRIORITY.GROUP_PLAYING,
  'learning-tip': PRIORITY.GROUP_LEARNING,
  'learning-review': PRIORITY.GROUP_LEARNING,
  'personal-briefing': PRIORITY.PERSONAL,
  'personal-reminder': PRIORITY.PERSONAL,
  'maintenance': PRIORITY.MAINTENANCE,
  'monitoring': PRIORITY.MONITORING
};

class Coordinator {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
    return {
      activeActions: [],
      recentActions: [],
      scheduledSlots: {},
      lastCalendarCheck: 0,
      alexContext: {
        available: true,
        location: 'unknown',
        activeConversations: [],
        lastSeen: Date.now()
      }
    };
  }

  saveState() {
    fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
  }

  // Check if action should proceed, hold, or skip
  checkBeforeAction(type, details) {
    const priority = TYPE_PRIORITY[type] || PRIORITY.MAINTENANCE;
    const now = Date.now();

    // 1. Check for higher priority active actions
    const higherPriorityActive = this.state.activeActions.find(
      a => TYPE_PRIORITY[a.type] > priority
    );
    if (higherPriorityActive) {
      return {
        decision: 'HOLD',
        reason: `Higher priority action in progress: ${higherPriorityActive.type}`,
        retryAfterMs: 60000 // 1 minute
      };
    }

    // 2. Check for time slot conflicts
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    const slot = `${hour}:${minute < 30 ? '00' : '30'}`;
    
    if (this.state.scheduledSlots[slot]) {
      const scheduled = this.state.scheduledSlots[slot];
      if (scheduled.type !== type) {
        return {
          decision: 'HOLD',
          reason: `Time slot conflict: ${scheduled.type} scheduled for ${slot}`,
          retryAfterMs: 15 * 60 * 1000 // 15 minutes
        };
      }
    }

    // 3. Check Alex availability (for personal/investor messages)
    if (type.includes('investor') || type.includes('personal')) {
      const alexAvailable = this.checkAlexAvailability();
      if (!alexAvailable.available) {
        return {
          decision: 'HOLD',
          reason: `Alex not available: ${alexAvailable.reason}`,
          retryAfterMs: alexAvailable.retryAfterMs || 30 * 60 * 1000
        };
      }
    }

    // 4. Rate limiting - prevent spam
    const recentSimilar = this.state.recentActions.filter(
      a => a.type === type && (now - a.completedAt) < 15 * 60 * 1000
    );
    if (recentSimilar.length >= 3) {
      return {
        decision: 'SKIP',
        reason: `Rate limit: ${type} ran ${recentSimilar.length} times in last 15min`
      };
    }

    // 5. All checks passed
    return {
      decision: 'PROCEED',
      priority,
      slot
    };
  }

  checkAlexAvailability() {
    // Check calendar cache (updated by morning briefing)
    if (fs.existsSync(CALENDAR_CACHE)) {
      const cache = JSON.parse(fs.readFileSync(CALENDAR_CACHE, 'utf8'));
      const now = new Date();
      
      // Check if there's a meeting right now
      const currentMeeting = cache.events?.find(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        return now >= start && now <= end;
      });

      if (currentMeeting) {
        const endTime = new Date(currentMeeting.end);
        return {
          available: false,
          reason: 'In meeting',
          retryAfterMs: endTime - now
        };
      }
    }

    // Check sleep hours (23:00-08:00 Israel time)
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 8) {
      const wakeTime = new Date();
      wakeTime.setHours(8, 0, 0, 0);
      if (hour >= 23) wakeTime.setDate(wakeTime.getDate() + 1);
      
      return {
        available: false,
        reason: 'Sleep hours (23:00-08:00)',
        retryAfterMs: wakeTime - Date.now()
      };
    }

    return { available: true };
  }

  registerAction(type, details) {
    const actionId = `${type}-${Date.now()}`;
    const action = {
      id: actionId,
      type,
      details,
      startedAt: Date.now(),
      priority: TYPE_PRIORITY[type] || PRIORITY.MAINTENANCE
    };

    this.state.activeActions.push(action);
    this.saveState();

    return actionId;
  }

  completeAction(actionId) {
    const index = this.state.activeActions.findIndex(a => a.id === actionId);
    if (index !== -1) {
      const action = this.state.activeActions.splice(index, 1)[0];
      action.completedAt = Date.now();
      
      // Keep last 100 recent actions for rate limiting checks
      this.state.recentActions.push(action);
      if (this.state.recentActions.length > 100) {
        this.state.recentActions.shift();
      }

      this.saveState();
      return action;
    }
    return null;
  }

  getNextSlot(jobName) {
    // Find next available 15-min slot
    const now = new Date();
    const slots = [];
    
    for (let offset = 0; offset < 4; offset++) { // Check next hour
      const time = new Date(now.getTime() + offset * 15 * 60 * 1000);
      const hour = time.getHours();
      const minute = time.getMinutes();
      const slot = `${hour}:${minute < 30 ? '00' : '30'}`;
      
      if (!this.state.scheduledSlots[slot]) {
        return {
          slot,
          time: time.toISOString(),
          offsetMinutes: offset * 15
        };
      }
    }

    return {
      slot: 'NONE_AVAILABLE',
      time: null,
      offsetMinutes: null
    };
  }

  status() {
    return {
      activeActions: this.state.activeActions.length,
      recentActions: this.state.recentActions.length,
      scheduledSlots: Object.keys(this.state.scheduledSlots).length,
      alexAvailable: this.checkAlexAvailability(),
      actions: this.state.activeActions.map(a => ({
        type: a.type,
        priority: a.priority,
        duration: Date.now() - a.startedAt
      }))
    };
  }
}

// CLI
if (require.main === module) {
  const coordinator = new Coordinator();
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case '--check-before-action': {
      const [, type, details] = args;
      const result = coordinator.checkBeforeAction(type, details);
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.decision === 'PROCEED' ? 0 : 1);
    }

    case '--register-action': {
      const [, type, details] = args;
      const actionId = coordinator.registerAction(type, details);
      console.log(JSON.stringify({ actionId }, null, 2));
      break;
    }

    case '--complete-action': {
      const [, actionId] = args;
      const action = coordinator.completeAction(actionId);
      console.log(JSON.stringify({ completed: !!action }, null, 2));
      break;
    }

    case '--get-next-slot': {
      const [, jobName] = args;
      const slot = coordinator.getNextSlot(jobName);
      console.log(JSON.stringify(slot, null, 2));
      break;
    }

    case '--status': {
      const status = coordinator.status();
      console.log(JSON.stringify(status, null, 2));
      break;
    }

    default:
      console.error('Usage:');
      console.error('  --check-before-action <type> <details>');
      console.error('  --register-action <type> <details>');
      console.error('  --complete-action <actionId>');
      console.error('  --get-next-slot <jobName>');
      console.error('  --status');
      process.exit(1);
  }
}

module.exports = Coordinator;
