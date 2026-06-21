#!/usr/bin/env node
// Generates missing Part 7 panel illustrations using gpt-image-1.
// Each prompt has a character description used across all 3 panels for visual consistency.
// Output: B&W SVG (PNG → sharp grayscale/threshold → potrace vectorisation).
//
// Usage:  OPENAI_API_KEY=sk-... npm run generate:part7-images
// Idempotent: skips files already present in public/images/part7/.
// To add prompts: append to part7.json then re-run.

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const potrace = require('potrace')

const BANK_PATH = 'public/questions/schools/part7.json'
const OUT_DIR = 'public/images/part7'

// Image generation prompt.
// Character description ensures visual consistency across panels of the same story.
// High-contrast B&W line art produces clean SVG output via potrace.
const buildImagePrompt = (character, scene) =>
  `Black and white pencil sketch illustration. Clean thick outlines, high contrast, ` +
  `no colour, no shading or gradients, pure white background. Square composition. ` +
  `No text, no speech bubbles, no labels, no captions.\n\n` +
  `Main character (keep identical appearance in every panel of this story): ${character}.\n\n` +
  `Scene: ${scene}\n\n` +
  `Style: simple children's book line drawing. Face clearly shows the character's emotion. ` +
  `Show 2–3 everyday objects only. Minimal background detail. Character fills most of the frame.`

async function generatePanelB64(character, scene) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: buildImagePrompt(character, scene),
      n: 1,
      size: '1024x1024',
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${body}`)
  }
  const data = await res.json()
  return data.data[0].b64_json
}

async function saveAsSVG(b64, destPath) {
  const pngBuffer = Buffer.from(b64, 'base64')
  // Convert to pure B&W before vectorising: grayscale then hard threshold
  const bwBuffer = await sharp(pngBuffer)
    .grayscale()
    .threshold(128)
    .png()
    .toBuffer()

  const svg = await new Promise((resolve, reject) => {
    potrace.trace(bwBuffer, {
      background: '#ffffff',
      color: '#000000',
      threshold: potrace.Potrace.THRESHOLD_AUTO,
    }, (err, svg) => {
      if (err) reject(err)
      else resolve(svg)
    })
  })

  fs.writeFileSync(destPath, svg, 'utf8')
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required')
    process.exit(1)
  }

  const bank = JSON.parse(fs.readFileSync(BANK_PATH, 'utf8'))
  fs.mkdirSync(OUT_DIR, { recursive: true })

  let generated = 0
  let skipped = 0

  for (const prompt of bank.prompts) {
    console.log(`\nCharacter: ${prompt.character}`)
    for (const pic of prompt.pics) {
      const destPath = path.join(OUT_DIR, path.basename(pic.image))
      if (fs.existsSync(destPath)) {
        console.log(`  skip  ${path.basename(destPath)}`)
        skipped++
        continue
      }
      console.log(`  gen   ${path.basename(destPath)}`)
      console.log(`        "${pic.text}"`)
      const b64 = await generatePanelB64(prompt.character, pic.text)
      await saveAsSVG(b64, destPath)
      console.log(`  saved ${path.basename(destPath)}`)
      generated++
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} skipped.`)
}

main().catch(err => { console.error(err.message); process.exit(1) })
