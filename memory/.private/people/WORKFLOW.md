# People Memory Workflow

## When Someone Introduces Themselves

**Trigger:** Person shares their name and personal info (job, interests, background, etc.)

**Action:**
1. Extract key info from their introduction
2. Create/update `memory/people/{name}.md` (use lowercase, hyphens for spaces)
3. Update `memory/people/directory.json` with basic index entry

## Profile Structure

Each person gets their own markdown file with:
- Basic info (name, contact, platform)
- Background (job, company, role)
- Interests & skills
- Important context
- Interaction history (key conversations)

## Cross-Platform Linking

- If they're in WhatsApp contacts → link to `memory/whatsapp/contacts/{name}.md`
- If they're in a group → reference `memory/channels/{group}.md`
- If they're esh employee → note that (but use wacli for lookups)

## Privacy

- Only save what they voluntarily share
- Mark sensitive info clearly
- Don't share person A's info with person B without permission

## Directory Index

Keep `memory/people/directory.json` updated with:
```json
{
  "name": {
    "file": "memory/people/name.md",
    "platform": "whatsapp|telegram|discord|...",
    "contact": "phone|user_id",
    "tags": ["friend", "work", "esh", ...],
    "lastUpdated": "YYYY-MM-DD"
  }
}
```

## Quick Lookup

Before responding to someone, check if they have a profile:
1. Search `directory.json` by name/contact
2. Load their profile for context
3. Update after significant interactions
