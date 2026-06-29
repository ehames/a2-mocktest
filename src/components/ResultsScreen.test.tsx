// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, test, expect, vi, type MockInstance } from 'vitest'
import ResultsScreen from './ResultsScreen'
import type { AppState } from '../types'

// jsdom doesn't implement HTMLDialogElement.showModal/close — polyfill them
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn().mockImplementation(function(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn().mockImplementation(function(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  })
})

afterEach(cleanup)

vi.mock('../scoring', () => ({
  computeResults: vi.fn().mockReturnValue({
    score: 15,
    total: 30,
    pct: 50,
    band: 'Pass',
    perPart: [
      { label: 'Part 1', score: 3, total: 6 },
      { label: 'Part 2', score: 3, total: 7 },
      { label: 'Part 3', score: 3, total: 5 },
      { label: 'Part 4', score: 3, total: 6 },
      { label: 'Part 5', score: 3, total: 6 },
      { label: 'Part 6 Writing', score: 0, total: 1 },
      { label: 'Part 7 Writing', score: 0, total: 1 },
    ],
  }),
}))

vi.mock('../pdfExport', () => ({ openPdf: vi.fn() }))

const minState = {
  activeTest: {} as AppState['activeTest'],
  answers: {},
  text: {},
  writing: { 6: '', 7: '' },
  secondsLeft: 3000,
  name: 'Test Student',
} as unknown as AppState

describe('ResultsScreen', () => {
  test('returns null when activeTest is absent', () => {
    const { container } = render(
      <ResultsScreen state={{ ...minState, activeTest: null } as unknown as AppState} dispatch={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  test('renders action buttons', () => {
    render(<ResultsScreen state={minState} dispatch={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Review answers' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restart exam' })).toBeInTheDocument()
  })
})

describe('ResultsScreen — Restart PIN modal', () => {
  let dispatch: MockInstance

  beforeEach(() => {
    dispatch = vi.fn()
    render(<ResultsScreen state={minState} dispatch={dispatch} />)
    fireEvent.click(screen.getByRole('button', { name: 'Restart exam' }))
  })

  test('clicking Restart exam opens PIN modal', () => {
    expect(screen.getByPlaceholderText("Teacher's code")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  test('wrong PIN shows error and does not dispatch', () => {
    fireEvent.change(screen.getByPlaceholderText("Teacher's code"), { target: { value: '0000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.getByText('Incorrect code — try again')).toBeInTheDocument()
    expect(dispatch).not.toHaveBeenCalled()
  })

  test('wrong PIN clears the input field', () => {
    fireEvent.change(screen.getByPlaceholderText("Teacher's code"), { target: { value: '9999' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.getByPlaceholderText("Teacher's code")).toHaveValue('')
  })

  test('correct PIN dispatches RESTART', () => {
    fireEvent.change(screen.getByPlaceholderText("Teacher's code"), { target: { value: '1235' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESTART' })
  })

  test('Enter key with correct PIN dispatches RESTART', () => {
    fireEvent.change(screen.getByPlaceholderText("Teacher's code"), { target: { value: '1235' } })
    fireEvent.keyDown(screen.getByPlaceholderText("Teacher's code"), { key: 'Enter' })
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESTART' })
  })

  test('Cancel closes modal', () => {
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByPlaceholderText("Teacher's code")).not.toBeInTheDocument()
    expect(dispatch).not.toHaveBeenCalled()
  })

  test('error message clears when typing after wrong PIN', () => {
    fireEvent.change(screen.getByPlaceholderText("Teacher's code"), { target: { value: '0000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.getByText('Incorrect code — try again')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText("Teacher's code"), { target: { value: '1' } })
    expect(screen.queryByText('Incorrect code — try again')).not.toBeInTheDocument()
  })
})
