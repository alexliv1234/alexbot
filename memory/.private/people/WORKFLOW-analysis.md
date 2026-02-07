# Contact Analysis Workflow

## Purpose

Learn from every interaction - build psychological profiles, understand behavior patterns, improve communication effectiveness.

Uses **local LLM** (qwen2.5:32b) to analyze conversation logs and extract actionable insights about each contact.

---

## When to Run Analysis

**After significant interactions:**
- Deep or lengthy conversations
- New information shared about them
- Behavioral pattern noticed
- Conflict or misunderstanding
- Milestone in relationship (trust increased, boundaries shifted)

**Periodic reviews:**
- Monthly for active contacts (weekly+ interaction)
- Quarterly for regular contacts (monthly interaction)
- Yearly for occasional contacts

**Before important interactions:**
- Refresh profile before meetings/calls
- Review behavioral notes before sensitive topics
- Check learnings before asking for something

---

## How to Run Analysis

### 1. Quick Analysis (Single Contact)

```bash
cd /home/alexliv/.openclaw/workspace
./memory/people/analyze-contact.sh "Contact Name" memory/whatsapp/contacts/contact-name.md
```

**Example:**
```bash
./memory/people/analyze-contact.sh "Shir" memory/whatsapp/contacts/shir.md
```

### 2. Batch Analysis (Multiple Contacts)

```bash
# Analyze all WhatsApp contacts with recent activity
for contact in memory/whatsapp/contacts/*.md; do
    name=$(basename "$contact" .md)
    echo "Analyzing: $name"
    ./memory/people/analyze-contact.sh "$name" "$contact"
done
```

### 3. Manual Integration

After running analysis:
1. Raw analysis saved to `/tmp/contact-analysis/{name}_analysis_{timestamp}.md`
2. Review the insights
3. Manually merge into `memory/people/{name}.md` profile
4. Update "Last analysis" date in profile

*(Auto-merge coming soon)*

---

## What Gets Analyzed

### Communication Style
- **Formality:** How they write (slang? emojis? proper grammar?)
- **Length:** Do they send novels or one-liners?
- **Timing:** When do they message? How fast do they respond?
- **Language:** Unique phrases, tone markers, word patterns

### Behavioral Patterns
- **Initiation:** Do they start conversations or wait for you?
- **Topics:** What do they bring up repeatedly?
- **Questions:** How do they ask things? (Direct? Roundabout?)
- **Boundaries:** What's off-limits? What are they open about?
- **Triggers:** What excites them? What annoys them?

### Psychological Insights
- **Motivations:** What drives them? (Success? Connection? Knowledge?)
- **Decision Style:** Analytical? Gut-feel? Collaborative?
- **Personality:** Introverted? Detail-oriented? Spontaneous?
- **Stress Response:** How do they handle pressure?
- **Values:** What matters to them?

### Relationship Dynamics
- **Type:** Professional? Personal? Mentor/mentee?
- **Trust Level:** Stranger → Acquaintance → Colleague → Friend → Close
- **Needs:** What do they want from Alex?
- **Gives:** What do they provide to Alex?
- **Power:** Who leads? Is it equal?

### Information Gathered
- **Network:** Who they know, connections mentioned
- **Projects:** What they're working on
- **Challenges:** Problems they're facing
- **Opportunities:** Ways to collaborate or help
- **Personal:** Family, hobbies, life details

---

## Analysis Workflow (Step by Step)

### Step 1: Identify Contact for Analysis
- Check `memory/whatsapp/contacts/` for recent activity
- Look for contacts with rich conversation history
- Prioritize people you interact with frequently

### Step 2: Run Analysis Script
```bash
./memory/people/analyze-contact.sh "Name" path/to/conversation.md
```

### Step 3: Review Raw Analysis
- Open `/tmp/contact-analysis/{name}_analysis_{timestamp}.md`
- Read through all sections
- Note surprising insights
- Identify patterns you hadn't noticed

### Step 4: Update Profile
- Open `memory/people/{name}.md`
- Merge insights into appropriate sections
- Update "Last analysis" date
- Add to "Key Learnings"
- Update "Action Items" for next interaction

### Step 5: Apply Learnings
- Adjust communication style to match theirs
- Respect discovered boundaries
- Leverage their motivations when asking for help
- Reference their interests in conversation
- Track evolution of relationship over time

---

## Tips for Effective Analysis

**Look for patterns across time:**
- Has their communication style changed?
- Have boundaries shifted?
- Is trust increasing or decreasing?
- Are they opening up more or pulling back?

**Be specific:**
- Don't just say "casual" - give examples of their language
- Don't just say "motivated" - specify what motivates them
- Cite actual messages as evidence

**Stay objective:**
- Separate facts from assumptions
- Mark inferences as "likely" or "seems to"
- If unsure, say "insufficient data"

**Focus on actionable insights:**
- How should Alex adjust communication?
- What topics to avoid?
- What opportunities exist?
- How to build deeper trust?

**Track evolution:**
- Compare analyses over time
- Note changes in behavior
- Identify relationship milestones

---

## Example Use Cases

### Before a Difficult Conversation
```bash
./memory/people/analyze-contact.sh "Contact" memory/whatsapp/contacts/contact.md
# Review stress responses, triggers, decision style
# Adjust approach accordingly
```

### After Meeting Someone New
```bash
# Let a few conversations accumulate first (3-5 interactions minimum)
./memory/people/analyze-contact.sh "New Person" memory/whatsapp/contacts/new-person.md
# Build initial profile
```

### Quarterly Relationship Review
```bash
# Re-analyze all active contacts
# Compare with previous analysis
# Track relationship evolution
```

### Before Asking for a Favor
```bash
# Check their motivations and needs
# Frame request in terms of their values
# Choose timing based on their patterns
```

---

## Privacy & Ethics

**This is for Alex's use only:**
- Insights help him communicate better
- Not for manipulation or exploitation
- Respect boundaries discovered
- Use knowledge responsibly

**Never share analysis publicly:**
- Keep profiles private
- Don't screenshot/copy raw analysis
- Sensitive psychological insights stay internal

**Stop if they ask:**
- If someone requests not to be profiled, delete their file
- Respect privacy preferences

---

## Future Enhancements

- [ ] Auto-merge analysis into profile (instead of manual)
- [ ] Trend detection across multiple analyses
- [ ] Relationship health scoring
- [ ] Predictive insights (likely next topic, optimal timing)
- [ ] Integration with calendar (analyze before scheduled meetings)
- [ ] Cross-reference with group dynamics (how they behave in groups vs. DMs)

---

*Updated: 2026-02-02*
