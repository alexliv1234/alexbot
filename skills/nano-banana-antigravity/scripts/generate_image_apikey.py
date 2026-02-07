#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "requests>=2.28.0",
#     "pillow>=10.0.0",
# ]
# ///
"""
Generate images using Google Gemini with direct API key (no OAuth needed).

Usage:
    uv run generate_image_apikey.py --prompt "your image description" --filename "output.png"
    uv run generate_image_apikey.py --prompt "edit this" --filename "output.png" -i input.png
"""

import argparse
import base64
import json
import os
import sys
import time
from pathlib import Path
from typing import Optional

# Default API key (can be overridden with GOOGLE_API_KEY env var)
DEFAULT_API_KEY = "AIzaSyCWXInZURhPrgYXC1ZH9BiztTW4bMhKA8o"

# Gemini API endpoint for image generation
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"

# Models to try (in order of preference)
IMAGE_MODELS = [
    "gemini-2.0-flash-exp-image-generation",  # Primary - fast image generation
    "gemini-2.0-flash-preview-image-generation",  # Alternative
]


def generate_image(
    api_key: str,
    prompt: str,
    input_images: Optional[list[Path]] = None,
    aspect_ratio: str = "1:1",
    image_size: str = "2K",
) -> tuple[bytes, str]:
    """Generate an image using Gemini's image generation."""
    import requests
    
    # Build content parts
    parts = [{"text": prompt}]
    
    # Add input images for editing
    if input_images:
        for img_path in input_images:
            if img_path.exists():
                img_data = base64.b64encode(img_path.read_bytes()).decode()
                mime_type = "image/png" if img_path.suffix.lower() == ".png" else "image/jpeg"
                parts.append({
                    "inlineData": {
                        "data": img_data,
                        "mimeType": mime_type,
                    }
                })
    
    last_error = None
    
    for model in IMAGE_MODELS:
        try:
            print(f"Trying model: {model}", file=sys.stderr)
            
            # Build request for Gemini generateContent
            request_body = {
                "contents": [{"parts": parts}],
                "generationConfig": {
                    "responseModalities": ["TEXT", "IMAGE"],
                },
            }
            
            url = f"{GEMINI_API_BASE}/models/{model}:generateContent?key={api_key}"
            
            response = requests.post(
                url,
                json=request_body,
                headers={"Content-Type": "application/json"},
                timeout=120,
            )
            
            if response.status_code == 429:
                print(f"Rate limited on {model}, trying next...", file=sys.stderr)
                last_error = "Rate limited"
                continue
            
            if response.status_code == 404:
                print(f"Model {model} not found, trying next...", file=sys.stderr)
                last_error = "Model not found"
                continue
            
            if not response.ok:
                last_error = f"HTTP {response.status_code}: {response.text[:500]}"
                print(f"Error: {last_error}", file=sys.stderr)
                continue
            
            data = response.json()
            
            if "error" in data:
                last_error = f"{data['error'].get('code')}: {data['error'].get('message')}"
                print(f"API error: {last_error}", file=sys.stderr)
                continue
            
            # Extract image from response
            candidates = data.get("candidates", [])
            for candidate in candidates:
                parts = candidate.get("content", {}).get("parts", [])
                for part in parts:
                    inline_data = part.get("inlineData", {})
                    if inline_data.get("data") and inline_data.get("mimeType", "").startswith("image/"):
                        image_bytes = base64.b64decode(inline_data["data"])
                        mime_type = inline_data["mimeType"]
                        print(f"Success with model: {model}", file=sys.stderr)
                        return image_bytes, mime_type
            
            last_error = "No image in response"
            print(f"No image found in response from {model}", file=sys.stderr)
            
        except requests.exceptions.Timeout:
            print(f"Timeout on {model}, trying next...", file=sys.stderr)
            last_error = "Timeout"
            continue
        except Exception as e:
            last_error = str(e)
            print(f"Exception with {model}: {e}", file=sys.stderr)
            continue
    
    raise Exception(f"All models failed. Last error: {last_error}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate images using Gemini with API key"
    )
    parser.add_argument(
        "--prompt", "-p",
        required=True,
        help="Image description/prompt"
    )
    parser.add_argument(
        "--filename", "-f",
        required=True,
        help="Output filename (e.g., sunset-mountains.png)"
    )
    parser.add_argument(
        "--input-image", "-i",
        action="append",
        dest="input_images",
        metavar="IMAGE",
        help="Input image path(s) for editing. Can be specified multiple times."
    )
    parser.add_argument(
        "--aspect-ratio", "-a",
        choices=["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
        default="1:1",
        help="Aspect ratio (default: 1:1)"
    )
    parser.add_argument(
        "--resolution", "-r",
        choices=["1K", "2K", "4K"],
        default="2K",
        help="Output resolution: 1K, 2K (default), or 4K"
    )
    parser.add_argument(
        "--api-key", "-k",
        default=None,
        help="Google API key (defaults to GOOGLE_API_KEY env var or built-in)"
    )
    
    args = parser.parse_args()
    
    # Get API key
    api_key = args.api_key or os.environ.get("GOOGLE_API_KEY") or DEFAULT_API_KEY
    
    print(f"Using Google AI API key: {api_key[:10]}...{api_key[-4:]}", file=sys.stderr)
    
    # Parse input images
    input_images = None
    if args.input_images:
        input_images = [Path(p) for p in args.input_images]
        for p in input_images:
            if not p.exists():
                print(f"Warning: Input image not found: {p}", file=sys.stderr)
    
    # Generate image
    print(f"Generating image...", file=sys.stderr)
    print(f"Prompt: {args.prompt[:100]}{'...' if len(args.prompt) > 100 else ''}", file=sys.stderr)
    
    try:
        image_bytes, mime_type = generate_image(
            api_key=api_key,
            prompt=args.prompt,
            input_images=input_images,
            aspect_ratio=args.aspect_ratio,
            image_size=args.resolution,
        )
        
        # Determine output path
        output_path = Path(args.filename)
        if not output_path.is_absolute():
            output_path = Path.cwd() / output_path
        
        # Ensure correct extension based on mime type
        ext = ".jpg" if "jpeg" in mime_type else ".png"
        if output_path.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
            output_path = output_path.with_suffix(ext)
        
        # Save image
        output_path.write_bytes(image_bytes)
        
        size_kb = len(image_bytes) / 1024
        print(f"Image saved: {output_path} ({size_kb:.1f} KB)", file=sys.stderr)
        
        # Output MEDIA line for OpenClaw
        print(f"MEDIA:{output_path}")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
