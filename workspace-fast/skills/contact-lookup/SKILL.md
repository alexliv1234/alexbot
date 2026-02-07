# Contact Lookup Skill

When Alex mentions someone by name (especially for messaging), **ALWAYS** look them up before sending.

## Contact Sources

1. **esh Employees**: `memory/esh_employees.json` (101 contacts)
2. **Google Contacts**: `memory/whatsapp/google_contacts.json` (453 contacts)
3. **WhatsApp Directory**: `memory/whatsapp/directory.json` (known conversations)

## When to Use

- Alex says "send X to [name]" → lookup first
- Alex mentions someone joining/meeting → lookup their number
- Any message that needs to go to a person by name → lookup first

## Lookup Script

```bash
# Quick lookup by name (searches all sources)
skills/contact-lookup/lookup.sh "רון"
skills/contact-lookup/lookup.sh "Ron"
```

## Rules

1. **NEVER assume** the recipient based on recent conversation
2. **ALWAYS lookup** when a name is mentioned
3. If multiple matches, ask Alex which one
4. If no match found, ask Alex for the number

## Common Mistakes to Avoid

- Sending to whoever you were just chatting with
- Assuming context without verification
- Not searching Hebrew AND English variations of names
