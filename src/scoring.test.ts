import { describe, it, expect } from 'vitest'
import { wc, computeResults } from './scoring'
import type { ActiveTest } from './types'

// ── wc ───────────────────────────────────────────────────────────────────────

describe('wc', () => {
  it('counts words in normal sentence', () => expect(wc('hello world foo')).toBe(3))
  it('returns 0 for empty string', () => expect(wc('')).toBe(0))
  it('returns 0 for whitespace-only', () => expect(wc('   ')).toBe(0))
  it('handles leading/trailing whitespace', () => expect(wc('  hi  ')).toBe(1))
  it('collapses multiple spaces', () => expect(wc('one  two   three')).toBe(3))
  it('counts a single word', () => expect(wc('hello')).toBe(1))
})

// ── computeResults ────────────────────────────────────────────────────────────

function makeTest(): ActiveTest {
  return {
    part1: [
      { tag: 'A', text: '', prompt: '', opts: ['a', 'b', 'c'], answer: 0 },
      { tag: 'B', text: '', prompt: '', opts: ['a', 'b', 'c'], answer: 1 },
      { tag: 'C', text: '', prompt: '', opts: ['a', 'b', 'c'], answer: 2 },
      { tag: 'D', text: '', prompt: '', opts: ['a', 'b', 'c'], answer: 0 },
      { tag: 'E', text: '', prompt: '', opts: ['a', 'b', 'c'], answer: 1 },
      { tag: 'F', text: '', prompt: '', opts: ['a', 'b', 'c'], answer: 2 },
    ],
    part2: {
      people: [
        { letter: 'A', name: 'Ana', text: '' },
        { letter: 'B', name: 'Bob', text: '' },
        { letter: 'C', name: 'Cal', text: '' },
      ],
      questions: [
        { prompt: '', answer: 0 },
        { prompt: '', answer: 1 },
        { prompt: '', answer: 2 },
        { prompt: '', answer: 0 },
        { prompt: '', answer: 1 },
        { prompt: '', answer: 2 },
        { prompt: '', answer: 0 },
      ],
    },
    part3: {
      title: '',
      paragraphs: [],
      questions: [
        { prompt: '', opts: ['a', 'b', 'c'], answer: 0 },
        { prompt: '', opts: ['a', 'b', 'c'], answer: 1 },
        { prompt: '', opts: ['a', 'b', 'c'], answer: 2 },
        { prompt: '', opts: ['a', 'b', 'c'], answer: 0 },
        { prompt: '', opts: ['a', 'b', 'c'], answer: 1 },
      ],
    },
    part4: {
      title: '',
      paragraphs: [],
      questions: [
        { opts: ['a', 'b', 'c'], answer: 0 },
        { opts: ['a', 'b', 'c'], answer: 1 },
        { opts: ['a', 'b', 'c'], answer: 2 },
        { opts: ['a', 'b', 'c'], answer: 0 },
        { opts: ['a', 'b', 'c'], answer: 1 },
        { opts: ['a', 'b', 'c'], answer: 2 },
      ],
    },
    part5: {
      title: '',
      paragraphs: [],
      gaps: [
        { accept: ['the'] },
        { accept: ['a', 'an'] },
        { accept: ['is'] },
        { accept: ['was'] },
        { accept: ['in'] },
        { accept: ['on'] },
      ],
    },
    part6: { intro: '', bullets: ['', '', ''], minWords: 25 },
    part7: {
      intro: '',
      storyArc: '',
      characters: [],
      pics: [
        { label: 'Picture 1', text: '', image: '' },
        { label: 'Picture 2', text: '', image: '' },
        { label: 'Picture 3', text: '', image: '' },
      ],
      minWords: 35,
    },
  }
}

describe('computeResults', () => {
  it('scores 0 when all answers are wrong', () => {
    const test = makeTest()
    // All answers wrong: submit option 1 where answer is 0, option 0 where answer is 1/2
    const answers: Record<number, number> = {
      0: 2, 1: 0, 2: 0, 3: 2, 4: 0, 5: 0,  // Part 1
      6: 2, 7: 0, 8: 0, 9: 2, 10: 0, 11: 0, 12: 2,  // Part 2
      13: 2, 14: 0, 15: 0, 16: 2, 17: 0,  // Part 3
      18: 2, 19: 0, 20: 0, 21: 2, 22: 0, 23: 0,  // Part 4
    }
    const result = computeResults(test, answers, {})
    expect(result.score).toBe(0)
    expect(result.total).toBe(30)
    expect(result.pct).toBe(0)
  })

  it('scores 30 when all MC answers are correct and all gaps correct', () => {
    const test = makeTest()
    const answers: Record<number, number> = {
      0: 0, 1: 1, 2: 2, 3: 0, 4: 1, 5: 2,   // Part 1
      6: 0, 7: 1, 8: 2, 9: 0, 10: 1, 11: 2, 12: 0,  // Part 2
      13: 0, 14: 1, 15: 2, 16: 0, 17: 1,    // Part 3
      18: 0, 19: 1, 20: 2, 21: 0, 22: 1, 23: 2,  // Part 4
    }
    const text: Record<number, string> = {
      0: 'the', 1: 'a', 2: 'is', 3: 'was', 4: 'in', 5: 'on',
    }
    const result = computeResults(test, answers, text)
    expect(result.score).toBe(30)
    expect(result.total).toBe(30)
    expect(result.pct).toBe(100)
  })

  it('Part 5 accepts alternate spellings (case-insensitive, trimmed)', () => {
    const test = makeTest()
    const text: Record<number, string> = {
      0: '  THE  ',  // trimmed + lowercased → 'the' ✓
      1: 'AN',       // lowercased → 'an' ✓ (in accept list)
      2: 'is', 3: 'was', 4: 'in', 5: 'on',
    }
    const result = computeResults(test, {}, text)
    const p5 = result.perPart.find(p => p.label === 'Part 5')!
    expect(p5.score).toBe(6)
  })

  it('Part 5 rejects wrong words', () => {
    const test = makeTest()
    const text: Record<number, string> = { 0: 'wrong', 1: 'nope' }
    const result = computeResults(test, {}, text)
    const p5 = result.perPart.find(p => p.label === 'Part 5')!
    expect(p5.score).toBe(0)
  })

  it('perPart has correct labels and totals', () => {
    const result = computeResults(makeTest(), {}, {})
    expect(result.perPart.map(p => p.label)).toEqual([
      'Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5',
    ])
    expect(result.perPart.map(p => p.total)).toEqual([6, 7, 5, 6, 6])
  })

  it('returns correct band for percentage', () => {
    const test = makeTest()
    // Score 0 → 'More practice needed'
    const low = computeResults(test, {}, {})
    expect(low.band).toBe('More practice needed')

    // Perfect score → 'Excellent'
    const answers: Record<number, number> = {
      0: 0, 1: 1, 2: 2, 3: 0, 4: 1, 5: 2,
      6: 0, 7: 1, 8: 2, 9: 0, 10: 1, 11: 2, 12: 0,
      13: 0, 14: 1, 15: 2, 16: 0, 17: 1,
      18: 0, 19: 1, 20: 2, 21: 0, 22: 1, 23: 2,
    }
    const text: Record<number, string> = { 0: 'the', 1: 'a', 2: 'is', 3: 'was', 4: 'in', 5: 'on' }
    const high = computeResults(test, answers, text)
    expect(high.band).toBe('Excellent')
  })
})
