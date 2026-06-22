import { describe, it, expect } from 'vitest'
import { getBand, BAND_THRESHOLDS } from './constants'

describe('getBand', () => {
  it('returns Excellent at 90', () => expect(getBand(90)).toBe('Excellent'))
  it('returns Excellent above 90', () => expect(getBand(100)).toBe('Excellent'))
  it('returns Strong pass at 75', () => expect(getBand(75)).toBe('Strong pass'))
  it('returns Strong pass between 75 and 89', () => expect(getBand(80)).toBe('Strong pass'))
  it('returns Pass at 60', () => expect(getBand(60)).toBe('Pass'))
  it('returns Pass between 60 and 74', () => expect(getBand(65)).toBe('Pass'))
  it('returns Keep practising at 40', () => expect(getBand(40)).toBe('Keep practising'))
  it('returns Keep practising between 40 and 59', () => expect(getBand(55)).toBe('Keep practising'))
  it('returns More practice needed at 0', () => expect(getBand(0)).toBe('More practice needed'))
  it('returns More practice needed below 40', () => expect(getBand(39)).toBe('More practice needed'))

  it('thresholds are exhaustive (cover 0–100)', () => {
    for (let pct = 0; pct <= 100; pct++) {
      expect(() => getBand(pct)).not.toThrow()
      expect(getBand(pct)).toBeTruthy()
    }
  })

  it('thresholds are sorted descending', () => {
    for (let i = 0; i < BAND_THRESHOLDS.length - 1; i++) {
      expect(BAND_THRESHOLDS[i].min).toBeGreaterThan(BAND_THRESHOLDS[i + 1].min)
    }
  })
})
