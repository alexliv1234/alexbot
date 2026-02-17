#!/usr/bin/env python3
"""
Get today's workouts from Google Fit
Returns JSON with workout details
"""

import sys
import json
from pathlib import Path
from datetime import datetime, timezone

try:
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
except ImportError:
    print(json.dumps({"error": "Missing packages"}))
    sys.exit(1)

SKILL_DIR = Path(__file__).parent.parent
TOKEN_PATH = SKILL_DIR / 'token.json'

# Activity type mapping (Google Fit activity types)
ACTIVITY_TYPES = {
    1: "Biking",
    7: "Walking", 
    8: "Running",
    9: "Aerobics",
    10: "Badminton",
    11: "Baseball",
    12: "Basketball",
    13: "Biathlon",
    79: "Weight Training",
    96: "Strength Training",
    # Add more as needed
}

def get_workouts():
    """Get today's workout sessions from Google Fit"""
    
    if not TOKEN_PATH.exists():
        return {
            "error": "Not authenticated",
            "workouts": [],
            "total_count": 0
        }
    
    creds = Credentials.from_authorized_user_file(str(TOKEN_PATH))
    service = build('fitness', 'v1', credentials=creds)
    
    # Get today's range
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    start_time_nanos = int(start_of_day.timestamp() * 1e9)
    end_time_nanos = int(now.timestamp() * 1e9)
    
    try:
        # Get activity sessions
        sessions_response = service.users().sessions().list(
            userId='me',
            startTime=start_of_day.isoformat() + 'Z',
            endTime=now.isoformat() + 'Z'
        ).execute()
        
        workouts = []
        for session in sessions_response.get('session', []):
            activity_type = session.get('activityType', 0)
            activity_name = ACTIVITY_TYPES.get(activity_type, f"Activity {activity_type}")
            
            start_ms = int(session.get('startTimeMillis', 0))
            end_ms = int(session.get('endTimeMillis', 0))
            duration_min = (end_ms - start_ms) / 60000  # Convert to minutes
            
            workout = {
                "name": session.get('name', activity_name),
                "activity_type": activity_name,
                "duration_minutes": round(duration_min, 1),
                "start_time": datetime.fromtimestamp(start_ms/1000, tz=timezone.utc).isoformat(),
                "calories": session.get('activeTimeMillis', 0) / 1000  # Rough estimate
            }
            
            workouts.append(workout)
        
        return {
            "workouts": workouts,
            "total_count": len(workouts),
            "goal_met": len(workouts) >= 1,  # Alex wants 1 workout per day
            "timestamp": now.isoformat()
        }
    
    except Exception as e:
        return {
            "error": str(e),
            "workouts": [],
            "total_count": 0
        }

if __name__ == '__main__':
    result = get_workouts()
    print(json.dumps(result, indent=2))
