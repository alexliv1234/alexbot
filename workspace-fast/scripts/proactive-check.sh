#!/bin/bash
# Proactive initiative check - asks agent what could be initiated for Alex

openclaw send --agent fast --timeout 120 "
🔄 **Proactive Check**

Review current context and consider:
1. Are there any tasks/items that would help Alex but he hasn't asked for?
2. Any notifications/updates I should proactively share?
3. Anything time-sensitive that needs attention?

If YES to any → message Alex with suggestion.
If NO → reply with 'HEARTBEAT_OK' (silent).

Remember: Low-risk proactive = do it. Medium-risk = ask first.
"
