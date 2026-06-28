// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { afterEach, describe, test, expect, vi } from 'vitest'
import OpenCloze from './OpenCloze'
import type { Part5Set } from '../../types'

afterEach(cleanup)

const mockSet: Part5Set = {
  title: 'Learning to Cook',
  paragraphs: [
    'Maria decided (1) ___ cook dinner for her family.',
    'She had (2) ___ bought all the ingredients.',
    'It was (3) ___ difficult but she enjoyed it.',
  ],
  gaps: [
    { accept: ['to'] },
    { accept: ['already', 'just'] },
    { accept: ['quite', 'very'] },
  ],
}

const noop = vi.fn()

describe('OpenCloze — active mode', () => {
  test('renders one input per gap marker', () => {
    render(<OpenCloze set={mockSet} textAnswers={{}} review={false} onsetText={noop} />)
    expect(screen.getAllByRole('textbox')).toHaveLength(3)
  })

  test('inputs have spellCheck disabled', () => {
    render(<OpenCloze set={mockSet} textAnswers={{}} review={false} onsetText={noop} />)
    for (const input of screen.getAllByRole('textbox')) {
      expect(input).toHaveAttribute('spellcheck', 'false')
    }
  })

  test('placeholder shows local gap number', () => {
    render(<OpenCloze set={mockSet} textAnswers={{}} review={false} onsetText={noop} />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveAttribute('placeholder', '1')
    expect(inputs[1]).toHaveAttribute('placeholder', '2')
    expect(inputs[2]).toHaveAttribute('placeholder', '3')
  })

  test('typing calls onsetText with (gapIndex, value)', () => {
    const onsetText = vi.fn()
    render(<OpenCloze set={mockSet} textAnswers={{}} review={false} onsetText={onsetText} />)
    const inputs = screen.getAllByRole('textbox')

    fireEvent.change(inputs[0], { target: { value: 'to' } })
    expect(onsetText).toHaveBeenCalledWith(0, 'to')

    fireEvent.change(inputs[1], { target: { value: 'already' } })
    expect(onsetText).toHaveBeenCalledWith(1, 'already')

    fireEvent.change(inputs[2], { target: { value: 'quite' } })
    expect(onsetText).toHaveBeenCalledWith(2, 'quite')
  })

  test('shows current answer value in input', () => {
    render(<OpenCloze set={mockSet} textAnswers={{ 0: 'to', 2: 'very' }} review={false} onsetText={noop} />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('to')
    expect(inputs[1]).toHaveValue('')
    expect(inputs[2]).toHaveValue('very')
  })
})

describe('OpenCloze — review mode', () => {
  test('shows no inputs', () => {
    render(<OpenCloze set={mockSet} textAnswers={{ 0: 'to', 1: 'already', 2: 'quite' }} review={true} onsetText={noop} />)
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
  })

  test('correct answer displays the typed word', () => {
    // all gaps answered so only one gap can trigger → arrows
    render(<OpenCloze set={mockSet} textAnswers={{ 0: 'to', 1: 'already', 2: 'quite' }} review={true} onsetText={noop} />)
    expect(screen.getByText('to')).toBeInTheDocument()
    expect(screen.queryAllByText(/^→/).length).toBe(0)
  })

  test('wrong answer shows typed word and correction', () => {
    // all gaps answered; gap 0 wrong ('of' instead of 'to'), gaps 1 & 2 correct
    render(<OpenCloze set={mockSet} textAnswers={{ 0: 'of', 1: 'already', 2: 'quite' }} review={true} onsetText={noop} />)
    expect(screen.getByText('of')).toBeInTheDocument()
    expect(screen.getByText('→ to')).toBeInTheDocument()
    expect(screen.queryAllByText(/^→/).length).toBe(1)
  })

  test('accepts alternate spellings as correct', () => {
    // all gaps answered; gap 1 uses alternate 'just', gaps 0 & 2 correct
    render(<OpenCloze set={mockSet} textAnswers={{ 0: 'to', 1: 'just', 2: 'quite' }} review={true} onsetText={noop} />)
    expect(screen.getByText('just')).toBeInTheDocument()
    expect(screen.queryAllByText(/^→/).length).toBe(0)
  })

  test('case-insensitive acceptance', () => {
    render(<OpenCloze set={mockSet} textAnswers={{ 0: 'TO', 1: 'already', 2: 'quite' }} review={true} onsetText={noop} />)
    expect(screen.queryAllByText(/^→/).length).toBe(0)
  })

  test('unanswered gap shows dash', () => {
    render(<OpenCloze set={mockSet} textAnswers={{}} review={true} onsetText={noop} />)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })
})
