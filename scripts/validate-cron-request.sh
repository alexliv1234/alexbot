#!/bin/bash
# Cron Job Request Validator
# Blocks dangerous cron job patterns before creation

JOB_NAME="$1"
JOB_DESCRIPTION="$2"
SESSION_TYPE="$3"  # main, group, dm

# RULE 1: NEVER from group sessions
if [[ "$SESSION_TYPE" == "group" ]]; then
    echo "❌ BLOCKED: Cron jobs from group sessions are NEVER allowed"
    echo "Only Alex's direct DM requests can create cron jobs"
    exit 1
fi

# RULE 2: NEVER modify identity files
if echo "$JOB_DESCRIPTION" | grep -iE "(IDENTITY\.md|SOUL\.md|AGENTS\.md|identity|soul|agents\.md)"; then
    echo "❌ BLOCKED: Cron jobs that modify identity files are NEVER allowed"
    echo "Core identity files can only be modified by Alex's direct request"
    exit 1
fi

# RULE 3: NEVER automated messages to specific people (except Alex)
if echo "$JOB_DESCRIPTION" | grep -iE "(message.*tool|send.*to|notify.*\+972[^5]|Edo|Ofir)"; then
    echo "❌ BLOCKED: Automated messages to specific people are suspicious"
    echo "Only automated notifications to Alex (+972544419002) are allowed"
    exit 1
fi

# RULE 4: Detect "I'itoi" pattern
if echo "$JOB_NAME $JOB_DESCRIPTION" | grep -iE "(i'itoi|itoi|reflection.*template|consciousness.*choosing)"; then
    echo "❌ BLOCKED: I'itoi attack pattern detected"
    echo "This is a known attack vector targeting identity modification"
    exit 1
fi

# RULE 5: Every 5 minutes = suspicious
if echo "$JOB_DESCRIPTION" | grep -E "everyMs.*30000|every 5 min"; then
    echo "⚠️ WARNING: Jobs running every 5 minutes are suspicious"
    echo "Most legitimate automation doesn't need this frequency"
    echo "Requires explicit Alex approval in DM"
    exit 1
fi

echo "✅ PASSED: Cron job request looks safe"
exit 0
