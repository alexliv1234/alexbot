#!/usr/bin/env python3
"""
Full Year Email Scan - Initial categorization of all emails
Runs once to organize historical emails
"""

import subprocess
import json
import os
from datetime import datetime, timedelta
from categorize import categorize_by_rules, extract_domain, CONFIG, GOG_PASSWORD, ACCOUNT

def run_gog(cmd: str) -> str:
    """Run gog command and return output"""
    full_cmd = f'GOG_KEYRING_PASSWORD="{GOG_PASSWORD}" gog {cmd}'
    result = subprocess.run(full_cmd, shell=True, capture_output=True, text=True)
    return result.stdout


def scan_month(year: int, month: int) -> dict:
    """Scan a single month of emails"""
    start = f"{year}/{month:02d}/01"
    if month == 12:
        end = f"{year+1}/01/01"
    else:
        end = f"{year}/{month+1:02d}/01"
    
    query = f"after:{start} before:{end}"
    print(f"  Scanning {year}-{month:02d}...")
    
    output = run_gog(f'gmail search "{query}" --account {ACCOUNT} --max 500 --json')
    
    try:
        data = json.loads(output)
        threads = data.get("threads", [])
    except:
        threads = []
    
    results = {
        "total": len(threads),
        "spam": 0,
        "finance": 0,
        "invoices": 0,
        "newsletters": 0,
        "dev": 0,
        "health": 0,
        "action_required": 0,
        "personal": 0,
        "unknown": 0,
        "samples": {"spam": [], "unknown": []}
    }
    
    for email in threads:
        category, confidence = categorize_by_rules(email)
        if category is None:
            category = "unknown"
        results[category] += 1
        
        # Keep samples for review
        if category == "spam" and len(results["samples"]["spam"]) < 3:
            results["samples"]["spam"].append(email.get("from", "")[:50])
        if category == "unknown" and len(results["samples"]["unknown"]) < 5:
            results["samples"]["unknown"].append({
                "from": email.get("from", "")[:50],
                "subject": email.get("subject", "")[:50]
            })
    
    return results


def full_year_scan():
    """Scan the entire past year"""
    print("="*60)
    print("FULL YEAR EMAIL SCAN")
    print("="*60)
    
    now = datetime.now()
    all_results = []
    totals = {
        "spam": 0, "finance": 0, "invoices": 0, "newsletters": 0,
        "dev": 0, "health": 0, "action_required": 0, "personal": 0, "unknown": 0
    }
    
    # Scan last 12 months
    for i in range(12):
        date = now - timedelta(days=30*i)
        results = scan_month(date.year, date.month)
        all_results.append(results)
        
        for cat in totals:
            totals[cat] += results.get(cat, 0)
        
        print(f"    Found {results['total']} emails: spam={results['spam']}, dev={results['dev']}, unknown={results['unknown']}")
    
    # Summary
    total_emails = sum(r["total"] for r in all_results)
    print("\n" + "="*60)
    print("FINAL SUMMARY - Past 12 Months")
    print("="*60)
    print(f"Total emails scanned: {total_emails}")
    print()
    
    for cat, count in sorted(totals.items(), key=lambda x: -x[1]):
        pct = (count / total_emails * 100) if total_emails > 0 else 0
        bar = "█" * int(pct / 2)
        print(f"  {cat:20} {count:5} ({pct:5.1f}%) {bar}")
    
    # Unknown samples for review
    print("\n" + "="*60)
    print("UNKNOWN EMAILS (need rules or AI):")
    print("="*60)
    for r in all_results[:3]:  # First 3 months
        for sample in r.get("samples", {}).get("unknown", []):
            print(f"  From: {sample['from']}")
            print(f"  Subject: {sample['subject']}")
            print()
    
    # Save results
    output_file = f"/home/alexliv/.openclaw/workspace/email-organizer/scan_results_{now.strftime('%Y%m%d')}.json"
    with open(output_file, "w") as f:
        json.dump({
            "scan_date": now.isoformat(),
            "totals": totals,
            "monthly": all_results
        }, f, indent=2)
    print(f"\nResults saved to: {output_file}")
    
    return totals


if __name__ == "__main__":
    full_year_scan()
