# Part 7 Image Generation Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `scripts/generate-part7-images.cjs` to use OpenAI Responses API multi-turn (panel-to-panel visual context), a refined prompt with explicit setting/background fields, and WebP output instead of SVG.

**Architecture:** The JSON bank (`schools/part7.json`) is updated with a new schema — `characters[]` array plus `setting`, `background`, `scene`, `emotion` per panel. The script reads these fields, assembles the refined prompt, and calls the Responses API sequentially per story: panel 2 receives `previous_response_id` from panel 1, panel 3 from panel 2. Each panel's PNG response is converted to WebP via `sharp` and saved.

**Tech Stack:** Node.js (CommonJS), `openai` npm package (Responses API), `sharp` (PNG → WebP), `gpt-4o` with `image_generation` tool.

## Global Constraints

- Script file must stay CommonJS (`.cjs`) — the project root is `"type": "module"` ESM
- Output files: `public/images/part7/<slug>_p{1,2,3}.webp`
- Bank file: `public/questions/schools/part7.json`
- Image generation only via `npm run generate:part7-images` — **not triggered by any other task**
- Do not touch `public/questions/general/part7.json` — out of scope
- Do not modify `src/types.ts` — extra JSON fields are ignored at runtime, no type changes needed

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `public/questions/schools/part7.json` | Modify | New schema: `characters[]`, per-panel generation fields, `.webp` paths |
| `scripts/generate-part7-images.cjs` | Rewrite | New prompt builder + Responses API multi-turn + WebP output |
| `package.json` | Modify | Add `openai`, remove `potrace` |
| `public/images/part7/*.svg` | Delete | Replaced by WebP |

---

### Task 1: Update `schools/part7.json` with new schema

**Files:**
- Modify: `public/questions/schools/part7.json`

**Interfaces:**
- Produces: JSON structure consumed by Task 3 script — `prompts[].characters` (array of `{name, description}`), `prompts[].pics[].{text, setting, background, scene, emotion, image}`

- [ ] **Step 1: Replace the file contents**

Write the following to `public/questions/schools/part7.json`:

```json
{
  "prompts": [
    {
      "intro": "Look at the three pictures. Write the story shown in the pictures.",
      "characters": [
        { "name": "Tom", "description": "a boy of about 12, short dark hair, white school shirt and dark trousers" },
        { "name": "Sam", "description": "a girl of about 12, short straight hair, blue jacket and jeans" }
      ],
      "pics": [
        {
          "label": "Picture 1",
          "text": "bike / house / sunny",
          "setting": "outside a house on a sunny residential street",
          "background": "house facade with front door, garden path, bright sun in the sky",
          "scene": "Tom stands with his bicycle in the foreground",
          "emotion": "happy and excited",
          "image": "images/part7/cafe-rain_p1.webp"
        },
        {
          "label": "Picture 2",
          "text": "rain / bus stop / friend",
          "setting": "a rainy street with a bus stop",
          "background": "bus stop shelter, street lamp, falling rain",
          "scene": "Tom and Sam stand together at the bus stop",
          "emotion": "Tom surprised, Sam smiling",
          "image": "images/part7/cafe-rain_p2.webp"
        },
        {
          "label": "Picture 3",
          "text": "cafe / cakes / happy",
          "setting": "inside a café",
          "background": "café counter, window, simple wall",
          "scene": "Tom and Sam sit at a small table with cups and a plate of cakes",
          "emotion": "both laughing and happy",
          "image": "images/part7/cafe-rain_p3.webp"
        }
      ],
      "minWords": 35
    },
    {
      "intro": "Look at the three pictures. Write the story shown in the pictures.",
      "characters": [
        { "name": "Sofia", "description": "a girl of about 13, long curly hair, jeans and a green hoodie" },
        { "name": "Biscuit", "description": "a small fluffy white dog with floppy ears" }
      ],
      "pics": [
        {
          "label": "Picture 1",
          "text": "park / dog / lost",
          "setting": "a sunny park with a path",
          "background": "park bench, trees, green grass",
          "scene": "Sofia walks Biscuit on a lead along the path",
          "emotion": "relaxed and happy",
          "image": "images/part7/lost-dog_p1.webp"
        },
        {
          "label": "Picture 2",
          "text": "street / poster / worried",
          "setting": "a street with a brick wall",
          "background": "brick wall, street lamp, pavement",
          "scene": "Sofia pins a lost-dog poster to the wall",
          "emotion": "worried and upset",
          "image": "images/part7/lost-dog_p2.webp"
        },
        {
          "label": "Picture 3",
          "text": "garden / dog / relieved",
          "setting": "a garden with a fence",
          "background": "garden fence, flower pots, gate",
          "scene": "Sofia kneels down and hugs Biscuit tightly",
          "emotion": "relieved and happy",
          "image": "images/part7/lost-dog_p3.webp"
        }
      ],
      "minWords": 35
    }
  ]
}
```

- [ ] **Step 2: Validate the JSON**

```bash
node -e "
const d = require('./public/questions/schools/part7.json');
d.prompts.forEach((p, i) => {
  console.assert(Array.isArray(p.characters) && p.characters.length > 0, \`prompt \${i}: missing characters[]\`);
  p.characters.forEach(c => {
    console.assert(c.name && c.description, \`prompt \${i}: character missing name or description\`);
  });
  p.pics.forEach((pic, j) => {
    ['setting','background','scene','emotion'].forEach(f => {
      console.assert(pic[f], \`prompt \${i} pic \${j}: missing \${f}\`);
    });
    console.assert(pic.image.endsWith('.webp'), \`prompt \${i} pic \${j}: image must be .webp\`);
  });
});
console.log('schema ok');
"
```

Expected output: `schema ok`

- [ ] **Step 3: Commit**

```bash
git add public/questions/schools/part7.json
git commit -m "feat: update schools/part7.json — new characters[] schema, setting/background/scene/emotion per panel, webp paths"
```

---

### Task 2: Swap npm dependencies

**Files:**
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Produces: `openai` package available via `require('openai')` in CJS scripts

- [ ] **Step 1: Install `openai`, remove `potrace`**

```bash
npm install --save-dev openai@latest
npm uninstall potrace
```

- [ ] **Step 2: Verify `openai` is importable from CJS**

```bash
node -e "const { OpenAI } = require('openai'); console.log('openai ok');"
```

Expected output: `openai ok`

- [ ] **Step 3: Verify `potrace` is gone**

```bash
node -e "require('potrace')" 2>&1 | grep -q "Cannot find module" && echo "potrace removed ok"
```

Expected output: `potrace removed ok`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add openai package, remove potrace"
```

---

### Task 3: Rewrite `generate-part7-images.cjs`

**Files:**
- Modify: `scripts/generate-part7-images.cjs`

**Interfaces:**
- Consumes: `public/questions/schools/part7.json` schema from Task 1 — `prompts[].characters[]`, `prompts[].pics[].{setting, background, scene, emotion, image}`
- Consumes: `openai` package from Task 2 — `new OpenAI({ apiKey })`, `client.responses.create()`
- Produces: `public/images/part7/<slug>_p{1,2,3}.webp` (when run with API key)

- [ ] **Step 1: Overwrite the script with the new implementation**

Write the following to `scripts/generate-part7-images.cjs`:

```javascript
#!/usr/bin/env node
// Generates Part 7 panel illustrations using the OpenAI Responses API.
// Sequential multi-turn generation (previous_response_id) maintains character
// appearance across panels of the same story.
//
// Usage:
//   OPENAI_API_KEY=sk-... npm run generate:part7-images
//   node scripts/generate-part7-images.cjs --dry-run   (prints prompts, no API calls)
//
// Idempotent at story level: skips stories where all panel .webp files exist.
// To regenerate: delete the panel files, then re-run.

'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { OpenAI } = require('openai');

const BANK_PATH = 'public/questions/schools/part7.json';
const OUT_DIR = 'public/images/part7';
const DRY_RUN = process.argv.includes('--dry-run');

const STYLE_PREFIX =
  "B&W pencil sketch illustration, simple children's book line drawing style. " +
  'Clean outline only, no colour, no shading, no gradients. Pure white background. ' +
  'Square composition. No text, no speech bubbles, no labels, no captions.';

function buildPanelPrompt(characters, pic, panelNum, totalPanels) {
  const charList = characters.map(c => `- ${c.name}: ${c.description}.`).join('\n');
  return [
    STYLE_PREFIX,
    `CHARACTERS IN THIS STORY:\n${charList}`,
    `PANEL ${panelNum} OF ${totalPanels} — Setting: ${pic.setting}. ` +
      `Background shows: ${pic.background}. ` +
      `${pic.scene} and fills most of the frame. ` +
      `Background is simple but clearly shows the location. ` +
      `The characters' faces clearly show ${pic.emotion}.`,
  ].join('\n\n');
}

async function main() {
  if (!DRY_RUN && !process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const bank = JSON.parse(fs.readFileSync(BANK_PATH, 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const client = DRY_RUN ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let generated = 0;
  let skipped = 0;

  for (const prompt of bank.prompts) {
    const panelPaths = prompt.pics.map(pic =>
      path.join(OUT_DIR, path.basename(pic.image))
    );
    const allExist = panelPaths.every(p => fs.existsSync(p));
    const slug = path.basename(panelPaths[0]).replace(/_p\d+\.webp$/, '');

    if (allExist) {
      console.log(`skip  ${slug} (all panels present)`);
      skipped++;
      continue;
    }

    console.log(`\nstory: ${slug}`);
    console.log(`chars: ${prompt.characters.map(c => c.name).join(', ')}`);

    let previousResponseId = null;

    for (let i = 0; i < prompt.pics.length; i++) {
      const pic = prompt.pics[i];
      const destPath = panelPaths[i];
      const panelPrompt = buildPanelPrompt(prompt.characters, pic, i + 1, prompt.pics.length);

      console.log(`\n  panel ${i + 1}: ${pic.text}`);

      if (DRY_RUN) {
        console.log('\n--- PROMPT ---');
        console.log(panelPrompt);
        console.log('--- END ---\n');
        continue;
      }

      const params = {
        model: 'gpt-4o',
        tools: [{ type: 'image_generation', quality: 'low', size: '1024x1024' }],
        input: panelPrompt,
      };
      if (previousResponseId) params.previous_response_id = previousResponseId;

      const response = await client.responses.create(params);
      previousResponseId = response.id;

      const imageCall = response.output.find(o => o.type === 'image_generation_call');
      if (!imageCall) throw new Error(`No image_generation_call in response for panel ${i + 1}`);

      const pngBuffer = Buffer.from(imageCall.result, 'base64');
      const webpBuffer = await sharp(pngBuffer).webp({ quality: 85 }).toBuffer();
      fs.writeFileSync(destPath, webpBuffer);
      console.log(`  saved ${path.basename(destPath)}`);
      generated++;
    }
  }

  if (!DRY_RUN) {
    console.log(`\nDone: ${generated} generated, ${skipped} skipped.`);
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
```

- [ ] **Step 2: Run in dry-run mode to verify prompt output**

```bash
node scripts/generate-part7-images.cjs --dry-run
```

Expected output (excerpt — verify the panel 1 prompt for cafe-rain matches):
```
story: cafe-rain
chars: Tom, Sam

  panel 1: bike / house / sunny

--- PROMPT ---
B&W pencil sketch illustration, simple children's book line drawing style. Clean outline only, no colour, no shading, no gradients. Pure white background. Square composition. No text, no speech bubbles, no labels, no captions.

CHARACTERS IN THIS STORY:
- Tom: a boy of about 12, short dark hair, white school shirt and dark trousers.
- Sam: a girl of about 12, short straight hair, blue jacket and jeans.

PANEL 1 OF 3 — Setting: outside a house on a sunny residential street. Background shows: house facade with front door, garden path, bright sun in the sky. Tom stands with his bicycle in the foreground and fills most of the frame. Background is simple but clearly shows the location. The characters' faces clearly show happy and excited.
--- END ---
```

Verify 6 prompts total are printed (2 stories × 3 panels), with no API error.

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-part7-images.cjs
git commit -m "feat: rewrite generation script — Responses API multi-turn, refined prompt, WebP output"
```

---

### Task 4: Delete old SVG files

**Files:**
- Delete: `public/images/part7/cafe-rain_p1.svg`, `cafe-rain_p2.svg`, `cafe-rain_p3.svg`
- Delete: `public/images/part7/lost-dog_p1.svg`, `lost-dog_p2.svg`, `lost-dog_p3.svg`

- [ ] **Step 1: Delete the SVG files**

```bash
rm public/images/part7/cafe-rain_p1.svg \
   public/images/part7/cafe-rain_p2.svg \
   public/images/part7/cafe-rain_p3.svg \
   public/images/part7/lost-dog_p1.svg \
   public/images/part7/lost-dog_p2.svg \
   public/images/part7/lost-dog_p3.svg
```

- [ ] **Step 2: Verify the directory is now empty**

```bash
ls public/images/part7/
```

Expected: empty output (no files listed).

- [ ] **Step 3: Commit**

```bash
git add public/images/part7/
git commit -m "chore: delete old SVG pilot images (replaced by WebP)"
```

---

### Task 5: Generate images (requires `OPENAI_API_KEY`)

**Files:**
- Create: `public/images/part7/cafe-rain_p{1,2,3}.webp`
- Create: `public/images/part7/lost-dog_p{1,2,3}.webp`

> **Note:** This task makes real API calls and incurs OpenAI charges. Run only when ready to generate.

- [ ] **Step 1: Run the generation script**

```bash
OPENAI_API_KEY=sk-... npm run generate:part7-images
```

Expected terminal output:
```
story: cafe-rain
chars: Tom, Sam

  panel 1: bike / house / sunny
  saved cafe-rain_p1.webp

  panel 2: rain / bus stop / friend
  saved cafe-rain_p2.webp

  panel 3: cafe / cakes / happy
  saved cafe-rain_p3.webp

story: lost-dog
chars: Sofia, Biscuit

  panel 1: park / dog / lost
  saved lost-dog_p1.webp

  panel 2: street / poster / worried
  saved lost-dog_p2.webp

  panel 3: garden / dog / relieved
  saved lost-dog_p3.webp

Done: 6 generated, 0 skipped.
```

- [ ] **Step 2: Verify 6 WebP files exist**

```bash
ls -lh public/images/part7/
```

Expected: 6 `.webp` files, each between 20–100 KB.

- [ ] **Step 3: Visual inspection**

Open the app (`npm run dev`) and navigate to Part 7. Verify:
- All 3 panels display for each story
- Style is B&W pencil sketch
- Characters look consistent across panels within a story
- Backgrounds clearly show the scene location

- [ ] **Step 4: Verify idempotency**

```bash
OPENAI_API_KEY=sk-... npm run generate:part7-images
```

Expected output:
```
skip  cafe-rain (all panels present)
skip  lost-dog (all panels present)

Done: 0 generated, 2 skipped.
```

- [ ] **Step 5: Commit**

```bash
git add public/images/part7/
git commit -m "feat: generate Part 7 WebP illustrations (cafe-rain, lost-dog)"
```
