#!/bin/bash
# git-auto-commit.sh - Auto-commit changes every 10 minutes
# Created: 2026-02-07
# Purpose: Keep AlexBot's workspace synced to GitHub with detailed, self-aware commit messages
#
# Commit messages tell the story of my evolution as an AI assistant.
# Each commit shows what changed and WHY - whether initiated by Alex, 
# by my own learning, or by automated processes.

set -e

WORKSPACE="$HOME/.openclaw/workspace"
cd "$WORKSPACE"

# Sync all OpenClaw config to workspace BEFORE checking for changes
if [[ -f "$WORKSPACE/scripts/sync-openclaw-config.sh" ]]; then
    "$WORKSPACE/scripts/sync-openclaw-config.sh" export 2>/dev/null || true
fi

# Ensure SSH agent has the key
eval "$(ssh-agent -s)" > /dev/null 2>&1
ssh-add ~/.ssh/alexbot_github 2>/dev/null || true

# Check if there are any changes
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - No changes to commit"
    exit 0
fi

# Categorize changes for detailed commit message
MEMORY_CHANGES=$(git diff --name-only -- 'memory/*.md' 'memory/*.json' 2>/dev/null | wc -l)
CHANNEL_CHANGES=$(git diff --name-only -- 'memory/channels/*' 2>/dev/null | wc -l)
SCRIPT_CHANGES=$(git diff --name-only -- 'scripts/*' 2>/dev/null | wc -l)
SKILL_CHANGES=$(git diff --name-only -- 'skills/*' 2>/dev/null | wc -l)
CORE_CHANGES=$(git diff --name-only -- '*.md' 2>/dev/null | grep -v memory | wc -l || echo 0)
PLAN_CHANGES=$(git diff --name-only -- 'memory/plans/*' 2>/dev/null | wc -l)
PEOPLE_CHANGES=$(git diff --name-only -- 'memory/people/*' 'memory/.private/*' 'memory/whatsapp/contacts/*' 2>/dev/null | wc -l)
DAILY_NOTES=$(git diff --name-only -- 'memory/2026-*.md' 2>/dev/null | wc -l)
CALL_TRANSCRIPTS=$(git diff --name-only -- 'memory/call-transcripts/*' 2>/dev/null | wc -l)

# Also count new untracked files
NEW_FILES=$(git ls-files --others --exclude-standard | wc -l)

# Build commit message with self-aware context
COMMIT_TYPE="chore"
COMMIT_SCOPE="sync"
SUBJECT_PARTS=()
BODY_LINES=()

# Add self-awareness header
BODY_LINES+=("🤖 AlexBot Self-Update")
BODY_LINES+=("========================")
BODY_LINES+=("")
BODY_LINES+=("Triggered by: Automated sync (cron job)")
BODY_LINES+=("Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')")
BODY_LINES+=("")

# Determine the nature of changes
if [ "$CORE_CHANGES" -gt 0 ]; then
    COMMIT_TYPE="evolve"
    COMMIT_SCOPE="identity"
    SUBJECT_PARTS+=("identity/personality updates")
    BODY_LINES+=("## 🧠 Core Identity Evolution")
    BODY_LINES+=("My core personality or rules were updated:")
    for f in $(git diff --name-only -- '*.md' 2>/dev/null | grep -v memory | head -5); do
        BODY_LINES+=("  - $f")
    done
    BODY_LINES+=("")
fi

if [ "$SCRIPT_CHANGES" -gt 0 ]; then
    COMMIT_TYPE="enhance"
    COMMIT_SCOPE="capabilities"
    SUBJECT_PARTS+=("new/improved capabilities")
    BODY_LINES+=("## ⚡ Capability Enhancement")
    BODY_LINES+=("My automation scripts were improved:")
    for f in $(git diff --name-only -- 'scripts/*' 2>/dev/null | head -5); do
        BODY_LINES+=("  - $f")
    done
    BODY_LINES+=("")
fi

if [ "$SKILL_CHANGES" -gt 0 ]; then
    COMMIT_TYPE="enhance"
    COMMIT_SCOPE="skills"
    SUBJECT_PARTS+=("skill updates")
    BODY_LINES+=("## 🎯 Skill Development")
    BODY_LINES+=("My skills were enhanced or added:")
    for f in $(git diff --name-only -- 'skills/*' 2>/dev/null | head -5); do
        BODY_LINES+=("  - $f")
    done
    BODY_LINES+=("")
fi

if [ "$PLAN_CHANGES" -gt 0 ]; then
    COMMIT_TYPE="plan"
    if [ "$COMMIT_SCOPE" = "sync" ]; then
        COMMIT_SCOPE="roadmap"
    fi
    SUBJECT_PARTS+=("improvement planning")
    BODY_LINES+=("## 📋 Self-Improvement Planning")
    BODY_LINES+=("Updated my improvement roadmap:")
    for f in $(git diff --name-only -- 'memory/plans/*' 2>/dev/null | head -5); do
        BODY_LINES+=("  - $f")
    done
    BODY_LINES+=("")
fi

if [ "$MEMORY_CHANGES" -gt 0 ] || [ "$CHANNEL_CHANGES" -gt 0 ]; then
    if [ "$COMMIT_SCOPE" = "sync" ]; then
        COMMIT_SCOPE="memory"
    fi
    SUBJECT_PARTS+=("learned from interactions")
    BODY_LINES+=("## 📚 Learning & Memory")
    BODY_LINES+=("I learned and stored new information:")
    BODY_LINES+=("  - Memory files updated: $MEMORY_CHANGES")
    BODY_LINES+=("  - Channel context updated: $CHANNEL_CHANGES")
    BODY_LINES+=("")
fi

if [ "$PEOPLE_CHANGES" -gt 0 ]; then
    SUBJECT_PARTS+=("relationship learning")
    BODY_LINES+=("## 👥 Relationship Memory")
    BODY_LINES+=("Updated my understanding of people I interact with:")
    BODY_LINES+=("  - Profiles updated: $PEOPLE_CHANGES")
    BODY_LINES+=("")
fi

if [ "$DAILY_NOTES" -gt 0 ]; then
    SUBJECT_PARTS+=("daily journaling")
    BODY_LINES+=("## 📅 Daily Notes")
    BODY_LINES+=("Recorded my daily activities and learnings.")
    BODY_LINES+=("")
fi

if [ "$CALL_TRANSCRIPTS" -gt 0 ]; then
    SUBJECT_PARTS+=("call processing")
    BODY_LINES+=("## 📞 Call Transcripts")
    BODY_LINES+=("Processed and stored new call transcriptions.")
    BODY_LINES+=("")
fi

if [ "$NEW_FILES" -gt 0 ]; then
    SUBJECT_PARTS+=("$NEW_FILES new additions")
    BODY_LINES+=("## ✨ New Files Added: $NEW_FILES")
    for f in $(git ls-files --others --exclude-standard | head -5); do
        BODY_LINES+=("  + $f")
    done
    if [ "$NEW_FILES" -gt 5 ]; then
        BODY_LINES+=("  ... and $((NEW_FILES - 5)) more")
    fi
    BODY_LINES+=("")
fi

# Add footer
BODY_LINES+=("---")
BODY_LINES+=("This commit represents my continuous evolution as Alex's AI assistant.")
BODY_LINES+=("Each change makes me better at helping him.")

# Build final subject
if [ ${#SUBJECT_PARTS[@]} -eq 0 ]; then
    SUBJECT="🤖 sync: periodic self-update $(date '+%H:%M')"
else
    SUBJECT="🤖 $COMMIT_TYPE($COMMIT_SCOPE): $(IFS=', '; echo "${SUBJECT_PARTS[*]}")"
fi

# Build final body
BODY="$(printf '%s\n' "${BODY_LINES[@]}")"

# Stage all changes
git add -A

# Commit with detailed message
git commit -m "$SUBJECT" -m "$BODY"

# Push to GitHub
GIT_SSH_COMMAND="ssh -i ~/.ssh/alexbot_github -o StrictHostKeyChecking=no" git push origin master

echo "$(date '+%Y-%m-%d %H:%M:%S') - Committed and pushed: $SUBJECT"
