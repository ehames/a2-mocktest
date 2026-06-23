#!/usr/bin/env node
// Generates Part 7 panel illustrations. Supports two engines selectable via --engine:
//
//   openai  (default) — OpenAI Responses API (gpt-5.5 + image_generation tool).
//           Panels are chained via previous_response_id for cross-panel character consistency.
//           Requires OPENAI_API_KEY.
//
//   imagen  — Google Imagen via AI Studio REST API.
//           Each panel is generated independently (no stateful chaining).
//           Requires GOOGLE_API_KEY.
//
// Usage:
//   OPENAI_API_KEY=sk-... npm run generate:part7-images
//   OPENAI_API_KEY=sk-... npm run generate:part7-images -- --dry-run
//   OPENAI_API_KEY=sk-... npm run generate:part7-images -- --story 0
//   OPENAI_API_KEY=sk-... npm run generate:part7-images -- --story 0 --quality low
//   OPENAI_API_KEY=sk-... npm run generate:part7-images -- --story 0 --panel 2
//   GOOGLE_API_KEY=...   npm run generate:part7-images -- --engine imagen --story 0
//   GOOGLE_API_KEY=...   npm run generate:part7-images -- --engine imagen --story 0 --quality low
//
// --panel N (1-indexed, requires --story):
//   OpenAI: regenerates a single panel using stored context from the prior panel.
//   Imagen: regenerates that panel independently (no chaining).
//   --panel 1 always regenerates all 3.
//
// --quality low|med|high  (default: high)
//
// Sidecar {slug}_meta.json is written to OUT_DIR (OpenAI only) to store response IDs.

'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { QUALITY_MAP, IMAGEN_QUALITY_MAP, buildPanelPrompt, readMeta, writeMeta } = require('./part7-helpers.cjs');

const BANK_PATH = 'public/questions/schools/part7.json';
const OUT_DIR = 'public/images/part7';
const DRY_RUN = process.argv.includes('--dry-run');

const STORY_ARG = process.argv.indexOf('--story');
const STORY_FILTER = STORY_ARG !== -1 ? parseInt(process.argv[STORY_ARG + 1], 10) : null;

const PANEL_ARG = process.argv.indexOf('--panel');
const PANEL_TARGET = PANEL_ARG !== -1 ? parseInt(process.argv[PANEL_ARG + 1], 10) : null; // 1-indexed

const ENGINE_ARG = process.argv.indexOf('--engine');
const ENGINE = ENGINE_ARG !== -1 ? process.argv[ENGINE_ARG + 1] : 'openai';
if (!['openai', 'imagen'].includes(ENGINE)) {
  console.error(`Error: --engine must be openai or imagen (got "${ENGINE}")`);
  process.exit(1);
}

const QUALITY_ARG = process.argv.indexOf('--quality');
const QUALITY_INPUT = QUALITY_ARG !== -1 ? process.argv[QUALITY_ARG + 1] : 'high';
const qmap = ENGINE === 'imagen' ? IMAGEN_QUALITY_MAP : QUALITY_MAP;
const QUALITY = qmap[QUALITY_INPUT];
if (!QUALITY) {
  console.error(`Error: --quality must be low, med, or high (got "${QUALITY_INPUT}")`);
  process.exit(1);
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

async function callImagenApi(promptText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${QUALITY}:generateContent?key=${process.env.GOOGLE_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const imgPart = parts.find(p => p.inlineData);
  if (!imgPart) throw new Error(`No image in response: ${JSON.stringify(data).slice(0, 300)}`);
  return { b64: imgPart.inlineData.data };
}

async function savePanel(b64, destPath) {
  const pngBuffer = Buffer.from(b64, 'base64');
  const webpBuffer = await sharp(pngBuffer).resize(512, 512, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  fs.writeFileSync(destPath, webpBuffer);
}

async function main() {
  if (!DRY_RUN) {
    if (ENGINE === 'openai' && !process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is required for --engine openai');
      process.exit(1);
    }
    if (ENGINE === 'imagen' && !process.env.GOOGLE_API_KEY) {
      console.error('Error: GOOGLE_API_KEY is required for --engine imagen');
      process.exit(1);
    }
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

    const meta = readMeta(OUT_DIR, slug);

    // Determine panels to generate and seed response ID
    // --panel 1 → all 3 from scratch; --panel N>1 → only panel N
    // OpenAI: seeds from stored prior-panel response ID for character consistency
    // Imagen: always generates independently (no chaining)
    let panelIndices; // 0-based
    let seedResponseId = null;

    if (PANEL_TARGET !== null && PANEL_TARGET > 1) {
      if (ENGINE === 'openai') {
        const priorKey = `p${PANEL_TARGET - 1}_response_id`;
        const storedId = meta[priorKey] || null;
        if (storedId) {
          console.log(`  chaining from stored ${priorKey}`);
          seedResponseId = storedId;
        } else {
          console.warn(`  warning: no stored response ID for panel ${PANEL_TARGET - 1} — generating panel ${PANEL_TARGET} without cross-panel context`);
        }
      }
      panelIndices = [PANEL_TARGET - 1];
    } else {
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
      if (ENGINE === 'imagen') {
        result = await callImagenApi(panelPrompt);
      } else {
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
      }

      await savePanel(result.b64, destPath);
      console.log(`  saved ${path.basename(destPath)}`);

      if (ENGINE === 'openai' && result.responseId) {
        meta[`p${i + 1}_response_id`] = result.responseId;
        writeMeta(OUT_DIR, slug, meta);
        previousResponseId = result.responseId;
      }

      generated++;
    }
  }

  if (!DRY_RUN) {
    console.log(`\nDone: ${generated} generated, ${skipped} skipped.`);
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
