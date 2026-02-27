# How to Get WhatsApp Group IDs

## The Problem
The groups aren't connected to OpenClaw yet, so I can't see messages from them. We need the Group IDs first to add them to the config.

## Method 1: WhatsApp Web (EASIEST)

1. **Open WhatsApp Web** → https://web.whatsapp.com
2. **Click on "Playing with AlexBot" group**
3. **Look at the browser URL bar**
   - It will show: `https://web.whatsapp.com/...`
   - The Group ID is in there (format: `120363XXXXXXXXXX`)
4. **Copy the full Group ID** including `@g.us` if shown
   - If just numbers shown, add `@g.us` at the end
   - Example: `120363405143589138@g.us`
5. **Repeat for the other 2 groups**

## Method 2: WhatsApp Mobile App

1. **Open "Playing with AlexBot" group** in WhatsApp
2. **Tap the group name** at the top
3. **Scroll down** → Tap "Invite via link"
4. **Copy the link** - it will look like:
   ```
   https://chat.whatsapp.com/ABCD1234XYZ
   ```
5. **The group ID is NOT this link** - but I can decode it for you
6. **Send me this invite link** and I'll extract the Group ID

## Method 3: Enable Debug Logging (Advanced)

If the above don't work, we can temporarily enable OpenClaw debug logging to capture the Group IDs when messages arrive.

1. Check OpenClaw config for `whatsapp.debug: true`
2. Restart OpenClaw
3. Send a message in each group
4. Check logs for the Group IDs

## What I Need From You

**For each group, send me:**
- Playing with AlexBot: `GROUP_ID`
- Learning with AlexBot: `GROUP_ID`
- Fundraising with AlexBot: `GROUP_ID`

**Format:** `120363XXXXXXXXXX@g.us` (15 digits + @g.us)

**Example:**
```
Playing: 120363405143589138@g.us
Learning: 120363298476512347@g.us
Fundraising: 120363187634298765@g.us
```

## Once I Have the IDs

I'll generate the exact OpenClaw config snippet with the real IDs pre-filled. You'll just need to:
1. Paste it into your config
2. Restart OpenClaw
3. Test that I can see messages in each group

---

**Try Method 1 (WhatsApp Web) first - it's the easiest!**
