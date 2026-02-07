#!/usr/bin/env python3
"""Process a call recording: transcribe and summarize."""

import sys
import os
import json
from pathlib import Path
from datetime import datetime

# Add venv to path
venv_path = Path.home() / "whisper-venv" / "lib" / "python3.12" / "site-packages"
if venv_path.exists():
    sys.path.insert(0, str(venv_path))

from faster_whisper import WhisperModel

WORKSPACE = Path.home() / ".openclaw" / "workspace"
RECORDINGS_DIR = WORKSPACE / "memory" / "call-recordings"
SUMMARIES_DIR = WORKSPACE / "memory" / "call-summaries"
STATE_FILE = Path(__file__).parent / "state.json"

def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"processedFiles": [], "lastCheck": None}

def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))

def transcribe(audio_path: Path, language: str = "he") -> str:
    """Transcribe audio file using faster-whisper."""
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, info = model.transcribe(str(audio_path), language=language)
    
    text_parts = []
    for segment in segments:
        text_parts.append(segment.text.strip())
    
    return " ".join(text_parts)

def process_recording(audio_path: Path, file_id: str = None) -> dict:
    """Process a single recording."""
    SUMMARIES_DIR.mkdir(parents=True, exist_ok=True)
    
    # Transcribe
    print(f"Transcribing: {audio_path.name}")
    transcript = transcribe(audio_path)
    
    # Parse filename for metadata
    # Format: "תא קולי (+972522999080) [2026-02-02 00-45-19] [Outgoing].m4a"
    filename = audio_path.stem
    
    # Create summary
    summary = {
        "file": audio_path.name,
        "processed_at": datetime.now().isoformat(),
        "transcript": transcript,
        "language": "he"
    }
    
    # Save summary
    summary_file = SUMMARIES_DIR / f"{datetime.now().strftime('%Y-%m-%d')}_{audio_path.stem}.json"
    summary_file.write_text(json.dumps(summary, indent=2, ensure_ascii=False))
    
    print(f"Summary saved: {summary_file}")
    return summary

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: process-recording.py <audio_file>")
        sys.exit(1)
    
    audio_path = Path(sys.argv[1])
    if not audio_path.exists():
        print(f"File not found: {audio_path}")
        sys.exit(1)
    
    result = process_recording(audio_path)
    print(f"\nTranscript: {result['transcript']}")
