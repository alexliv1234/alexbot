# 🛡️ Enforcement Quick Reference

**ONE-WEEK TRIAL: Mar 3-10, 2026**

---

## 🚨 BEFORE Every Critical Reply

### Playing Group (120363405143589138@g.us)

```bash
# 1. Enforce
bash scripts/enforce-protocol.sh "120363405143589138@g.us" "whatsapp"

# 2. Score
node scripts/score-message.js "+972XXX" "Name" "summary" 7 8 6 7 9 0 0

# 3. Compose (include score block)

# 4. Validate
bash scripts/enforce-protocol.sh "120363405143589138@g.us" "whatsapp" "" "$(cat reply.txt)"

# 5. Send
```

### Investor Messages

```bash
# 1. Enforce
bash scripts/enforce-protocol.sh "$PHONE" "whatsapp" "$PHONE"

# 2. Compose (intelligence-first!)

# 3. Validate
bash scripts/enforce-protocol.sh "$PHONE" "whatsapp" "$PHONE" "$(cat reply.txt)"

# 4. Send (if validated)
```

### Teaching Group (120363405143589140@g.us)

```bash
# 1. Enforce
bash scripts/enforce-protocol.sh "120363405143589140@g.us" "whatsapp"

# 2. Compose (examples! code! structure!)

# 3. Validate
bash scripts/enforce-protocol.sh "120363405143589140@g.us" "whatsapp" "" "$(cat reply.txt)"

# 4. Send + score
node scripts/score-teaching.js "name" "+972XXX" "summary" 8 9 7 8 9
```

---

## 📊 Track This Week (Mar 3-10)

| Date | Context | Used Enforcement? | Caught Mistake? |
|------|---------|-------------------|-----------------|
| Mar 3 | | | |
| Mar 4 | | | |
| Mar 5 | | | |
| Mar 6 | | | |
| Mar 7 | | | |
| Mar 8 | | | |
| Mar 9 | | | |
| Mar 10 | | | |

**Goal:** 100% enforcement usage before critical replies

---

## 🎯 Success = Doing, Not Knowing

- ✓ Tool exists (ENFORCEMENT-README.md)
- ✓ Tool documented (this reference)
- ⏳ **Tool USED** - prove it this week!

---

*Created: 2026-03-03 02:00*
*Trial ends: 2026-03-10 02:00*
