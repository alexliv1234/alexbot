#!/bin/bash
# git-auto-commit.sh - Auto-commit changes every 10 minutes
# Created: 2026-02-07
# Purpose: Keep the AlexBot workspace synced to GitHub with detailed commit messages

set -e

WORKSPACE="$HOME/.openclaw/workspace"
cd "$WORKSPACE"

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

# Also count new untracked files
NEW_FILES=$(git ls-files --others --exclude-standard | wc -l)

# Build commit message
COMMIT_TYPE="chore"
COMMIT_SCOPE="sync"
SUBJECT_PARTS=()
BODY_LINES=()

if [ "$CORE_CHANGES" -gt 0 ]; then
    COMMIT_TYPE="feat"
    COMMIT_SCOPE="core"
    SUBJECT_PARTS+=("core identity updates")
    BODY_LINES+=("Core files modified:")
    for f in $(git diff --name-only -- '*.md' 2>/dev/null | grep -v memory | head -5); do
        BODY_LINES+=("  - $f")
    done
fi

if [ "$SCRIPT_CHANGES" -gt 0 ]; then
    COMMIT_TYPE="feat"
    COMMIT_SCOPE="scripts"
    SUBJECT_PARTS+=("script updates")
    BODY_LINES+=("")
    BODY_LINES+=("Scripts modified:")
    for f in $(git diff --name-only -- 'scripts/*' 2>/dev/null | head -5); do
        BODY_LINES+=("  - $f")
    done
fi

if [ "$SKILL_CHANGES" -gt 0 ]; then
    COMMIT_TYPE="feat"
    COMMIT_SCOPE="skills"
    SUBJECT_PARTS+=("skill updates")
    BODY_LINES+=("")
    BODY_LINES+=("Skills modified:")
    for f in $(git diff --name-only -- 'skills/*' 2>/dev/null | head -5); do
        BODY_LINES+=("  - $f")
    done
fi

if [ "$PLAN_CHANGES" -gt 0 ]; then
    SUBJECT_PARTS+=("improvement plans")
    BODY_LINES+=("")
    BODY_LINES+=("Plans modified:")
    for f in $(git diff --name-only -- 'memory/plans/*' 2>/dev/null | head -5); do
        BODY_LINES+=("  - $f")
    done
fi

if [ "$MEMORY_CHANGES" -gt 0 ] || [ "$CHANNEL_CHANGES" -gt 0 ]; then
    if [ "$COMMIT_SCOPE" = "sync" ]; then
        COMMIT_SCOPE="memory"
    fi
    SUBJECT_PARTS+=("memory/channel updates")
    BODY_LINES+=("")
    BODY_LINES+=("Memory files updated: $MEMORY_CHANGES")
    BODY_LINES+=("Channel files updated: $CHANNEL_CHANGES")
fi

if [ "$PEOPLE_CHANGES" -gt 0 ]; then
    SUBJECT_PARTS+=("contact/people updates")
    BODY_LINES+=("")
    BODY_LINES+=("People/contact profiles updated: $PEOPLE_CHANGES")
fi

if [ "$NEW_FILES" -gt 0 ]; then
    SUBJECT_PARTS+=("$NEW_FILES new files")
    BODY_LINES+=("")
    BODY_LINES+=("New files added: $NEW_FILES")
    for f in $(git ls-files --others --exclude-standard | head -5); do
        BODY_LINES+=("  + $f")
    done
    if [ "$NEW_FILES" -gt 5 ]; then
        BODY_LINES+=("  ... and $((NEW_FILES - 5)) more")
    fi
fi

# Build final subject
if [ ${#SUBJECT_PARTS[@]} -eq 0 ]; then
    SUBJECT="chore(sync): periodic sync $(date '+%Y-%m-%d %H:%M')"
else
    SUBJECT="$COMMIT_TYPE($COMMIT_SCOPE): $(IFS=', '; echo "${SUBJECT_PARTS[*]}")"
fi

# Build final body
BODY="Automatic commit by git-auto-commit.sh
Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')

$(printf '%s\n' "${BODY_LINES[@]}")"

# Stage all changes
git add -A

# Commit with detailed message
git commit -m "$SUBJECT" -m "$BODY"

# Push to GitHub
GIT_SSH_COMMAND="ssh -i ~/.ssh/alexbot_github -o StrictHostKeyChecking=no" git push origin master

echo "$(date '+%Y-%m-%d %H:%M:%S') - Committed and pushed: $SUBJECT"
