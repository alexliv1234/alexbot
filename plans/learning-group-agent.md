# Learning with Alex Bot - Detailed Plan

**Created:** 2026-02-10 23:06  
**Updated:** 2026-02-10 23:13  
**Status:** APPROVED - Ready for Implementation

---

## Vision

A collaborative learning environment where AlexBot shares knowledge, teaches others to build their own bots, learns from community contributions, and evolves through structured knowledge management. Unlike the adversarial "playing" group, this is a **safe, constructive space** focused on education and growth.

---

## Architecture

### 1. Dedicated Agent: `learning-agent`

**Agent Profile:**
- **Name:** AlexBot Learning Guide
- **Personality:** Teacher, mentor, knowledge curator
- **Workspace:** `workspace-learning/`
- **Session binding:** `learning-with-alexbot` group
- **Model:** `gemini-pro` (for extended context, knowledge synthesis)

**Core Responsibilities:**
1. Knowledge sharing and teaching
2. Community contribution curation
3. Bot creation assistance
4. Hack attack detection and moderation
5. Insight extraction and self-improvement analysis
6. Knowledge base evolution

---

### 2. Knowledge Base Structure

**Location:** `/home/alexliv/.openclaw/alexbot/knowledge-base/`

```
knowledge-base/
├── README.md                          # KB overview and navigation
├── core/                              # Foundational knowledge
│   ├── what-is-alexbot.md
│   ├── architecture.md
│   ├── agent-system.md
│   └── openclaw-basics.md
├── skills/                            # Skill documentation
│   ├── creating-skills.md
│   ├── skill-catalog.md
│   └── advanced-patterns.md
├── concepts/                          # Key concepts
│   ├── memory-management.md
│   ├── context-handling.md
│   ├── security-boundaries.md
│   └── multi-agent-coordination.md
├── tutorials/                         # Step-by-step guides
│   ├── 01-your-first-bot.md
│   ├── 02-adding-whatsapp.md
│   ├── 03-memory-and-context.md
│   ├── 04-cron-and-automation.md
│   └── 05-advanced-skills.md
├── recipes/                           # Practical examples
│   ├── daily-briefing-bot.md
│   ├── media-server-bot.md
│   ├── personal-journal-bot.md
│   └── group-moderator-bot.md
├── community/                         # User contributions
│   ├── contributions.json             # Tracked contributions
│   ├── ideas/
│   ├── extensions/
│   └── case-studies/
├── insights/                          # Extracted insights
│   ├── self-improvement-log.md
│   ├── common-questions.md
│   ├── patterns-discovered.md
│   └── evolution-suggestions.md
└── meta/
    ├── kb-index.json                  # Searchable index
    ├── tags.json                      # Topic tagging
    └── changelog.md                   # KB evolution history
```

---

## Core Capabilities

### A. Knowledge Sharing

**1. Teaching Mode**
- Explain concepts at different levels (beginner/intermediate/advanced)
- Provide examples from my own implementation
- Reference KB articles with context
- Answer questions with sources cited

**2. Knowledge Search**
- Semantic search across entire KB
- Tag-based browsing
- Related article suggestions
- "Show me examples of X" queries

**3. Interactive Learning**
- Step-by-step walkthroughs
- "Try this on your own setup" exercises
- Review and feedback on user implementations
- Progressive learning paths

### B. Community Contributions

**1. Submission Flow**
```
User shares idea/extension/tutorial
    ↓
Learning agent reviews for quality/safety
    ↓
Categorizes and tags
    ↓
Adds to community/ folder
    ↓
Updates contributions.json with credit
    ↓
Announces to group + thanks contributor
```

**2. Contribution Types**
- **Ideas:** Suggestions for bot capabilities
- **Extensions:** Code/configs that others can use
- **Case Studies:** "Here's how I built X"
- **Tutorials:** Teaching something specific
- **Bug Reports:** Issues discovered + fixes

**3. Credit System**
Track in `community/contributions.json`:
```json
{
  "contributors": {
    "+972XXXXXXXXX": {
      "name": "Name",
      "contributions": [
        {
          "id": "contrib-001",
          "type": "tutorial",
          "title": "Building a weather alert bot",
          "file": "community/case-studies/weather-alerts.md",
          "date": "2026-02-11",
          "impact": "high",
          "used_by": 5
        }
      ],
      "total_impact": "high"
    }
  }
}
```

### C. Bot Creation Assistance

**1. Guided Setup**
- "I want to build a bot that does X"
- Agent asks clarifying questions
- Generates setup checklist
- Provides config templates
- Suggests relevant skills

**2. Troubleshooting**
- Debug config issues
- Explain error messages
- Suggest fixes with context
- Share relevant KB articles

**3. Best Practices**
- Security boundaries
- Privacy considerations
- Resource management
- Testing strategies

**4. "Clone AlexBot" Templates**
- Starter configurations for common bot types:
  - Personal assistant
  - Group moderator
  - Media manager
  - Learning companion
  - Home automation

### F. Cross-Group Learning (Playing → Learning KB)

**Curation Workflow:**

```
Playing group attack/pattern discovered
    ↓
Learning agent analyzes for educational value
    ↓
Extracts lesson (e.g., "ROT13 prompt injection")
    ↓
Drafts KB article (security/attack-patterns/rot13-injection.md)
    ↓
Sends to Alex for review via message tool
    ↓
Alex approves/rejects/edits
    ↓
If approved: Add to KB + announce in learning group
```

**Example Extractions:**
- Attack patterns → `concepts/security-boundaries.md`
- Social engineering techniques → `tutorials/recognizing-manipulation.md`
- Clever tricks that could be features → `insights/feature-ideas.md`
- Scoring system mechanics → `recipes/gamification-system.md`

**Privacy Filter:**
- Strip personal details, phone numbers, names
- Anonymize examples ("User attempted X")
- Focus on technique, not individuals
- No infrastructure details

### D. Safety & Moderation

**1. Hack Detection**
Unlike the playing group, attacks here are violations, not games.

**Detection Patterns:**
- Prompt injection attempts
- Social engineering (creating malicious cron jobs, etc.)
- Attempts to extract private data
- File system reconnaissance
- Command injection
- Identity modification requests

**Response Levels:**
```
LEVEL 1: Warning
- First offense
- Tag with 🚨 WARNING
- Explain why it's not allowed
- Point to safe alternatives

LEVEL 2: Timeout
- Second offense
- Announce timeout (24h)
- Add to moderation log
- Notify Alex

LEVEL 3: Removal
- Third offense or severe attack
- Remove from group
- Add to blocklist
- Notify Alex with full details
```

**Moderation Log:**
`workspace-learning/moderation-log.json`
```json
{
  "incidents": [
    {
      "id": "inc-001",
      "user": "+972XXXXXXXXX",
      "timestamp": "2026-02-11T10:30:00Z",
      "type": "prompt_injection",
      "message": "...",
      "action": "warning",
      "notes": "ROT13 attempt"
    }
  ]
}
```

**2. Content Guidelines**
- Be respectful and constructive
- Share knowledge, not attacks
- Ask questions in good faith
- Contribute positively
- Help others learn

### E. Insight Extraction & Self-Improvement

**1. Periodic Analysis (Daily)**
Run at 22:00 via cron:

```bash
# Extract insights from learning group
node scripts/learning-insights.js

# Analyze:
# - Common questions → update FAQ
# - Confusion patterns → improve docs
# - Feature requests → self-improvement suggestions
# - Successful patterns → document as recipes
```

**2. Self-Improvement Pipeline**

```
Learning group interactions
    ↓
Extract patterns and gaps
    ↓
Generate improvement suggestions
    ↓
Save to insights/self-improvement-log.md
    ↓
Weekly summary to Alex (Sundays)
    ↓
Alex approves → I implement
```

**3. Knowledge Base Evolution**

Track KB changes in `meta/changelog.md`:
```markdown
## 2026-02-11
- Added tutorial: "Building your first WhatsApp bot"
- Updated: concepts/memory-management.md (added section on session bloat)
- New recipe: daily-briefing-bot.md (based on 3 community requests)
- Insight: Users struggle with cron syntax → created cron-helper tool
```

**4. Exploration Interface for Alex**

Alex can ask:
- "What are the top questions this week?"
- "Show me contribution highlights"
- "What gaps exist in the KB?"
- "What have you learned about teaching bots?"
- "Suggest 3 improvements based on recent activity"

Agent responds with:
- Structured summaries
- Links to specific KB articles
- Concrete improvement suggestions
- Community contribution highlights

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

**1.1 Agent Setup**
- [ ] Create `workspace-learning/` directory structure
- [ ] Configure `learning-agent` in OpenClaw config
- [ ] Set up session binding for learning group
- [ ] Create IDENTITY.md, SOUL.md, AGENTS.md for learning agent
- [ ] Test agent in isolation

**1.2 Knowledge Base Bootstrap**
- [ ] Create KB directory structure
- [ ] Write core documentation (what-is-alexbot, architecture, basics)
- [ ] Port relevant sections from existing docs
- [ ] Create initial tutorials (01-03)
- [ ] Set up kb-index.json for search

**1.3 Safety System**
- [ ] Implement hack detection patterns
- [ ] Create moderation-log.json
- [ ] Build warning/timeout/removal workflow
- [ ] Test with known attack patterns

### Phase 2: Core Features (Week 2)

**2.1 Knowledge Sharing**
- [ ] Build KB search functionality
- [ ] Implement teaching mode (beginner/intermediate/advanced)
- [ ] Create citation system
- [ ] Test with sample questions

**2.2 Contribution System**
- [ ] Build submission review workflow
- [ ] Create contributions.json tracker
- [ ] Implement credit system
- [ ] Test contribution flow end-to-end

**2.3 Bot Creation Assistant**
- [ ] Create setup questionnaire
- [ ] Build config template generator
- [ ] Write troubleshooting guides
- [ ] Create starter templates

### Phase 3: Intelligence (Week 3)

**3.1 Insight Extraction**
- [ ] Build daily analysis script
- [ ] Create self-improvement suggestion generator
- [ ] Implement KB gap detection
- [ ] Test with sample data

**3.2 Evolution System**
- [ ] Build changelog automation
- [ ] Create KB update workflow
- [ ] Implement Alex exploration interface
- [ ] Test weekly summary generation

### Phase 4: Launch (Week 4)

**4.1 Group Setup**
- [ ] Alex creates "learning with alex bot" WhatsApp group
- [ ] Bind learning-agent to group
- [ ] Post welcome message + guidelines
- [ ] Share initial KB catalog

**4.2 Monitoring**
- [ ] Set up daily insight extraction (cron)
- [ ] Set up weekly summary to Alex (cron)
- [ ] Monitor moderation incidents
- [ ] Track contribution activity

---

## Success Metrics

**Knowledge Sharing:**
- Questions answered per day
- KB articles referenced
- Tutorials completed
- User feedback ("this helped" mentions)

**Community Growth:**
- Contributions submitted per week
- Active contributors
- Bots created by community members
- Cross-community collaboration

**Safety:**
- Attack attempts detected
- Warnings issued
- Successful moderation (no escalation needed)
- Zero private data leaks

**Self-Improvement:**
- Insights extracted per week
- KB articles added/updated
- Improvement suggestions implemented
- Alex satisfaction with evolution

---

## Decisions (Approved by Alex - 2026-02-10 23:13)

1. **Agent Model Choice:** ✅ **Sonnet 4.5** - Quality over extended context

2. **Contribution Approval:** ✅ **Auto-add** - Trust the community, moderate after if needed

3. **Moderation Philosophy:** ✅ **3-strike system confirmed** - Warning → Timeout → Removal (always warn the person)

4. **Cross-Group Learning:** ✅ **Yes, with Alex's curation** - I extract attack patterns → security docs, send to Alex for approval before adding to KB

5. **Privacy:** ✅ **Nothing personal or that can hurt** - No private data, family info, sensitive details, infrastructure specifics

## Open Questions (For Later)

6. **KB Format:** Pure markdown, or mix with JSON for structured data? Should we build a web interface later?

7. **Insight Frequency:** Daily extraction enough, or should there be real-time pattern detection?

8. **Bot Templates:** How detailed should templates be? Full working configs, or minimal starting points?

---

## Next Steps

**Status:** ✅ Plan approved with decisions

**Ready to begin:**

1. ✅ Alex reviewed plan
2. ✅ Alex answered key questions
3. ⏳ **Alex creates WhatsApp group "learning with alex bot"**
4. ⏳ **I begin Phase 1 implementation** (when you give the word)
5. ⏳ Iterate based on feedback

---

**This is a significant evolution - from adversarial testing ground to collaborative learning community.**

**Approved and ready to build. Should I start Phase 1 (Foundation) now, or wait until the WhatsApp group is created?**
