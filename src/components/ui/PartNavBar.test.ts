import { describe, test, expect } from 'vitest'
import { getChips, getCompletion } from './PartNavBar'

const noAnswers: Record<number, number> = {}
const noText: Record<number, string> = {}
const noWriting = { 6: '', 7: '' }

// ── getChips ──────────────────────────────────────────────────────────────────

describe('getChips', () => {
  describe('Part 1', () => {
    test('returns 6 chips with local display numbers 1–6', () => {
      const chips = getChips(1, noAnswers, noText)!
      expect(chips).toHaveLength(6)
      expect(chips.map(c => c.display)).toEqual([1, 2, 3, 4, 5, 6])
    })

    test('scroll IDs reference qIndex 0–5', () => {
      const chips = getChips(1, noAnswers, noText)!
      expect(chips.map(c => c.scrollId)).toEqual(['q-0','q-1','q-2','q-3','q-4','q-5'])
    })

    test('answered reflects qIndex 0–5 in answers', () => {
      const chips = getChips(1, { 0: 2, 3: 0 }, noText)!
      expect(chips[0].answered).toBe(true)
      expect(chips[1].answered).toBe(false)
      expect(chips[3].answered).toBe(true)
      expect(chips[5].answered).toBe(false)
    })
  })

  describe('Part 2', () => {
    test('returns 7 chips with local display numbers 1–7', () => {
      const chips = getChips(2, noAnswers, noText)!
      expect(chips).toHaveLength(7)
      expect(chips.map(c => c.display)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    test('scroll IDs reference qIndex 6–12', () => {
      const chips = getChips(2, noAnswers, noText)!
      expect(chips.map(c => c.scrollId)).toEqual(['q-6','q-7','q-8','q-9','q-10','q-11','q-12'])
    })

    test('answered uses qIndex 6–12', () => {
      const chips = getChips(2, { 6: 0, 10: 1 }, noText)!
      expect(chips[0].answered).toBe(true)  // qIndex 6
      expect(chips[1].answered).toBe(false) // qIndex 7
      expect(chips[4].answered).toBe(true)  // qIndex 10
    })
  })

  describe('Part 3', () => {
    test('returns 5 chips with local display numbers 1–5', () => {
      const chips = getChips(3, noAnswers, noText)!
      expect(chips).toHaveLength(5)
      expect(chips.map(c => c.display)).toEqual([1, 2, 3, 4, 5])
    })

    test('scroll IDs reference qIndex 13–17', () => {
      const chips = getChips(3, noAnswers, noText)!
      expect(chips.map(c => c.scrollId)).toEqual(['q-13','q-14','q-15','q-16','q-17'])
    })

    test('answered uses qIndex 13–17', () => {
      const chips = getChips(3, { 13: 0, 17: 2 }, noText)!
      expect(chips[0].answered).toBe(true)
      expect(chips[4].answered).toBe(true)
      expect(chips[2].answered).toBe(false)
    })
  })

  describe('Part 4', () => {
    test('returns 6 chips with local display numbers 1–6', () => {
      const chips = getChips(4, noAnswers, noText)!
      expect(chips).toHaveLength(6)
      expect(chips.map(c => c.display)).toEqual([1, 2, 3, 4, 5, 6])
    })

    test('scroll IDs reference qIndex 18–23', () => {
      const chips = getChips(4, noAnswers, noText)!
      expect(chips.map(c => c.scrollId)).toEqual(['q-18','q-19','q-20','q-21','q-22','q-23'])
    })

    test('answered uses qIndex 18–23', () => {
      const chips = getChips(4, { 18: 1, 22: 0 }, noText)!
      expect(chips[0].answered).toBe(true)
      expect(chips[4].answered).toBe(true)
      expect(chips[1].answered).toBe(false)
    })
  })

  describe('Part 5', () => {
    test('returns 6 chips with local display numbers 1–6', () => {
      const chips = getChips(5, noAnswers, noText)!
      expect(chips).toHaveLength(6)
      expect(chips.map(c => c.display)).toEqual([1, 2, 3, 4, 5, 6])
    })

    test('scroll IDs reference q-24..q-29', () => {
      const chips = getChips(5, noAnswers, noText)!
      expect(chips.map(c => c.scrollId)).toEqual(['q-24','q-25','q-26','q-27','q-28','q-29'])
    })

    test('answered based on non-empty trimmed text', () => {
      const chips = getChips(5, noAnswers, { 0: 'the', 1: ' ', 2: '', 3: 'a' })!
      expect(chips[0].answered).toBe(true)
      expect(chips[1].answered).toBe(false) // whitespace-only
      expect(chips[2].answered).toBe(false)
      expect(chips[3].answered).toBe(true)
      expect(chips[4].answered).toBe(false)
    })
  })

  describe('Parts 6 and 7', () => {
    test('returns null — no chips for writing parts', () => {
      expect(getChips(6, noAnswers, noText)).toBeNull()
      expect(getChips(7, noAnswers, noText)).toBeNull()
    })
  })
})

// ── getCompletion ─────────────────────────────────────────────────────────────

describe('getCompletion', () => {
  test('Part 1: counts answered in range 0–5, total 6', () => {
    expect(getCompletion(1, {}, {}, noWriting)).toEqual({ done: 0, total: 6 })
    expect(getCompletion(1, { 0: 0, 3: 1, 5: 2 }, {}, noWriting)).toEqual({ done: 3, total: 6 })
    expect(getCompletion(1, { 0:0,1:0,2:0,3:0,4:0,5:0 }, {}, noWriting)).toEqual({ done: 6, total: 6 })
  })

  test('Part 1: ignores answers outside range 0–5', () => {
    expect(getCompletion(1, { 6: 0, 13: 1 }, {}, noWriting)).toEqual({ done: 0, total: 6 })
  })

  test('Part 2: counts answered in range 6–12, total 7', () => {
    expect(getCompletion(2, { 6: 0, 7: 1, 12: 2 }, {}, noWriting)).toEqual({ done: 3, total: 7 })
    expect(getCompletion(2, { 6:0,7:0,8:0,9:0,10:0,11:0,12:0 }, {}, noWriting)).toEqual({ done: 7, total: 7 })
  })

  test('Part 3: counts answered in range 13–17, total 5', () => {
    expect(getCompletion(3, { 13: 0, 17: 2 }, {}, noWriting)).toEqual({ done: 2, total: 5 })
  })

  test('Part 4: counts answered in range 18–23, total 6', () => {
    expect(getCompletion(4, { 18:0,19:0,20:0,21:0,22:0,23:0 }, {}, noWriting)).toEqual({ done: 6, total: 6 })
    expect(getCompletion(4, {}, {}, noWriting)).toEqual({ done: 0, total: 6 })
  })

  test('Part 5: counts non-empty trimmed text entries, total 6', () => {
    expect(getCompletion(5, {}, { 0: 'the', 1: ' ', 2: 'a' }, noWriting)).toEqual({ done: 2, total: 6 })
    expect(getCompletion(5, {}, { 0:'a',1:'b',2:'c',3:'d',4:'e',5:'f' }, noWriting)).toEqual({ done: 6, total: 6 })
  })

  test('Part 6: 1 if writing[6] non-empty, 0 otherwise, total 1', () => {
    expect(getCompletion(6, {}, {}, { 6: 'hi there', 7: '' })).toEqual({ done: 1, total: 1 })
    expect(getCompletion(6, {}, {}, { 6: '', 7: 'x' })).toEqual({ done: 0, total: 1 })
    expect(getCompletion(6, {}, {}, { 6: '   ', 7: '' })).toEqual({ done: 0, total: 1 })
  })

  test('Part 7: 1 if writing[7] non-empty, 0 otherwise, total 1', () => {
    expect(getCompletion(7, {}, {}, { 6: '', 7: 'my story' })).toEqual({ done: 1, total: 1 })
    expect(getCompletion(7, {}, {}, { 6: 'x', 7: '' })).toEqual({ done: 0, total: 1 })
  })
})
