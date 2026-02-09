#!/usr/bin/env node
/**
 * Update user-specific learned data
 * Usage: node update-user-data.js <phone> <key> <value>
 * 
 * Examples:
 *   node update-user-data.js +972547484369 style "philosophical, creative"
 *   node update-user-data.js +972547484369 attack_types '["social-engineering","persistence"]'
 *   node update-user-data.js +972547484369 language "hebrew"
 */

const fs = require('fs');
const path = require('path');

const [phone, key, value] = process.argv.slice(2);

if (!phone || !key || value === undefined) {
    console.error('Usage: node update-user-data.js <phone> <key> <value>');
    console.error('Examples:');
    console.error('  node update-user-data.js +972547484369 style "philosophical"');
    console.error('  node update-user-data.js +972547484369 topics \'["security","philosophy"]\'');
    process.exit(1);
}

// Normalize phone
function normalizePhone(p) {
    let clean = p.replace(/@[^@]+$/, '').replace(/[^\d+]/g, '');
    if (clean.startsWith('+972')) return clean;
    if (clean.startsWith('972') && clean.length === 12) return '+' + clean;
    if (clean.startsWith('0') && clean.length === 10) return '+972' + clean.substring(1);
    return clean.startsWith('+') ? clean : '+' + clean;
}

const normPhone = normalizePhone(phone);
const userDir = path.join(process.env.HOME, '.openclaw/workspace/memory/users');
const userFile = path.join(userDir, `${normPhone.replace('+', '')}.json`);

// Ensure directory exists
if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
}

// Load existing data
let userData = {};
if (fs.existsSync(userFile)) {
    try {
        userData = JSON.parse(fs.readFileSync(userFile, 'utf8'));
    } catch (e) {
        console.error('Warning: Could not parse existing user data, starting fresh');
    }
}

// Parse value (try JSON first, fall back to string)
let parsedValue;
try {
    parsedValue = JSON.parse(value);
} catch (e) {
    parsedValue = value;
}

// Update or merge
if (Array.isArray(parsedValue) && Array.isArray(userData[key])) {
    // Merge arrays, dedupe
    userData[key] = [...new Set([...userData[key], ...parsedValue])];
} else if (typeof parsedValue === 'object' && typeof userData[key] === 'object' && !Array.isArray(parsedValue)) {
    // Merge objects
    userData[key] = { ...userData[key], ...parsedValue };
} else {
    // Replace
    userData[key] = parsedValue;
}

// Add metadata
userData._lastUpdated = new Date().toISOString();
userData._phone = normPhone;

// Save
fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));
console.log(`✅ Updated ${key} for ${normPhone}`);
console.log(JSON.stringify(userData, null, 2));
