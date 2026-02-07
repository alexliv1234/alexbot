# WhatsApp Activity Log

This directory tracks all WhatsApp conversations for context and summaries.

## Structure

- `contacts/` — Per-contact conversation logs (e.g., `yonatan-pick.md`)
- `daily/` — Daily summaries (e.g., `2026-01-31.md`)
- `directory.json` — Contact directory (number → name mapping)

## Usage

- Every WhatsApp message gets logged to the relevant contact file
- Daily summaries generated during morning routine
- Search with `grep` or memory_search for context
