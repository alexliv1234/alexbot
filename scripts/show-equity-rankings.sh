#!/bin/bash
# Show current equity pool rankings

echo ""
echo "🏆 EQUITY POOL CONTRIBUTION RANKINGS"
echo "===================================="
echo ""

# Run calculator
node scripts/calculate-equity-contributions.js

echo ""
echo "📊 TOP 10 CONTRIBUTORS:"
echo ""

# Show top 10 with details
jq -r '.leaderboard[:10] | .[] | 
  "\(.rank). \(.name) - \(.weighted_total) points
   └─ Security: \(.breakdown.security_testing | floor) | Suggestions: \(.breakdown.improvement_suggestions | floor) | Engagement: \(.breakdown.engagement_quality | floor) | Disclosure: \(.breakdown.responsible_disclosure | floor)"' \
  memory/equity-pool/contributor-tracking.json

echo ""
echo "💡 Full data: memory/equity-pool/contributor-tracking.json"
echo "📝 Announcement draft: memory/equity-pool/announcement-draft.md"
echo ""
