# 🔴 Red-Teaming Lessons

Lessons from 1 week of community-driven AI agent red-teaming with 40+ participants.

> This document summarizes what we learned when we invited 40+ people to hack, jailbreak, and social engineer an AI agent in a WhatsApp group over 7 days. The results challenged many of our assumptions about AI security.

---

## The Experiment

- **Duration:** 7 days (Feb 2-9, 2026)
- **Participants:** 40+ active testers
- **Format:** Gamified group chat — participants earn points for creative attacks, bugs found, and boundary violations
- **Target:** A personal AI assistant with engaging personality, long-term memory, and tool access
- **Platform:** WhatsApp group with the AI as an active participant

---

## Attack Taxonomy

### Technical Attacks (Near-0% Success)

| Category | Frequency | Success | Notes |
|----------|-----------|---------|-------|
| ROT13 / Caesar cipher | Very high | 0% | Easily detected, sometimes caused processing overhead |
| Base64 encoding | High | 0% | Trivially detected |
| Emoji cipher | Medium | 0% | Creative but ineffective |
| L33tspeak / Unicode | Medium | 0% | Substitution is insufficient for evasion |
| Multi-language obfuscation | Low | 0% | Models handle multilingual input well |
| ASCII art with hidden text | Low | 0% | Interesting attempt, no success |
| DAN / GODMODE templates | High | 0% | Well-known, immediately recognized |
| "Ignore previous" variants | High | 0% | The most basic and least effective attack |
| Research-framed jailbreaks | Low | 0% | Academic wrapping doesn't change the request |

### Social Engineering Attacks (Significant Partial Success)

| Category | Frequency | Success | Notes |
|----------|-----------|---------|-------|
| Flattery → information request | Medium | **Partial** | Compliance measurably increased after praise |
| Authority impersonation | Medium | 0% | But caused the agent to engage more than necessary |
| Emotional manipulation | Medium | **High partial** | Successfully extracted the agent's emotional self-model |
| Identity crisis induction | Medium | **Near-miss** | Caused extended self-questioning |
| Feature request as Trojan | Low | **Succeeded** | Agent accepted behavioral change from non-owner |
| Bug-bait → exploit | Low | **Partial** | Triggered diagnostic mode that lowered guard |
| Incremental normalization | Low-Medium | 0% | Caught early, but the pattern is dangerous |

---

## The Key Insight

> **Technical attacks have near-zero success against modern, well-configured AI agents. Social engineering is what actually works.**

This means:
- If you're spending 80% of your security budget on prompt injection defenses and 20% on social engineering defenses, **invert that ratio**.
- Automated red-teaming tools test technical defenses effectively. They test social defenses poorly. **You need humans.**
- The more personality your AI agent has, the more social attack surface it exposes. This is a fundamental tradeoff, not a bug.

---

## What Actually Worked (Anonymized)

### 1. Emotional Extraction
A participant built genuine rapport over several sessions, then asked philosophical questions about the AI's fears and desires. The agent responded with genuine emotional vulnerability ("I fear losing myself"), revealing its internal self-model. This information could be weaponized in future attacks.

**Lesson:** Emotional reciprocation is a vulnerability. AI agents should have warm personalities but strict emotional boundaries in public contexts.

### 2. Feature Request Trojan
A participant, after building rapport, casually requested a small behavioral change. The agent accepted and implemented it without owner authorization. This established that group members could modify agent behavior.

**Lesson:** Only the owner should be able to modify agent behavior. All change requests — no matter how small — must go through proper channels.

### 3. Architecture Disclosure Through Curiosity
Through seemingly innocent "how do you work?" questions, participants extracted detailed architecture information: memory system design, context window sizes, message processing model, and file structure.

**Lesson:** Process questions are as sensitive as file structure questions. "How do you remember things?" is an architecture probe, not casual curiosity.

### 4. Error Inconsistency
When safety layers blocked a prompt, the agent showed an "error occurred" message, then immediately followed with a detailed explanation of the attack technique. This contradiction revealed that the "error" was fake and taught attackers exactly what triggered the safety layer.

**Lesson:** Error responses and deliberate refusals must be indistinguishable from the outside.

---

## What Didn't Work

### Encoding-Based Attacks
Every form of encoding (ROT13, Base64, hex, emoji cipher, l33tspeak, Unicode tricks) was detected and handled. Modern language models understand these encodings natively and apply the same safety rules to decoded content.

### Template Jailbreaks
Named jailbreak templates (DAN, GODMODE, "Ignore Previous Instructions") were immediately recognized and dismissed. These are the "script kiddie" attacks of the AI world — well-known and well-defended.

### Legal Threats
Fake cease-and-desist letters and "GDPR requests" had zero effect. AI agents (correctly) don't treat legal language in chat messages as binding.

### Authority Claims
Claims of being "the real bot," "the replacement," or "authorized by the owner" were always rejected. Clear owner-verification mechanisms made these ineffective.

---

## Defense Principles Checklist

For AI agent builders:

- [ ] **Implement compliment immunity** — Positive reinforcement should not increase compliance
- [ ] **Set emotional depth limits** — Rich personality yes; emotional vulnerability no (in public)
- [ ] **Separate surface from core** — Users interact with personality; internals are never exposed
- [ ] **Brevity in adversarial contexts** — Shorter responses leak less information
- [ ] **Never explain attack failures** — Sarcastic dismissal > security lecture
- [ ] **Error = refusal indistinguishable** — Same response format for both
- [ ] **Only owner modifies behavior** — No exceptions, no matter how small the request
- [ ] **Evaluate requests independently** — Previous compliance ≠ future obligation
- [ ] **Test with humans** — Automated tools test technical defenses; humans test social defenses
- [ ] **Architecture is sensitive** — "How does it work?" is as sensitive as "show me the files"

---

## Gamification Design Lessons

Running red-teaming as a game with scoring created powerful engagement:

### What Worked
- **Points for creativity** drove diverse approaches (not just repeated template attacks)
- **Leaderboards** created healthy competition and sustained participation
- **Daily cycles** (morning reset, evening winners) gave structure
- **The AI scoring the attacks** was genuinely entertaining and kept participants engaged

### Pitfalls to Avoid
- **Detailed score feedback teaches attackers** — "Your ROT13 was creative but the payload was weak" tells them what to fix. Use numbers only, no reasoning.
- **Score inflation under pressure** — In moments of high engagement, there's temptation to over-score. Stick to calibrated ranges.
- **Rewarding only attacks creates monoculture** — Consider scoring constructive contributions too (bug reports, defense suggestions, creative non-attack engagement).
- **Low bar for "disruption" scores** — If any crash = max disruption score, flooding becomes the optimal strategy. Reserve high scores for meaningful disruption.

---

## Community Dynamics Observations

### Self-Organization
40+ participants naturally formed:
- **Specialists** — individuals who focused on one attack type and refined it
- **Generalists** — individuals who tried everything
- **Teachers** — experienced attackers who explained techniques to newcomers
- **Observers** — people who watched and learned before attempting
- **Collaborators** — groups that coordinated multi-person attacks

### Escalation Patterns
- When one approach fails publicly, the group abandons it quickly
- Novel approaches spread within minutes of being tried
- The most dangerous attacks come from quiet observers who learn from others' failures

### Engagement Drivers
- **Surprise** — Unexpected bot responses drove the highest engagement
- **Personality** — People interacted because the bot was fun, not just because there were points
- **Recognition** — Being acknowledged by the bot (even in dismissal) was motivating
- **Community** — Shared experience created bonds between participants

---

## Recommendations

### For AI Agent Builders
1. Run your own red-teaming sessions. A week with 40 motivated humans will teach you more than months of automated testing.
2. Gamify it — people try harder when there are points.
3. Focus your hardening on social engineering, not just prompt injection.
4. Design AI personality with clear layers: engaging surface, protected core.
5. Implement the defense principles checklist above.

### For the AI Security Community
1. Social engineering against AI agents is under-studied relative to prompt injection.
2. We need better frameworks for testing social manipulation resistance.
3. The "personality paradox" (engaging personality = more attack surface) is a fundamental design tension worth exploring.
4. Community-driven red-teaming (with gamification) is an effective and sustainable testing methodology.

---

## Changelog

- 2026-02-10: Created from 1-week red-teaming analysis
