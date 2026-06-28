// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, test, expect, vi } from 'vitest'
import ClozeMC from './ClozeMC'
import type { Part4Set } from '../../types'

afterEach(cleanup)

const mockSet: Part4Set = {
  title: 'Life at School',
  paragraphs: [
    'Every morning Tom (1) ___ to school by bus.',
    'He (2) ___ his friends and they (3) ___ lunch together.',
  ],
  questions: [
    { opts: ['goes', 'walk', 'run'], answer: 0 },
    { opts: ['see', 'meets', 'find'], answer: 1 },
    { opts: ['eat', 'had', 'have'], answer: 2 },
  ],
}

const noop = vi.fn()

describe('ClozeMC — active mode', () => {
  test('renders one select per gap marker', () => {
    render(<ClozeMC set={mockSet} answers={{}} review={false} onChoose={noop} baseIndex={18} />)
    expect(screen.getAllByRole('combobox')).toHaveLength(3)
  })

  test('select placeholder shows local gap number, not global qIndex', () => {
    render(<ClozeMC set={mockSet} answers={{}} review={false} onChoose={noop} baseIndex={18} />)
    const selects = screen.getAllByRole('combobox')
    // Gap 1 placeholder = "1" (local), not "19" (global)
    expect(selects[0]).toHaveDisplayValue('1')
    expect(selects[1]).toHaveDisplayValue('2')
    expect(selects[2]).toHaveDisplayValue('3')
  })

  test('each select contains the question options as text', () => {
    render(<ClozeMC set={mockSet} answers={{}} review={false} onChoose={noop} baseIndex={18} />)
    const selects = screen.getAllByRole('combobox')
    // First gap options
    expect(selects[0]).toHaveTextContent('goes')
    expect(selects[0]).toHaveTextContent('walk')
    expect(selects[0]).toHaveTextContent('run')
    // Second gap options
    expect(selects[1]).toHaveTextContent('see')
    expect(selects[1]).toHaveTextContent('meets')
  })

  test('selecting an option calls onChoose with (baseIndex + gapIndex, optionIndex)', () => {
    const onChoose = vi.fn()
    render(<ClozeMC set={mockSet} answers={{}} review={false} onChoose={onChoose} baseIndex={18} />)
    const selects = screen.getAllByRole('combobox')

    fireEvent.change(selects[0], { target: { value: '0' } })
    expect(onChoose).toHaveBeenCalledWith(18, 0) // gap 1 → qIndex 18

    fireEvent.change(selects[1], { target: { value: '1' } })
    expect(onChoose).toHaveBeenCalledWith(19, 1) // gap 2 → qIndex 19

    fireEvent.change(selects[2], { target: { value: '2' } })
    expect(onChoose).toHaveBeenCalledWith(20, 2) // gap 3 → qIndex 20
  })

  test('shows selected answer value in select', () => {
    render(<ClozeMC set={mockSet} answers={{ 18: 0 }} review={false} onChoose={noop} baseIndex={18} />)
    const selects = screen.getAllByRole('combobox')
    expect(selects[0]).toHaveDisplayValue('goes')
    expect(selects[1]).toHaveDisplayValue('2') // gap 2 still at placeholder
  })
})

describe('ClozeMC — review mode', () => {
  test('shows no selects', () => {
    render(<ClozeMC set={mockSet} answers={{ 18: 0, 19: 0, 20: 0 }} review={true} onChoose={noop} baseIndex={18} />)
    expect(screen.queryAllByRole('combobox')).toHaveLength(0)
  })

  test('correct answer shows the chosen option text', () => {
    // q18 correct=0 (goes), student chose 0 → correct
    render(<ClozeMC set={mockSet} answers={{ 18: 0 }} review={true} onChoose={noop} baseIndex={18} />)
    expect(screen.getByText('goes')).toBeInTheDocument()
  })

  test('wrong answer shows student text and correction arrow', () => {
    // q19 correct=1 (meets), student chose 0 (see) → wrong
    render(<ClozeMC set={mockSet} answers={{ 19: 0 }} review={true} onChoose={noop} baseIndex={18} />)
    expect(screen.getByText('see')).toBeInTheDocument()
    expect(screen.getByText('→ meets')).toBeInTheDocument()
  })

  test('unanswered gap shows dash and correction arrow', () => {
    render(<ClozeMC set={mockSet} answers={{}} review={true} onChoose={noop} baseIndex={18} />)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/^→/).length).toBeGreaterThanOrEqual(1)
  })
})
