import type { ActiveTest } from './types'
import { getBand } from './constants'

export interface PartScore { label: string; score: number; total: number }
export interface Results {
  score: number
  total: number
  pct: number
  band: string
  perPart: PartScore[]
}

function wc(s: string): number {
  const t = (s || '').trim()
  return t ? t.split(/\s+/).length : 0
}

export function computeResults(
  test: ActiveTest,
  answers: Record<number, number>,
  text: Record<number, string>,
): Results {
  const perPart: PartScore[] = []
  let score = 0
  let total = 0

  // Part 1 — 6 items, each at qIndex 0..5
  {
    let s = 0
    test.part1.forEach((item, i) => { if (answers[i] === item.answer) s++ })
    perPart.push({ label: 'Part 1', score: s, total: 6 })
    score += s; total += 6
  }

  // Part 2 — 7 questions, qIndex 6..12
  {
    let s = 0
    test.part2.questions.forEach((q, i) => { if (answers[6 + i] === q.answer) s++ })
    perPart.push({ label: 'Part 2', score: s, total: 7 })
    score += s; total += 7
  }

  // Part 3 — 5 questions, qIndex 13..17
  {
    let s = 0
    test.part3.questions.forEach((q, i) => { if (answers[13 + i] === q.answer) s++ })
    perPart.push({ label: 'Part 3', score: s, total: 5 })
    score += s; total += 5
  }

  // Part 4 — 6 questions, qIndex 18..23
  {
    let s = 0
    test.part4.questions.forEach((q, i) => { if (answers[18 + i] === q.answer) s++ })
    perPart.push({ label: 'Part 4', score: s, total: 6 })
    score += s; total += 6
  }

  // Part 5 — 6 gaps, gapIndex 0..5
  {
    let s = 0
    test.part5.gaps.forEach((g, i) => {
      if (g.accept.includes((text[i] || '').trim().toLowerCase())) s++
    })
    perPart.push({ label: 'Part 5', score: s, total: 6 })
    score += s; total += 6
  }

  const pct = total ? Math.round(score / total * 100) : 0
  return { score, total, pct, band: getBand(pct), perPart }
}

export { wc }
