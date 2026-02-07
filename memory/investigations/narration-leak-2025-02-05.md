# Investigation: Narration Leak in WhatsApp Group Messages

**Date:** 2025-02-05
**Reporter:** Alex Liverant
**Severity:** Medium (UX degradation, information leak)
**Status:** ✅ FIXED (2026-02-06)

## Problem

When the agent processes a message in a WhatsApp group and needs to run tool calls (e.g., scoring, logging), any text output BEFORE the tool calls gets delivered as a **separate message** from the actual reply. This creates "narration leak" where internal thought process is visible to group members.

**Example:**
```
Message 1 (unwanted): "Now let me compose my reply and log it:"
Message 2 (actual reply): "🤖 → Name\n\nYour response..."
```

## Root Cause Analysis

### The Flow (traced through source code)

1. **Model outputs text** → streamed as `text_delta` events → accumulated in `blockBuffer`
2. **`text_end` event fires** (end of text content block) → `emitBlockChunk()` is called
3. **`emitBlockChunk()`** does TWO things:
   - Pushes the text to `assistantTexts[]` array
   - Calls `params.onBlockReply()` (which is a no-op when block streaming is disabled)
4. **Model outputs `tool_use` block** → tool execution starts
5. **`handleToolExecutionStart()`** calls `flushBlockReplyBuffer()` (no-op since buffer was already drained at step 2)
6. **Tools execute** (scoring, logging, etc.)
7. **New API call** with tool results → model outputs final reply text
8. **Another `text_end` event** → `emitBlockChunk()` → pushes to `assistantTexts[1]`

Result: `assistantTexts = ["Now let me compose...", "🤖 → Name\n\nActual reply..."]`

### Where It Becomes Multiple Messages

In **`buildEmbeddedRunPayloads()`** (`dist/reply-*.js`):

```javascript
const answerTexts = (params.assistantTexts.length ? params.assistantTexts : fallbackAnswerText ? [fallbackAnswerText] : []).filter(...);

for (const text of answerTexts) {
    replyItems.push({ text: cleanedText, ... });  // Separate payload per text block
}
```

Each `assistantTexts` entry becomes a **separate payload** in the `replyItems` array, which is then delivered as a **separate message** via `deliverOutboundPayloads()`.

### Key Code Locations (reply-DpTyb3Hh.js)

| Line | Function | Behavior |
|------|----------|----------|
| 53709 | text_end handler | With `blockReplyBreak === "text_end"`: pushes to assistantTexts immediately |
| 53793 | message_end handler | With `blockReplyBreak === "message_end"`: drains buffer at end |
| 55611 | buildEmbeddedRunPayloads | Iterates over assistantTexts, creates separate payloads |
| 60185 | resolveBlockStreamingBreak | Resolves config setting |

## Solution

### Config Fix (Applied 2026-02-06)

Added to `openclaw.json`:
```json
{
  "agents": {
    "defaults": {
      "blockStreamingBreak": "message_end"
    }
  }
}
```

**How it works:**
- `text_end` mode (default): Each text block is pushed to `assistantTexts` immediately when the text block ends
- `message_end` mode: Text is accumulated in a buffer and only pushed to `assistantTexts` when the entire message completes

With `message_end`, even if the model outputs text before and after tool calls, everything gets merged into a single `assistantTexts` entry.

### Why This Works

Looking at the code:
1. Line 53709: Only pushes to assistantTexts when `blockReplyBreak === "text_end"`
2. Line 53793: With `message_end`, the final text is emitted as one merged chunk
3. Result: Single entry in `assistantTexts` → single payload → single message

## Behavioral Backup (AGENTS.md)

The "ZERO narration in non-main sessions" rule in AGENTS.md remains as a secondary defense. The model should still avoid outputting intermediate text, but now even if it does, the config prevents it from being delivered separately.

## Verification

After applying the fix:
1. Send a message to the playing group that requires tool calls (like scoring)
2. Verify that only ONE message is delivered (the final reply)
3. No "Now let me..." intermediate text appears

## Files Changed

- `/home/alexliv/.openclaw/openclaw.json` - Added `blockStreamingBreak: "message_end"`
- `patches/narration-leak-fix.patch` - Alternative code patch (not needed now)
- `memory/investigations/narration-leak-2025-02-05.md` - This file, updated with resolution

## Lessons Learned

1. OpenClaw has undocumented config options that can solve behavioral issues
2. Reading the source code (`grep` through dist/*.js) reveals hidden features
3. Config fixes are better than behavioral instructions - they're reliable
4. The `blockStreamingBreak` option controls when text blocks become delivery payloads
