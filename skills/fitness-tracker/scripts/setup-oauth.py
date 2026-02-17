#!/usr/bin/env python3
"""
Google Fitness API OAuth Setup

This script guides you through setting up OAuth credentials for Google Fit API.
Run once to authorize, then the token will be stored for future use.
"""

import os
import sys
import json
from pathlib import Path

# Add google-auth-oauthlib and google-api-python-client if needed
try:
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
except ImportError:
    print("ERROR: Missing required packages!")
    print("Install with: pip install --upgrade google-auth-oauthlib google-api-python-client")
    sys.exit(1)

# Scopes required for Fitness API
SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.location.read',
    'https://www.googleapis.com/auth/fitness.body.read',
]

# Paths
SKILL_DIR = Path(__file__).parent.parent
TOKEN_PATH = SKILL_DIR / 'token.json'
CREDENTIALS_PATH = SKILL_DIR / 'credentials.json'

def main():
    print("🏃 Google Fit API OAuth Setup\n")
    
    # Check if credentials.json exists
    if not CREDENTIALS_PATH.exists():
        print(f"ERROR: {CREDENTIALS_PATH} not found!")
        print("\n📝 To get credentials.json:")
        print("1. Go to: https://console.cloud.google.com/")
        print("2. Create a project (or select existing)")
        print("3. Enable 'Fitness API'")
        print("4. Create OAuth 2.0 credentials (Desktop app)")
        print("5. Download JSON and save as:")
        print(f"   {CREDENTIALS_PATH}")
        print("\nThen run this script again.")
        sys.exit(1)
    
    creds = None
    
    # Load existing token if available
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
    
    # If no valid credentials, let user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing token...")
            creds.refresh(Request())
        else:
            print("Starting OAuth flow...")
            print("A browser window will open. Sign in with alexliv@gmail.com")
            flow = InstalledAppFlow.from_client_secrets_file(
                str(CREDENTIALS_PATH), SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save token for future use
        TOKEN_PATH.write_text(creds.to_json())
        print(f"✅ Token saved to {TOKEN_PATH}")
    
    # Test the connection
    print("\n🧪 Testing API connection...")
    service = build('fitness', 'v1', credentials=creds)
    
    # List data sources
    sources = service.users().dataSources().list(userId='me').execute()
    print(f"✅ Connected! Found {len(sources.get('dataSource', []))} data sources")
    
    print("\n🎉 Setup complete! You can now use the fitness tracker scripts.")

if __name__ == '__main__':
    main()
