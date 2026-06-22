import { describe, it, expect } from 'vitest'
import { reducer, initialState } from './reducer'
import type { AppState } from './types'

function state(overrides: Partial<AppState> = {}): AppState {
  return { ...initialState, ...overrides }
}

describe('reducer', () => {
  describe('SET_NAME', () => {
    it('updates name', () => {
      const s = reducer(state(), { type: 'SET_NAME', name: 'Alice' })
      expect(s.name).toBe('Alice')
    })
  })

  describe('START', () => {
    it('sets started and moves to step 1', () => {
      const s = reducer(state(), { type: 'START' })
      expect(s.started).toBe(true)
      expect(s.step).toBe(1)
    })
  })

  describe('CHOOSE', () => {
    it('records the selected option', () => {
      const s = reducer(state({ started: true }), { type: 'CHOOSE', qIndex: 3, option: 1 })
      expect(s.answers[3]).toBe(1)
    })

    it('is a no-op when submitted', () => {
      const s = reducer(state({ submitted: true }), { type: 'CHOOSE', qIndex: 0, option: 2 })
      expect(s.answers[0]).toBeUndefined()
    })

    it('is a no-op in review mode', () => {
      const s = reducer(state({ review: true }), { type: 'CHOOSE', qIndex: 0, option: 2 })
      expect(s.answers[0]).toBeUndefined()
    })

    it('overwrites an existing answer', () => {
      const s1 = reducer(state(), { type: 'CHOOSE', qIndex: 0, option: 0 })
      const s2 = reducer(s1, { type: 'CHOOSE', qIndex: 0, option: 2 })
      expect(s2.answers[0]).toBe(2)
    })
  })

  describe('SET_TEXT', () => {
    it('records typed gap text', () => {
      const s = reducer(state(), { type: 'SET_TEXT', gapIndex: 2, value: 'the' })
      expect(s.text[2]).toBe('the')
    })

    it('is a no-op when submitted', () => {
      const s = reducer(state({ submitted: true }), { type: 'SET_TEXT', gapIndex: 0, value: 'x' })
      expect(s.text[0]).toBeUndefined()
    })

    it('is a no-op in review mode', () => {
      const s = reducer(state({ review: true }), { type: 'SET_TEXT', gapIndex: 0, value: 'x' })
      expect(s.text[0]).toBeUndefined()
    })
  })

  describe('SET_WRITING', () => {
    it('records writing for part 6', () => {
      const s = reducer(state(), { type: 'SET_WRITING', part: 6, value: 'Dear Sam,' })
      expect(s.writing[6]).toBe('Dear Sam,')
    })

    it('records writing for part 7', () => {
      const s = reducer(state(), { type: 'SET_WRITING', part: 7, value: 'One day...' })
      expect(s.writing[7]).toBe('One day...')
    })

    it('is a no-op when submitted', () => {
      const s = reducer(state({ submitted: true }), { type: 'SET_WRITING', part: 6, value: 'x' })
      expect(s.writing[6]).toBe('')
    })
  })

  describe('SUBMIT', () => {
    it('sets submitted, clears started, moves to step 8', () => {
      const s = reducer(state({ started: true, step: 7 }), { type: 'SUBMIT' })
      expect(s.submitted).toBe(true)
      expect(s.started).toBe(false)
      expect(s.step).toBe(8)
      expect(s.review).toBe(false)
    })
  })

  describe('RESTART', () => {
    it('resets to initial state', () => {
      const dirty = state({
        step: 8,
        submitted: true,
        started: false,
        answers: { 0: 1, 1: 2 },
        text: { 0: 'hello' },
        writing: { 6: 'Dear', 7: 'Once' },
        name: 'Alice',
      })
      const s = reducer(dirty, { type: 'RESTART' })
      expect(s.step).toBe(0)
      expect(s.submitted).toBe(false)
      expect(s.answers).toEqual({})
      expect(s.text).toEqual({})
      expect(s.writing).toEqual({ 6: '', 7: '' })
      expect(s.name).toBe('')
      expect(s.activeTest).toBeNull()
    })
  })

  describe('ENTER_REVIEW', () => {
    it('sets review mode and returns to step 1', () => {
      const s = reducer(state({ step: 8, submitted: true }), { type: 'ENTER_REVIEW' })
      expect(s.review).toBe(true)
      expect(s.step).toBe(1)
    })
  })

  describe('NAV_STEP', () => {
    it('moves to the specified step', () => {
      const s = reducer(state({ step: 3 }), { type: 'NAV_STEP', step: 5 })
      expect(s.step).toBe(5)
    })
  })

  describe('TICK', () => {
    it('decrements secondsLeft by 1', () => {
      const s = reducer(state({ secondsLeft: 10 }), { type: 'TICK' })
      expect(s.secondsLeft).toBe(9)
    })

    it('does not go below 0', () => {
      const s = reducer(state({ secondsLeft: 0 }), { type: 'TICK' })
      expect(s.secondsLeft).toBe(0)
    })
  })

  describe('LOAD_ERROR', () => {
    it('stores the error message', () => {
      const s = reducer(state(), { type: 'LOAD_ERROR', message: 'Network failed' })
      expect(s.loadError).toBe('Network failed')
    })
  })

  describe('unknown action', () => {
    it('returns state unchanged', () => {
      // @ts-expect-error — deliberate unknown action
      const s = reducer(state(), { type: 'UNKNOWN' })
      expect(s).toEqual(state())
    })
  })
})
