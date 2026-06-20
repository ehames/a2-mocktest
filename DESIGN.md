---
name: A2 Key Mock Test
description: Mobile-first Cambridge A2 Key Reading & Writing practice test
colors:
  navy: "#0B2447"
  navy-outer: "#15263b"
  ink: "#16263D"
  muted: "#5B6B7F"
  faint: "#9AA7B6"
  page-bg: "#EEF1F5"
  surface: "#ffffff"
  border: "#E2E8F0"
  input-border: "#C2CEDC"
  option-border: "#DCE3EC"
  instr-bg: "#E8EEF6"
  accent: "#5B9BD5"
  button-loading-bg: "#4a6a9a"
  passage-ink: "#1E2D40"
  instr-ink: "#3A4A5E"
  header-muted: "#9FB3CC"
  pic-bg: "#F4F6F9"
  correct: "#2E7D32"
  correct-bg: "#EAF6EE"
  error: "#C62828"
  error-bg: "#FCEDED"
typography:
  display:
    fontFamily: "Libre Franklin, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "31px"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Libre Franklin, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "25px"
    fontWeight: 800
    lineHeight: 1.15
  title:
    fontFamily: "Libre Franklin, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.1
  body:
    fontFamily: "Libre Franklin, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Libre Franklin, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
  caption:
    fontFamily: "Libre Franklin, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "0.12em"
  passage:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  sm: "8px"
  md: "11px"
  lg: "14px"
  xl: "16px"
spacing:
  xs: "11px"
  sm: "16px"
  md: "18px"
  lg: "24px"
  xl: "30px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "13px 22px"
  button-primary-loading:
    backgroundColor: "#4a6a9a"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "13px 22px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
    padding: "13px 18px"
  option-row-idle:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "14px"
  option-row-selected:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "14px"
  option-row-correct:
    backgroundColor: "{colors.correct-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "14px"
  option-row-wrong:
    backgroundColor: "{colors.error-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "14px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "13px 14px"
---

# Design System: A2 Key Mock Test

## 1. Overview

**Creative North Star: "The Quiet Focus"**

The A2 Key Mock Test is a phone in a quiet library. The student is already motivated; the interface's only job is to get out of the way. Every pixel either helps the learner answer a question or it should not exist. Decoration is a distraction. Structure is the design.

The palette anchors on Deep Examination Navy — institutional, weighty, Cambridge-adjacent — against a cool near-white background that reads like the surface of a photocopied exam paper under fluorescent light. The single accent (Steady Signal, `#5B9BD5`) appears only as progress: the bar filling across the header, the ring filling on the results screen. It signals forward movement without celebrating it.

This system explicitly rejects the three failure modes named in PRODUCT.md. No Duolingo-style gamification: no streaks, coins, confetti, or reward loops. No corporate LMS dullness: no grey sidebars, nested menus, or course-catalogue chrome. No dashboard overload: no widgets, dense data tables, or admin-tool aesthetic. A student opening this app should feel the same focused calm they'd feel sitting down to the actual Cambridge examination.

**Key Characteristics:**
- Single-screen flow: one part per screen, no peeking ahead
- Mobile-native proportions: touch targets ≥44px, phone-first layout with a dark letterbox shell on desktop
- Semantic color vocabulary: accent for progress, green for correct, red for wrong — never for decoration
- Two-family type system: Libre Franklin for UI chrome, Source Serif 4 for reading passages and written content
- Flat surfaces with border-defined hierarchy; one shadow exception on the primary CTA button
- Firm but approachable: rounded corners (8–16px) humanize the institutional navy without softening the register

## 2. Colors: The Examination Palette

A restrained palette dominated by one deep navy, one cool neutral surface, and three tightly scoped semantic signal colors. Color is never decorative; every hue earns its place by doing one specific job.

### Primary
- **Deep Examination Navy** (`#0B2447`): The structural anchor. Test-screen and results-screen headers, primary action buttons ("Start test," "Next," "Submit," "Restart"), the A2 logo badge, and all major headings. The single color that carries institutional weight.
- **Outer Shell** (`#15263b`): Slightly lighter than navy; the desktop letterbox framing the mobile column. Never appears inside the test interface itself.

### Secondary
- **Steady Signal** (`#5B9BD5`): The accent. Used only to represent progress and score: the progress bar fill, the score ring fill, per-part bar fills, and the result band label. Its rarity gives it meaning — when students see this blue, they know they are moving forward or receiving a result.

### Neutral
- **Examination Ink** (`#16263D`): Primary body text. Question stems, answer labels, card content, and all high-legibility text on light surfaces.
- **Muted Annotation** (`#5B6B7F`): Secondary text. Part subtitles in the header, metadata labels, navigation counters, section markers.
- **Faint Hint** (`#9AA7B6`): Placeholder and optional-field text. Communicates "this can be ignored" without being illegible.
- **Page Ground** (`#EEF1F5`): The test body background. Cool blue-grey; not warm, not beige. The institutional register demands cool neutrals.
- **Surface White** (`#ffffff`): Card and panel backgrounds. Cards read above the page ground by contrast alone — no shadow.
- **Structural Border** (`#E2E8F0`): Card outlines and row dividers. The primary way surfaces define themselves against each other.
- **Input Stroke** (`#C2CEDC`): Text field borders and ghost button outlines. Slightly stronger than the structural border to signal interactivity.
- **Option Stroke** (`#DCE3EC`): Idle multiple-choice option borders. Softer than input stroke — these are answers to consider, not fields to fill.
- **Instruction Ground** (`#E8EEF6`): Background for instruction blocks within each part. Slightly deeper than Page Ground to create quiet visual separation from question content.

### Semantic
- **Correct** (`#2E7D32`) / **Correct Ground** (`#EAF6EE`): Review mode only, on correct answers. Never used for branding or UI decoration.
- **Error** (`#C62828`) / **Error Ground** (`#FCEDED`): Wrong answers in review; error messages on load failure; timer warning state at ≤5:00. The warning use of red is the only instance where a semantic color communicates a UI state rather than an answer result.

**The One Signal Rule.** Steady Signal (`#5B9BD5`) appears only on elements that communicate forward progress or a completed score. It must never appear on decorative elements, section headers, or anything that does not represent movement through the test.

**The Semantic Purity Rule.** Green and red exist only for answer correctness and error states. They are prohibited on any neutral UI element — buttons, labels, backgrounds, icons — that does not carry a pass/fail or error meaning.

## 3. Typography

**UI Font:** Libre Franklin, -apple-system, BlinkMacSystemFont, sans-serif
**Passage Font:** Source Serif 4, Georgia, serif

**Character:** A deliberate contrast pairing. Libre Franklin's geometric construction carries the interface — precise, institutional, slightly compressed at heavy weights. Source Serif 4 switches register for reading passages and written answers, where a serif signals "this is the text being evaluated, not the interface around it." The swap is functional, not decorative.

### Hierarchy
- **Display** (800, 31px, 1.12, −0.01em letter-spacing): The intro screen's main heading ("Reading and Writing"). Used once per session entry.
- **Headline** (800, 25–27px, 1.15): Results screen headers and the score ring number. Appears only after submission — communicates culmination.
- **Title** (800, 19px, 1.1): Part labels in the test header and the A2 badge. The landmark that orients students between sections.
- **Body** (400, 15px, 1.55): Question stems, instructions, and intro copy. The workhorse; comfortable reading line-height.
- **Label** (600–700, 14px, 1.3): Row metadata, button text, and form labels. Slightly heavier than body to distinguish interactive from passive.
- **Caption** (700, 12px, uppercase, 0.10–0.14em tracking): Section markers ("Before you begin," "Writing — review yourself"). One or two per screen maximum.
- **Passage** (Source Serif 4, 400, 14–15px, 1.55): Reading passages (Parts 2–4), open-cloze text (Part 5), and written-answer display in review. Never used for UI chrome.

**The Two-Register Rule.** Libre Franklin owns UI; Source Serif 4 owns content. Never use Source Serif 4 on buttons, labels, instructions, or navigation. Never use Libre Franklin for reading passages or written-answer display.

## 4. Elevation

This system is flat by default. Cards define their level through border contrast against the page ground — not shadow. The visual hierarchy is: outer shell (`#15263b`) → page ground (`#EEF1F5`) → surface cards (`#fff` with `#E2E8F0` border) → instruction blocks (`#E8EEF6` on page ground).

**One exception.** The primary action button carries `box-shadow: 0 6px 18px rgba(11,36,71,0.22)` — a navy-tinted ambient shadow. This is the only shadow in the system. It exists for one reason: to identify the single most important action on any given screen.

**The Single Shadow Rule.** If a shadow appears on anything other than the primary action button, it was added in error. Cards, panels, instruction blocks, chips, and nav elements are unconditionally flat. The shadow is not a styling choice; it is a pointer.

## 5. Components

### Buttons

Firm but approachable: solid fills with clearly rounded corners. No ambiguity about what is tappable; no decorative softening that undermines the institutional register.

- **Shape:** Gently rounded (11px on footer nav buttons and ghost buttons; 13px on full-width primary CTA)
- **Primary** (Start test / Next / Submit / Restart): Deep Examination Navy fill, white text, 700 weight, 16px on the intro screen / 14px in the test footer. Full-width on intro; right-aligned inline in the test footer. Carries the single system shadow.
- **Loading state:** Muted navy (`#4a6a9a`) fill, disabled cursor, same shape. Signals "wait" without removing the button.
- **Ghost / Outline** (Back / Review answers): White fill, `1.5px solid #C2CEDC` border, navy text. 11–12px radius. Used in equal-weight paired layouts (Back + Next / Review + Restart).

### Option Rows (Multiple Choice)

Three layout variants, four semantic states. The state system is the most complex component in the interface and the most visible to students.

- **Row variant** (Parts 1, 3): Full-width button, 12px radius, 1.5px border, 14px padding. Letter badge (28×28px circle) floats left; answer text runs right. Min height 54px.
- **Inline variant** (Part 4, MC-cloze): Compact inline button for in-passage use. 10px radius, same border/badge logic, smaller badge (22×22px).
- **Letter variant** (Part 2, matching): Equal-width A/B/C buttons in a flex row. Letter only, no label. 10px radius, min height 50px.
- **Idle:** White background, `#DCE3EC` border, Examination Ink text
- **Selected:** Navy background, white text, white badge border — confirms the choice without requiring confirmation
- **Correct (review):** Correct Ground background, green border, green-filled badge with ✓ mark
- **Wrong (review):** Error Ground background, red border, red-filled badge with ✗ mark

### Input Fields

- **Style:** White background, `1.5px solid #C2CEDC` border, 11px radius
- **Padding:** 13px 14px
- **Font:** Libre Franklin, 500, 15px
- **Placeholder:** Faint Hint (`#9AA7B6`) — intentionally quiet; the name field is optional and low-stakes

### Info Cards (Test metadata / Writing review)

- **Corner style:** 16px radius — the most generously rounded surface in the system
- **Background:** Surface White with `1px solid #E2E8F0` border
- **Shadow:** None; flat
- **Internal dividers:** `1px solid #EEF1F5` between rows — one tone lighter than the border, creates rhythm without adding weight
- **Internal padding:** 15px 18px per metadata row; 16–20px for content cards

### Instruction Blocks

- **Background:** Instruction Ground (`#E8EEF6`)
- **Radius:** 10px
- **Padding:** 11px 14px
- **Font:** Libre Franklin, 500, 13px, 1.45 line-height, `#3A4A5E` — marginally darker than Muted to hold legibility on the blue-tinted ground

### Timer Pill

Two states; the transition between them is purposefully jarring.

- **Normal:** Semi-transparent pill (`rgba(255,255,255,0.14)`) on the navy header. White text. 8px radius. Understated by design — the test is not about the clock.
- **Warning (≤5:00):** Solid red (`rgba(200,40,40,0.92)`). White text. Same shape. The only moment the interface actively competes for attention. It should feel like a shock.

### Progress Bar

- **Location:** Bottom of the test header, set against the navy surface
- **Height:** 4px; deliberately thin — the strip is a landmark, not a feature
- **Track:** `rgba(255,255,255,0.16)` — near-invisible on navy
- **Fill:** Steady Signal (`#5B9BD5`)
- **Radius:** 2px
- **Transition:** `width 0.35s ease`

### Score Ring (Results Screen)

- **Outer ring:** 128×128px circle; `conic-gradient(#5B9BD5 [pct * 3.6]deg, #E2E8F0 0)` — progress represented as filled arc
- **Inner cutout:** 96×96px white circle, centers the score number (800, 27px, navy) and total label (600, 11px, muted)
- **Appears only on the results screen** — the single moment of visual emphasis after submission

## 6. Do's and Don'ts

### Do:
- **Do** use Deep Examination Navy (`#0B2447`) for primary actions, structural headers, and major headings. It is the anchor; use it with confidence.
- **Do** use Source Serif 4 exclusively for reading passages, open-cloze text, and written-answer display. The font swap communicates "this is the exam content" without any explicit label.
- **Do** use Steady Signal (`#5B9BD5`) only for progress indicators and score elements. Rarity is its signal value.
- **Do** keep green and red strictly semantic: correct/wrong in review mode, error alerts, and the ≤5:00 timer warning only.
- **Do** use 1.5px border weight (not 1px) on all interactive elements — option rows, inputs, ghost buttons — so they read as tappable on mobile at arm's length.
- **Do** let card hierarchy emerge from background contrast and border alone. The Single Shadow Rule allows exactly one shadow in the system: the primary action button.
- **Do** ensure every interactive touch target is ≥44px tall. The test is taken on a mobile phone by students who may be anxious. Fumbled taps cost points.
- **Do** use `animation: pop-in 0.2s ease` (scale 0.985→1, opacity 0.4→1) for screen-to-screen transitions. It acknowledges the navigation without distracting from the next question.

### Don't:
- **Don't** add gamification elements of any kind: no streaks, coins, XP bars, progress celebrations, confetti, mascots, or reward loops. This is examination preparation, not a reward system.
- **Don't** reproduce corporate LMS aesthetics: no grey sidebars, no breadcrumb trails, no course-catalogue navigation, no nested menus. The interface exposes one screen per part, full stop.
- **Don't** add dashboard complexity: no widgets, no multiple data panels, no admin-tool density. The only "data" the student sees is their score and per-part progress bars.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on any card, list item, or callout.
- **Don't** use Source Serif 4 in buttons, labels, headings, or any UI chrome. It belongs exclusively to exam content.
- **Don't** use Steady Signal, green, or red on non-semantic UI elements. Color decoration is prohibited.
- **Don't** add a shadow to any element other than the primary CTA button. Elevation is claimed by one element only.
- **Don't** use a warm-tinted background. Page Ground (`#EEF1F5`) is cool blue-grey — institutional, not cozy. Warm neutrals shift the register incorrectly toward the LMS or consumer-ed aesthetic this system rejects.
