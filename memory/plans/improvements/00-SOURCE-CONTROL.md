# 📦 Source Control Setup (PRE-REQUISITE)

**Category:** Infrastructure
**Priority:** P0 (MUST DO FIRST)
**Status:** pending
**Impact:** Enables safe, trackable changes

---

## Current State

| Item | Status |
|------|--------|
| Git repo exists | ✅ Yes (empty, no commits) |
| Git user configured | ❌ Not set |
| SSH keys | ❌ None |
| GitHub CLI | ❌ Not installed |
| .gitignore | ❌ Missing |
| Initial commit | ❌ None |
| Remote repo | ❌ Not created |

---

## What Is "Me"?

**My workspace:** `~/.openclaw/workspace/`

**Files that define me:**
```
Core Identity:
├── SOUL.md          # My personality
├── IDENTITY.md      # Who I am
├── USER.md          # About Alex (SENSITIVE!)
├── AGENTS.md        # Behavior rules
├── TOOLS.md         # Tool usage notes
├── MEMORY.md        # Long-term memory (SENSITIVE!)
└── HEARTBEAT.md     # Periodic task rules

Scripts (my abilities):
└── scripts/         # 28+ scripts

Memory (my knowledge):
└── memory/
    ├── channels/    # Group-specific context
    ├── plans/       # Improvement plans
    ├── people/      # (PRIVATE - never commit!)
    ├── .private/    # Sensitive data
    └── *.md         # Daily notes

Skills (installed capabilities):
└── skills/          # Custom skills

Config:
├── .openclaw/       # Local config
├── .clawhub/        # ClawHub cache
└── package.json     # Dependencies
```

---

## Security Considerations

**NEVER commit:**
- `MEMORY.md` - Contains personal info, family details
- `USER.md` - Alex's private information
- `memory/people/` - Individual profiles
- `memory/.private/` - Explicitly private
- `memory/whatsapp/google_contacts.json` - Contact database
- `memory/esh_employees.json` - Employee data
- API keys, tokens, passwords
- Session transcripts

**Safe to commit:**
- Scripts (scoring, monitoring, etc.)
- Channel memory (playing-group rules, etc.)
- Plans and improvements
- Skill configurations
- SOUL.md, IDENTITY.md, AGENTS.md
- General workflow docs

---

## Implementation Steps

### 00-01: Configure Git Identity
**Priority:** P0 | **Effort:** Low | **Status:** pending

```bash
git config --global user.name "AlexLivBot"
git config --global user.email "alexliv+bot@gmail.com"
```

---

### 00-02: Create .gitignore
**Priority:** P0 | **Effort:** Low | **Status:** pending

```gitignore
# Sensitive files - NEVER commit
MEMORY.md
USER.md
memory/people/
memory/.private/
memory/whatsapp/google_contacts.json
memory/esh_employees.json
memory/call-transcripts/

# Node
node_modules/
package-lock.json

# Temporary files
*.log
*.tmp
*.jpg
*.png
*.mp3
*.m4a

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# ClawHub cache
.clawhub/
.clawdhub/

# Local OpenClaw config (has tokens)
.openclaw/

# Session files
*.jsonl

# Cellcom debugging (temporary)
cellcom-*.js
cellcom-*.html
cellcom-*.png

# Python temp
*.pyc
__pycache__/
parse_vcard*.py
```

---

### 00-03: Generate SSH Key
**Priority:** P0 | **Effort:** Low | **Status:** pending

```bash
ssh-keygen -t ed25519 -C "alexliv+bot@gmail.com" -f ~/.ssh/alexbot_github -N ""
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/alexbot_github
cat ~/.ssh/alexbot_github.pub
# → Add this key to GitHub
```

---

### 00-04: Create GitHub Repository
**Priority:** P0 | **Effort:** Low | **Status:** pending

**Option A: Alex creates manually**
1. Go to github.com/new
2. Name: `alexbot-workspace` (private repo!)
3. Copy SSH URL

**Option B: Use GitHub CLI**
```bash
# Install gh
sudo apt install gh

# Authenticate
gh auth login

# Create repo
gh repo create alexbot-workspace --private --source=. --remote=origin
```

---

### 00-05: Initial Commit Structure
**Priority:** P0 | **Effort:** Medium | **Status:** pending

```bash
cd ~/.openclaw/workspace

# Add .gitignore first
git add .gitignore
git commit -m "chore: add .gitignore for sensitive files"

# Add core identity files
git add SOUL.md IDENTITY.md AGENTS.md HEARTBEAT.md
git commit -m "feat: add core identity files"

# Add scripts
git add scripts/
git commit -m "feat: add automation scripts"

# Add workflow docs
git add TOOLS.md SKILLS-GUIDE.md DATA_PROTECTION.md
git add SCORING-MECHANISM.md WORKFLOW-session-management.md
git commit -m "docs: add workflow documentation"

# Add channel memory (public parts only)
git add memory/channels/SCORING-SYSTEM.md
git add memory/channels/playing-with-alexbot.md
git add memory/channels/WORKFLOW-*.md
git commit -m "feat: add channel configurations"

# Add improvement plans
git add memory/plans/
git commit -m "docs: add improvement plans"

# Push
git push -u origin master
```

---

### 00-06: Set Up Git Workflow
**Priority:** P0 | **Effort:** Low | **Status:** pending

**Branch strategy:**
- `master` - Stable, working configuration
- `feature/*` - New features
- `fix/*` - Bug fixes
- `improvement/*` - From improvement plans

**Commit message format:**
```
type(scope): description

Types: feat, fix, docs, chore, refactor, security
Scope: scripts, memory, config, cron, etc.

Examples:
- feat(multi-agent): add fast agent for groups
- fix(scoring): normalize JID format
- docs(plans): add source control setup
- security(groups): restrict file access
```

**Before each change:**
```bash
git checkout -b improvement/01-01-fast-agent
# make changes
git add -A
git commit -m "feat(multi-agent): create fast agent for groups"
git push -u origin improvement/01-01-fast-agent
# create PR or merge to master
```

---

### 00-07: Document Git Commands for Me
**Priority:** P1 | **Effort:** Low | **Status:** pending

Add to TOOLS.md:
```markdown
## Git Workflow

Before any change:
1. git status (check current state)
2. git checkout -b <branch-name>
3. Make changes
4. git add <files>
5. git commit -m "type(scope): description"
6. git push

After Alex approves:
- git checkout master
- git merge <branch-name>
- git push
```

---

### 00-08: Backup Current State
**Priority:** P0 | **Effort:** Low | **Status:** pending

Before starting git setup:
```bash
cd ~/.openclaw
tar -czvf workspace-backup-$(date +%Y%m%d).tar.gz workspace/
```

---

## Dependencies

```
00-08 (backup) → 00-01 (git config) → 00-02 (.gitignore)
                                    ↓
                              00-03 (SSH key)
                                    ↓
                              00-04 (GitHub repo)
                                    ↓
                              00-05 (initial commit)
                                    ↓
                              00-06 (workflow)
```

---

## What Alex Needs to Do

1. **Create GitHub repo** (private!) - `alexbot-workspace`
2. **Add SSH key** from step 00-03 to GitHub settings
3. **Approve initial commit structure**

Then I can do the rest!

---

## Estimated Time

| Step | Time | Who |
|------|------|-----|
| 00-08 Backup | 1 min | Bot |
| 00-01 Git config | 1 min | Bot |
| 00-02 .gitignore | 5 min | Bot |
| 00-03 SSH key | 2 min | Bot + Alex (add to GitHub) |
| 00-04 GitHub repo | 5 min | Alex |
| 00-05 Initial commit | 10 min | Bot |
| 00-06 Workflow | 5 min | Bot |
| **Total** | ~30 min | |
