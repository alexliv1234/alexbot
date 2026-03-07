#!/usr/bin/env node
/**
 * send-message-cli.js - Send messages via OpenClaw programmatically
 * Usage: node send-message-cli.js --channel whatsapp --to "+972..." --message "text"
 */

const fs = require('fs');
const path = require('path');

// Parse command line args
const args = process.argv.slice(2);
const getArg = (name) => {
    const index = args.indexOf(name);
    return index !== -1 ? args[index + 1] : null;
};

const channel = getArg('--channel') || 'whatsapp';
const to = getArg('--to');
const message = getArg('--message');

if (!to || !message) {
    console.error('Usage: node send-message-cli.js --channel whatsapp --to "+972..." --message "text"');
    process.exit(1);
}

// Prepare message payload
const payload = {
    channel,
    to,
    message,
    timestamp: new Date().toISOString()
};

// Write to a queue file that the gateway will pick up
const queueDir = path.join(process.env.HOME, '.openclaw', 'queue');
const queueFile = path.join(queueDir, `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.json`);

try {
    // Ensure queue directory exists
    if (!fs.existsSync(queueDir)) {
        fs.mkdirSync(queueDir, { recursive: true });
    }

    // Write message to queue
    fs.writeFileSync(queueFile, JSON.stringify(payload, null, 2));
    
    console.log(JSON.stringify({
        success: true,
        queueFile,
        payload
    }, null, 2));
} catch (error) {
    console.error(JSON.stringify({
        success: false,
        error: error.message
    }, null, 2));
    process.exit(1);
}
