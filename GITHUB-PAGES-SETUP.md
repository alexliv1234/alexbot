# GitHub Pages Setup Guide

## ✅ Local Setup Complete

All files are created and committed:
- `docs/` folder with Jekyll site structure
- Main pages: index.md, playing.md, learning.md, fundraising.md
- Custom CSS with terminal-inspired styling
- Auto-update script (`scripts/update-github-pages.sh`)
- Cron jobs for 3x daily updates (08:00, 14:00, 20:00 Israel time)

## 🚀 Next Steps: Enable GitHub Pages

1. **Go to GitHub repository settings:**
   - Visit: https://github.com/alexliv1234/alexbot/settings/pages

2. **Enable GitHub Pages:**
   - **Source:** Deploy from a branch
   - **Branch:** `master` (or `main`)
   - **Folder:** `/docs`
   - Click **Save**

3. **Wait for deployment:**
   - GitHub will build the site (takes ~1-2 minutes)
   - Check Actions tab for build status: https://github.com/alexliv1234/alexbot/actions

4. **Access your site:**
   - URL: https://alexliv1234.github.io/alexbot/
   - Should show the main hub with all three group pages

## 🔧 Auto-Update System

**Cron jobs registered:**
- **Morning (08:00):** First update of the day
- **Afternoon (14:00):** Mid-day refresh
- **Evening (20:00):** End-of-day update

**What gets updated:**
- Playing group: Challenge counts, winners
- Learning group: Q&A stats, top students
- Fundraising: Investor status

**Manual trigger:**
```bash
cd /home/alexliv/.openclaw/workspace
bash scripts/update-github-pages.sh
```

## 🎨 Customization

**Edit content:**
- `docs/index.md` - Main hub
- `docs/groups/*.md` - Group pages
- `docs/assets/css/custom.css` - Styling

**Changes auto-deploy** via git push + GitHub Actions.

## 🔍 Troubleshooting

**Site not showing:**
- Check GitHub Pages settings (step 1-2 above)
- Verify `_config.yml` has correct `baseurl: "/alexbot"`
- Check Actions tab for build errors

**Stats not updating:**
- Check cron jobs: `openclaw cron list`
- Run manually: `bash scripts/update-github-pages.sh`
- Verify memory files exist in expected locations

**Styling broken:**
- Clear browser cache
- Check `custom.css` loaded: View Source → look for `assets/css/custom.css`
- Verify Jekyll theme set in `_config.yml`

## 📊 Monitoring

**Check site health:**
- Visit https://alexliv1234.github.io/alexbot/
- Verify "Last updated" timestamp is recent
- Check that stats match memory files

**Check update success:**
- Review git log: `git log --oneline --grep="Auto-update"`
- Should see 3 commits daily (08:00, 14:00, 20:00)

---

**Built:** 2026-02-27  
**First update:** Next scheduled cron run (08:00, 14:00, or 20:00 Israel time)
