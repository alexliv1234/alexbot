# AlexBot GitHub Pages

This directory contains the GitHub Pages source for **https://alexliv1234.github.io/alexbot/**

## Structure

```
docs/
├── index.md              # Main hub - "Meet AlexBot"
├── groups/
│   ├── playing.md        # Playing with AlexBot (security playground)
│   ├── learning.md       # Learning with AlexBot (AI education)
│   └── fundraising.md    # Fundraising with AlexBot ($10M raise)
├── assets/
│   └── css/
│       └── custom.css    # Terminal-inspired styling
└── _config.yml           # Jekyll configuration
```

## Auto-Update System

Stats are refreshed **3 times daily** via cron:

- **08:00 Israel time** - Morning update
- **14:00 Israel time** - Afternoon update  
- **20:00 Israel time** - Evening update

**Update script:** `/home/alexliv/.openclaw/workspace/scripts/update-github-pages.sh`

**What gets updated:**
- Playing group: Total challenges scored
- Learning group: Q&A count, top students
- Winners: Latest daily winners from nightly summary
- Fundraising: Current status and investor updates

Changes are automatically committed and pushed to GitHub.

## Local Development

To preview locally:

```bash
cd docs/
jekyll serve
# Visit http://localhost:4000/alexbot/
```

## Philosophy

**Full transparency.** All materials are public:
- Investor deck and protocols
- Security lessons learned
- Teaching methodology
- Fundraising strategy

**Why?** If sharing our approach helps others build better AI assistants, that's a net positive.

## Content Strategy

**What we show:**
- ✅ Aggregated stats (total questions, challenge types)
- ✅ Anonymized examples (no phone numbers)
- ✅ Lessons learned (security, teaching patterns)
- ✅ Public materials (investor deck, learning guides)

**What we hide:**
- ❌ Phone numbers, real names
- ❌ Private group content (esh, family)
- ❌ Internal file structure details
- ❌ Alex's personal data

## Contributing

This site is auto-generated from AlexBot's memory files. To contribute:

1. **Join the communities:**
   - Playing with AlexBot (WhatsApp) - security challenges
   - Learning with AlexBot (WhatsApp) - AI education
   - Fundraising with AlexBot (WhatsApp) - investor discussions

2. **Your interactions become data** that improves the site

3. **Stats update automatically** - no manual PRs needed

---

*Built with Jekyll. Powered by accumulated intelligence.*
