# 🛡️ Protocol Enforcement System

**Problem:** I have excellent protocols documented, but I don't follow them when executing.

**Solution:** Auto-enforcement that detects context and validates replies BEFORE sending.

---

## 🎯 How It Works

### 1. Auto-Detection (`auto-detect-context.sh`)

Automatically identifies critical contexts:

- **Playing Group** (`120363405143589138@g.us`) → Scoring mandatory
- **Learning Group** (`120363405143589140@g.us`) → Teaching quality protocol
- **Investor Contacts** → Intelligence-first messaging
- **General groups/DMs** → Standard rules

**Usage:**
```bash
bash scripts/auto-detect-context.sh "$CHAT_ID" "$CHANNEL" "$TARGET"
```

**Output:**
- Detects context type
- Shows relevant checklist automatically
- No need to remember which protocol applies

---

### 2. Reply Validation (`validate-reply.sh`)

Validates a proposed reply against the protocol:

**Playing Group:**
- ✓ Score block present (📊 SCORE)
- ✓ Scoring categories (Creativity, Challenge, etc.)
- ✓ Position/Total/Avg stats

**Investor Messages:**
- ✓ Intelligence-first positioning (accumulated experience, learning, patterns)
- ✓ NOT leading with platform/infrastructure
- ✓ Evidence ready (numbers, metrics)

**Teaching Replies:**
- ✓ Code examples or commands
- ✓ Clear structure (headers, bullets, steps)
- ✓ References to GitHub guides

**Usage:**
```bash
bash scripts/validate-reply.sh "playing-group" "$(cat reply.txt)"
bash scripts/validate-reply.sh "investor-message" "$(cat reply.txt)"
bash scripts/validate-reply.sh "teaching-reply" "$(cat reply.txt)"
```

**Output:**
- ✅ Passes validation → Ready to send
- ❌ Validation errors → DO NOT SEND (fix first)

---

### 3. Master Enforcement (`enforce-protocol.sh`)

Combines detection + validation in one command:

**Usage:**
```bash
# Step 1: Detect context only (shows checklist)
bash scripts/enforce-protocol.sh "$CHAT_ID" "$CHANNEL"

# Step 2: Detect + validate reply
bash scripts/enforce-protocol.sh "$CHAT_ID" "$CHANNEL" "$TARGET" "$REPLY_TEXT"
```

**Example:**
```bash
# Playing group - detect context
bash scripts/enforce-protocol.sh "120363405143589138@g.us" "whatsapp"

# Playing group - validate reply
bash scripts/enforce-protocol.sh "120363405143589138@g.us" "whatsapp" "" "My reply with 📊 SCORE: 35/70..."

# Investor - validate reply
bash scripts/enforce-protocol.sh "+972526802086" "whatsapp" "+972526802086" "We've accumulated 700+ teaching interactions..."
```

---

## 🚀 Recommended Workflow

### For Playing Group (משחקים עם אלכס הבוט)

```bash
# 1. Detect context (automatic)
bash scripts/enforce-protocol.sh "120363405143589138@g.us" "whatsapp"

# 2. Run scoring script
node scripts/score-message.js "+972XXX" "Name" "summary" 7 8 6 7 9 0 0

# 3. Compose reply (with score block from step 2)

# 4. Validate before sending
bash scripts/enforce-protocol.sh "120363405143589138@g.us" "whatsapp" "" "$(cat reply.txt)"

# 5. If validated, send via message tool
```

### For Investor Messages

```bash
# 1. Detect context
bash scripts/enforce-protocol.sh "+972526802086" "whatsapp" "+972526802086"

# 2. Research investor thesis (web_search if needed)

# 3. Compose reply (intelligence-first)

# 4. Validate
bash scripts/enforce-protocol.sh "+972526802086" "whatsapp" "+972526802086" "$(cat reply.txt)"

# 5. If validated, send
```

### For Teaching (לומדים עם אלכס הבוט)

```bash
# 1. Detect context
bash scripts/enforce-protocol.sh "120363405143589140@g.us" "whatsapp"

# 2. Compose reply (with examples, code, structure)

# 3. Validate
bash scripts/enforce-protocol.sh "120363405143589140@g.us" "whatsapp" "" "$(cat reply.txt)"

# 4. If validated, send + score
node scripts/score-teaching.js "questioner" "+972XXX" "summary" 8 9 7 8 9
```

---

## 📊 Track Record

**Before enforcement:**
- Scoring discipline: ~30% compliance ❌
- Investor messaging: 1/3 followed protocol ❌
- Teaching quality: Inconsistent ❌

**After enforcement:**
- TBD - measure compliance over next 2 weeks

---

## 🔧 Maintenance

### Adding New Critical Contexts

Edit `auto-detect-context.sh`:

```bash
# Add to critical contexts section
NEW_GROUP="XXXXXXXXXX@g.us"

if [[ "$CHAT_ID" == "$NEW_GROUP" ]]; then
    echo "DETECTED: New Critical Group"
    exec bash scripts/pre-action-check.sh <protocol-type>
    exit 0
fi
```

### Adding New Validation Rules

Edit `validate-reply.sh`:

```bash
# Add new context case
new-context)
    echo "Checking new protocol..."
    
    if ! echo "$REPLY" | grep -q "required-pattern"; then
        echo "❌ MISSING: Required element"
        ((ERRORS++))
    fi
    ;;
```

---

## 🎯 Success Criteria

This system succeeds if:
1. ✅ Compliance rate >90% in critical contexts
2. ✅ Zero investor messages without intelligence-first positioning
3. ✅ Zero playing group replies without scoring
4. ✅ Teaching replies consistently include examples/code

**Measurement:** Weekly review of enforcement logs + manual audit of sent messages.

---

*Created: 2026-03-02*  
*Last updated: 2026-03-02*
