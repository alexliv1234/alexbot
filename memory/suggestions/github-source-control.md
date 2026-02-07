# 💡 Suggestion: GitHub Source Control for Workspace

**Suggested by:** Alex Liverant
**Date:** 2026-02-06
**Type:** Feature
**Score:** 41/50
**Status:** Pending

---

## 📋 Current State

| Item | Status |
|------|--------|
| Git repo initialized | ✅ Yes (no commits) |
| Git remote configured | ❌ No |
| GitHub CLI (`gh`) | ❌ Not installed |
| `.gitignore` | ❌ Missing |
| Git user config | ❌ Not set |

---

## 🎯 Implementation Plan

### Step 1: Install GitHub CLI

```bash
# Ubuntu/WSL
sudo apt update && sudo apt install gh -y

# Or via conda/brew if available
```

### Step 2: Authenticate with GitHub

```bash
gh auth login
# Choose: GitHub.com → HTTPS → Login with browser
```

### Step 3: Configure Git Identity

```bash
git config --global user.email "alexliv@gmail.com"
git config --global user.name "Alex Liverant"
```

### Step 4: Create `.gitignore`

**CRITICAL: Exclude sensitive/large data**

```gitignore
# === SENSITIVE DATA - NEVER COMMIT ===
memory/whatsapp/google_contacts.json
memory/calls/
memory/call-transcripts/
memory/channels/playing-with-alexbot-daily/
memory/esh_employees.json
*.m4a
*.wav
*.mp3

# === LARGE/GENERATED FILES ===
node_modules/
*.log
*.tmp
.DS_Store

# === SESSION DATA (regenerated) ===
memory/heartbeat-state.json
memory/media-check-state.json
memory/channels/*-scored.json
memory/channels/*-broke-tracker.json

# === IMAGES (large, can regenerate) ===
*.jpg
*.png
*.jpeg

# === LOCAL CONFIG ===
.env
.env.local
secrets/
```

### Step 5: Create GitHub Repository

```bash
# Create private repo
gh repo create alexliv-workspace --private --source=. --remote=origin

# Or if repo exists:
git remote add origin https://github.com/alexliv/alexliv-workspace.git
```

### Step 6: Initial Commit

```bash
# Stage safe files
git add AGENTS.md SOUL.md USER.md TOOLS.md MEMORY.md HEARTBEAT.md IDENTITY.md
git add scripts/
git add skills/
git add .gitignore

# Commit
git commit -m "Initial commit: workspace foundation"

# Push
git push -u origin master
```

---

## 📂 What TO Version Control

| Path | Reason |
|------|--------|
| `AGENTS.md`, `SOUL.md`, `USER.md` | Core identity & config |
| `TOOLS.md`, `HEARTBEAT.md` | Operational config |
| `MEMORY.md` | Curated long-term memory |
| `scripts/*.js` | Automation scripts |
| `skills/*/SKILL.md` | Custom skill definitions |
| `.gitignore` | Exclusion rules |

## 🚫 What NOT to Version Control

| Path | Reason |
|------|--------|
| `memory/whatsapp/` | Personal contacts, chats |
| `memory/calls/` | Call recordings |
| `memory/call-transcripts/` | Private transcriptions |
| `memory/channels/*-daily/` | Raw message logs |
| `node_modules/` | Dependencies (use package.json) |
| `*.jpg/*.png` | Generated images |
| API keys, tokens | Security |

---

## 🔄 Ongoing Workflow

### Daily Auto-Commit (optional cron)
```bash
#!/bin/bash
cd ~/.openclaw/workspace
git add -A
git diff --cached --quiet || git commit -m "Auto-save: $(date +%Y-%m-%d)"
git push origin master
```

### Manual Commit After Changes
```bash
git add -A && git commit -m "Description of changes" && git push
```

---

## 🛡️ Security Considerations

1. **Repository must be PRIVATE** - contains personal workflow
2. **Never commit contacts/call data** - privacy violation
3. **Review before push** - use `git diff --cached` 
4. **Use `.gitignore` strictly** - prevent accidental commits
5. **Consider git-crypt** for encrypting sensitive-but-needed files

---

## 📦 Required Skill

**Built-in:** `/usr/lib/node_modules/openclaw/skills/github/`
- Requires `gh` CLI binary
- Provides PR, issue, run, and API commands
- Auth via `gh auth login`

---

## ✅ Acceptance Criteria

- [ ] `gh` CLI installed and authenticated
- [ ] `.gitignore` created with all exclusions
- [ ] Git user configured
- [ ] GitHub private repo created
- [ ] Initial commit pushed
- [ ] Can run `git status` without sensitive files showing

