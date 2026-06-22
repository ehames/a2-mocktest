'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { QUALITY_MAP, STYLE_PREFIX, buildPanelPrompt, readMeta, writeMeta } = require('./part7-helpers.cjs');

// ── QUALITY_MAP ──────────────────────────────────────────────────────────────

describe('QUALITY_MAP', () => {
  test('maps low → low', () => assert.equal(QUALITY_MAP.low, 'low'));
  test('maps med → medium', () => assert.equal(QUALITY_MAP.med, 'medium'));
  test('maps high → high', () => assert.equal(QUALITY_MAP.high, 'high'));
  test('unknown key is undefined', () => assert.equal(QUALITY_MAP.unknown, undefined));
});

// ── buildPanelPrompt ─────────────────────────────────────────────────────────

const CHARS = [
  { name: 'Leo', description: 'a boy of about 10, red cap' },
  { name: 'Gran', description: 'a woman of about 65, curly grey hair' },
];

const STORY = {
  storyArc: 'Leo gets a present from Gran.',
};

const PIC = {
  setting: 'a kitchen table',
  background: 'kitchen cupboards, window',
  scene: 'Leo opens a present while Gran watches',
  emotion: 'Leo excited, Gran happy',
};

describe('buildPanelPrompt', () => {
  test('includes style prefix', () => {
    const p = buildPanelPrompt(CHARS, STORY, PIC, 1, 3);
    assert.ok(p.startsWith(STYLE_PREFIX));
  });

  test('includes story arc', () => {
    const p = buildPanelPrompt(CHARS, STORY, PIC, 1, 3);
    assert.ok(p.includes('Leo gets a present from Gran.'));
  });

  test('includes all character descriptions', () => {
    const p = buildPanelPrompt(CHARS, STORY, PIC, 1, 3);
    assert.ok(p.includes('Leo: a boy of about 10, red cap.'));
    assert.ok(p.includes('Gran: a woman of about 65, curly grey hair.'));
  });

  test('includes panel number and total', () => {
    const p = buildPanelPrompt(CHARS, STORY, PIC, 2, 3);
    assert.ok(p.includes('PANEL 2 OF 3'));
  });

  test('includes setting and scene', () => {
    const p = buildPanelPrompt(CHARS, STORY, PIC, 1, 3);
    assert.ok(p.includes('a kitchen table'));
    assert.ok(p.includes('Leo opens a present while Gran watches'));
  });

  test('no absent block when absent is empty', () => {
    const pic = { ...PIC, absent: [] };
    const p = buildPanelPrompt(CHARS, STORY, pic, 1, 3);
    assert.ok(!p.includes('NOT IN THIS PANEL'));
  });

  test('absent block lists characters to omit', () => {
    const pic = { ...PIC, absent: ['Gran'] };
    const p = buildPanelPrompt(CHARS, STORY, pic, 1, 3);
    assert.ok(p.includes('CHARACTERS NOT IN THIS PANEL (do NOT draw them): Gran.'));
  });

  test('absent block with multiple characters', () => {
    const pic = { ...PIC, absent: ['Leo', 'Gran'] };
    const p = buildPanelPrompt(CHARS, STORY, pic, 1, 3);
    assert.ok(p.includes('Leo, Gran'));
  });
});

// ── readMeta / writeMeta ─────────────────────────────────────────────────────

describe('readMeta', () => {
  test('returns empty object when file does not exist', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p7-test-'));
    assert.deepEqual(readMeta(dir, 'no-such-story'), {});
    fs.rmSync(dir, { recursive: true });
  });

  test('returns empty object when file contains invalid JSON', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p7-test-'));
    fs.writeFileSync(path.join(dir, 'bad_meta.json'), 'not json');
    assert.deepEqual(readMeta(dir, 'bad'), {});
    fs.rmSync(dir, { recursive: true });
  });
});

describe('writeMeta / readMeta round-trip', () => {
  test('persists and restores response IDs', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p7-test-'));
    const meta = { p1_response_id: 'resp_aaa', p2_response_id: 'resp_bbb' };
    writeMeta(dir, 'my-story', meta);
    const restored = readMeta(dir, 'my-story');
    assert.deepEqual(restored, meta);
    fs.rmSync(dir, { recursive: true });
  });

  test('overwrites existing sidecar on second write', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p7-test-'));
    writeMeta(dir, 'my-story', { p1_response_id: 'resp_old' });
    writeMeta(dir, 'my-story', { p1_response_id: 'resp_new', p2_response_id: 'resp_bbb' });
    const restored = readMeta(dir, 'my-story');
    assert.equal(restored.p1_response_id, 'resp_new');
    assert.equal(restored.p2_response_id, 'resp_bbb');
    fs.rmSync(dir, { recursive: true });
  });

  test('sidecar filename uses slug', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p7-test-'));
    writeMeta(dir, 'swim-lesson', { p1_response_id: 'resp_x' });
    assert.ok(fs.existsSync(path.join(dir, 'swim-lesson_meta.json')));
    fs.rmSync(dir, { recursive: true });
  });
});
