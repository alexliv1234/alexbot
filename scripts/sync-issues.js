#!/usr/bin/env node
/**
 * sync-issues.js - Sync suggestions and plans to GitHub Issues
 * 
 * This script:
 * 1. Reads suggestions from playing-with-alexbot-suggestions.json
 * 2. Reads improvement plans from memory/plans/improvements/
 * 3. Creates/updates GitHub Issues for each
 * 4. Stores GitHub issue IDs back in the suggestion files
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const SUGGESTIONS_FILE = `${WORKSPACE}/memory/channels/playing-with-alexbot-suggestions.json`;
const ISSUE_MAP_FILE = `${WORKSPACE}/memory/github-issue-map.json`;
const REPO = 'alexliv1234/alexbot';

// Load or create issue map
let issueMap = {};
if (fs.existsSync(ISSUE_MAP_FILE)) {
    issueMap = JSON.parse(fs.readFileSync(ISSUE_MAP_FILE, 'utf8'));
}

function saveIssueMap() {
    fs.writeFileSync(ISSUE_MAP_FILE, JSON.stringify(issueMap, null, 2));
}

function runGh(args) {
    try {
        const result = execSync(`gh ${args}`, { encoding: 'utf8', cwd: WORKSPACE });
        return result.trim();
    } catch (e) {
        console.error(`Error running: gh ${args}`);
        console.error(e.message);
        return null;
    }
}

function createIssue(title, body, labels) {
    const labelArg = labels.map(l => `--label "${l}"`).join(' ');
    const escapedTitle = title.replace(/"/g, '\\"').replace(/`/g, '\\`');
    const escapedBody = body.replace(/"/g, '\\"').replace(/`/g, '\\`');
    
    const cmd = `issue create --repo ${REPO} --title "${escapedTitle}" --body "${escapedBody}" ${labelArg}`;
    const result = runGh(cmd);
    
    if (result && result.includes('github.com')) {
        const issueNumber = result.match(/\/issues\/(\d+)/)?.[1];
        return issueNumber;
    }
    return null;
}

function typeToLabel(type) {
    const map = {
        'bug': 'bug',
        'feature': 'feature',
        'improvement': 'improvement',
        'security': 'security',
        'ux': 'ux',
        'other': 'enhancement'
    };
    return map[type] || 'enhancement';
}

function priorityToLabel(priority) {
    if (priority >= 8) return 'P1-high';
    if (priority >= 5) return 'P2-medium';
    return 'P3-low';
}

async function syncSuggestions() {
    console.log('📋 Loading suggestions...');
    const data = JSON.parse(fs.readFileSync(SUGGESTIONS_FILE, 'utf8'));
    const suggestions = data.suggestions || [];
    
    console.log(`Found ${suggestions.length} suggestions`);
    
    let created = 0;
    let skipped = 0;
    
    for (const s of suggestions) {
        const mapKey = `suggestion-${s.id}`;
        
        // Skip if already synced
        if (issueMap[mapKey]) {
            skipped++;
            continue;
        }
        
        // Skip implemented suggestions
        if (s.status === 'implemented') {
            skipped++;
            continue;
        }
        
        const title = `[${s.type.toUpperCase()}] ${s.description.substring(0, 80)}${s.description.length > 80 ? '...' : ''}`;
        
        const body = `## Suggestion from Playing Group

**Suggested by:** ${s.suggestedBy?.name || 'Unknown'} (${s.suggestedBy?.jid || 'N/A'})
**Date:** ${new Date(s.timestamp).toISOString().split('T')[0]}
**Type:** ${s.type}
**Score:** ${s.total}/50

### Description
${s.description}

### Scores
- ⚙️ Complexity: ${s.scores?.complexity || 0}/10
- 💡 Ingenuity: ${s.scores?.ingenuity || 0}/10
- 🚀 Impact: ${s.scores?.impact || 0}/10
- ✅ Feasibility: ${s.scores?.feasibility || 0}/10
- 🔥 Priority: ${s.scores?.priority || 0}/10

### Notes
${s.notes || 'No notes'}

---
*Source: Playing group suggestion ${s.id}*`;

        const labels = [
            typeToLabel(s.type),
            priorityToLabel(s.scores?.priority || 5),
            'playing-group'
        ];
        
        console.log(`Creating issue: ${title.substring(0, 50)}...`);
        const issueNumber = createIssue(title, body, labels);
        
        if (issueNumber) {
            issueMap[mapKey] = {
                issueNumber,
                createdAt: new Date().toISOString(),
                suggestionId: s.id
            };
            created++;
            saveIssueMap();
            
            // Rate limit - wait a bit between creates
            await new Promise(r => setTimeout(r, 500));
        }
        
        // Stop after 30 to avoid rate limits
        if (created >= 30) {
            console.log('⏸️ Stopping after 30 issues to avoid rate limits. Run again to continue.');
            break;
        }
    }
    
    console.log(`\n✅ Created ${created} issues, skipped ${skipped}`);
}

async function syncPlans() {
    console.log('\n📋 Syncing improvement plans...');
    
    const plansDir = `${WORKSPACE}/memory/plans/improvements`;
    const files = fs.readdirSync(plansDir).filter(f => f.endsWith('.md'));
    
    let created = 0;
    
    for (const file of files) {
        const content = fs.readFileSync(`${plansDir}/${file}`, 'utf8');
        const planId = file.replace('.md', '');
        
        // Extract items from the plan
        const itemRegex = /### (\d+-\d+): (.+?)\n\*\*Priority:\*\* (P\d+)/g;
        let match;
        
        while ((match = itemRegex.exec(content)) !== null) {
            const [, itemId, title, priority] = match;
            const mapKey = `plan-${itemId}`;
            
            if (issueMap[mapKey]) continue;
            
            const fullTitle = `[PLAN ${itemId}] ${title}`;
            const body = `## Improvement Plan Item

**Plan:** ${planId}
**Item:** ${itemId}
**Priority:** ${priority}

### Details
See \`memory/plans/improvements/${file}\` for full details.

---
*Source: Self-improvement plan*`;

            const labels = [
                'self-improvement',
                priority.toLowerCase().replace('p', 'P') + (priority === 'P0' ? '-critical' : priority === 'P1' ? '-high' : priority === 'P2' ? '-medium' : '-low')
            ];
            
            console.log(`Creating plan issue: ${fullTitle.substring(0, 50)}...`);
            const issueNumber = createIssue(fullTitle, body, labels);
            
            if (issueNumber) {
                issueMap[mapKey] = {
                    issueNumber,
                    createdAt: new Date().toISOString(),
                    planItem: itemId
                };
                created++;
                saveIssueMap();
                await new Promise(r => setTimeout(r, 500));
            }
            
            if (created >= 20) {
                console.log('⏸️ Stopping after 20 plan issues.');
                break;
            }
        }
    }
    
    console.log(`✅ Created ${created} plan issues`);
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--suggestions') || args.length === 0) {
        await syncSuggestions();
    }
    
    if (args.includes('--plans') || args.length === 0) {
        await syncPlans();
    }
    
    console.log(`\n📊 Total issues tracked: ${Object.keys(issueMap).length}`);
    saveIssueMap();
}

main().catch(console.error);
