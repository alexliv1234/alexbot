# Avatar Generation Instructions for AlexBot Presentation Character

## ⚠️ KEY REQUIREMENTS SUMMARY

**CRITICAL**: This must be a **FULL BODY character** (head to feet), NOT just head and torso.

**MUST HAVE**:
- ✅ Complete body: Head, torso, arms, legs, feet
- ✅ **Walking animation**: Legs alternate in walking-in-place motion
- ✅ Feet coordinate with leg movement
- ✅ Character walks IN when appearing, walks OUT when finishing
- ✅ Different entry animation each time (6 types randomly selected)
- ✅ Based on reference photos (stylized/caricature style)

---

## Overview

You are generating a **personalized animated character** for a presentation web app. This character is a **digital twin/avatar** that represents the user during their tech talk about "AlexBot" (a personal AI assistant).

### Character Requirements

- **Full Body Character**: Complete character from head to feet (NOT just head and torso)
- **Style**: Animation/comic/caricature style (think: stylized tech YouTuber avatar, South Park-esque, or modern web comic character)
- **Not realistic**: Exaggerated features, simplified shapes, bold outlines
- **Personality**: Tech-savvy, slightly sarcastic, confident but approachable
- **Technical**: Must be SVG-based with inline SMIL animations
- **Animated Movement**: Character walks in when speaking, walks out when finished
- **Context**: Represents the creator of AlexBot - tech-related but human, NOT a literal robot

---

## Technical Requirements

### SVG Structure

**Canvas Specifications**:

- ViewBox: `0 0 300 300` (300x300px square canvas)
- Format: Self-contained SVG component
- File structure: React TSX component with default export

**Component Signature**:

```typescript
export default function BotCharacter() {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Character elements here */}
    </svg>
  );
}
```

---

## Required Visual Elements

Your character **MUST** include these functional elements (adapt styling to match reference photos):

### 1. Head/Face (Y: 50-140)

- Main head shape based on reference photos
- Should fill roughly upper portion of canvas
- Include recognizable facial features from photos
- Use simplified geometric shapes (circle, oval, rounded rectangle)

### 2. Eyes (2 elements with animation)

- **Position**: Upper-middle of head (around Y: 120-140)
- **Must animate**: Pulsing/blinking to show "awareness"
- **Color**: Cyan (#00BCD4) recommended, or match character design
- **Animation**: Radius/scale pulse (2s loop, subtle)

**Example Animation**:

```xml
<circle cx="115" cy="130" r="15" fill="#00BCD4">
  <animate attributeName="r" values="15;17;15" dur="2s" repeatCount="indefinite"/>
</circle>
```

### 3. Pupils (optional but recommended)

- Small dark circles or shapes within eyes
- Fill: Dark navy (#1A1A2E)
- Static or with subtle animation

### 4. Mouth/Speaking Indicator (CRITICAL)

- **Must visually change when speaking**
- Options:
  - Animated path that morphs (like waveform)
  - Multiple mouth positions that cycle
  - Speech lines/effects near mouth
- **Animation**: 0.6-1.0s loop
- **Should be obvious** when active

**Example Animation**:

```xml
<path d="M 100 180 Q 125 165 150 180 T 200 180" stroke="#FFD700" strokeWidth="3" fill="none" strokeLinecap="round">
  <animate
    attributeName="d"
    values="M 100 180 Q 125 165 150 180 T 200 180;
            M 100 180 Q 125 195 150 180 T 200 180;
            M 100 180 Q 125 165 150 180 T 200 180"
    dur="0.6s"
    repeatCount="indefinite"
  />
</path>
```

### 5. Hair/Head Features

- Replicate user's hairstyle in stylized form from reference photos
- Use simplified shapes/paths
- Can be static or with subtle animation (e.g., slight sway)
- **This is a key identifier** - make it recognizable

### 6. Body/Torso (Y: 140-200)

- Upper and middle torso
- Based on user's typical clothing style from photos
- Can include:
  - T-shirt/hoodie outline
  - Visible collar or neckline
  - Tech-related accessories (headphones, smartwatch, glasses)
  - Shirt design/logos (simplified)

### 7. Arms (Y: 140-220)

- **Two arms** positioned naturally at sides or in relaxed pose
- Simplified shapes (can be simple lines with rounded ends or basic geometric shapes)
- Should match clothing style (sleeves, bare arms, etc.)
- Can be slightly animated (subtle sway or gesture)
- **Optional**: Hands can be simplified (mittens, simple shapes, or detailed fingers - your choice)

### 8. Legs (Y: 200-280)

- **Two legs** - CRITICAL for walking animation
- Simplified shapes based on reference photos
- Match clothing style (pants, jeans, shorts)
- Should have **alternating movement** to convey walking motion
- Use simple shapes (rounded rectangles, capsule shapes)

### 9. Feet (Y: 270-290)

- **Two feet** at base of character
- Simplified shoe shapes or basic foot outlines
- Should coordinate with walking leg animation
- Can be simple ovals, rounded rectangles, or shoe-like shapes
- Color should match typical footwear from photos

### 10. Status/Indicator Lights (3 small elements)

- Small glowing circles or LEDs somewhere on character
- **Placement suggestions**:
  - On shirt/chest
  - On accessories (headphones, glasses)
  - Floating near character
- **Must have 3 lights with different pulse timings**
- **Colors**:
  - Light 1: Cyan (#00BCD4) - 1.0s cycle
  - Light 2: Green (#4CAF50) - 1.2s cycle
  - Light 3: Red (#FF5252) - 0.8s cycle

**Example Implementation**:

```xml
<circle cx="125" cy="260" r="4" fill="#00BCD4">
  <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/>
</circle>
<circle cx="150" cy="260" r="4" fill="#4CAF50">
  <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite"/>
</circle>
<circle cx="175" cy="260" r="4" fill="#FF5252">
  <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite"/>
</circle>
```

### 11. Speech Bubble Indicator (3 floating elements)

- Three small circles that float/bob when character is speaking
- **Position**: To the side of character's head (right side)
- **Sizes**: Small (r=3), Medium (r=5), Large (r=7)
- **Animation**: Vertical bobbing with staggered timing
- **Color**: Gold (#FFD700)
- **Opacity**: 0.8

**Example Implementation**:

```xml
<g class="speech-indicator" opacity="0.8">
  <circle cx="230" cy="110" r="3" fill="#FFD700">
    <animate attributeName="cy" values="110;105;110" dur="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="245" cy="100" r="5" fill="#FFD700">
    <animate attributeName="cy" values="100;95;100" dur="1s" begin="0.2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="265" cy="95" r="7" fill="#FFD700">
    <animate attributeName="cy" values="95;90;95" dur="1s" begin="0.4s" repeatCount="indefinite"/>
  </circle>
</g>
```

---

## Color Palette

### Primary Colors (use for highlights/accents)

- **Gold**: `#FFD700` - Primary accent (borders, highlights, important elements)
- **Cyan**: `#00BCD4` - Secondary accent (eyes, tech elements, status lights)

### Status Indicator Colors

- **Cyan**: `#00BCD4` (status light 1)
- **Green**: `#4CAF50` (status light 2)
- **Red**: `#FF5252` (status light 3)

### Character Base Colors (adapt to reference photos)

- **Skin tone**: Match reference photos (use appropriate HSL/hex values)
- **Hair color**: Match reference photos
- **Clothing colors**: Match reference photos or user's typical style
- **Background/gradient fills**: Dark blue/purple shades (#2A2A4E to #1A1A2E)

### Outline/Stroke

- Use **Gold (#FFD700)** for main character outlines (2-3px stroke-width)
- Creates comic/cartoon aesthetic with bold outlines
- Use darker colors (#1A1A2E) for inner details and facial features

---

## Design Guidelines

### Comic/Animation Aesthetic

**Visual Style**:

- **Bold outlines**: 2-3px gold stroke around main shapes
- **Simplified shapes**: Use basic geometric shapes (circles, rounded rectangles, simple paths)
- **Flat colors**: Solid fills with optional subtle gradients
- **Exaggerated features**: Larger eyes, simplified nose, expressive mouth
- **Clean lines**: Smooth curves, avoid excessive detail

**Caricature Approach**:

- Emphasize distinctive features from reference photos
- Slightly enlarge head proportions (50-60% of total height)
- Simplify clothing to iconic elements (e.g., just collar + color block)
- Add 1-2 signature items (glasses, headphones, watch, specific shirt style)

**Tech Aesthetic**:

- Include subtle tech elements:
  - LED indicator lights (the 3 status lights)
  - Geometric accents (hexagons, sharp angles in accessories)
  - Modern/minimalist clothing style
  - Optional: Circuit board patterns as background detail
- **Avoid overly futuristic/sci-fi** - this is a real person, not a robot

### Facial Expression

**Default Expression** (Character at rest):

- **Neutral/slight smile**: Approachable but not overly excited
- **Direct eye contact**: Pupils centered, looking forward
- **Raised eyebrows** (optional): Suggests curiosity/engagement
- **Relaxed posture**: Shoulders aligned, head upright

**Note**: Mouth will animate automatically via SMIL. Eyes pulse continuously. Overall character should maintain confident, engaging presence.

---

## Proportions and Layout

### Vertical Layout (Y-axis positioning guide) - FULL BODY

- **0-40px**: Empty space / top margin
- **40-140px**: HEAD/FACE
  - 40-60px: Hair top / head top
  - 80-100px: Eyes (horizontal centers ~115 and ~185)
  - 115-130px: Mouth area
  - 130-140px: Chin/neck
- **140-200px**: TORSO/UPPER BODY
  - 140-160px: Shoulders/collar
  - 160-190px: Chest/torso (status lights here)
  - Arms extend from ~140-220px alongside torso
- **200-280px**: LEGS
  - 200-230px: Upper legs/thighs
  - 230-260px: Lower legs/calves
  - 260-280px: Ankles
  - **IMPORTANT**: Legs should be able to animate in alternating pattern for walking
- **280-295px**: FEET
  - Simple shoe/foot shapes at base
  - Should touch or be near bottom of character
- **295-300px**: Empty space / bottom margin

### Horizontal Layout (X-axis)

- Character should be **centered horizontally** on 300px canvas
- Head center: ~150px
- Body center: ~150px
- Legs: Left leg ~130px, Right leg ~170px (or similar spacing)
- Feet positioned under legs
- If asymmetric (e.g., hair swept to one side), balance overall visual weight

### Element Sizing - FULL BODY

- **Head width**: 80-100px (smaller to fit full body)
- **Eyes spacing**: 20-30px apart (centers at ~135, ~165 or similar)
- **Eye radius**: 8-12px (proportional to smaller head)
- **Mouth width**: 50-70px
- **Body/torso width**: 80-100px
- **Leg width**: 15-25px each (simple shapes)
- **Feet length**: 20-30px
- **Overall character height**: ~250-260px (leaves room for margins)

---

## Visual Style References

### Good Style Examples (Conceptual)

- **South Park style**: Simple geometric shapes, bold outlines, flat colors
- **Scott Pilgrim comics**: Angular features, expressive eyes, stylized hair
- **Modern tech YouTuber avatars**: Recognizable without excessive details, exaggerated features
- **Corporate illustration styles** (e.g., Google Doodles): Clean, friendly, geometric

### What to Capture from Reference Photos

1. **Hairstyle**: Color, length, parting, general shape (simplified to 2-3 main shapes)
2. **Face shape**: Round, oval, square, angular (translate to basic geometric shape)
3. **Glasses** (if present): Simple frames, can be slightly exaggerated size
4. **Facial hair** (if present): Simplified solid shapes for beard/mustache
5. **Clothing style**: Casual (t-shirt), formal (collared shirt), tech (hoodie)
6. **Distinctive features**: Anything that makes the person immediately recognizable

**Key principle**: "I could identify this person from this avatar" NOT "This looks exactly like a photo"

---

## Reference Photo Analysis - Alex's Appearance

Based on the provided reference photo, the character MUST include these specific features:

### Facial Features

- **Face Shape**: Oval to rectangular face shape (use rounded rectangle or elongated oval as base)
- **Skin Tone**: Light-medium, olive/warm complexion (suggested hex: #D4A574 or similar warm skin tone)
- **Glasses**: **BLACK THICK-FRAMED RECTANGULAR GLASSES** - This is a **SIGNATURE FEATURE**, must be prominent
  - Bold black frames (#000000)
  - Rectangular/square shape
  - Slightly oversized for comic effect
  - Should frame the eyes prominently
- **Facial Hair**: **Full, thick salt-and-pepper beard** - VERY DISTINCTIVE
  - Covers chin and cheeks fully
  - Well-groomed appearance
  - **Color mix**: Dark brown (#3E2723) and gray/white (#B0B0B0) - create texture with both colors
  - Should be recognizable as mature/distinguished look

### Hair

- **Color**: Dark brown to black (#2C1810)
- **Style**: Medium length, swept back with volume
- **Texture**: Slightly wavy/tousled, not perfectly straight
- **Key feature**: Creates distinctive silhouette with height/volume on top
- **Simplification**: Use 2-3 main shapes for hair mass

### Clothing - ICONIC ELEMENT ⚡

- **Shirt**: **RED T-SHIRT** (#DC143C or #C41E3A - vibrant red)
- **Graphic**: **LARGE YELLOW LIGHTNING BOLT** center chest (#FFD700 - perfect match with theme gold!)
- **Logo**: "SHAZAM!" text below lightning bolt (optional but adds character)
- **Style**: Crew neck, short sleeves, casual fit
- **Significance**: Inspired by Shazam superhero - shows tech/geek culture personality
- **Visual impact**: High contrast red + yellow makes character instantly recognizable

### Body Type

- Average to stocky build
- Shoulders visible, relaxed posture
- Confident stance

### Lower Body (for full body character)

- **Pants**: Likely casual pants (jeans or khakis) - use blue (#4A5568) or tan (#C0A080)
- **Shoes**: Casual footwear (sneakers) - use simple shapes, dark colors (#2D3748) or white/gray

### Personality Vibe

- **Expression**: Confident, serious but approachable
- **Demeanor**: Tech professional with superhero/geek culture aesthetic
- **Energy**: Focused but friendly
- **Style**: "Casual tech worker who loves comic books"

### Color Palette from Reference Photo

**Primary Character Colors**:
- **Shirt Red**: #DC143C or #C41E3A (vibrant red)
- **Lightning Bolt Yellow**: #FFD700 (matches presentation theme gold!)
- **Hair**: Dark brown/black #2C1810
- **Beard**: Mix of #3E2723 (dark brown) and #B0B0B0 (gray/white)
- **Glasses Frames**: Black #000000 (thick, bold)
- **Skin**: Olive/warm tone #D4A574 or #C8997E
- **Pants**: Blue denim #4A5568 or khaki #C0A080
- **Shoes**: Dark gray/black #2D3748 or white #F7FAFC

### Most Distinctive Features (Priority Order)

1. **BLACK THICK-FRAMED GLASSES** - Absolute must-have, makes character instantly recognizable
2. **Salt-and-pepper beard** - Full, thick, distinguished look
3. **Red shirt with yellow lightning bolt** - Iconic Shazam reference, high visual impact
4. **Swept-back dark hair** - Creates distinctive silhouette
5. **Confident expression** - Slight seriousness with approachability

---

## Animation Requirements

### Animations to Include (SMIL)

You must implement these using SVG `<animate>` or `<animateTransform>` elements:

1. **Eye pulsing** - Continuous awareness indicator (2s cycle)
2. **Mouth morphing** - Continuous speaking indicator (0.6-1.0s cycle)
3. **Status lights** - 3 independent pulses with different timings
4. **Speech bubbles** - Vertical bobbing with staggered delays
5. **WALKING ANIMATION** - CRITICAL - Legs and feet alternating movement

### Walking Animation (CRITICAL REQUIREMENT)

The character must have a **continuous walking-in-place animation** for the legs and feet. This creates the illusion of walking when combined with the horizontal entry motion provided by React.

**Walking Cycle Specifications**:

- **Duration**: 0.8-1.2s per full cycle (both legs complete one step)
- **Pattern**: Alternating leg movement (when left leg forward, right leg back, and vice versa)
- **Continuous**: Animation runs perpetually with `repeatCount="indefinite"`

**Example Walking Animation for Legs**:

```xml
<!-- Left Leg - moves forward and back -->
<rect id="leftLeg" x="130" y="200" width="20" height="80" rx="10" fill="[pants-color]">
  <animateTransform
    attributeName="transform"
    type="translate"
    values="0,0; 8,0; 0,0; -8,0; 0,0"
    dur="1s"
    repeatCount="indefinite"
  />
</rect>

<!-- Right Leg - opposite phase to left leg -->
<rect id="rightLeg" x="170" y="200" width="20" height="80" rx="10" fill="[pants-color]">
  <animateTransform
    attributeName="transform"
    type="translate"
    values="0,0; -8,0; 0,0; 8,0; 0,0"
    dur="1s"
    repeatCount="indefinite"
  />
</rect>

<!-- Left Foot - coordinates with left leg -->
<ellipse id="leftFoot" cx="140" cy="285" rx="15" ry="8" fill="[shoe-color]">
  <animateTransform
    attributeName="transform"
    type="translate"
    values="0,0; 8,0; 0,0; -8,0; 0,0"
    dur="1s"
    repeatCount="indefinite"
  />
</ellipse>

<!-- Right Foot - coordinates with right leg -->
<ellipse id="rightFoot" cx="180" cy="285" rx="15" ry="8" fill="[shoe-color]">
  <animateTransform
    attributeName="transform"
    type="translate"
    values="0,0; -8,0; 0,0; 8,0; 0,0"
    dur="1s"
    repeatCount="indefinite"
  />
</ellipse>
```

**Alternative Walking Patterns** (choose one that fits your design):

1. **Simple Forward/Back Swing**: Legs translate horizontally (shown above)
2. **Leg Rotation**: Legs rotate slightly at hip joint for more natural gait
3. **Knee Bend**: Upper and lower leg segments move independently
4. **Stepping Motion**: Combine vertical (Y) and horizontal (X) movement
5. **Feet Lift**: Feet additionally move up/down slightly when stepping

**Important Walking Animation Notes**:

- **Phase offset**: Right leg should be opposite phase to left leg
- **Subtlety**: Keep movement subtle (5-10px range) - exaggerated looks cartoony
- **Consistency**: All leg/feet elements must share same duration for synchronized walking
- **Feet coordination**: Feet must move with their corresponding legs
- **Arms (optional)**: Arms can swing slightly opposite to legs for natural walking motion

### Animations NOT to Implement

These are handled by the React wrapper component (DO NOT add to SVG):

- **Entry animations** (6 different types - randomly selected each time):
  1. **slideInRight**: Slides in from right with spring physics
  2. **hoverDown**: Drops from top with rotation
  3. **materialize**: Spins and scales into view
  4. **walkIn**: Walks in with bouncing steps (your walking animation will coordinate with horizontal slide)
  5. **teleport**: Materializes with blur effect
  6. **bounce**: Bounces down from top
- **Speaking state animations**: Scale 1→1.05→1, rotate ±2° (wiggle effect)
- **Glow effect**: Drop-shadow filter (#FFD700 golden glow)

**Important**: A **different entry animation is randomly chosen each time** the character appears. This means the character will enter the screen in various ways (walking, hovering, materializing, etc.), but your walking leg animation will always be running, which looks especially good with the `walkIn` variant.

Your SVG character with walking animation will automatically coordinate with whichever entry animation is selected by the React wrapper.

### Optional Enhancements

**Hair/Clothing Sway** (adds subtle life):

```xml
<g transform-origin="center">
  <animateTransform
    attributeName="transform"
    type="rotate"
    values="0;2;0;-2;0"
    dur="3s"
    repeatCount="indefinite"
  />
</g>
```

---

## Output Format

### Required Structure

```typescript
export default function BotCharacter() {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head/Face - main shape, simplified from reference photos */}

      {/* Eyes with pulsing animation */}

      {/* Pupils (optional) */}

      {/* Mouth with morphing animation for speaking */}

      {/* Hair - key identifier, simplified from photos */}

      {/* Body/Clothing - based on typical style */}

      {/* 3 Status lights with different pulse timings */}

      {/* Speech bubble indicators (3 circles) */}

      {/* Gradient definitions if needed */}
      <defs>
        <linearGradient id="characterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A2A4E" />
          <stop offset="100%" stopColor="#1A1A2E" />
        </linearGradient>
      </defs>
    </svg>
  );
}
```

### File Destination

This file will be saved to:

```
docs/presentation/app/src/components/speakers/BotCharacter.tsx
```

---

## Generation Checklist

Before finalizing the character, verify:

- [ ] SVG canvas is 300x300px viewBox
- [ ] Default export function named `BotCharacter`
- [ ] **FULL BODY character** - includes head, torso, arms, legs, and feet
- [ ] Character visually resembles reference photos (in stylized form)
- [ ] **BLACK THICK-FRAMED RECTANGULAR GLASSES** are prominent and recognizable
- [ ] **FULL SALT-AND-PEPPER BEARD** with dark brown and gray colors
- [ ] **RED T-SHIRT with LARGE YELLOW LIGHTNING BOLT** (Shazam logo) on chest
- [ ] Dark swept-back hair with volume
- [ ] Head/face in upper portion (Y: 40-140)
- [ ] Eyes have pulsing animation with `repeatCount="indefinite"`
- [ ] Mouth has animation for speaking indicator (within beard area)
- [ ] **Two arms** positioned naturally with short sleeves
- [ ] **Two legs** with alternating walking animation (casual pants)
- [ ] **Two feet** coordinating with leg movement (casual shoes/sneakers)
- [ ] **Walking animation implemented** - legs and feet move in opposite phases
- [ ] Walking animation duration 0.8-1.2s per cycle
- [ ] 3 status lights with independent pulse timings (1.0s, 1.2s, 0.8s)
- [ ] 3 speech bubble indicators with bobbing animation
- [ ] Primary colors use Gold (#FFD700) and Cyan (#00BCD4)
- [ ] Character colors: Red shirt (#DC143C), Yellow lightning (#FFD700), Dark hair (#2C1810), Olive skin (#D4A574), Black glasses (#000000)
- [ ] Bold outlines (2-3px stroke) in gold or dark colors
- [ ] Animation/comic/caricature style (NOT photorealistic)
- [ ] Character has personality: tech-confident with geek culture aesthetic
- [ ] All animations use `repeatCount="indefinite"`
- [ ] No external dependencies or imports (pure SVG + TSX wrapper)
- [ ] All distinctive features visible: glasses, beard, lightning bolt shirt
- [ ] Character height ~250-260px (fits within canvas with margins)

---

## Important Guidelines for LLM

When creating Alex's character from the reference photo:

1. **Full Body Composition**: Create COMPLETE character from head to feet (not just upper body)
2. **Facial structure**: Oval to rectangular face shape → use rounded rectangle or elongated oval as base
3. **Hairstyle**: KEY signature element - Dark brown/black swept-back hair with volume → simplify to 2-3 main shapes/paths
4. **Eyes**: Make slightly larger than realistic, expressive and friendly, with cyan color and pulsing animation
5. **Body proportions**: Head smaller than typical to fit full body in frame
6. **Clothing**: **RED T-SHIRT with LARGE YELLOW LIGHTNING BOLT** (Shazam logo) → high-contrast red+gold makes character instantly recognizable
7. **Leg/foot style**: Casual pants (blue jeans #4A5568 or khaki #C0A080), casual sneakers (dark or white/gray)
8. **Accessories**: **BLACK THICK-FRAMED RECTANGULAR GLASSES** (SIGNATURE FEATURE - must be prominent), no other accessories visible
9. **Facial Hair**: **FULL SALT-AND-PEPPER BEARD** with mix of dark brown (#3E2723) and gray (#B0B0B0) - VERY DISTINCTIVE
10. **Color palette**: Red shirt #DC143C, yellow lightning #FFD700, dark hair #2C1810, olive skin #D4A574, black glasses #000000
11. **Walking animation**: CRITICAL - implement alternating leg movement
12. **Personality vibe**: Tech-confident with geek culture aesthetic, serious but approachable demeanor

### Key Success Factors

✅ **Full Body**: Character includes head, torso, arms, legs, and feet
✅ **Walking Animation**: Legs alternate smoothly for walking-in-place effect
✅ **Recognizable**: Someone who knows the person should immediately identify them from the avatar
✅ **Simplified**: No excessive detail - clean lines and basic shapes
✅ **Animated**: All required elements have smooth, continuous animations
✅ **Personality**: Character conveys tech confidence and approachability
✅ **Themed**: Gold/cyan color scheme maintains presentation consistency
✅ **Variety Ready**: Character looks good with all 6 entry animation types

---

## Example Workflow

1. **Analyze reference photo** - Alex's key identifiers: Black thick-framed glasses, salt-and-pepper beard, swept-back dark hair, red shirt with yellow lightning bolt
2. **Create head shape** - Oval to rectangular face (smaller to fit full body) in olive skin tone (#D4A574)
3. **Add hair** - Dark brown/black (#2C1810) swept back with volume - critical for recognition - simplify to 2-3 main shapes
4. **Add glasses** - BLACK THICK-FRAMED RECTANGULAR GLASSES (#000000) - SIGNATURE FEATURE, make prominent with bold outlines
5. **Add beard** - Full salt-and-pepper beard mixing dark brown (#3E2723) and gray (#B0B0B0) - covers chin/cheeks fully
6. **Position eyes** - Behind glasses, slightly larger, with cyan color (#00BCD4) and pulsing animation
7. **Create mouth** - Within beard area, animated waveform or morphing shape for speaking indicator (gold #FFD700)
8. **Add torso/clothing** - RED T-SHIRT (#DC143C) with LARGE YELLOW LIGHTNING BOLT (#FFD700) center chest - Shazam logo
9. **Add arms** - Positioned naturally at sides, short sleeves matching red shirt
10. **Create legs** - Two simple shapes (casual pants, blue/khaki) with alternating walking animation
11. **Add feet** - Two casual sneaker/shoe shapes coordinating with leg movement (dark or white/gray)
12. **Implement walking animation** - Alternating leg/foot translate transforms (opposite phases, ~1s duration)
13. **Add tech elements** - 3 status lights on chest area + speech bubbles near head
14. **Apply color palette** - Gold outlines (#FFD700), red shirt, yellow lightning, black glasses, olive skin, dark hair, salt-and-pepper beard
15. **Test animations** - Ensure all SMIL animations run independently and continuously
16. **Verify walking cycle** - Legs alternate smoothly, feet coordinate, duration ~1s
17. **Verify distinctive features** - Glasses, beard, and lightning bolt shirt are all clearly visible and recognizable
18. **Verify checklist** - Confirm all required elements present, especially full body with walking

---

## Final Notes

- Keep it **simple** - Clean lines, basic shapes, minimal detail
- Make it **recognizable** - Key features (glasses, beard, lightning bolt shirt) should identify Alex
- Make it **animated** - Smooth, continuous animations add life
- Make it **full body with walking** - Complete character that walks in and out
- Make it **tech-themed** - Gold accents, status lights, modern aesthetic, Shazam shirt adds geek culture personality
- Make it **approachable** - Confident but friendly expression, tech-professional demeanor
- **Remember variety** - Character will appear with 6 different entry animations randomly selected

The goal is a stylized **full-body walking avatar** that people recognize as "that's Alex!" - someone who loves tech, comic books, and building AI assistants - while maintaining the animated, tech-forward aesthetic of the presentation.
