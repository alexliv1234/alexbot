# Fitness Tracker Setup

## ✅ You've Done (סיימת!)

1. ✅ Installed Health Sync
2. ✅ Synced Samsung Health → Google Fit
3. ✅ Python environment set up

---

## 🔐 What You Need to Do Now

### Step 1: Get Google Cloud Credentials

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/

2. **Create/Select Project:**
   - Click "Select a project" → "New Project"
   - Name: "AlexBot Fitness"
   - Click "Create"

3. **Enable Fitness API:**
   - In search bar, type "Fitness API"
   - Click "Fitness API" → "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: **Desktop app**
   - Name: "AlexBot Fitness Tracker"
   - Click "Create"

5. **Download JSON:**
   - Click the download button (⬇️) next to your new OAuth client
   - Save as: `~/.openclaw/workspace/skills/fitness-tracker/credentials.json`

---

### Step 2: Authorize Access

Run this from your Windows machine (where you can open a browser):

```bash
~/.openclaw/workspace/skills/fitness-tracker/scripts/setup-oauth.sh
```

- It will open your browser
- Sign in with **alexliv@gmail.com**
- Grant permissions
- Token will be saved automatically

---

### Step 3: Test It!

```bash
# Check steps
~/.openclaw/workspace/skills/fitness-tracker/scripts/get-steps.sh

# Check workouts
~/.openclaw/workspace/skills/fitness-tracker/scripts/get-workouts.sh
```

If you see JSON with your data → **Success!** 🎉

---

## 🤖 Then I'll Take Over

After setup, I'll:
- Create cron jobs for daily tracking
- Send you motivational messages
- Track progress toward 15,000 steps
- Remind you to work out

---

## 🆘 Troubleshooting

**"Not authenticated" error:**
- Run `setup-oauth.sh` again
- Make sure `credentials.json` exists

**No data showing:**
- Check Health Sync is running
- Force a sync in Health Sync app
- Wait 5-10 minutes for Google Fit to update

**Browser won't open (WSL):**
- Copy the URL from terminal
- Paste in Windows browser manually
