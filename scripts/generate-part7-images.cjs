#!/usr/bin/env node
// Generates Part 7 panel illustrations using the OpenAI Responses API (gpt-5.5 + image_generation tool).
// Panels are chained via previous_response_id so each call sees the previous image,
// maintaining consistent character appearance across all 3 panels of a story.
//
// Usage:
//   OPENAI_API_KEY=sk-... npm run generate:part7-images
//   OPENAI_API_KEY=sk-... npm run generate:part7-images -- --dry-run
//   OPENAI_API_KEY=sk-... npm run generate:part7-images -- --story 0
//   OPENAI_API_KEY=sk-... npm run generate:part7-images -- --story 0 --quality low
//   OPENAI_API_KEY=sk-... npm run generate:part7-images -- --story 0 --panel 2
//   OPENAI_API_KEY=sk-... npm run generate:part7-images -- --story 0 --panel 2 --quality high
//
// --panel N (1-indexed, requires --story):
//   Regenerate a single panel using stored context from the prior panel.
//   --panel 1 always regenerates all 3 (no prior context to chain from).
//   --panel 2 loads stored p1 response ID → regenerates panel 2 only.
//   --panel 3 loads stored p2 response ID → regenerates panel 3 only.
//   If the sidecar is missing or the stored ID fails, falls back to chaining-free generation.
//
// --quality low|med|high  (default: high)
//
// Sidecar {slug}_meta.json is written to OUT_DIR after each panel to store response IDs.

'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BANK_PATH = 'public/questions/schools/part7.json';
const OUT_DIR = 'public/images/part7';
const DRY_RUN = process.argv.includes('--dry-run');

const STORY_ARG = process.argv.indexOf('--story');
const STORY_FILTER = STORY_ARG !== -1 ? parseInt(process.argv[STORY_ARG + 1], 10) : null;

const PANEL_ARG = process.argv.indexOf('--panel');
const PANEL_TARGET = PANEL_ARG !== -1 ? parseInt(process.argv[PANEL_ARG + 1], 10) : null; // 1-indexed

const QUALITY_ARG = process.argv.indexOf('--quality');
const QUALITY_INPUT = QUALITY_ARG !== -1 ? process.argv[QUALITY_ARG + 1] : 'high';
const QUALITY_MAP = { low: 'low', med: 'medium', high: 'high' };
const QUALITY = QUALITY_MAP[QUALITY_INPUT];
if (!QUALITY) {
  console.error(`Error: --quality must be low, med, or high (got "${QUALITY_INPUT}")`);
  process.exit(1);
}

const STYLE_PREFIX =
  "B&W pencil sketch illustration, simple children's book line drawing style. " +
  'Clean outline only, no colour, no shading, no gradients. Pure white background. ' +
  'Square composition. No speech bubbles, no labels, no captions.';

function buildPanelPrompt(characters, storyPrompt, pic, panelNum, totalPanels) {
  const charList = characters.map(c => `- ${c.name}: ${c.description}.`).join('\n');
  const absentBlock = (pic.absent && pic.absent.length > 0)
    ? `\nCHARACTERS NOT IN THIS PANEL (do NOT draw them): ${pic.absent.join(', ')}.`
    : '';
  return [
    STYLE_PREFIX,
    `STORY CONTEXT: ${storyPrompt.storyArc}`,
    `CHARACTERS IN THIS STORY:\n${charList}${absentBlock}`,
    `PANEL ${panelNum} OF ${totalPanels} — Setting: ${pic.setting}. ` +
      `Background shows: ${pic.background}. ` +
      `${pic.scene}, filling most of the frame. ` +
      `Background is simple but clearly shows the location. ` +
      `The characters' faces clearly show ${pic.emotion}.`,
  ].join('\n\n');
}

async function callApi(promptText, previousResponseId) {
  const body = {
    model: 'gpt-5.5',
    input: promptText,
    tools: [{ type: 'image_generation', quality: QUALITY, size: '1024x1024' }],
  };
  if (previousResponseId) body.previous_response_id = previousResponseId;

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const imageCall = data.output.find(o => o.type === 'image_generation_call');
  if (!imageCall) throw new Error('No image_generation_call in response');
  return { b64: imageCall.result, responseId: data.id };
}

function metaPath(slug) {
  return path.join(OUT_DIR, `${slug}_meta.json`);
}

function readMeta(slug) {
  const p = metaPath(slug);
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
}

function writeMeta(slug, meta) {
  fs.writeFileSync(metaPath(slug), JSON.stringify(meta, null, 2));
}

async function savePanel(b64, destPath) {
  const pngBuffer = Buffer.from(b64, 'base64');
  const webpBuffer = await sharp(pngBuffer).webp({ quality: 85 }).toBuffer();
  fs.writeFileSync(destPath, webpBuffer);
}

async function main() {
  if (!DRY_RUN && !process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const bank = JSON.parse(fs.readFileSync(BANK_PATH, 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;

  const prompts = STORY_FILTER !== null ? [bank.prompts[STORY_FILTER]] : bank.prompts;

  for (const prompt of prompts) {
    const panelPaths = prompt.pics.map(pic =>
      path.join(OUT_DIR, path.basename(pic.image))
    );
    const slug = path.basename(panelPaths[0]).replace(/_p\d+\.webp$/, '');

    // Without --panel: standard idempotency check (skip if all panels exist)
    if (PANEL_TARGET === null) {
      if (panelPaths.every(p => fs.existsSync(p))) {
        console.log(`skip  ${slug} (all panels present)`);
        skipped++;
        continue;
      }
    }

    const label = [
      `quality: ${QUALITY_INPUT}`,
      PANEL_TARGET ? `panel: ${PANEL_TARGET}` : null,
    ].filter(Boolean).join(', ');
    console.log(`\nstory: ${slug}  (${label})`);
    console.log(`chars: ${prompt.characters.map(c => c.name).join(', ')}`);

    const meta = readMeta(slug);

    // Determine panels to generate
    // --panel 1 → regenerate all 3 (no prior context exists)
    // --panel N → regenerate only panel N, seeded with stored response ID of panel N-1
    // no --panel  → regenerate all panels from 0 (existing idempotency check already ran)
    let panelIndices; // 0-based
    let seedResponseId = null;

    if (PANEL_TARGET !== null && PANEL_TARGET > 1) {
      const priorKey = `p${PANEL_TARGET - 1}_response_id`;
      const storedId = meta[priorKey] || null;
      if (storedId) {
        console.log(`  chaining from stored ${priorKey}`);
        seedResponseId = storedId;
        panelIndices = [PANEL_TARGET - 1]; // only the one panel
      } else {
        console.warn(`  warning: no stored response ID for panel ${PANEL_TARGET - 1} — generating panel ${PANEL_TARGET} without cross-panel context`);
        panelIndices = [PANEL_TARGET - 1];
      }
    } else {
      // PANEL_TARGET === 1 or null: regenerate from start
      panelIndices = prompt.pics.map((_, i) => i);
    }

    let previousResponseId = seedResponseId;

    for (const i of panelIndices) {
      const pic = prompt.pics[i];
      const destPath = panelPaths[i];
      const panelPrompt = buildPanelPrompt(prompt.characters, prompt, pic, i + 1, prompt.pics.length);

      console.log(`\n  panel ${i + 1}: ${pic.text}`);

      if (DRY_RUN) {
        console.log('\n--- PROMPT ---');
        console.log(panelPrompt);
        console.log('--- END ---\n');
        continue;
      }

      let result;
      try {
        result = await callApi(panelPrompt, previousResponseId);
      } catch (err) {
        // Stored ID may have expired — retry without chaining
        if (previousResponseId && /40[04]/.test(err.message)) {
          console.warn(`  warning: stored response ID rejected (${err.message.match(/\d{3}/)?.[0]}) — retrying without cross-panel context`);
          previousResponseId = null;
          result = await callApi(panelPrompt, null);
        } else {
          throw err;
        }
      }

      await savePanel(result.b64, destPath);
      console.log(`  saved ${path.basename(destPath)}`);

      // Persist response ID so future --panel runs can chain from it
      meta[`p${i + 1}_response_id`] = result.responseId;
      writeMeta(slug, meta);

      previousResponseId = result.responseId;
      generated++;
    }
  }

  if (!DRY_RUN) {
    console.log(`\nDone: ${generated} generated, ${skipped} skipped.`);
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
