# Video Generation Spec — AlexBot Character Animations

## Overview

Generate 4 short character animation videos for use in a React presentation app. The character appears as a small presenter in the bottom-right corner of a 1920×1080 slide deck, composited via chroma key (green screen removal in a `<canvas>`).

---

## Technical Requirements

| Property | Value |
|---|---|
| **Video Resolution** | 1280×720 (720p, 16:9) |
| **Background** | Solid green screen `#00FF00` |
| **Format** | MP4 (H.264) or WebM |
| **Frame Rate** | 24–30 fps |
| **Duration** | 3–5 seconds per clip |

### Character Proportions at 720p

| Property | Value |
|---|---|
| Character height | ~100px (~14% of frame height) |
| Feet position | Bottom of frame, y ≈ 705 |
| Standing position (x) | ~1100 (right side, ~86% across) |
| Empty space above | ~84% of frame is green |

> **Why 720p?** Most AI video generators default to 720p or 1080p at 16:9. At 720p the character is small but crisp enough. The app scales the video down further when compositing onto the 1920×1080 presentation.

### Fallback

If your generator requires 1080p (1920×1080), generate at that resolution with the character occupying the **bottom 15%** of the frame, standing at x ≈ 1650.

---

## Character Design — "AlexBot"

A stylized 2D vector-art man. **Bold, flat-shaded, thick outlines** — designed to read clearly at small sizes.

### Appearance

| Feature | Description |
|---|---|
| **Build** | Medium, slightly stocky |
| **Skin** | Warm tan (`#D4A574`) |
| **Hair** | Dark brown (`#2C1810`), swept back with volume, grey at temples |
| **Beard** | Full salt-and-pepper — dark brown base (`#3E2723`) with grey streaks (`#B0B0B0`) |
| **Glasses** | Thick black rectangular frames, bridge across nose |
| **Eyes** | Cyan irises (`#00BCD4`) behind glasses, dark pupils |
| **Shirt** | Red t-shirt (`#DC143C`) with a yellow lightning bolt (`#FFD700`) on the chest (Shazam-style) |
| **Pants** | Dark blue-grey jeans (`#4A5568` → `#2D3748` gradient) |
| **Shoes** | Bright yellow sneakers (`#FFD700`) |
| **Microphone** | Black handheld mic in right hand — dark grey handle (`#555`), darker head (`#333`) |

### Critical Design Notes

1. **No green on the character.** Zero green pixels — the chroma key will erase them.
2. **Bold design for small scale.** Thick outlines (3–4px equivalent), high contrast colors, simple shapes. The character will display at ~100–150px tall on screen.
3. **Consistency across all 4 videos.** Same proportions, same colors, same face. Use a reference/anchor frame.
4. **Microphone must be visible** in every video. AI generators sometimes morph it into other objects.

---

## Video Files

### 1. `walk-in.mp4` — Entrance

| Property | Value |
|---|---|
| Duration | 3–4 seconds |
| Motion | Character walks in from the right edge of frame, stops at standing position (x ≈ 1100) |

**Prompt:**
> Wide 2D vector animation on solid #00FF00 green background. A small character (about 14% of frame height) enters from the far right edge. He walks left with a confident, rhythmic stride to about the 86% mark horizontally. He stops, turns to face the camera, and settles into a neutral standing pose. He holds a black microphone in his right hand. Flat shading, thick outlines, no shadows on background.

### 2. `idle.mp4` — Standing Loop

| Property | Value |
|---|---|
| Duration | 3–5 seconds (seamless loop) |
| Motion | Subtle breathing, blinking, slight weight shift. Feet stay planted. |

**Prompt:**
> Seamless looping 2D vector animation on solid #00FF00 green. A small character stands at the 86% horizontal mark, near the bottom of the frame. He breathes naturally (subtle chest rise/fall), blinks occasionally, shifts weight slightly. Feet stay glued to the floor — no drift. He holds a black microphone at his side. Flat shading, thick outlines.

### 3. `talk.mp4` — Speaking Loop

| Property | Value |
|---|---|
| Duration | 3–5 seconds (seamless loop) |
| Motion | Mouth moves, free hand gestures, head nods. Mic raised slightly. |

**Prompt:**
> Seamless looping 2D vector animation on solid #00FF00 green. The character stands at the 86% mark, speaking. His mouth moves in a natural talking rhythm. He raises the microphone slightly with his right hand. His free left hand makes expressive "explaining" gestures (open palm, pointing). He nods his head occasionally. Returns to neutral at loop point. Flat shading, thick outlines.

### 4. `walk-out.mp4` — Exit

| Property | Value |
|---|---|
| Duration | 3–4 seconds |
| Motion | Character turns left and walks off the left edge of frame. |

**Prompt:**
> Wide 2D vector animation on solid #00FF00 green. The character, standing at the 86% mark, turns to his left and walks across the frame toward the left edge. He waves goodbye over his shoulder with his free hand as he walks. He exits the frame completely. Flat shading, thick outlines, no shadows on background.

---

## Post-Processing

After generating videos:

1. **Green screen removal** — Use Unscreen.com, CapCut, or After Effects (Keylight) to key out `#00FF00`
2. **Export as WebM with alpha channel** — This is critical for overlay compositing in the browser
3. **File naming** — Place in `public/video/`:
   - `public/video/walk-in.webm`
   - `public/video/idle.webm`
   - `public/video/talk.webm`
   - `public/video/walk-out.webm`

> **Browser compositing alternative:** If WebM-with-alpha isn't feasible, the app includes a canvas-based chroma key shader that removes `#00FF00` in real-time from regular MP4 files. This is the fallback approach.

---

## Quality Checklist

- [ ] Character is consistent across all 4 videos (same face, proportions, colors)
- [ ] No green pixels on the character
- [ ] Microphone is visible and consistent
- [ ] Idle and talk loops are seamless (no visible jump at loop point)
- [ ] Character stays at correct position (no drift in idle/talk)
- [ ] Background is pure `#00FF00` with no gradients or noise
- [ ] Character reads clearly when scaled down to ~100px tall
