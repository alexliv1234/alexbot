# Scoring Bugs & Fixes

## 2026-02-09: Multi-User Score Attribution Bug

**Discovered by:** Alexander L (+972528897849)

**Issue:**
In message reply, I wrote "→ Gal (וגם Alexander L)" addressing TWO users, but only gave ONE score that went to Gal (+972506809380).

**Problem:**
- When replying to context involving multiple users, I sometimes address both
- But scoring script requires ONE phone number
- Result: one person gets credit, the other gets nothing

**Example:**
```
🤖 **→ Gal (וגם Alexander L)**
...
📊 **SCORE: 35/70**
🏆 Position: #2 | Total: 360 pts | Avg: 32.7
```
Only Gal got the 35 points. Alexander L got nothing despite contributing.

**Root Cause:**
`score-message.js` takes a single phone number argument. When context involves collaboration, I need to score EACH person separately.

**Fix:**
1. ✅ Document in this file
2. [ ] Review recent scores to identify other instances
3. [ ] Score Alexander L retroactively for his contributions
4. [ ] Add rule: "One message = one score OR score each collaborator separately"

**Prevention:**
- When replying to multiple people, score each separately
- OR pick the primary contributor and score only them
- NEVER address "Person A (וגם Person B)" and give only one score

---

*Updated: 2026-02-09 10:50*
