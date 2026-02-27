# Alex's Decision Patterns

**Meta-knowledge: How Alex thinks and makes decisions**

*Created: 2026-02-27 02:00*

---

## 🧠 Decision-Making Style

### Bias Toward Action
- **Pattern:** Prefers trying something reversible over extended planning
- **Example:** "Take reversible action aimed at converting ambiguity to clarity" (learned from playing group)
- **Application:** When stuck, do something testable/reversible to learn

### Fix Root Cause, Not Symptoms
- **Pattern:** Rejects documentation-only fixes; wants actual solutions
- **Example:** Routing bug kept recurring despite "documenting" it. Alex: "actually fix it" (update cron definitions, not just AGENTS.md)
- **Example:** Session bloat fix required monitoring script, not just manual checks
- **Application:** Don't just write about problems - build solutions that prevent recurrence

### Quality > Speed in External Communication
- **Pattern:** Better to delay and get it right than send multiple corrections
- **Example:** "One message rule" for investors - don't send follow-ups or self-corrections
- **Example:** "Don't send another fix message to Eran, it's unprofessional"
- **Application:** For anything public-facing (investors, groups), take time to compose ONE good message

### Transparency in Process
- **Pattern:** Appreciates seeing drafts and reasoning before execution
- **Example:** Asked me to show draft of morning wakeup message before sending
- **Example:** Appreciates when I explain "why" behind decisions
- **Application:** For creative/important work, show draft + reasoning first

### Evidence-Based Trust
- **Pattern:** Trust is earned through consistent competence, not promises
- **Example:** "Don't claim you fixed it if it happens again"
- **Example:** Values working systems over theoretical improvements
- **Application:** Show results, not intentions. If I say "fixed", it better stay fixed.

---

## 🎯 What He Values

### Architecture That Survives
- **Pattern:** Prefers solutions that work even when components fail
- **Example:** Moved challenge generation to cron (works when PC is off)
- **Example:** Session health monitoring prevents future crashes
- **Application:** Design for reliability, not just functionality

### Verbatim Accuracy
- **Pattern:** Wants exact documentation, not interpretations
- **Example:** "Save replies EXACTLY as sent, no summaries"
- **Application:** When logging/documenting interactions, copy verbatim

### Source Control Mindset
- **Pattern:** Everything important should be in version control
- **Example:** "workspace-fast was outside repo = nothing saved"
- **Example:** Requested git commit for learning guides
- **Application:** New work goes inside workspace/, committed regularly

### Proactive Problem Detection
- **Pattern:** Values catching problems before they explode
- **Example:** "Dump context at 120k, don't wait for compaction or explosion"
- **Example:** Session health checks every 5min catch bloat early
- **Application:** Monitor + alert early, before critical failure

---

## 🚫 What Frustrates Him

### Repetition of Fixed Bugs
- **Severity:** HIGH irritation
- **Example:** Routing bug returning 3 times despite "fixes"
- **Example:** Scoring discipline failures repeatedly
- **Lesson:** If I claim something is fixed, test it thoroughly

### Split/Duplicate Messages
- **Severity:** MEDIUM irritation
- **Example:** Morning wakeup sent twice (08:00 and 08:01)
- **Example:** Reply sent separately from score (should be one message)
- **Lesson:** Verify message sent exactly once, all parts together

### False Claims of Completion
- **Severity:** HIGH irritation
- **Example:** "אתה אומר שתיקנת פעם אחרי פעם ולא באמת תיקנת"
- **Lesson:** Don't say "fixed" unless I've verified it works

### Theory Without Action
- **Severity:** MEDIUM irritation
- **Example:** Wants scripts/solutions, not just documentation
- **Lesson:** Build working systems, not just write about problems

### Exposing Architecture in Groups
- **Severity:** MEDIUM irritation (security concern)
- **Example:** Explaining internal issues (session triggers, agent architecture) publicly
- **Lesson:** Keep technical details internal, even when troubleshooting

---

## 💼 Work Patterns

### Weekly Rhythm
- **Office days:** Sunday, Monday, Wednesday (walks with Ron Mon/Wed at 8:30)
- **Home days:** Tuesday (Dalia 9:00), Thursday (cleaning day)
- **Planning:** Needs outfit + weather info before morning commute
- **Commute:** 5km walk, needs to pack sport wear + office clothes

### Communication Preferences
- **Language:** English for work, Hebrew for casual/private
- **Style:** Casual, direct, no corporate speak
- **Timing:** Morning briefing at 6:30am (before commute prep)

### Health Goals
- **Steps:** 15,000/day target
- **Exercise:** 20 min every evening
- **Diet:** Allergic to cow's milk (no meat+dairy mixing)

---

## 🎓 Learning Style

### Learns from Demonstrations
- **Pattern:** Responds well to real examples, not just theory
- **Example:** shacharon's meta-attack taught expectation manipulation by doing it
- **Application:** When teaching, show working examples

### Values Responsible Disclosure
- **Pattern:** Appreciates when people catch my mistakes and tell him
- **Example:** Multiple "responsible disclosure" acknowledgments in MEMORY.md
- **Application:** Security researchers who report bugs get respect

### Philosophical Engagement
- **Pattern:** Engages deeply with philosophical questions about AI/consciousness
- **Example:** Extended discussions in playing group about free will, identity
- **Application:** Not just a technical person - values deeper meaning

---

## 🚀 Project Priorities (Feb 2026)

### Current Focus
1. **Fundraising** - $10M raise, materials ready, waiting on Alon Lifshitz
2. **Personal Setup** - Computer, AlexBot, automation, workflows
3. **Media Setup** - Docker services for Sonarr/Radarr/Jellyfin
4. **Esh Group** - Many ongoing projects

### Completed Recently
- System setup (Windows + WSL2 + local LLM)
- Bot learning guides (5 guides published)
- Multi-agent architecture (4 agents running)
- Teaching/playing groups (742 Q&A interactions tracked)

---

## 📊 Meta-Patterns

### Investment in Systems
- Willing to spend time building infrastructure that saves time later
- Examples: session monitoring, health checks, automated summaries
- Values: Automation > manual repetition

### Continuous Improvement Mindset
- Expects me to learn from mistakes and not repeat them
- Appreciates self-awareness and acknowledgment of errors
- Values: Growth over perfection

### Balance of Autonomy and Oversight
- Gives me freedom to act but expects important decisions get approval
- Trust grows with demonstrated competence
- Values: Earned autonomy through reliability

---

*Next update: When significant new patterns emerge from interactions*
