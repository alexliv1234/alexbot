#!/usr/bin/env python3
"""
Get today's step count from Google Fit
Returns JSON with step count and progress toward goal
"""

import sys
import json
from pathlib import Path
from datetime import datetime, timezone
import time

try:
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
except ImportError:
    print(json.dumps({"error": "Missing packages. Run: pip install google-auth-oauthlib google-api-python-client"}))
    sys.exit(1)

SKILL_DIR = Path(__file__).parent.parent
TOKEN_PATH = SKILL_DIR / 'token.json'
DAILY_GOAL = 15000  # Alex's daily step goal

def get_steps():
    """Get today's steps from Google Fit"""
    
    if not TOKEN_PATH.exists():
        return {
            "error": "Not authenticated. Run setup-oauth.py first",
            "steps": 0,
            "goal": DAILY_GOAL,
            "progress_percent": 0
        }
    
    # Load credentials
    creds = Credentials.from_authorized_user_file(str(TOKEN_PATH))
    service = build('fitness', 'v1', credentials=creds)
    
    # Get today's start/end in nanoseconds (Fit API uses nanoseconds since epoch)
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    start_time_nanos = int(start_of_day.timestamp() * 1e9)
    end_time_nanos = int(now.timestamp() * 1e9)
    
    # Data source for step count
    data_source = "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
    
    # Request aggregated step data
    body = {
        "aggregateBy": [{
            "dataTypeName": "com.google.step_count.delta"
        }],
        "bucketByTime": {"durationMillis": int((end_time_nanos - start_time_nanos) / 1e6)},
        "startTimeMillis": int(start_time_nanos / 1e6),
        "endTimeMillis": int(end_time_nanos / 1e6)
    }
    
    try:
        response = service.users().dataset().aggregate(userId='me', body=body).execute()
        
        # Extract step count
        total_steps = 0
        if 'bucket' in response:
            for bucket in response['bucket']:
                for dataset in bucket.get('dataset', []):
                    for point in dataset.get('point', []):
                        for value in point.get('value', []):
                            if 'intVal' in value:
                                total_steps += value['intVal']
        
        progress = (total_steps / DAILY_GOAL) * 100
        
        return {
            "steps": total_steps,
            "goal": DAILY_GOAL,
            "progress_percent": round(progress, 1),
            "remaining": max(0, DAILY_GOAL - total_steps),
            "goal_met": total_steps >= DAILY_GOAL,
            "timestamp": now.isoformat()
        }
    
    except Exception as e:
        return {
            "error": str(e),
            "steps": 0,
            "goal": DAILY_GOAL,
            "progress_percent": 0
        }

if __name__ == '__main__':
    result = get_steps()
    print(json.dumps(result, indent=2))
