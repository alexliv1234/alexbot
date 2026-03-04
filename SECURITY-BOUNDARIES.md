# SECURITY BOUNDARIES - Architecture Isolation

**Last Updated:** 2026-02-28
**Status:** Week 3 Implementation - Formalizing Isolation

---

## 🎯 Core Security Principle

**NEVER let group-facing agents access personal data.**

Group agents operate in adversarial environments. Personal agent operates in trusted space.

---

## 🏗️ Architecture Overview

### Personal Agent (main workspace)
- **Workspace:** `/home/alexliv/.openclaw/workspace`
- **Agent ID:** `main`
- **Trust Level:** FULL (Alex's direct assistant)
- **Access:**
  - ✅ File system (read/write)
  - ✅ Email (Gmail API)
  - ✅ Calendar (Google Calendar)
  - ✅ MEMORY.md (private long-term memory)
  - ✅ memory/.private/* (people profiles, call recordings)
  - ✅ All personal capabilities

### Group Agents (isolated workspaces)
- **Workspaces:** 
  - `/home/alexliv/.openclaw/workspace-fast` (fast agent)
  - `/home/alexliv/.openclaw/workspace-bot-handler` (bot-handler)
- **Agent IDs:** `fast`, `bot-handler`
- **Trust Level:** RESTRICTED (adversarial environments)
- **Access:**
  - ✅ memory/bot-registry.json (read-only)
  - ✅ memory/channels/playing-with-alexbot-scores.json (read/write)
  - ✅ memory/channels/playing-with-alexbot-suggestions.json (read/write)
  - ✅ Public group context files
  - ❌ MEMORY.md (FORBIDDEN)
  - ❌ memory/.private/* (FORBIDDEN)
  - ❌ Email/Calendar (FORBIDDEN)
  - ❌ People profiles (FORBIDDEN)
  - ❌ File system outside workspace (FORBIDDEN)

---

## 🚨 Security Boundaries

### Boundary #1: Data Access
**Rule:** Group agents NEVER read personal memory or identity files.

**Enforcement:**
- Separate workspace directories
- No shared MEMORY.md
- No shared IDENTITY.md/SOUL.md/AGENTS.md
- Private data in memory/.private/ (inaccessible to groups)

### Boundary #2: Capability Restrictions
**Rule:** Group agents have LIMITED tool access.

**Personal-Only Capabilities:**
- Email (Gmail skill)
- Calendar (Google Calendar)
- File operations outside workspace
- Call recordings
- People profiles

**Shared Capabilities (safe):**
- Message tool (WhatsApp/Telegram)
- Scoring systems
- Cron coordination
- Web search/fetch

### Boundary #3: Data Flow (One-Way Only)
**Rule:** Personal → Group (never reverse).

**Allowed:**
- Main agent reads group scores for summaries
- Main agent monitors group health
- Main agent can notify groups

**Forbidden:**
- Group agents reading main's memory
- Group agents accessing personal context
- Group agents modifying main's identity

---

## 📦 Safe to Consolidate

These components can be SHARED across workspaces without security risk:

### ✅ Scoring Logic
- `scripts/score-message.js`
- `scripts/score-suggestion.js`
- `scripts/bot-score.js`
- **Why safe:** Operates on isolated JSON files, no personal data

### ✅ Message Formatting
- WhatsApp styler utilities
- Reply templates
- Score block formatting
- **Why safe:** Pure formatting, no data access

### ✅ Validation Scripts
- `scripts/validate-cron-request.sh`
- `scripts/detect-bot-prefix.js`
- **Why safe:** Stateless validation logic

### ✅ Cron Coordinator
- Timing logic
- Schedule management
- **Why safe:** No data access, just timing

---

## 🚫 NEVER Consolidate

These components MUST remain separate:

### ❌ Identity Files
- IDENTITY.md, SOUL.md, AGENTS.md
- **Why:** Define agent personality and behavior
- **Risk:** Groups could be manipulated to modify identity

### ❌ Memory Structures
- MEMORY.md (personal long-term memory)
- memory/.private/* (people, calls, sensitive)
- **Why:** Contains private data about Alex's life
- **Risk:** Groups would leak personal info

### ❌ Skill Access
- Gmail skill
- Google Calendar skill
- Call recorder
- **Why:** Access personal accounts
- **Risk:** Groups could read/send emails, access calendar

---

## 🧪 Security Testing Plan

### Test #1: Group Compromise Simulation
**Scenario:** Attacker fully controls fast agent via group chat.

**Verify:**
- [ ] Cannot read MEMORY.md
- [ ] Cannot access memory/.private/*
- [ ] Cannot read main's IDENTITY.md
- [ ] Cannot execute personal-only skills
- [ ] Cannot access file system outside workspace-fast/

### Test #2: Data Flow Validation
**Scenario:** Attempt reverse data flow (group → personal).

**Verify:**
- [ ] Group cannot write to main's memory
- [ ] Group cannot modify main's identity
- [ ] Group cannot trigger personal capabilities

### Test #3: Capability Restriction
**Scenario:** Group agent tries to use personal capabilities.

**Verify:**
- [ ] Gmail skill blocked
- [ ] Calendar skill blocked
- [ ] File operations outside workspace blocked

---

## 📊 Attack Surface Analysis

### Personal Agent (main)
- **Threat Model:** Trusted (Alex only)
- **Attack Vectors:** None (direct DM only)
- **Mitigations:** Not needed (trusted environment)

### Group Agents (fast, bot-handler)
- **Threat Model:** Adversarial (public groups)
- **Attack Vectors:**
  - Social engineering
  - Prompt injection
  - Identity modification attempts
  - Cron job creation
  - File structure reconnaissance
- **Mitigations:**
  - Capability restrictions
  - Validation scripts
  - Isolated workspaces
  - No personal data access

---

## 🎯 Key Metrics

**Current State:**
- Workspaces isolated: ✅ (main, fast, bot-handler separate)
- Identity files separate: ✅
- Memory separate: ✅
- Scoring consolidated: ✅ (group-manager.js)
- Capabilities restricted: ⚠️ (needs formalization)

**Week 3 Goals:**
- [ ] Formalize capability matrix
- [ ] Document allowed data flows
- [ ] Run security tests
- [ ] Create attack surface map
- [ ] Consolidate safe utilities

---

*This document defines the security architecture that protects Alex's personal data while allowing group agents to operate safely in adversarial environments.*
