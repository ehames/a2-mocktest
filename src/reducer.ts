import type { AppState, Action, Step } from './types'
import { DURATION_MINUTES_DEFAULT } from './constants'

const INITIAL_SECONDS = DURATION_MINUTES_DEFAULT * 60

export const initialState: AppState = {
  step: 0,
  started: false,
  submitted: false,
  review: false,
  secondsLeft: INITIAL_SECONDS,
  answers: {},
  text: {},
  writing: { 6: '', 7: '' },
  name: '',
  activeTest: null,
  loadError: null,
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.name }

    case 'SET_TEST':
      return { ...state, activeTest: action.test, secondsLeft: action.secondsLeft, loadError: null }

    case 'LOAD_ERROR':
      return { ...state, loadError: action.message }

    case 'START':
      return { ...state, started: true, step: 1 }

    case 'CHOOSE':
      if (state.review || state.submitted) return state
      return { ...state, answers: { ...state.answers, [action.qIndex]: action.option } }

    case 'SET_TEXT':
      if (state.review || state.submitted) return state
      return { ...state, text: { ...state.text, [action.gapIndex]: action.value } }

    case 'SET_WRITING':
      if (state.review || state.submitted) return state
      return { ...state, writing: { ...state.writing, [action.part]: action.value } }

    case 'SUBMIT':
      return { ...state, submitted: true, started: false, step: 8, review: false }

    case 'RESTART':
      return {
        ...initialState,
        activeTest: null,
        secondsLeft: INITIAL_SECONDS,
      }

    case 'ENTER_REVIEW':
      return { ...state, review: true, step: 1 }

    case 'NAV_STEP':
      return { ...state, step: action.step as Step }

    case 'TICK': {
      const next = Math.max(0, state.secondsLeft - 1)
      return { ...state, secondsLeft: next }
    }

    default:
      return state
  }
}
