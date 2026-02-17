Here are the precise, copy-paste instructions for your AI Image and Video generators.

These prompts are tuned for the **"Right-Side Presenter"** layout: a full 16:9 frame where the character occupies the bottom-right area (approx 1/3 height), leaving the rest of the screen open for your presentation slides.

---

### 🎨 Phase 1: Image Generation (Midjourney / DALL-E 3)

**Goal:** Generate the "Anchor Frame" first. This is the source of truth for the character's look and position.

**Settings:**

- **Aspect Ratio:** `--ar 16:9` (Wide)
- **Style:** Niji 6 (if using Midjourney) or "Vector Illustration"

#### 1. The Master Anchor Prompt

> **Prompt:**
> "A wide cinematic 16:9 shot in high-quality 2D vector animation style. Solid neon green background (#00FF00).
> **The Scene:** There is a character standing on the **far right side** of the frame (at the 80% mark). The rest of the screen to his left is completely empty green space.
> **The Character:** A tech-savvy man named Alex. He is approximately **35% of the total image height**. He has a full **salt-and-pepper beard** (dark brown mixed with grey) and **thick black rectangular glasses**. He has dark hair swept back with grey temples. He wears a **bright red t-shirt with a large yellow lightning bolt** (Shazam logo), dark blue jeans, and **bright yellow sneakers**.
> **The Pose:** He is holding a **black handheld microphone** in his right hand at chest level. He is facing the camera directly, smiling professionally. Flat shading, crisp thick outlines."

**Action:** Generate this image until you get the perfect "Alex". **Save this image.** Let's call it `anchor_alex.png`.

---

### 🎥 Phase 2: Video Generation (Luma Dream Machine / Runway Gen-3)

**Goal:** Create the movement. You will need to upload `anchor_alex.png` as a reference to keep the face consistent.

**Technical Constraints:**

- **Resolution:** 1920x1080 (16:9)
- **Duration:** 5 seconds (standard generation)
- **Looping:** For Idle/Talk, use the "Loop" feature if available, or use the same image as Start and End.

#### 1. Video: The Entrance (Walk Left to Right)

- **Input Image (End Frame):** `anchor_alex.png`
- **Input Image (Start Frame):** _Leave empty (Text to Video)_ OR create a version of the anchor image where he is barely visible on the far left edge.
- **Prompt:**
  > "Wide angle 2D animation. The character enters from the **far left edge** of the screen. He walks confidently all the way across the floor to the **right side**. He walks with a rhythmic, energetic stride. He stops at the exact spot shown in the end frame, turns to face the camera, and smiles. He holds the microphone securely. The green background remains perfectly static."

#### 2. Video: The Idle Loop (Standing Still)

- **Input Image (Start Frame):** `anchor_alex.png`
- **Input Image (End Frame):** `anchor_alex.png`
- **Prompt:**
  > "Seamless 2D animation loop. The character stands in place on the right side. He breathes naturally (chest rise and fall). He blinks his eyes. He shifts his weight slightly but **does not move his feet**. He holds the microphone steady. The green background is static."

#### 3. Video: The Talking Loop (Speaking)

- **Input Image (Start Frame):** `anchor_alex.png`
- **Input Image (End Frame):** `anchor_alex.png`
- **Prompt:**
  > "Seamless 2D animation loop. The character, standing on the right, raises the microphone slightly and speaks. His mouth moves in a talking rhythm. He uses his **free left hand** to make expressive 'explaining' gestures (open palm, pointing). He nods his head. He returns to the neutral pose at the end. Green background static."

#### 4. Video: The Exit (Walk Right to Left)

- **Input Image (Start Frame):** `anchor_alex.png`
- **Input Image (End Frame):** _Leave empty_ (or use an image of empty green screen).
- **Prompt:**
  > "Wide angle 2D animation. The character turns to his left and walks all the way back across the screen. He walks from the right side to the **far left edge**. He waves goodbye with his free hand (non-mic hand) over his shoulder as he walks away. He continues walking until he exits the frame completely. Green background static."

---

### ⚡ Critical Tips for Best Results

1. **The "Drift" Fix:** If the AI makes the character slowly slide across the screen during the `Idle` or `Talk` videos, reject it. The feet must look "glued" to the floor for the overlay to work.
2. **Mic Consistency:** Watch the microphone hand. AI sometimes morphs the mic into a coffee cup or disappears it. Ensure the black mic is visible in every video.
3. **Background Removal:** Since you generated a solid `#00FF00` background, you can use a tool like **Unscreen.com**, **CapCut**, or **Adobe After Effects** (Keylight) to remove the green and export as **WebM with Alpha**. This is much better for React performance than doing green-screen removal in the browser.
