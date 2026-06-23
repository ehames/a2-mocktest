'use strict';

const fs = require('fs');
const path = require('path');

const QUALITY_MAP = { low: 'low', med: 'medium', high: 'high' };

const IMAGEN_QUALITY_MAP = {
  low:  'gemini-2.5-flash-image',
  med:  'nano-banana-pro-preview',
  high: 'gemini-3-pro-image',
};

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

function readMeta(outDir, slug) {
  const p = path.join(outDir, `${slug}_meta.json`);
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
}

function writeMeta(outDir, slug, meta) {
  fs.writeFileSync(path.join(outDir, `${slug}_meta.json`), JSON.stringify(meta, null, 2));
}

module.exports = { QUALITY_MAP, IMAGEN_QUALITY_MAP, STYLE_PREFIX, buildPanelPrompt, readMeta, writeMeta };
