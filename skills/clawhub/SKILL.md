# ClawHub Skill

Search and install skills from ClawHub - a skill registry for OpenClaw agents.

**URL:** https://clawhub.com
**API:** https://clawhub.com/api/v1/search?q=<query>

## When to Use

- Alex asks for something I don't know how to do
- Need to find new capabilities/integrations
- Looking for tools/APIs I don't have yet

## Search

```bash
# Semantic search for skills
skills/clawhub/search.sh "contact management"
skills/clawhub/search.sh "calendar"
skills/clawhub/search.sh "email"
```

## Workflow

1. Search ClawHub for relevant skills
2. Show Alex the options
3. If approved, fetch and install the skill
4. Read the skill's SKILL.md and use it

## API Response Format

```json
{
  "results": [
    {
      "slug": "skill-name",
      "displayName": "Skill Display Name",
      "summary": "What the skill does",
      "version": "1.0.0"
    }
  ]
}
```

## Installing Skills

```bash
# Get skill details
curl -s "https://clawhub.com/api/v1/skills/<slug>"

# Download/install skill
skills/clawhub/install.sh <slug>
```
