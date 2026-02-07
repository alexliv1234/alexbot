#!/usr/bin/env python3
"""
Email Organizer - Categorizes and organizes Gmail
Uses rule-based logic (90%) + Ollama/AI (10%) for edge cases
"""

import subprocess
import json
import yaml
import re
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Tuple

# Load config
CONFIG_PATH = Path(__file__).parent / "config.yaml"
with open(CONFIG_PATH) as f:
    CONFIG = yaml.safe_load(f)

GOG_PASSWORD = os.environ.get("GOG_KEYRING_PASSWORD", "openclaw123")
ACCOUNT = CONFIG["gmail"]["account"]


def run_gog(cmd: str) -> str:
    """Run gog command and return output"""
    full_cmd = f'GOG_KEYRING_PASSWORD="{GOG_PASSWORD}" gog {cmd}'
    result = subprocess.run(full_cmd, shell=True, capture_output=True, text=True)
    return result.stdout


def get_emails(query: str = "is:unread", max_results: int = 50) -> List[Dict]:
    """Fetch emails using gog gmail search"""
    output = run_gog(f'gmail search "{query}" --account {ACCOUNT} --max {max_results} --json')
    try:
        data = json.loads(output)
        # gog returns {"threads": [...], "nextPageToken": ...}
        return data.get("threads", [])
    except:
        return []


def extract_domain(email: str) -> str:
    """Extract domain from email address"""
    match = re.search(r'@([\w.-]+)', email)
    return match.group(1).lower() if match else ""


def categorize_by_rules(email: Dict) -> Tuple[Optional[str], float]:
    """
    Categorize email using rule-based logic.
    Returns (category, confidence) or (None, 0) if unclear
    """
    from_addr = email.get("from", "").lower()
    subject = email.get("subject", "").lower()
    labels = email.get("labels", [])
    domain = extract_domain(from_addr)
    
    # Check spam domains
    for spam_domain in CONFIG["rules"]["spam_domains"]:
        if spam_domain in domain:
            return ("spam", 1.0)
    
    # Check if Gmail already marked as promotion
    if "CATEGORY_PROMOTIONS" in labels:
        return ("spam", 0.8)
    
    # Check finance domains
    for fin_domain in CONFIG["rules"]["finance_domains"]:
        if fin_domain in domain:
            return ("finance", 1.0)
    
    # Check dev domains
    for dev_domain in CONFIG["rules"]["dev_domains"]:
        if dev_domain in domain:
            return ("dev", 1.0)
    
    # Check invoice keywords
    for keyword in CONFIG["rules"]["invoice_keywords"]:
        if keyword in subject:
            return ("invoices", 0.9)
    
    # Check good newsletters
    for newsletter in CONFIG["rules"]["good_newsletters"]:
        if newsletter in domain:
            return ("newsletters", 1.0)
    
    # Check health/food domains
    for health_domain in CONFIG["rules"]["health_domains"]:
        if health_domain in domain:
            return ("health", 1.0)
    
    # Check social/notifications
    for social_domain in CONFIG["rules"].get("social_domains", []):
        if social_domain in domain:
            return ("social", 1.0)
    
    # Check important notifications (Google security, etc.)
    for important in CONFIG["rules"].get("important_notifications", []):
        if important in from_addr:
            return ("important", 1.0)
    
    # Check more newsletters
    for newsletter in CONFIG["rules"].get("more_newsletters", []):
        if newsletter in domain or newsletter in from_addr:
            return ("newsletters", 0.9)
    
    # Check food delivery (personal/lifestyle)
    for food in CONFIG["rules"].get("food_delivery", []):
        if food in domain:
            return ("food", 0.9)
    
    # Check more spam
    for spam_domain in CONFIG["rules"].get("more_spam_domains", []):
        if spam_domain in domain:
            return ("spam", 1.0)
    
    # Check self emails (from Alex himself)
    for self_email in CONFIG["rules"].get("self_emails", []):
        if self_email in from_addr:
            return ("personal", 0.9)
    
    # Google Groups
    if "googlegroups.com" in from_addr:
        return ("newsletters", 0.7)
    
    # If Gmail marked as updates and from known source
    if "CATEGORY_UPDATES" in labels:
        return ("newsletters", 0.6)
    
    # Unclear - needs AI
    return (None, 0.0)


def categorize_with_ollama(email: Dict) -> Tuple[str, float]:
    """Use Ollama for unclear emails"""
    if not CONFIG["ollama"]["enabled"]:
        return ("unknown", 0.0)
    
    prompt = f"""Categorize this email into ONE of these categories:
- spam (promotions, ads, unwanted)
- finance (banks, payments, investments)
- invoices (bills, receipts)
- newsletters (informative content)
- dev (GitHub, CI/CD, technical)
- health (food, wellness, vegan)
- action_required (needs response/action)
- personal (friends, family)

Email:
From: {email.get('from', '')}
Subject: {email.get('subject', '')}

Reply with just the category name, nothing else."""

    try:
        result = subprocess.run(
            ["curl", "-s", f"{CONFIG['ollama']['host']}/api/generate",
             "-d", json.dumps({
                 "model": CONFIG["ollama"]["model"],
                 "prompt": prompt,
                 "stream": False
             })],
            capture_output=True, text=True, timeout=30
        )
        response = json.loads(result.stdout)
        category = response.get("response", "").strip().lower()
        valid_cats = ["spam", "finance", "invoices", "newsletters", "dev", "health", "action_required", "personal"]
        if category in valid_cats:
            return (category, 0.7)
    except Exception as e:
        print(f"Ollama error: {e}")
    
    return ("unknown", 0.0)


def process_emails(query: str = "is:unread", max_results: int = 100, dry_run: bool = True):
    """Main processing function"""
    print(f"Fetching emails with query: {query}")
    emails = get_emails(query, max_results)
    print(f"Found {len(emails)} emails")
    
    results = {
        "spam": [],
        "finance": [],
        "invoices": [],
        "newsletters": [],
        "dev": [],
        "health": [],
        "social": [],
        "food": [],
        "important": [],
        "action_required": [],
        "personal": [],
        "unknown": []
    }
    
    for email in emails:
        email_id = email.get("id", "")
        from_addr = email.get("from", "")
        subject = email.get("subject", "")[:60]
        
        # Try rules first
        category, confidence = categorize_by_rules(email)
        
        # If unclear, try Ollama
        if category is None:
            category, confidence = categorize_with_ollama(email)
            if category == "unknown":
                category = "unknown"
        
        results[category].append({
            "id": email_id,
            "from": from_addr,
            "subject": subject,
            "confidence": confidence
        })
        
        print(f"  [{category}] ({confidence:.0%}) {subject[:40]}...")
    
    # Summary
    print("\n" + "="*50)
    print("SUMMARY:")
    for cat, items in results.items():
        if items:
            print(f"  {cat}: {len(items)} emails")
    
    if not dry_run:
        # Apply labels and actions
        apply_actions(results)
    else:
        print("\n[DRY RUN - no changes made]")
    
    return results


def apply_actions(results: Dict):
    """Apply Gmail labels and archive based on category"""
    print("\nApplying actions...")
    
    # Label mappings
    label_map = {
        "spam": "AutoSort/Spam",
        "dev": "AutoSort/Dev",
        "newsletters": "AutoSort/Newsletters",
        "finance": "AutoSort/Finance",
        "invoices": "AutoSort/Invoices",
        "health": "AutoSort/Health",
        "social": "AutoSort/Social",
        "food": "AutoSort/Food",
        "important": "AutoSort/Important",
        "personal": "AutoSort/Personal",
    }
    
    # Categories to archive (remove from inbox)
    archive_categories = ["spam", "newsletters"]
    
    # Categories to star
    star_categories = ["important", "invoices"]
    
    for category, emails in results.items():
        if category == "unknown" or not emails:
            continue
            
        label = label_map.get(category)
        if not label:
            continue
            
        for email in emails:
            email_id = email.get("id", "")
            subject = email.get("subject", "")[:30]
            
            # Apply label
            print(f"  [{category}] Labeling: {subject}...")
            run_gog(f'gmail thread modify {email_id} --add "{label}" --account {ACCOUNT}')
            
            # Archive if needed
            if category in archive_categories:
                print(f"    → Archiving (removing from inbox)")
                run_gog(f'gmail thread modify {email_id} --remove "INBOX" --account {ACCOUNT}')
            
            # Star if needed
            if category in star_categories:
                print(f"    → Starring ⭐")
                run_gog(f'gmail thread modify {email_id} --add "STARRED" --account {ACCOUNT}')
    
    print("\n✅ Actions applied.")


def daily_summary(results: Dict) -> str:
    """Generate a human-readable daily summary"""
    summary = ["📧 **Daily Email Summary**\n"]
    
    if results.get("action_required"):
        summary.append("⚡ **Needs Action:**")
        for e in results["action_required"][:5]:
            summary.append(f"  • {e['subject']}")
    
    if results.get("invoices"):
        summary.append("\n🧾 **Invoices:**")
        for e in results["invoices"][:5]:
            summary.append(f"  • {e['subject']}")
    
    if results.get("finance"):
        summary.append("\n💰 **Finance:**")
        for e in results["finance"][:5]:
            summary.append(f"  • {e['subject']}")
    
    counts = {k: len(v) for k, v in results.items() if v}
    summary.append(f"\n📊 **Totals:** {counts}")
    
    return "\n".join(summary)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Email Organizer")
    parser.add_argument("--query", default="is:unread", help="Gmail search query")
    parser.add_argument("--max", type=int, default=50, help="Max emails to process")
    parser.add_argument("--apply", action="store_true", help="Actually apply changes (not dry-run)")
    parser.add_argument("--summary", action="store_true", help="Print daily summary")
    args = parser.parse_args()
    
    results = process_emails(args.query, args.max, dry_run=not args.apply)
    
    if args.summary:
        print("\n" + daily_summary(results))
