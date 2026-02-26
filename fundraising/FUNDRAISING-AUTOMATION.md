# 🤖 Autonomous Fundraising System

**Version:** 1.0  
**Created:** 2026-02-26  
**Owner:** Alex Liverant + AlexBot

---

## 📋 Overview

Fully automated fundraising management system that:
- ✅ Tracks investors through complete pipeline
- ✅ Researches investors automatically (web + AI)
- ✅ Generates personalized outreach strategies
- ✅ Sends WhatsApp intros (with approval)
- ✅ Manages follow-up sequences
- ✅ Daily reports at 18:00
- ✅ Morning checks at 08:00

**Alex's involvement:** Give me investor info, approve messages, reply to responses.  
**Everything else:** AlexBot handles it.

---

## 🚀 Quick Start

### Add New Investor

```bash
bash fundraising/scripts/add-investor.sh "+972XXXXXXXXX" "Full Name" "Fund Name"
```

**What happens:**
1. Creates investor directory with all files
2. Adds to main pipeline (`investor-pipeline.json`)
3. Sets stage to `research`

---

### Research Investor

```bash
bash fundraising/scripts/research-investor.sh <investor-id>
```

**What AlexBot does:**
- LinkedIn search (background, experience)
- Fund research (portfolio, thesis, recent deals)
- Social media discovery
- Recent news & activity
- Updates `research.md` with findings

⏳ **Time:** 20-30 minutes

---

### Generate Strategy

```bash
bash fundraising/scripts/generate-strategy.sh <investor-id>
```

**What AlexBot does:**
- Reads research findings
- Uses Local LLM (qwen2.5:32b) to create:
  - Personalized intro (3 variations)
  - Follow-up sequence (day 5, 10, 21)
  - Response scenarios
- Saves to `strategy.md`

⏳ **Time:** 5-10 minutes

---

### Send Intro (After Approval!)

```bash
bash fundraising/scripts/send-intro.sh <investor-id>
```

**Safety:**
1. Shows you the message first
2. Asks for confirmation
3. Sends via WhatsApp DM
4. Logs communication
5. Updates stage to `outreach`

**Dry run (preview only):**
```bash
bash fundraising/scripts/send-intro.sh <investor-id> --dry-run
```

---

## 📊 Monitoring

### Check Follow-ups

```bash
bash fundraising/scripts/check-followups.sh
```

Shows:
- Who needs follow-up (day 5, 10, 21+)
- Who's still in waiting window
- Current stage status

---

### Daily Report

```bash
bash fundraising/scripts/daily-report.sh
```

Shows:
- Pipeline overview (by stage)
- Today's outreach
- Follow-ups needed
- Recent responses
- Progress toward goals
- Recommended actions

**Auto-sent to Alex every day at 18:00**

---

## 🗂️ File Structure

```
fundraising/
├── investor-pipeline.json          # Main CRM database
├── investors/
│   ├── {investor-id}/
│   │   ├── profile.json           # Basic info + stage
│   │   ├── research.md            # Deep research
│   │   ├── strategy.md            # Outreach plan
│   │   ├── communications.jsonl   # Full conversation log
│   │   └── notes.md              # Internal notes
│   └── README.md
├── scripts/
│   ├── add-investor.sh            # Add new investor
│   ├── research-investor.sh       # Trigger research
│   ├── generate-strategy.sh       # Create strategy
│   ├── send-intro.sh              # Send intro message
│   ├── log-communication.sh       # Manual logging
│   ├── check-followups.sh         # Check who needs follow-up
│   ├── daily-report.sh            # Generate daily report
│   ├── daily-manager.sh           # Full daily workflow
│   └── manage-pipeline.sh         # CRM management
├── templates/                      # File templates
└── FUNDRAISING-AUTOMATION.md       # This file
```

---

## 📅 Investor Stages

1. **research** - Gathering information
2. **strategy** - Planning approach
3. **ready** - Approved, ready to send
4. **outreach** - Intro sent, awaiting response
5. **responded** - They replied
6. **meeting** - Meeting scheduled/completed
7. **materials** - Sent deck/docs
8. **due_diligence** - Active DD process
9. **term_sheet** - Negotiating terms
10. **closed** - Deal signed! 🎉
11. **passed** - Not interested
12. **nurture** - Not now, maybe later

---

## ⏰ Automated Schedule

### Morning (08:00)
**Cron:** `Fundraising - Morning Check`

**What happens:**
1. Run `daily-manager.sh`
2. Check all follow-ups needed
3. Identify actions required
4. Prepare follow-up messages
5. Notify Alex if urgent

---

### Evening (18:00)
**Cron:** `Fundraising - Evening Report`

**What happens:**
1. Run `daily-report.sh`
2. Generate full summary
3. Send report to Alex (+972544419002)
4. Highlight:
   - Today's sent messages
   - Follow-ups needed
   - Responses received
   - Recommended next actions

---

## 🎯 Typical Workflow

### Day 1: Add Investor
```bash
bash scripts/add-investor.sh "+972526802086" "Alon Lifshitz" "Private Angel"
# AlexBot: Starts research automatically
```

### Day 1-2: Research Phase
- AlexBot searches web, LinkedIn, news
- Updates `research.md` with findings
- Discovers focus areas, check size, etc.

### Day 2: Strategy Creation
```bash
bash scripts/generate-strategy.sh alon-lifshitz
# AlexBot: Uses LLM to create personalized intro
```

### Day 2: Review & Approve
- Alex reviews `strategy.md`
- Checks intro message
- Approves or requests changes

### Day 2: Send Intro
```bash
bash scripts/send-intro.sh alon-lifshitz
# Confirm → Sent via WhatsApp
```

### Day 7: Auto Follow-up #1
- If no response after 5-7 days
- AlexBot sends friendly nudge
- Logs communication

### Day 12: Auto Follow-up #2
- If still no response
- More direct, value-focused
- Logs communication

### Day 21: Last Chance
- Final attempt
- Graceful exit option
- Marks as `passed` if no response

---

## 🔧 Utility Commands

### View investor profile
```bash
cat fundraising/investors/<investor-id>/profile.json | jq .
```

### Update investor stage manually
```bash
jq '.stage = "responded"' profile.json > profile.json.tmp && mv profile.json.tmp profile.json
```

### View communication history
```bash
cat fundraising/investors/<investor-id>/communications.jsonl
```

### List all investors
```bash
bash fundraising/scripts/manage-pipeline.sh list
```

### Pipeline status
```bash
bash fundraising/scripts/manage-pipeline.sh status
```

---

## 🚨 Safety Features

1. **No unsupervised sends:** First intro always requires approval
2. **Dry-run mode:** Test messages before sending
3. **Full logging:** Every communication tracked
4. **Stage tracking:** Always know where each investor is
5. **Timeline history:** Complete audit trail

---

## 🎓 Best Practices

### Adding Investors
- Add in batches (5-10 at a time)
- Mix Tier 1 (leads) + Tier 2 (strategic) + Tier 3 (fill)
- Don't wait for responses to add more

### Follow-ups
- Trust the timing (day 5, 10, 21)
- Don't chase too aggressively
- If 3 attempts fail, move on

### Parallelism
- Keep 15-20 active outreach at all times
- Don't put all eggs in one basket
- Create FOMO through multiple conversations

### Responses
- Reply within 24 hours
- Have materials ready (one-pager, deck, FAQ)
- Move fast once interest is shown

---

## 📈 Success Metrics

### Weekly Goals
- Add 5-10 new investors
- Send 10+ intro messages
- 3-5 responses received
- 2-3 meetings scheduled

### Monthly Goals
- 20+ investor conversations
- 5-10 serious prospects
- 2-3 in due diligence
- 1-2 term sheets

### Ultimate Goal
- **$10M raised**
- **20-25% equity**
- **$40-50M post-money valuation**

---

## 🤖 AlexBot's Role

**Research Phase:**
- Web searches (LinkedIn, fund sites, news)
- Information extraction
- Profile building
- Competitive analysis

**Strategy Phase:**
- LLM-powered intro generation
- Personalization based on research
- Follow-up sequence planning
- Response scenario preparation

**Execution Phase:**
- WhatsApp message sending (with approval)
- Communication logging
- Stage tracking
- Timeline management

**Monitoring Phase:**
- Daily checks (08:00)
- Follow-up identification
- Evening reports (18:00)
- Action recommendations

---

## 🔗 Integration with Existing Materials

The system uses your existing fundraising materials:
- `elevator-pitch-v2.md` - Core messaging
- `one-pager-v2.md` - Quick summary
- `investor-faq-v2.md` - Common questions
- `outreach-strategy.md` - Templates & targets
- `business-plan.md` - Full details

AlexBot references these when generating personalized strategies.

---

## 🎯 Next Steps

1. **Add your first 5 investors** (start with warm leads)
2. **Let AlexBot research them** (20-30 min each)
3. **Review & approve strategies**
4. **Send first batch of intros**
5. **Monitor daily reports**
6. **Respond to replies fast**
7. **Keep adding new investors**

---

## 📞 Support

Questions? Ask AlexBot in any session:
- "How do I add an investor?"
- "Show me follow-ups needed"
- "Generate report"
- "What's the status of [investor name]?"

---

**Built by AlexBot for Alex Liverant**  
*Let's fucking raise $10M.* 🚀

---

**Last Updated:** 2026-02-26
