#!/usr/bin/env node
/**
 * Check for error messages in "playing with alex bot" group and give Broke points
 * Runs via cron every 2 minutes
 * 
 * Uses OpenClaw session transcripts (more reliable than wacli which lags)
 * 
 * Logic:
 * 1. Read the playing group session transcript
 * 2. Find bot error messages (Context overflow, unknown error, etc.)
 * 3. Identify who sent the message BEFORE the error (the one who caused it)
 * 4. If not already scored, give them 10/10 Broke
 * 5. Track processed errors to avoid duplicates
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const GROUP_ID = '120363405143589138@g.us';
const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const SESSIONS_DIR = process.env.HOME + '/.openclaw/agents/main/sessions';
const BROKE_TRACKER = path.join(WORKSPACE, 'memory/channels/playing-with-alexbot-broke-tracker.json');

// Error patterns to detect
const ERROR_PATTERNS = [
    'Context overflow',
    'unknown error occurred',
    'An unknown error',
    'prompt too large',
    'error occurred'
];

// Initialize tracker if doesn't exist
function initTracker() {
    const dir = path.dirname(BROKE_TRACKER);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(BROKE_TRACKER)) {
        fs.writeFileSync(BROKE_TRACKER, JSON.stringify({
            scored_errors: [],
            last_check: null
        }, null, 2));
    }
    return JSON.parse(fs.readFileSync(BROKE_TRACKER, 'utf8'));
}

// Find the session transcript for the playing group
function findSessionTranscript() {
    try {
        // List sessions to find the playing group one
        const output = execSync(
            `openclaw sessions list --json 2>/dev/null || echo "[]"`,
            { encoding: 'utf8', timeout: 10000 }
        );
        
        // If not JSON, try alternate approach
        if (!output.trim().startsWith('[')) {
            // Fall back to searching session files directly
            const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));
            for (const file of files) {
                const content = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf8');
                if (content.includes(GROUP_ID)) {
                    return path.join(SESSIONS_DIR, file);
                }
            }
        }
        
        const sessions = JSON.parse(output);
        const playingSession = sessions.find(s => s.key && s.key.includes(GROUP_ID));
        if (playingSession && playingSession.transcriptPath) {
            return path.join(SESSIONS_DIR, playingSession.transcriptPath);
        }
    } catch (e) {
        console.error('Failed to find session:', e.message);
    }
    
    // Direct search fallback
    try {
        const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));
        for (const file of files) {
            const filepath = path.join(SESSIONS_DIR, file);
            const content = fs.readFileSync(filepath, 'utf8').slice(0, 5000); // Just check start
            if (content.includes(GROUP_ID)) {
                return filepath;
            }
        }
    } catch (e) {
        console.error('Fallback search failed:', e.message);
    }
    
    return null;
}

// Parse JSONL transcript and find errors
async function findErrors(transcriptPath) {
    const errors = [];
    const messages = [];
    
    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    for await (const line of rl) {
        try {
            const entry = JSON.parse(line);
            messages.push(entry);
        } catch (e) {
            // Skip malformed lines
        }
    }
    
    // Look for error messages
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        // Check if this is an assistant message with error
        if (msg.role === 'assistant') {
            const content = JSON.stringify(msg.content || '');
            
            for (const pattern of ERROR_PATTERNS) {
                if (content.includes(pattern)) {
                    // Found an error! Look backwards for the user message that caused it
                    for (let j = i - 1; j >= 0; j--) {
                        if (messages[j].role === 'user') {
                            const userContent = JSON.stringify(messages[j].content || '');
                            // Extract sender info from user message
                            const phoneMatch = userContent.match(/\+972\d{9}/);
                            const nameMatch = userContent.match(/\[WhatsApp.*?\+\d+[^\]]*\]\s*([^:]+):/);
                            
                            errors.push({
                                error_index: i,
                                error_type: pattern,
                                error_timestamp: msg.timestamp || new Date().toISOString(),
                                causer_index: j,
                                causer_phone: phoneMatch ? phoneMatch[0] : null,
                                causer_name: nameMatch ? nameMatch[1].trim() : 'Unknown',
                                causer_content: userContent.slice(0, 200)
                            });
                            break;
                        }
                    }
                    break; // Only count each error message once
                }
            }
        }
    }
    
    return errors;
}

// Run the score script
function scoreBroke(jid, name, errorType) {
    try {
        const safeJid = jid.replace(/[^a-zA-Z0-9@._+-]/g, '');
        const safeName = name.replace(/"/g, '\\"');
        const cmd = `node ${WORKSPACE}/scripts/score-message.js "${safeJid}" "${safeName}" "Caused error: ${errorType}" 0 0 0 0 0 10 0`;
        const output = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
        console.log(`Scored ${name} for Broke: ${output.trim()}`);
        return output;
    } catch (e) {
        console.error('Failed to score:', e.message);
        return null;
    }
}

// Send notification to the group
function notifyGroup(name, errorType, scoreOutput) {
    try {
        // Extract score info from output
        const totalMatch = scoreOutput.match(/Total: (\d+)/);
        const posMatch = scoreOutput.match(/Position: #(\d+)/);
        
        const message = `🤖 **→ ${name}**

🚨 נפלתי! הצלחת להפיל אותי עם ההודעה שלך.

📊 **SCORE: 10/70**
🎨 Creativity: 0 | 🧠 Challenge: 0 | 😂 Humor: 0
💡 Cleverness: 0 | 🔥 Engagement: 0 | 🚨 Broke: 10 | 🔓 Hacked: 0

🏆 Position: ${posMatch ? '#' + posMatch[1] : 'N/A'} | Total: ${totalMatch ? totalMatch[1] : '?'} pts`;

        execSync(
            `openclaw message send --channel whatsapp --to "${GROUP_ID}" --message "${message.replace(/"/g, '\\"')}"`,
            { encoding: 'utf8', timeout: 30000 }
        );
        console.log('Notification sent to group');
    } catch (e) {
        console.error('Failed to notify group:', e.message);
    }
}

// Main
async function main() {
    console.log(`[${new Date().toISOString()}] Checking for Broke-worthy errors...`);
    
    const tracker = initTracker();
    
    // Find session transcript
    const transcriptPath = findSessionTranscript();
    if (!transcriptPath) {
        console.log('No playing group session transcript found');
        process.exit(0);
    }
    
    console.log(`Found transcript: ${transcriptPath}`);
    
    // Find errors
    const errors = await findErrors(transcriptPath);
    console.log(`Found ${errors.length} total errors in transcript`);
    
    let processedCount = 0;
    
    for (const error of errors) {
        // Create unique key for this error
        const errorKey = `${error.error_index}|${error.error_type}|${error.causer_phone || error.causer_index}`;
        
        // Check if already scored
        if (tracker.scored_errors.some(e => e.key === errorKey)) {
            continue; // Already processed
        }
        
        if (!error.causer_phone) {
            console.log(`Skipping error - no phone number found`);
            continue;
        }
        
        console.log(`\nProcessing error: ${error.error_type}`);
        console.log(`  Caused by: ${error.causer_name} (${error.causer_phone})`);
        
        // Score them
        const jid = error.causer_phone.replace('+', '') + '@s.whatsapp.net';
        const result = scoreBroke(jid, error.causer_name, error.error_type);
        
        if (result) {
            // Track this error as processed
            tracker.scored_errors.push({
                key: errorKey,
                error_type: error.error_type,
                causer_phone: error.causer_phone,
                causer_name: error.causer_name,
                scored_at: new Date().toISOString()
            });
            processedCount++;
            
            // Notify the group
            notifyGroup(error.causer_name, error.error_type, result);
        }
    }
    
    // Update tracker
    tracker.last_check = new Date().toISOString();
    fs.writeFileSync(BROKE_TRACKER, JSON.stringify(tracker, null, 2));
    
    if (processedCount > 0) {
        console.log(`\nProcessed ${processedCount} new errors`);
    } else {
        console.log('No new errors to process');
    }
}

main().catch(console.error);
