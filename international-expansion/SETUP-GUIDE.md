# WhatsApp Group Setup - Step-by-Step Guide

## Step 1: Create the WhatsApp Groups

### Group 1: Playing with AlexBot

**In WhatsApp:**
1. Tap "New Group"
2. **Group Name:** `Playing with AlexBot`
3. **Group Description:**
```
Adversarial AI testing playground. Try to break, trick, or outsmart AlexBot. Every attempt gets scored. Watch AI learn from attacks in real-time. Security researchers, hackers & AI enthusiasts welcome. 🎯🤖
```
4. Add yourself first, don't add anyone else yet
5. Tap "Create"
6. **Save the Group ID** (see Step 2)

### Group 2: Learning with AlexBot

**In WhatsApp:**
1. Tap "New Group"
2. **Group Name:** `Learning with AlexBot`
3. **Group Description:**
```
Technical learning community powered by AI. Ask about AI, coding, OpenClaw, automation. Get comprehensive answers with examples. Teaching quality tracked & scored. 742+ Q&A interactions. Learn with transparency. 🎓🤖
```
4. Add yourself first, don't add anyone else yet
5. Tap "Create"
6. **Save the Group ID** (see Step 2)

### Group 3: Fundraising with AlexBot

**In WhatsApp:**
1. Tap "New Group"
2. **Group Name:** `Fundraising with AlexBot`
3. **Group Description:**
```
Investor due diligence space for AlexBot/OpenClaw. Experience the product by talking to it. Ask tough questions. Test capabilities. No pitch deck - live demonstration. $10M seed round. VCs, angels, strategics welcome. 💼🤖
```
4. Add yourself first, don't add anyone else yet
5. Tap "Create"
6. **Save the Group ID** (see Step 2)

---

## Step 2: Get Each Group's WhatsApp ID

**For each group you just created:**

1. Send a message in the group (any message, like "test")
2. Check the OpenClaw logs or your recent WhatsApp messages
3. The Group ID will look like: `120363XXXXXXXXXX@g.us`

**OR easier method:**
- Send me a message FROM each group (tag me or just say "hi")
- I'll tell you the Group ID immediately

---

## Step 3: Connect Me to the Groups (OpenClaw Config)

**You need to add these groups to your OpenClaw config.**

I'll create the exact config snippets you need to add...

### Config Addition for `config.yaml`

Add this to your `whatsapp.bindings` section:

```yaml
whatsapp:
  bindings:
    # ... your existing bindings ...
    
    # Playing with AlexBot (English)
    - match:
        kind: group
        id: "PASTE_PLAYING_GROUP_ID_HERE"  # Replace with actual group ID
      agent: fast
      label: playing-with-alexbot-en
      capabilities: []
      responsePrefix: "🤖 "
      
    # Learning with AlexBot (English)  
    - match:
        kind: group
        id: "PASTE_LEARNING_GROUP_ID_HERE"  # Replace with actual group ID
      agent: main
      label: learning-with-alexbot-en
      capabilities: []
      responsePrefix: "🤖 "
      
    # Fundraising with AlexBot (English)
    - match:
        kind: group
        id: "PASTE_FUNDRAISING_GROUP_ID_HERE"  # Replace with actual group ID
      agent: main
      label: fundraising-with-alexbot-en
      capabilities: []
      responsePrefix: "🤖 "
```

**After adding:**
1. Replace `PASTE_X_GROUP_ID_HERE` with the actual group IDs from Step 2
2. Save the config file
3. Run: `openclaw gateway restart` (or I can do this for you)

---

## Step 4: I'll Setup the Backend

**Once the groups are connected, I'll create:**

1. **Scoring scripts:**
   - `scripts/score-message-en.js` (Playing group)
   - `scripts/score-teaching-en.js` (Learning group)
   - `scripts/log-investor-question.js` (Fundraising group)

2. **Memory structures:**
   - `memory/channels/playing-with-alexbot-en.md`
   - `memory/channels/learning-with-alexbot-en.md`
   - `memory/channels/fundraising-with-alexbot-en.md`
   - Score/data files for each

3. **Cron jobs:**
   - Playing: Morning wakeup (10:00) + Evening summary (18:00)
   - Learning: Weekly analysis (Sunday 22:00)
   - Fundraising: Daily investor summary to you (20:00)

4. **AGENTS.md rules:**
   - Group-specific behavior for each
   - Scoring requirements
   - Investor escalation rules

**This will take me ~30 minutes. I'll let you know when ready.**

---

## Step 5: Test Before Inviting Anyone

**After I finish setup:**

1. Send a test message in Playing group
2. I should respond with scoring
3. Send a test question in Learning group  
4. I should respond with detailed answer + teaching score
5. Send a test investor question in Fundraising group
6. I should respond professionally

**If anything breaks, we fix it before inviting real people.**

---

## Step 6: Launch Sequence

**Once testing passes:**

### Day 1: Playing with AlexBot
- Invite 5-10 initial members:
  - Security researchers you know
  - Friendly hackers
  - AI safety folks
  - Tech friends who like challenges

**I'll post welcome message + first challenge automatically**

### Day 2: Learning with AlexBot
- Invite 10-15 initial members:
  - Developers from Clawders
  - OpenClaw users
  - AI enthusiasts
  - Tech community

**I'll post welcome message + seed Q&As**

### Day 3: Fundraising with AlexBot
- Invite 3-5 investors (warm intros only):
  - Alon Lifshitz (if ready)
  - Other investors you're talking to
  - Angels you know

**You post brief intro, I follow with welcome message**

---

## Quick Reference

| Group | Agent | Active Hours | Scoring | Purpose |
|-------|-------|--------------|---------|---------|
| **Playing** | fast | 10:00-18:00 IST Sun-Thu | 0-70 (7 categories) | Security/adversarial testing |
| **Learning** | main | 24/7 | 0-50 (5 categories) | Technical Q&A, teaching demo |
| **Fundraising** | main | 24/7 | No scoring | Investor due diligence |

---

## What You Need to Do NOW

**Immediate actions:**

1. ✅ Create all 3 WhatsApp groups (names + descriptions above)
2. ✅ Get their Group IDs (send me a message from each group)
3. ✅ I'll generate the exact config snippet with real IDs
4. ✅ You paste it into your OpenClaw config
5. ✅ Restart OpenClaw gateway
6. ✅ I setup all backend scripts/cron/memory
7. ✅ We test together
8. ✅ Launch!

**Start with creating the 3 groups, then ping me from each one so I can capture the Group IDs.**

Ready? 🚀
