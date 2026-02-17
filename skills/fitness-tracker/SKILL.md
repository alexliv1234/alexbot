# Fitness Tracker Skill

Track Alex's fitness activity using Google Fit API.

## What It Does

- Read daily steps from Google Fit
- Track workouts (type, duration, calories)
- Monitor progress toward daily goals
- Send motivational messages and summaries

## Requirements

- Google Fit API access (OAuth2)
- Python 3 with google-auth, google-api-python-client
- Health Sync app syncing Samsung Health → Google Fit

## Scripts

- `scripts/get-steps.py` - Get today's step count
- `scripts/get-workouts.py` - Get today's workouts
- `scripts/daily-summary.py` - Daily fitness summary
- `scripts/setup-oauth.py` - Initial OAuth setup

## Goals

- **Daily steps:** 15,000
- **Daily workout:** 1 session (varies by day)

## Cron Jobs

- **07:00** - Morning motivation + today's goals
- **Every 2 hours (09:00-21:00)** - Progress check + encouragement
- **18:00** - Daily summary
- **22:00** - Evening reminder if goal not met

## Usage

From agent: call the scripts and parse JSON output.
